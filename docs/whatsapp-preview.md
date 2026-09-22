# Free live WhatsApp previews

Firebase remains on Spark. There are no Cloud Functions, Blaze billing changes,
service-account keys, new database rules or paid upgrades for this feature.

The Cloudflare Worker `infonews-article-preview` handles only
`www.infonewsupdate24.com/news/*`. The domain already uses Cloudflare; DNS and the
rest of the Firebase site remain unchanged. It reads the requested article with
the Firestore REST API under existing public-read rules, filters unpublished,
private, deleted, scheduled and test entries, and inserts fresh social metadata
into the current Firebase Hosting HTML shell. The free `PREVIEW_ARTICLES` KV
namespace stores the last verified public metadata; readers use that shared copy
instead of consuming a Firestore read on every page view. A 60-second edge cache
also reduces repeated rendering. KV entries are rechecked after six hours or
when a newer version is requested by the CMS/share link.
Fetching the current shell keeps Firebase asset URLs aligned after later builds.

New articles and edits no longer depend on the hourly sitemap/Hosting build.
Confirmed missing/private articles return 404. A database outage serves the last
verified KV entry, or the existing Firebase static article, when available. An
unknown article during an outage returns 503 instead of inventing a 404. No write
endpoint is exposed. Existing local spotlight stories
remain supported. Database records take precedence over local story data.

The shared CMS save flow checks public featured images before first publication,
visibility changes or image changes (including Quick Edit and bulk publication).
Inline media-library images are uploaded using the existing Cloudinary setup.
The shared save/delete flow requests a new preview version, including when a
published article becomes private or is removed. KV propagation and the short
edge cache can delay bare-link updates by a minute or more; versioned share URLs
bypass older entries. Changes outside this CMS may wait for revalidation.
The editor checks the public HTML ID/version/title/image after saving. Save
success and preview readiness are reported separately. The former LiteSpeed
panel now performs actual preview checks instead of displaying simulated cache
statistics or successful purge/crawl/optimization messages.

## Commands

- `npm run test:preview`: handler and Worker regression tests.
- `npm run lint`: TypeScript checks.
- `npm run build`: website, static SEO validation and isolated Worker bundle.
- `npm run build:cached`: explicit outage-recovery build from the last verified
  local snapshot. Does not pretend to fetch current content or run in normal CI.
- `npm run deploy:preview`: deploy Worker code and its existing news-only route.
- `npm run deploy:hosting`: deploy the Firebase website; no Blaze services.
- `node scripts/check_preview_worker.mjs https://www.infonewsupdate24.com`: live
  WhatsApp user-agent HTML/image/404 smoke checks.

Wrangler uses the operator's existing Cloudflare login. Never put credentials in
the repository. The hourly workflow deploys Firebase Hosting only; it cannot
remove the independently managed Cloudflare route. Deploy the Worker separately
when its code or shared rendering logic changes.

## Free-tier limits and operational boundaries

Cloudflare Workers Free currently allows 100,000 requests/day with 10 ms CPU per
request. Waiting for network responses does not consume CPU time. Firestore and
Cloudinary retain their existing free-tier quotas. KV Free allows 100,000 reads
and 1,000 writes per day. This is a free-tier solution,
not unlimited capacity. No paid upgrades are configured or authorized.

On 2026-09-22 Firestore temporarily returned HTTP 429 (quota exceeded). The 97 entries from the
last verified 09:19 UTC snapshot were seeded into KV so already published
previews remain available. Live reads subsequently recovered. During any future
quota outage, newly changed data still requires Firebase to become readable;
a paid upgrade was not enabled. The CMS must not report newer metadata
as ready if it does not match the public response.

The checks verify public page/image availability, not WhatsApp's internal cache
or an individual user's link-preview settings. Previously sent messages may
retain an old preview. Share links already use a content version after edits.

Rollback: remove this Worker's news route in Cloudflare or deploy its config
with an empty `routes` list. Firebase static article pages remain available, but
the old build delay for new content returns. No database rollback is needed.

References:
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/
