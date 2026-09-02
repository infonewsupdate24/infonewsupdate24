interface Env {
  DEPLOY_HOOK_URL: string;
  FIREBASE_PROJECT_ID?: string;
}

type FirebaseTokenPayload = {
  aud?: string;
  iss?: string;
  sub?: string;
  exp?: number;
  iat?: number;
  user_id?: string;
};

let cachedJwks: { keys: JsonWebKey[]; expiresAt: number } | null = null;

function b64urlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function b64urlToJson<T>(value: string): T {
  const bytes = b64urlToBytes(value);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

async function getFirebaseJwks(projectId: string): Promise<JsonWebKey[]> {
  const now = Date.now();
  if (cachedJwks && cachedJwks.expiresAt > now) {
    return cachedJwks.keys;
  }

  const discoveryUrl =
    `https://securetoken.google.com/${encodeURIComponent(projectId)}/.well-known/openid-configuration`;

  const discoveryResponse = await fetch(discoveryUrl);
  if (!discoveryResponse.ok) {
    throw new Error('Unable to load Firebase OpenID configuration.');
  }

  const discovery = await discoveryResponse.json() as { jwks_uri?: string };
  if (!discovery.jwks_uri) {
    throw new Error('Firebase OpenID configuration has no jwks_uri.');
  }

  const jwksResponse = await fetch(discovery.jwks_uri);
  if (!jwksResponse.ok) {
    throw new Error('Unable to load Firebase signing keys.');
  }

  const jwks = await jwksResponse.json() as { keys?: JsonWebKey[] };
  if (!Array.isArray(jwks.keys) || jwks.keys.length === 0) {
    throw new Error('Firebase signing keys are empty.');
  }

  cachedJwks = {
    keys: jwks.keys,
    expiresAt: now + 60 * 60 * 1000,
  };

  return jwks.keys;
}

async function verifyFirebaseIdToken(
  token: string,
  projectId: string
): Promise<FirebaseTokenPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed Firebase ID token.');
  }

  const header = b64urlToJson<{ alg?: string; kid?: string }>(parts[0]);
  const payload = b64urlToJson<FirebaseTokenPayload>(parts[1]);

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported Firebase ID token.');
  }

  const keys = await getFirebaseJwks(projectId);
  const jwk = keys.find((key: any) => key.kid === header.kid);
  if (!jwk) {
    cachedJwks = null;
    const refreshed = await getFirebaseJwks(projectId);
    const retryKey = refreshed.find((key: any) => key.kid === header.kid);
    if (!retryKey) {
      throw new Error('Firebase signing key was not found.');
    }
    return verifyWithKey(parts, payload, retryKey, projectId);
  }

  return verifyWithKey(parts, payload, jwk, projectId);
}

async function verifyWithKey(
  parts: string[],
  payload: FirebaseTokenPayload,
  jwk: JsonWebKey,
  projectId: string
): Promise<FirebaseTokenPayload> {
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signedBytes = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = b64urlToBytes(parts[2]);

  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    signature,
    signedBytes
  );

  if (!valid) {
    throw new Error('Invalid Firebase ID token signature.');
  }

  const now = Math.floor(Date.now() / 1000);
  const expectedIssuer = `https://securetoken.google.com/${projectId}`;

  if (
    payload.aud !== projectId ||
    payload.iss !== expectedIssuer ||
    !payload.sub ||
    payload.exp == null ||
    payload.iat == null ||
    payload.exp <= now ||
    payload.iat > now + 60
  ) {
    throw new Error('Firebase ID token claims are invalid or expired.');
  }

  return payload;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const projectId = context.env.FIREBASE_PROJECT_ID || 'in24-news-platform-6f802';
    const hookUrl = context.env.DEPLOY_HOOK_URL;

    if (!hookUrl || !hookUrl.startsWith('https://')) {
      return json({ ok: false, message: 'DEPLOY_HOOK_URL is not configured.' }, 500);
    }

    const authorization = context.request.headers.get('Authorization') || '';
    if (!authorization.startsWith('Bearer ')) {
      return json({ ok: false, message: 'Firebase authentication is required.' }, 401);
    }

    const token = authorization.slice('Bearer '.length).trim();
    await verifyFirebaseIdToken(token, projectId);

    // Body is deliberately not trusted for authorization. It is only diagnostic.
    let reason = 'published_content_changed';
    try {
      const body = await context.request.json() as { reason?: string };
      if (body?.reason === 'post_published' || body?.reason === 'post_updated') {
        reason = body.reason;
      }
    } catch {
      // An empty/invalid body does not change the authorization decision.
    }

    const deployResponse = await fetch(hookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'InfoNewsUpdate24-CMS-Rebuild/1.0',
      },
      body: JSON.stringify({ reason }),
    });

    if (!deployResponse.ok) {
      return json(
        {
          ok: false,
          message: `Cloudflare deploy hook returned ${deployResponse.status}.`,
        },
        502
      );
    }

    return json({ ok: true, queued: true });
  } catch (error: any) {
    console.error('Production rebuild request failed:', error);
    return json(
      { ok: false, message: error?.message || 'Production rebuild request failed.' },
      401
    );
  }
};

export const onRequest = async (context: any) => {
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    });
  }
  return onRequestPost(context);
};
