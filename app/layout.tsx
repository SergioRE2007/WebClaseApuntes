import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Toaster } from 'sonner';
import { ChatWidget } from '@/components/chat/chat-widget';
import { env } from '@/lib/env';
import { appName } from '@/lib/shared';
import { cn } from '@/lib/cn';
import './global.css';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

const descripcion =
  'Apuntes de DAM (Desarrollo de Aplicaciones Multiplataforma) con ejercicios, tests y un tutor para resolver dudas.';

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: appName, template: `%s · ${appName}` },
  description: descripcion,
  applicationName: appName,
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: appName,
    title: appName,
    description: descripcion,
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
  colorScheme: 'light dark',
};

/** Traducciones de la interfaz de Fumadocs (buscador, TOC, tema…). */
const traducciones: Record<string, string> = {
  'Search(search trigger)': 'Buscar',
  'Search(search dialog)': 'Buscar en los apuntes…',
  'Open Search(search trigger)(aria-label)': 'Abrir buscador',
  'Close Search(search dialog)(aria-label)': 'Cerrar buscador',
  'No results found(search dialog)': 'Sin resultados',
  'Search failed(search dialog)': 'La búsqueda ha fallado',
  'Search failed, showing results for {query}(search dialog)': 'La búsqueda ha fallado, resultados para {query}',
  'On this page(table of contents)': 'En esta página',
  'No Headings(table of contents)': 'Sin apartados',
  'Table of Contents(inline table of contents)': 'Índice',
  'Last updated on(page footer)': 'Última actualización',
  'Next Page(pagination)': 'Siguiente',
  'Previous Page(pagination)': 'Anterior',
  'Toggle Theme(theme switcher)(aria-label)': 'Cambiar tema',
  'Light(theme switcher)(aria-label)': 'Claro',
  'Dark(theme switcher)(aria-label)': 'Oscuro',
  'System(theme switcher)(aria-label)': 'Sistema',
  'Toggle Menu(home layout header)(aria-label)': 'Abrir menú',
  'Open Sidebar(sidebar)(aria-label)': 'Abrir barra lateral',
  'Close Sidebar(sidebar)(aria-label)': 'Cerrar barra lateral',
  'Close Sidebar(aria-label)': 'Cerrar barra lateral',
  'Collapse Sidebar(sidebar)(aria-label)': 'Contraer barra lateral',
  'Show Sidebar(sidebar)': 'Mostrar barra lateral',
  'Hide Sidebar(sidebar)': 'Ocultar barra lateral',
  'Skip to Content(skip link)': 'Saltar al contenido',
  'Copy Text(code block)(aria-label)': 'Copiar código',
  'Copied Text(code block)(aria-label)': 'Copiado',
  'Copy Anchor Link(heading anchor)(aria-label)': 'Copiar enlace al apartado',
  'Copied Anchor Link(heading anchor)(aria-label)': 'Enlace copiado',
  'Copy Link(accordion)(aria-label)': 'Copiar enlace',
  'Copied Link(accordion)(aria-label)': 'Enlace copiado',
  'Copy Markdown(page actions)': 'Copiar Markdown',
  'Copied Markdown(page actions)': 'Markdown copiado',
  'View as Markdown(page actions)': 'Ver como Markdown',
  'Open(page actions)': 'Abrir',
  'Page Not Found(404 not found page)': 'Página no encontrada',
  'Back to Home(404 not found page)': 'Volver al inicio',
  'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)':
    'La página que buscas no existe, ha cambiado de nombre o no está disponible ahora mismo.',
  'Image Viewer(image zoom)(aria-label)': 'Visor de imágenes',
  'Close(image zoom)(aria-label)': 'Cerrar',
  'Next Image(image zoom)(aria-label)': 'Imagen siguiente',
  'Previous Image(image zoom)(aria-label)': 'Imagen anterior',
  'Close Banner(banner)(aria-label)': 'Cerrar aviso',
  'Ask AI(AI chat button)': 'Preguntar a la IA',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={cn(geistSans.variable, geistMono.variable)} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col font-sans">
        <RootProvider i18n={{ locale: 'es', translations: traducciones }}>
          {children}
          <ChatWidget />
          <Toaster position="top-center" closeButton />
        </RootProvider>
      </body>
    </html>
  );
}
