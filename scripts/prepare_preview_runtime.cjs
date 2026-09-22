const path = require('node:path');
const { build } = require('esbuild');
const root = path.resolve(__dirname, '..');
build({
  entryPoints: [path.join(root, 'worker/article-preview.mjs')],
  outfile: path.join(root, 'build/cloudflare-preview/worker.mjs'),
  bundle: true, platform: 'browser', format: 'esm', target: 'es2022', minify: true,
}).then(() => console.log('Prepared Cloudflare free preview Worker. Firebase Spark stays unchanged.'))
  .catch(error => { console.error(error); process.exitCode = 1; });
