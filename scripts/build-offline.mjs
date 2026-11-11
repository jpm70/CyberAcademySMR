/**
 * Genera dist/cyberacademy-smr-offline.html: la app completa en UN solo archivo .html
 * (JS, CSS y logo incrustados) para abrirla sin conexión, desde un pendrive o subirla a Moodle.
 *
 * Se ejecuta después de "vite build" (ver el script "build" de package.json).
 */
import { build } from 'vite';
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'dist-offline';
const TARGET = join('dist', 'cyberacademy-smr-offline.html');

if (!existsSync('dist')) throw new Error('Ejecuta antes "vite build"');

await build({
  configFile: 'vite.config.ts',
  mode: 'offline',
  base: './',
  logLevel: 'warn',
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 5_000,
  },
});

const assetsDir = join(OUT_DIR, 'assets');
const files = readdirSync(assetsDir);
const jsFiles = files.filter((f) => f.endsWith('.js'));
const cssFiles = files.filter((f) => f.endsWith('.css'));
const imageFiles = files.filter((f) => /\.(png|svg|ico|webp|jpg)$/.test(f));
if (jsFiles.length !== 1 || cssFiles.length > 1) {
  throw new Error(`Se esperaba 1 JS y como mucho 1 CSS en ${assetsDir}, hay: ${files.join(', ')}`);
}

const MIME = { png: 'image/png', svg: 'image/svg+xml', ico: 'image/x-icon', webp: 'image/webp', jpg: 'image/jpeg' };
const dataUri = (file) =>
  `data:${MIME[file.split('.').pop()]};base64,${readFileSync(join(assetsDir, file)).toString('base64')}`;
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let html = readFileSync(join(OUT_DIR, 'index.html'), 'utf8');
let js = readFileSync(join(assetsDir, jsFiles[0]), 'utf8');
const css = cssFiles.length ? readFileSync(join(assetsDir, cssFiles[0]), 'utf8') : '';

// Imágenes que Vite emite como archivo (el logo, que también es el favicon): el JS las pide con
// new URL('archivo', import.meta.url), que en un .html suelto apuntaría a un archivo inexistente.
for (const file of imageFiles) {
  const urlCall = new RegExp(
    'new URL\\(\\s*[`\'"](?:\\./)?(?:assets/)?' + escapeRegExp(file) + '[`\'"]\\s*,\\s*import\\.meta\\.url\\s*\\)\\.href',
    'g'
  );
  js = js.replace(urlCall, () => JSON.stringify(dataUri(file)));
  if (js.includes(file)) throw new Error(`El JS sigue referenciando ${file}`);
}

// Un "</script" literal dentro del JS cerraría la etiqueta antes de tiempo
js = js.replace(/<\/script/gi, '<\\/script');

const scriptTag = new RegExp(`<script[^>]*src="[^"]*${escapeRegExp(jsFiles[0])}"[^>]*></script>`);
if (!scriptTag.test(html)) throw new Error('No se encontró la etiqueta <script> del bundle');
html = html.replace(scriptTag, () => '');
if (cssFiles.length) {
  const linkTag = new RegExp(`<link[^>]*href="[^"]*${escapeRegExp(cssFiles[0])}"[^>]*>`);
  if (!linkTag.test(html)) throw new Error('No se encontró el <link> del CSS');
  html = html.replace(linkTag, () => `<style>\n${css}\n</style>`);
}
// Favicon y demás imágenes enlazadas desde el HTML
html = html.replace(/(src|href)="\.\/assets\/([^"]+\.(?:png|svg|ico|webp|jpg))"/g, (_m, attr, file) => `${attr}="${dataUri(file)}"`);
// El módulo va al final del <body>, después de #root
html = html.replace('</body>', () => `<script type="module">\n${js}\n</script>\n</body>`);

if (/(?:src|href)="\.\/assets\//.test(html)) throw new Error('Quedan referencias a ./assets/ sin incrustar');

writeFileSync(TARGET, html);
rmSync(OUT_DIR, { recursive: true, force: true });
console.log(`✓ ${TARGET} (${(html.length / 1024).toFixed(0)} KB)`);
