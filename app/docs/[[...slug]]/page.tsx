import { source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { MarcarCompletado } from '@/components/interactive';
import { PreguntarTutor } from '@/components/docs/preguntar-tutor';

/** Temas "de estudio": no portadas de carpeta ni la guía del autor. */
function esTema(page: NonNullable<ReturnType<typeof source.getPage>>) {
  const archivo = page.path.split('/').at(-1) ?? '';
  return page.slugs.length > 0 && !/^index\.mdx?$/.test(archivo) && page.slugs[0] !== 'guia-autor';
}

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const tema = esTema(page);
  // Si el autor ya puso <MarcarCompletado /> en el MDX, no lo duplicamos.
  const conMarcar = tema && !(await page.data.getText('raw')).includes('<MarcarCompletado');

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      // Miga de pan en gris (el acento queda para enlaces y foco)
      breadcrumb={{ className: '[&_.text-fd-primary]:text-fd-muted-foreground [&_.text-fd-primary]:font-normal' }}
      // Anterior/siguiente: solo nombre y flecha, sin la descripción
      footer={{ className: '[&_a>p:last-child]:hidden [&_a]:gap-0 [&_a]:px-4 [&_a]:py-3' }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className={tema ? 'mb-0' : undefined}>{page.data.description}</DocsDescription>
      {tema ? (
        <div className="not-prose mt-3 mb-8 flex flex-wrap items-center gap-2">
          <PreguntarTutor titulo={page.data.title} />
        </div>
      ) : null}
      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
        {conMarcar ? <MarcarCompletado /> : null}
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();
  return { title: page.data.title, description: page.data.description };
}
