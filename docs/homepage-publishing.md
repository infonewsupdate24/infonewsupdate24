# Published homepage

The public homepage starts from one verified snapshot containing published posts,
saved sections, categories and menus. The Cloudflare worker injects this JSON into
the current Firebase HTML shell before React starts. Local demo posts and stale
browser posts no longer supply the first render. This is bootstrap data, not
server-rendered React markup; loading assets still depends on the connection.

`worker/homepage.mjs` serves `/`, `/index.html` and `/api/homepage`. Other URLs pass
through; existing, more specific article and press-card worker routes take precedence.
Only source-verified, publicly published posts are included. Firebase staff tokens
and active user roles authorize refresh requests; callers cannot submit snapshot data.

Post saves/deletions and saved layout changes request a refresh. KV propagation can
take about a minute. Open public pages poll every minute. A 15-minute scheduled
refresh recovers missed requests. Source failures retain the last verified version;
CMS shows a retry notice without undoing a successful save or creating duplicates.

`npm run build` embeds a fresh fallback in Firebase's index. An explicit
`npm run build:cached` requires `.firebase/homepage.json` and retains its original
timestamp. It must not be described as fresh. No demo fallback is published.

Deploy the worker with `npx wrangler@4.136.1 deploy --config wrangler.homepage.jsonc`,
then deploy the built Hosting files with `firebase.hosting.generated.json`.

Checks: `npm run lint`; `node --test scripts/homepage.test.mjs
scripts/homepage-client.test.mjs scripts/article_preview.test.mjs
scripts/worker_preview.test.mjs`; `npm run build`.
For a local first-render regression fixture, run `node scripts/preview_homepage_qa.mjs`
and open localhost:4174. It deliberately writes obsolete browser posts/layout and
records the first and subsequent rendered headline/feed in `#homepage-qa`.
This fixture is outside the Hosting directory and must not be published.
