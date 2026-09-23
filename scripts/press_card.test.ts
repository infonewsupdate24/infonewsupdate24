import test from 'node:test';
import assert from 'node:assert/strict';
import { cardStatus, expiryFromDate, validCardToken, cardUrl, PressCard } from '../src/utils/pressCard';
const expiresAt = expiryFromDate('2028-12-31');
const card: PressCard = { token: 'a'.repeat(32), employeeId: 'INU24-001', name: 'Test', designation: 'Editor', photo: '', issuedAt: Date.parse('2026-01-01'), updatedAt: Date.parse('2026-01-01'), expiresAt, status: 'ACTIVE' };
test('expiry includes entire final date in India and flips at midnight', () => {
  assert.equal(new Date(expiresAt).toISOString(), '2028-12-31T18:30:00.000Z');
  assert.equal(cardStatus(card, expiresAt - 1), 'ACTIVE');
  assert.equal(cardStatus(card, expiresAt), 'EXPIRED');
});
test('revocation beats validity and invalid clocks never verify', () => {
  assert.equal(cardStatus({ ...card, status: 'REVOKED' }, expiresAt - 100), 'REVOKED');
  assert.equal(cardStatus(card, NaN), 'UNAVAILABLE');
  assert.equal(cardStatus(card, card.issuedAt - 1), 'UNAVAILABLE');
});
test('reject impossible dates, employee IDs and legacy user IDs as QR tokens', () => {
  for (const date of ['2028-02-30', '31/12/2028', '2028-13-01', '']) assert.throws(() => expiryFromDate(date));
  assert.equal(validCardToken('INU24-001'), false);
  assert.equal(validCardToken('u-1'), false);
  assert.equal(validCardToken(card.token), true);
  assert.equal(cardUrl(card.token), `https://www.infonewsupdate24.com/verify-card/${card.token}`);
});
