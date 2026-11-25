import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import type { ComponentProps } from 'react';
import type { MDXComponents } from 'mdx/types';
import {
  Card,
  CompletarCodigo,
  Concepto,
  Ejercicio,
  Explicacion,
  Flashcards,
  Glosario,
  Icono,
  MarcarCompletado,
  Mermaid,
  Opcion,
  Pista,
  Pregunta,
  Quiz,
  Solucion,
  Tarjeta,
  Termino,
  Terminal,
} from '@/components/interactive';

/**
 * Componentes disponibles en cualquier .mdx de content/docs sin importar nada.
 * La guía para el autor (content/docs/guia-autor) documenta cada uno.
 */
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // Imágenes con zoom al pulsar
    img: (props: ComponentProps<'img'>) => <ImageZoom {...(props as ComponentProps<typeof ImageZoom>)} />,
    // Fumadocs
    Card,
    Accordion,
    Accordions,
    Step,
    Steps,
    Tab,
    Tabs,
    File,
    Files,
    Folder,
    TypeTable,
    // DAM Apuntes
    Quiz,
    Pregunta,
    Opcion,
    Explicacion,
    Flashcards,
    Tarjeta,
    Ejercicio,
    Pista,
    Solucion,
    Mermaid,
    CompletarCodigo,
    Terminal,
    Concepto,
    Glosario,
    Termino,
    MarcarCompletado,
    Icono,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
