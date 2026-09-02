import { auth } from './firebase';

type RebuildResult = {
  ok: boolean;
  queued?: boolean;
  message?: string;
};

/**
 * Requests a production crawler/OG rebuild after a successful PUBLISHED save.
 * The Cloudflare Deploy Hook URL stays server-side in a Pages secret and is
 * never exposed to the browser bundle.
 */
export async function requestProductionRebuild(
  reason: 'post_published' | 'post_updated'
): Promise<RebuildResult> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Cannot request production rebuild: Firebase user is not signed in.');
  }

  const idToken = await user.getIdToken();

  const response = await fetch('/api/rebuild', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });

  let payload: RebuildResult | null = null;
  try {
    payload = await response.json();
  } catch {
    // Keep the useful HTTP error below if the body is not JSON.
  }

  if (!response.ok) {
    throw new Error(
      payload?.message || `Production rebuild request failed (${response.status}).`
    );
  }

  return payload || { ok: true, queued: true };
}
