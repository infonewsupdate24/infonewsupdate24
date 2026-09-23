# Official press card verification

CMS → Press Cards is restricted to active ADMIN / SUPER_ADMIN accounts. Issue a card once, then reopen the saved record to copy its permanent URL, download its locally generated QR, print, renew or revoke. Verify the supplied identity and photograph before issuance. No stock photograph is used. Name, designation and employee ID cannot be reassigned after issuance. Correct mistakes by revoking and issuing a new ID.

`press_cards/{random128bitToken}` contains only the public name, designation, optional HTTPS photograph, employee ID, status and timestamps. Anonymous document gets are allowed; anonymous collection listing is denied. `press_card_ids/{employeeId}` is a permanent admin-only reservation containing the issuer UID and timestamp. Both are created atomically. Duplicate IDs, schema injection, identity changes, deletion and reactivation of revoked cards are denied by rules.

The `/verify-card/{token}` route loads independently of the news and authentication providers. It uses an uncached Firestore batchGet and its server readTime. The expiry date includes the full date in Asia/Kolkata; expiry is evaluated automatically without scheduled jobs or Cloud Functions. It refreshes once a minute while visible and whenever the tab becomes visible or the network reconnects. Offline, timeout and quota errors clear any previous verified result. Legacy `/verify-reporter/{userId}` links show NOT FOUND; reissue those cards with a real saved QR.

Blood group and private user account details are excluded from the public record. The organization's supplied contact details and non-government disclaimer are included. A QR can be copied; compare the displayed identity/photo with the presenter. Verification confirms the organization's issuance record, not government accreditation.

The project remains on Spark; no Blaze service is required. Firestore free quotas still apply. Quota exhaustion displays verification unavailable, never VERIFIED. Hosting must deploy with generated configuration to preserve existing article redirects.

Validation: `npm run lint`; `node --import tsx --test scripts/press_card.test.ts`; `node scripts/test_press_card_rules.cjs <firebase-tools/lib path>`; `npm run build` (or explicit cached snapshot build if existing news reads are quota-limited).
