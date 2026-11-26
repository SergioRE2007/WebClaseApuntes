-- =============================================================
-- DAM Apuntes · Esquema de Supabase
-- Ejecutar entero en: Supabase → SQL Editor → New query → Run
-- =============================================================

-- ---------- Perfiles ----------
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nombre text,
  rol text not null default 'alumno' check (rol in ('alumno', 'admin')),
  clase_ok boolean not null default false,
  creado_en timestamptz not null default now()
);

alter table public.perfiles enable row level security;

-- Nombre visible acotado (la UI de /unirse ya lo limita a 60)
alter table public.perfiles drop constraint if exists perfiles_nombre_len;
alter table public.perfiles add constraint perfiles_nombre_len
  check (nombre is null or char_length(nombre) between 1 and 60);

-- Función auxiliar (security definer para evitar recursión en RLS)
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;

drop policy if exists "perfil propio: leer" on public.perfiles;
create policy "perfil propio: leer" on public.perfiles
  for select using (id = auth.uid() or public.es_admin());

-- Los alumnos solo pueden cambiar su nombre: el resto de columnas se protege con
-- permisos de columna y, además, con el trigger de abajo.
drop policy if exists "perfil propio: actualizar" on public.perfiles;
create policy "perfil propio: actualizar" on public.perfiles
  for update using (id = auth.uid()) with check (id = auth.uid());

revoke update on public.perfiles from anon, authenticated;
grant update (nombre) on public.perfiles to authenticated;

create or replace function public.proteger_campos_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo protege frente a peticiones de usuarios de la web (anon/authenticated).
  -- El servidor (service_role) y el SQL Editor (sin JWT) pueden cambiarlo todo.
  if coalesce(auth.role(), '') in ('anon', 'authenticated') and not public.es_admin() then
    new.id := old.id;
    new.email := old.email;
    new.rol := old.rol;
    new.clase_ok := old.clase_ok;
    new.creado_en := old.creado_en;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_proteger_perfil on public.perfiles;
create trigger trg_proteger_perfil
  before update on public.perfiles
  for each row execute function public.proteger_campos_perfil();

-- Crea el perfil automáticamente al registrarse
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Las funciones de trigger no deben poder llamarse por la API (/rest/v1/rpc)
revoke all on function public.proteger_campos_perfil() from public, anon, authenticated;
revoke all on function public.crear_perfil() from public, anon, authenticated;

drop trigger if exists trg_crear_perfil on auth.users;
create trigger trg_crear_perfil
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ---------- Aportaciones ----------
create table if not exists public.aportaciones (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references public.perfiles (id) on delete cascade,
  tipo text not null check (tipo in ('captura', 'video', 'documento', 'enlace', 'texto')),
  modulo text not null,
  tema text,
  titulo text not null check (char_length(titulo) between 3 and 140),
  descripcion text check (char_length(descripcion) <= 4000),
  enlace text,
  archivo_path text,
  archivo_nombre text,
  archivo_mime text,
  archivo_bytes bigint,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'descartada')),
  nota_admin text,
  creado_en timestamptz not null default now(),
  revisado_en timestamptz
);

alter table public.aportaciones drop constraint if exists aportaciones_enlace_ok;
alter table public.aportaciones add constraint aportaciones_enlace_ok
  check (enlace is null or (enlace ~* '^https?://' and char_length(enlace) <= 2000));
alter table public.aportaciones drop constraint if exists aportaciones_longitudes;
alter table public.aportaciones add constraint aportaciones_longitudes
  check (
    char_length(modulo) <= 80
    and char_length(coalesce(tema, '')) <= 120
    and char_length(coalesce(archivo_path, '')) <= 400
    and char_length(coalesce(archivo_nombre, '')) <= 255
    and (archivo_bytes is null or archivo_bytes between 0 and 52428800)
  );

create index if not exists aportaciones_estado_idx on public.aportaciones (estado, creado_en desc);

alter table public.aportaciones enable row level security;

drop policy if exists "aportaciones: crear propias" on public.aportaciones;
create policy "aportaciones: crear propias" on public.aportaciones
  for insert with check (
    autor_id = auth.uid()
    and estado = 'pendiente'
    and nota_admin is null
    and revisado_en is null
    and exists (select 1 from public.perfiles where id = auth.uid() and clase_ok)
    -- el adjunto tiene que estar en la carpeta del propio autor
    and (archivo_path is null or split_part(archivo_path, '/', 1) = auth.uid()::text)
    and (enlace is null or enlace ~* '^https?://')
  );

drop policy if exists "aportaciones: leer propias o admin" on public.aportaciones;
create policy "aportaciones: leer propias o admin" on public.aportaciones
  for select using (autor_id = auth.uid() or public.es_admin());

drop policy if exists "aportaciones: admin actualiza" on public.aportaciones;
create policy "aportaciones: admin actualiza" on public.aportaciones
  for update using (public.es_admin()) with check (public.es_admin());

drop policy if exists "aportaciones: admin borra" on public.aportaciones;
create policy "aportaciones: admin borra" on public.aportaciones
  for delete using (public.es_admin());

-- ---------- Uso del chat (límite diario) ----------
create table if not exists public.chat_uso (
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  dia date not null default (now() at time zone 'Europe/Madrid')::date,
  mensajes int not null default 0,
  tokens_entrada bigint not null default 0,
  tokens_salida bigint not null default 0,
  primary key (usuario_id, dia)
);

alter table public.chat_uso enable row level security;

drop policy if exists "chat_uso: leer propio o admin" on public.chat_uso;
create policy "chat_uso: leer propio o admin" on public.chat_uso
  for select using (usuario_id = auth.uid() or public.es_admin());
-- (las escrituras se hacen desde el servidor con service role)

-- Incremento atómico; devuelve el número de mensajes tras incrementar
create or replace function public.chat_incrementar(p_usuario uuid, p_limite int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dia date := (now() at time zone 'Europe/Madrid')::date;
  v_total int;
begin
  insert into public.chat_uso (usuario_id, dia, mensajes)
  values (p_usuario, v_dia, 1)
  on conflict (usuario_id, dia) do update set mensajes = public.chat_uso.mensajes + 1
  where public.chat_uso.mensajes < p_limite
  returning mensajes into v_total;
  return coalesce(v_total, -1); -- -1 = límite alcanzado
end;
$$;

revoke all on function public.chat_incrementar(uuid, int) from public, anon, authenticated;
-- Solo el servidor (service role) las llama; sin este grant falla con "permission denied".
grant execute on function public.chat_incrementar(uuid, int) to service_role;

-- Devuelve un mensaje al cupo de hoy (cuando la llamada a Claude falla antes de responder)
create or replace function public.chat_devolver(p_usuario uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.chat_uso set mensajes = greatest(mensajes - 1, 0)
  where usuario_id = p_usuario and dia = (now() at time zone 'Europe/Madrid')::date;
$$;

revoke all on function public.chat_devolver(uuid) from public, anon, authenticated;
-- Solo el servidor (service role) las llama; sin este grant falla con "permission denied".
grant execute on function public.chat_devolver(uuid) to service_role;

-- ---------- Intentos de código de clase (anti fuerza bruta) ----------
create table if not exists public.unirse_intentos (
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  dia date not null default (now() at time zone 'Europe/Madrid')::date,
  intentos int not null default 0,
  primary key (usuario_id, dia)
);

alter table public.unirse_intentos enable row level security;
-- sin políticas: solo el servidor (service role) lee y escribe

-- Registra un intento; devuelve el total de hoy o -1 si ya se pasó del límite
create or replace function public.unirse_intento(p_usuario uuid, p_limite int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dia date := (now() at time zone 'Europe/Madrid')::date;
  v_total int;
begin
  insert into public.unirse_intentos (usuario_id, dia, intentos)
  values (p_usuario, v_dia, 1)
  on conflict (usuario_id, dia) do update set intentos = public.unirse_intentos.intentos + 1
  where public.unirse_intentos.intentos < p_limite
  returning intentos into v_total;
  return coalesce(v_total, -1);
end;
$$;

revoke all on function public.unirse_intento(uuid, int) from public, anon, authenticated;
-- Solo el servidor (service role) las llama; sin este grant falla con "permission denied".
grant execute on function public.unirse_intento(uuid, int) to service_role;

-- Permisos de tabla. En proyectos de Supabase sin los permisos por defecto en `public`,
-- sin esto todo falla con "permission denied" aunque RLS esté bien. RLS sigue decidiendo las filas.
grant select, insert, update, delete on public.perfiles, public.aportaciones, public.chat_uso, public.unirse_intentos to service_role;
grant select on public.perfiles to authenticated;
grant update (nombre) on public.perfiles to authenticated;
grant select, insert, update, delete on public.aportaciones to authenticated;
grant select on public.chat_uso to authenticated;

-- ---------- Storage: bucket privado para aportaciones ----------
-- Mantén esta lista igual que MIMES_PERMITIDOS en lib/aportaciones.ts
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'aportaciones', 'aportaciones', false, 52428800, -- 50 MB
  array['image/png','image/jpeg','image/webp','image/gif','video/mp4','video/webm','video/quicktime',
        'application/pdf','application/zip','application/x-zip-compressed','text/plain','text/markdown']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = excluded.allowed_mime_types;

-- Ruta de cada archivo: <uid>/<uuid>-<nombre>
drop policy if exists "storage aportaciones: subir propias" on storage.objects;
create policy "storage aportaciones: subir propias" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'aportaciones'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.perfiles where id = auth.uid() and clase_ok)
  );

drop policy if exists "storage aportaciones: leer propias o admin" on storage.objects;
create policy "storage aportaciones: leer propias o admin" on storage.objects
  for select to authenticated using (
    bucket_id = 'aportaciones'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.es_admin())
  );

drop policy if exists "storage aportaciones: admin borra" on storage.objects;
create policy "storage aportaciones: admin borra" on storage.objects
  for delete to authenticated using (bucket_id = 'aportaciones' and public.es_admin());

-- Nota: los adjuntos subidos sin llegar a crear la aportación quedan huérfanos.
-- Solo los miembros de la clase pueden subir (política de arriba), así que el riesgo es
-- bajo; si hiciera falta, bórralos de vez en cuando desde Storage → aportaciones.

-- ---------- Hazte admin (cambia el email por el tuyo y ejecútalo tras registrarte) ----------
-- update public.perfiles set rol = 'admin', clase_ok = true where email = 'TU_EMAIL@ejemplo.com';
