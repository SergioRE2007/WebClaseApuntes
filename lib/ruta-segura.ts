/**
 * Devuelve `n` solo si es una ruta interna segura ("/algo"); si no, `def`.
 * Rechaza "//host", "/\\host", URLs absolutas y caracteres de control/espacios
 * raros que los navegadores normalizan. Sin dependencias de servidor: se puede
 * usar en proxy, route handlers, server actions y páginas.
 */
export function rutaSegura(n: unknown, def = '/docs'): string {
  if (typeof n !== 'string' || n.length === 0 || n.length > 2048) return def;
  if (!/^\/(?![\/\\])/.test(n)) return def;
  // eslint-disable-next-line no-control-regex
  if (/[\\\u0000-\u001f\u007f]/.test(n)) return def;
  try {
    const base = 'http://interno.invalid';
    const u = new URL(n, base);
    if (u.origin !== base) return def;
    return u.pathname + u.search + u.hash;
  } catch {
    return def;
  }
}
