// Read-only live verification against the private, ignored migration snapshot.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
const snapshot = JSON.parse(fs.readFileSync('build/press-card-check/migration.json', 'utf8'));
const origin = 'https://www.infonewsupdate24.com';
for (const source of snapshot.cards) {
  const response = await fetch(`${origin}/api/press-cards/verify/${source.token}`, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const { card, checkedAt } = await response.json();
  for (const key of ['token', 'employeeId', 'name', 'designation', 'photo', 'status', 'issuedAt', 'expiresAt', 'updatedAt']) {
    assert.equal(card[key], source[key], `Migrated ${key} differs from source`);
  }
  assert.ok(Math.abs(Date.now() - checkedAt) < 60000);
  assert.ok(!('issuedBy' in card) && !('updatedBy' in card));
  const page = await fetch(`${origin}/verify-card/${source.token}`, { signal: AbortSignal.timeout(20000) });
  assert.equal(page.status, 200);
  console.log(`${source.employeeId}: original QR preserved, source fields match, ${card.status}, no-store`);
}
for (const path of ['/api/press-cards', '/api/press-cards/me']) {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 401, 'Anonymous administration must be denied');
}
const admin = await fetch(origin + '/press-card-admin', { signal: AbortSignal.timeout(20000) });
assert.equal(admin.status, 200);
console.log('Admin route: HTTP 200; anonymous management: denied (401).');
