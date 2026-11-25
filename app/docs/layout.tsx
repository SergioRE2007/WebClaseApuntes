import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { requireAlumno } from '@/lib/auth';

export default async function Layout({ children }: LayoutProps<'/docs'>) {
  await requireAlumno('/docs');
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
