import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { House, Upload } from 'lucide-react';
import { baseOptions } from '@/lib/layout.shared';
import { requireAlumno } from '@/lib/auth';
import { UserMenu } from '@/components/layout/user-menu';

export default async function Layout({ children }: LayoutProps<'/docs'>) {
  await requireAlumno('/docs');
  const base = baseOptions();
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...base}
      // Dentro de los apuntes, accesos rápidos como iconos en el pie de la barra lateral
      links={[
        { type: 'icon', label: 'Inicio', text: 'Inicio', url: '/', icon: <House /> },
        { type: 'icon', label: 'Aportar', text: 'Aportar', url: '/aportar', icon: <Upload /> },
      ]}
      sidebar={{ footer: <div className="mt-2"><UserMenu /></div> }}
    >
      {children}
    </DocsLayout>
  );
}
