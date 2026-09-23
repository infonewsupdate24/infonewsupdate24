# Official press card verification

CMS → Press Cards is restricted to active ADMIN / SUPER_ADMIN accounts. Issue a card once, then reopen the saved record to copy its permanent URL, download its locally generated QR, print, renew or revoke. Verify the supplied identity and photograph before issuance. No stock photograph is used. Name, designation and employee ID cannot be reassigned after issuance. Correct mistakes by revoking and issuing a new ID.

The new authoritative database is Cloudflare D1 `infonews-press-cards`. The Worker exposes public GET `/api/press-cards/verify/{token}` and authenticated issuance/list/renew/revoke endpoints. All SQL is parameterized. Unique employee IDs and immutable identity/revocation transitions are also enforced by database constraints/triggers. Audit rows are written transactionally by triggers. Reads use `first-primary` and `no-store`, so public verification never reads Firestore or returns stale cached ACTIVE status.

The public response contains only name, designation, optional HTTPS photograph, employee ID, status and timestamps. Issuer UIDs and audit actors are excluded. Issue Date is an editable India calendar date at issuance; it may be today or a past date (from 2000 onward), not a future date. `createdAt` is the actual server registration time, separate from `issuedAt`. After issuance both are immutable. Expiry includes the entire final date in India.

`/press-card-admin` is a standalone admin portal which uses Firebase Authentication but no Firestore profile reads. Existing active SUPER_ADMIN users are migrated as card OWNERs and ADMINs as ISSUERs. Card permissions are thereafter independent of news CMS roles. An OWNER can grant/disable ISSUER access on that page; changing a news CMS role alone does not change card access. Owner permission changes require the Cloudflare project owner. Firebase JWT signature, algorithm, audience, issuer, issue time, expiry and auth time are checked; signed tokens can remain valid until their normal one-hour expiry after a Firebase account change. Disabling the D1 card permission blocks the next request immediately.

The `/verify-card/{token}` route and all existing tokens remain unchanged. It uses the Worker's server check time; expiry is evaluated automatically without scheduled jobs. It refreshes once a minute while visible and whenever the tab becomes visible or the network reconnects. Offline, timeout and service errors clear the old result. Legacy `/verify-reporter/{userId}` links show NOT FOUND; reissue those cards with a real saved QR.

Blood group and private user account details are excluded from the public record. The organization's supplied contact details and non-government disclaimer are included. A QR can be copied; compare the displayed identity/photo with the presenter. Verification confirms the organization's issuance record, not government accreditation.

Firebase remains on Spark. D1/Workers use their own free quotas; they are not unlimited. Their quota failures display unavailable, never VERIFIED. Hosting must deploy with generated configuration to preserve existing article redirects.

Validation: `npm run lint`; `node --import tsx --test scripts/press_card.test.ts`; `node --test scripts/press_card_worker.test.mjs` (Node 24 SQLite); `npm run build` (or explicit cached snapshot build if news reads are quota-limited).

## Migration and deployment

Do not reconstruct a card's current ACTIVE/REVOKED status from issuance scripts or user screenshots. Read the current source. Until a complete verified migration, the Worker returns 503 with an explicit migration message, not NOT FOUND or VERIFIED.

1. Run `node scripts/export_press_cards.cjs <firebase-tools/lib>` to confirm source reads are available. The private snapshot is saved only under ignored `build/press-card-check`.
2. Freeze legacy Firestore card writes (both press_cards and press_card_ids create/update/delete denied), validate and deploy those rules. Preserve old reads for rollback/history.
3. Re-run the export after the freeze, then immediately run `node scripts/prepare_press_card_migration.mjs`. It refuses stale exports and requires a verified existing SUPER_ADMIN. It preserves every token/status and generates insert-only SQL; it never overwrites existing rows.
4. Apply `worker/press-cards-schema.sql`, then `build/press-card-check/migration.sql` with `wrangler d1 execute infonews-press-cards --remote --config wrangler.press-cards.jsonc --file <file>`. File execution is atomic. The final migration_ready row enables reads only after all card/admin inserts succeed. If a previous import succeeded, inspect rows rather than replacing them or rerunning initial issuance.
5. Deploy `wrangler deploy --config wrangler.press-cards.jsonc`. Build and deploy Hosting with the generated config. Commit/push source so hourly Hosting builds retain routes and the new client.
6. Verify the existing INU24-001 URL against D1, active/revoked/expired states in tests, no-cache headers, denied anonymous administration, and editable Issue Date in the issuance form.

Keep database export files and generated migration SQL out of Git. Never use `issue_initial_press_card.cjs` after the cutover; it writes the retired Firestore backend.

## Completed cutover (2026-09-24 IST)

Legacy Firestore card and ID-registry writes are frozen by deployed rules. All 31 rules tests passed, with no compiler warnings. A fresh post-freeze export migrated one existing card and its active SUPER_ADMIN owner to D1 atomically; `migration_ready=1` is now set. Do not rerun the initial migration.

`node scripts/check_press_card_cutover.mjs` compares the live API to the ignored source snapshot. INU24-001 retained its original QR token and every public source field, returned ACTIVE with no-store, and the admin page returned HTTP 200. Anonymous management returned 401. Eight Worker tests, three date/identity tests and TypeScript checking passed. The browser admin portal requires login; a new production card was not issued as a test.
