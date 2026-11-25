// Valida uno o varios .mdx sin lanzar el build de Next.
// Uso (desde la raíz del repo):  node <ruta>/validar-mdx.mjs content/docs/2-dam/kotlin/compose/*.mdx
// Comprueba: frontmatter con title y description, que el MDX compila, y que los
// componentes <Mayúscula> usados están registrados en components/mdx.tsx.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const req = (m) => import(pathToFileURL(join(root, 'node_modules', m, 'index.js')).href).catch(() => import(m));
const { compile } = await import(pathToFileURL(join(root, 'node_modules/@mdx-js/mdx/index.js')).href);
const remarkGfm = (await req('remark-gfm')).default;

const registro = readFileSync(join(root, 'components/mdx.tsx'), 'utf8');
const cuerpoRegistro = registro.slice(registro.indexOf('return {'));
const registrados = new Set([...cuerpoRegistro.matchAll(/^\s*([A-Z]\w*)\s*[,:]/gm)].map((m) => m[1]));
// Los de defaultMdxComponents de Fumadocs
for (const n of ['Callout', 'Card', 'Cards', 'CodeBlock', 'Pre']) registrados.add(n);

function expandir(args) {
  const out = [];
  for (const a of args) {
    const p = resolve(root, a);
    if (existsSync(p) && statSync(p).isDirectory()) {
      const rec = (d) => {
        for (const f of readdirSync(d)) {
          const q = join(d, f);
          if (statSync(q).isDirectory()) rec(q);
          else if (q.endsWith('.mdx')) out.push(q);
        }
      };
      rec(p);
    } else out.push(p);
  }
  return out;
}

const archivos = expandir(process.argv.slice(2));
if (!archivos.length) {
  console.error('Pasa archivos .mdx o carpetas.');
  process.exit(2);
}

let fallos = 0;
for (const f of archivos) {
  const errores = [];
  const src = readFileSync(f, 'utf8');
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!fm) errores.push('Falta el frontmatter (--- title / description ---).');
  else {
    if (!/^title:\s*\S/m.test(fm[1])) errores.push('Falta "title" en el frontmatter.');
    if (!/^description:\s*\S/m.test(fm[1])) errores.push('Falta "description" en el frontmatter.');
  }
  const cuerpo = fm ? src.slice(fm[0].length) : src;
  try {
    await compile(cuerpo, { remarkPlugins: [remarkGfm] });
  } catch (e) {
    const pos = e.place?.start ?? e.place ?? e.position?.start;
    const linea = pos?.line ? pos.line + (fm ? fm[0].split('\n').length - 1 : 0) : '?';
    errores.push(`No compila (línea ${linea}): ${e.reason ?? e.message}`);
  }
  // Quita bloques de código, props con plantilla ({`...`}, p. ej. codigo= de <Recorrido>) y código en línea
  const sinCodigo = cuerpo
    .replace(/^(`{3,}|~{3,})[\s\S]*?^\1/gm, '')
    .replace(/\{\s*`(?:\\[\s\S]|[^`\\])*`\s*\}/g, '{}')
    .replace(/`[^`\n]*`/g, '');
  // Componentes importados en el propio MDX (import { A, B as C } from '...'; import D from '...')
  const importados = new Set();
  for (const m of sinCodigo.matchAll(/^import\s+([\s\S]*?)\s+from\s+['"][^'"]+['"]/gm)) {
    for (const parte of m[1].replace(/[{}]/g, ',').split(',')) {
      const nombre = parte.trim().split(/\s+as\s+/).pop()?.trim();
      if (nombre) importados.add(nombre);
    }
  }
  const usados = new Set([...sinCodigo.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)].map((m) => m[1]));
  for (const c of usados)
    if (!registrados.has(c) && !importados.has(c))
      errores.push(`Componente no registrado en components/mdx.tsx ni importado: <${c}>`);
  // Enlaces internos a /docs/... que no existen
  for (const m of sinCodigo.matchAll(/\]\((\/docs\/[^)\s#?]*)[^)]*\)|href=["'](\/docs\/[^"'#?]*)/g)) {
    const ruta = (m[1] ?? m[2]).replace(/\/+$/, '');
    const base = join(root, 'content', ruta.replace(/^\/docs/, 'docs'));
    if (!existsSync(`${base}.mdx`) && !existsSync(join(base, 'index.mdx')))
      errores.push(`Enlace roto: ${ruta}`);
  }
  const rel = f.slice(root.length + 1);
  if (errores.length) {
    fallos++;
    console.log(`✗ ${rel}\n  - ${errores.join('\n  - ')}`);
  } else console.log(`✓ ${rel}`);
}
console.log(`\n${archivos.length - fallos}/${archivos.length} correctos`);
process.exit(fallos ? 1 : 0);
