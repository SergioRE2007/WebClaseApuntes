'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { BookOpen, ChevronDown, KeyRound, Loader2, LogOut, Shield, Upload } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';
import { cn } from '@/lib/cn';
import { salir } from './actions';

export interface UserMenuClienteProps {
  nombre: string | null;
  email: string;
  esAdmin: boolean;
  enClase: boolean;
  demo: boolean;
}

function iniciales(nombre: string | null, email: string): string {
  const base = nombre?.trim() || email.split('@')[0] || '?';
  const partes = base.split(/[\s._-]+/).filter(Boolean);
  const letras = partes.length > 1 ? `${partes[0]![0]}${partes[1]![0]}` : base.slice(0, 2);
  return letras.toUpperCase();
}

const itemClass =
  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-fd-popover-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:bg-fd-accent focus-visible:outline-none [&_svg]:size-4 [&_svg]:text-fd-muted-foreground';

export function UserMenuCliente({ nombre, email, esAdmin, enClase, demo }: UserMenuClienteProps) {
  const [open, setOpen] = useState(false);
  const visible = nombre?.trim() || email.split('@')[0] || 'Tú';
  const primerNombre = visible.split(/\s+/)[0];
  const cerrar = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`Menú de usuario de ${visible}`}
        className={cn(
          'group inline-flex h-8 max-w-full items-center gap-2 rounded-full border bg-fd-card/70 ps-0.5 pe-2 text-sm font-medium transition-colors',
          'hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring data-[state=open]:bg-fd-accent',
        )}
      >
        <Avatar texto={iniciales(nombre, email)} />
        <span className="max-w-[9rem] truncate">{primerNombre}</span>
        <ChevronDown
          aria-hidden
          className="size-3.5 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-64 p-1.5">
        <div className="flex items-center gap-3 px-2.5 pt-2 pb-3">
          <Avatar texto={iniciales(nombre, email)} grande />
          <div className="min-w-0">
            <p className="truncate font-medium">{visible}</p>
            <p className="truncate text-xs text-fd-muted-foreground">{email}</p>
          </div>
        </div>
        {(esAdmin || demo) && (
          <div className="flex gap-1.5 px-2.5 pb-2">
            {esAdmin && (
              <span className="rounded-full bg-fd-primary/12 px-2 py-0.5 text-[11px] font-medium text-fd-primary">
                Admin
              </span>
            )}
            {demo && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                Modo demo
              </span>
            )}
          </div>
        )}
        <div role="separator" className="my-1 h-px bg-fd-border" />
        <nav aria-label="Cuenta" className="flex flex-col">
          {!enClase && (
            <Link href="/unirse" onClick={cerrar} className={itemClass}>
              <KeyRound aria-hidden />
              Únete a la clase
            </Link>
          )}
          <Link href="/docs" onClick={cerrar} className={itemClass}>
            <BookOpen aria-hidden />
            Mis apuntes
          </Link>
          <Link href="/aportar" onClick={cerrar} className={itemClass}>
            <Upload aria-hidden />
            Aportar recursos
          </Link>
          {esAdmin && (
            <Link href="/admin" onClick={cerrar} className={itemClass}>
              <Shield aria-hidden />
              Panel admin
            </Link>
          )}
        </nav>
        <div role="separator" className="my-1 h-px bg-fd-border" />
        <form action={salir}>
          <BotonSalir />
        </form>
      </PopoverContent>
    </Popover>
  );
}

function BotonSalir() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        itemClass,
        'text-red-600 hover:text-red-600 disabled:opacity-60 dark:text-red-400 dark:hover:text-red-400 [&_svg]:text-current',
      )}
    >
      {pending ? <Loader2 aria-hidden className="animate-spin" /> : <LogOut aria-hidden />}
      {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
    </button>
  );
}

function Avatar({ texto, grande }: { texto: string; grande?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'bg-brand-gradient inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm',
        grande ? 'size-10 text-sm' : 'size-7 text-[11px]',
      )}
    >
      {texto}
    </span>
  );
}
