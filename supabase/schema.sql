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

-- Los alumnos solo pueden cambiar su nombre (rol y clase_ok se protegen con el trigger de abajo)
drop policy if exists "perfil propio: actualizar" on public.perfiles;
create policy "perfil propio: actualizar" on public.perfiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.proteger_campos_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo service role (servidor) o un admin pueden tocar rol / clase_ok
  if coalesce(auth.role(), '') <> 'service_role' and not public.es_admin() then
    new.rol := old.rol;
    new.clase_ok := old.clase_ok;
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

create index if not exists aportaciones_estado_idx on public.aportaciones (estado, creado_en desc);

alter table public.aportaciones enable row level security;

drop policy if exists "aportaciones: crear propias" on public.aportaciones;
create policy "aportaciones: crear propias" on public.aportaciones
  for insert with check (
    autor_id = auth.uid()
    and estado = 'pendiente'
    and exists (select 1 from public.perfiles where id = auth.uid() and clase_ok)
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

-- ---------- Storage: bucket privado para aportaciones ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('aportaciones', 'aportaciones', false, 52428800) -- 50 MB
on conflict (id) do update set public = false, file_size_limit = 52428800;

-- Ruta de cada archivo: <uid>/<uuid>-<nombre>
drop policy if exists "storage aportaciones: subir propias" on storage.objects;
create policy "storage aportaciones: subir propias" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'aportaciones'
    and (storage.foldername(name))[1] = auth.uid()::text
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

-- ---------- Hazte admin (cambia el email por el tuyo y ejecútalo tras registrarte) ----------
-- update public.perfiles set rol = 'admin', clase_ok = true where email = 'TU_EMAIL@ejemplo.com';
