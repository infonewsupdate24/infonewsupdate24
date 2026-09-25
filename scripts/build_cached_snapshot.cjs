// Explicit recovery build when Spark cannot supply a fresh SEO snapshot.
// Never run this automatically in the hourly freshness workflow.
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const snapshot = '.firebase/seo-posts.json';
if (!fs.existsSync(snapshot)) throw new Error('No previously verified SEO snapshot is available.');
console.log(`Using last verified article snapshot from ${fs.statSync(snapshot).mtime.toISOString()}; this is not a fresh content sync.`);
for (const args of [
  ['node_modules/vite/bin/vite.js', 'build'],
  ['scripts/generate_article_seo_pages.cjs'],
  ['scripts/validate_seo.cjs'],
  ['scripts/prepare_preview_runtime.cjs'],
  ['scripts/generate_homepage_snapshot.mjs', '--cached'],
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
