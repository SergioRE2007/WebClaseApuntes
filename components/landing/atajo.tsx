'use client';

import { useEffect, useState } from 'react';
import { esMac } from '@/components/chat/lanzador';

const kbd = 'rounded border bg-fd-muted px-1.5 py-px font-mono text-[12px] text-fd-foreground';

/** Atajo de teclado con la tecla del sistema: "⌘K" en Mac, "Ctrl K" en el resto. */
export function Atajo({ tecla }: { tecla: string }) {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(esMac()), []);
  return <kbd className={kbd}>{mac ? `⌘${tecla}` : `Ctrl ${tecla}`}</kbd>;
}
