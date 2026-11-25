import { Fragment, type ReactNode } from 'react';

/**
 * Resaltado de sintaxis mínimo (sin dependencias) para bloques interactivos
 * donde no podemos usar Shiki porque el código lleva inputs dentro.
 */

const PALABRAS: Record<string, string[]> = {
  java: 'abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while var record sealed permits yield true false null String'.split(' '),
  kotlin: 'as break class continue do else false for fun if in interface is null object package return super this throw true try typealias val var when while by catch constructor data enum finally get import init internal lateinit open override private protected public sealed set suspend companion String Int Boolean Double'.split(' '),
  javascript: 'async await break case catch class const continue default delete do else export extends false finally for from function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while yield'.split(' '),
  typescript: 'abstract any as async await boolean break case catch class const continue default do else enum export extends false finally for from function if implements import in interface let new null number private protected public readonly return static string super switch this throw true try type typeof undefined var void while'.split(' '),
  python: 'and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield print self'.split(' '),
  csharp: 'abstract as base bool break byte case catch char class const continue decimal default do double else enum false finally float for foreach if int interface internal is long namespace new null object override private protected public readonly return sealed static string struct switch this throw true try using var virtual void while async await'.split(' '),
  sql: 'select from where and or not insert into values update set delete create table primary key foreign references join inner left right full outer on as group by order having limit distinct count sum avg min max null is in like between union all drop alter add constraint index view int integer varchar char date decimal default auto_increment unique asc desc exists case when then else end'.split(' '),
  bash: 'if then else elif fi for in do done while case esac function return echo exit export local sudo cd ls mkdir rm cp mv cat grep'.split(' '),
};
PALABRAS.js = PALABRAS.javascript!;
PALABRAS.ts = PALABRAS.typescript!;
PALABRAS.py = PALABRAS.python!;
PALABRAS.cs = PALABRAS.csharp!;
PALABRAS.kt = PALABRAS.kotlin!;
PALABRAS.sh = PALABRAS.bash!;
PALABRAS.mysql = PALABRAS.sql!;

const COMENTARIO: Record<string, RegExp> = {
  sql: /--[^\n]*|\/\*[\s\S]*?\*\//y,
  mysql: /--[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\//y,
  python: /#[^\n]*/y,
  py: /#[^\n]*/y,
  bash: /#[^\n]*/y,
  sh: /#[^\n]*/y,
};
const COMENTARIO_C = /\/\/[^\n]*|\/\*[\s\S]*?\*\//y;
const CADENA = /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/y;
const NUMERO = /\b\d+(?:\.\d+)?[fFdDlL]?\b/y;
const PALABRA = /[A-Za-z_$][\w$]*/y;
const ANOTACION = /@[A-Za-z_]\w*/y;

export const claseToken = {
  palabra: 'text-purple-700 dark:text-purple-300',
  cadena: 'text-green-700 dark:text-green-300',
  comentario: 'italic text-fd-muted-foreground',
  numero: 'text-amber-700 dark:text-amber-300',
  tipo: 'text-sky-700 dark:text-sky-300',
  anotacion: 'text-pink-700 dark:text-pink-300',
};

export function resaltar(codigo: string, lenguaje = 'java'): ReactNode {
  const lang = lenguaje.toLowerCase();
  const palabras = new Set(PALABRAS[lang] ?? []);
  const insensible = lang === 'sql' || lang === 'mysql';
  const comentario = COMENTARIO[lang] ?? COMENTARIO_C;
  const out: ReactNode[] = [];
  let i = 0;
  let texto = '';
  const volcar = () => {
    if (texto) out.push(<Fragment key={`t${out.length}`}>{texto}</Fragment>);
    texto = '';
  };
  const probar = (re: RegExp) => {
    re.lastIndex = i;
    const m = re.exec(codigo);
    return m && m.index === i ? m[0] : null;
  };
  while (i < codigo.length) {
    let m: string | null;
    let clase: string | null = null;
    if ((m = probar(comentario))) clase = claseToken.comentario;
    else if ((m = probar(CADENA))) clase = claseToken.cadena;
    else if (lang !== 'python' && lang !== 'py' && (m = probar(ANOTACION))) clase = claseToken.anotacion;
    else if ((m = probar(NUMERO))) clase = claseToken.numero;
    else if ((m = probar(PALABRA))) {
      const clave = insensible ? m.toLowerCase() : m;
      if (palabras.has(clave)) clase = claseToken.palabra;
      else if (/^[A-Z][a-z0-9]\w*$/.test(m) && !insensible) clase = claseToken.tipo;
    }
    if (m) {
      if (clase) {
        volcar();
        out.push(
          <span key={`k${out.length}`} className={clase}>
            {m}
          </span>,
        );
      } else texto += m;
      i += m.length;
    } else {
      texto += codigo[i];
      i++;
    }
  }
  volcar();
  return out;
}
