import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpen, Upload } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { UserMenu } from '@/components/layout/user-menu';
import { docsRoute } from './shared';

/**
 * Opciones comunes para HomeLayout y DocsLayout: logo, enlaces principales y
 * área de usuario (server component asíncrono; el enlace al panel admin solo
 * aparece dentro de él si el rol es admin).
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Logo />,
      url: '/',
      transparentMode: 'top',
    },
    links: [
      {
        text: 'Apuntes',
        url: docsRoute,
        active: 'nested-url',
        icon: <BookOpen />,
        on: 'nav',
      },
      {
        text: 'Aportar',
        url: '/aportar',
        active: 'nested-url',
        icon: <Upload />,
      },
      {
        type: 'custom',
        secondary: true,
        children: <UserMenu />,
      },
    ],
  };
}
