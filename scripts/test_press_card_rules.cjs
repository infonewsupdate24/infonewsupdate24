const fs = require('fs');
const cli = process.argv[2];
if (!cli) throw Error('Pass firebase-tools/lib directory');
const { requireAuth } = require(cli + '/requireAuth');
const { getProjectDefaultAccount } = require(cli + '/auth');
const { Client } = require(cli + '/apiv2');
const token = 'a'.repeat(32), now = '2026-09-22T00:00:00Z';
const card = { token, employeeId: 'INU24-001', name: 'Test Editor', designation: 'Editor', photo: '', status: 'ACTIVE', issuedAt: now, updatedAt: now, expiresAt: '2028-12-31T18:30:00Z' };
const registry = { token, employeeId: card.employeeId, issuedBy: 'admin', issuedAt: now };
const cases = [];
function add(name, method, data, expected = 'DENY', opts = {}) {
  const collection = opts.registry ? 'press_card_ids' : 'press_cards';
  cases.push({ name, test: { expectation: expected, request: { path: `/databases/(default)/documents/${collection}/${opts.registry ? card.employeeId : token}`, method, time: now, auth: opts.anonymous ? null : { uid: 'admin', token: {} }, resource: { data } }, resource: { data: opts.old || (opts.registry ? registry : card) }, functionMocks: [
    { function: 'get', args: [{ anyValue: {} }], result: { value: { data: { role: opts.role || 'ADMIN', status: opts.inactive ? 'SUSPENDED' : 'ACTIVE' } } } },
    { function: 'exists', args: [{ anyValue: {} }], result: { value: true } },
    { function: 'getAfter', args: [{ anyValue: {} }], result: { value: { data: opts.after || (opts.registry ? card : registry) } } },
  ] } });
}
add('anonymous QR get', 'get', card, 'ALLOW', { anonymous: true });
add('anonymous enumeration denied', 'list', card, 'DENY', { anonymous: true });
add('admin listing', 'list', card, 'ALLOW');
add('reporter listing denied', 'list', card, 'DENY', { role: 'REPORTER' });
add('legacy admin issuance frozen', 'create', card);
add('legacy superadmin issuance frozen', 'create', card, 'DENY', { role: 'SUPER_ADMIN' });
add('anonymous issuance denied', 'create', card, 'DENY', { anonymous: true });
add('reporter issuance denied', 'create', card, 'DENY', { role: 'REPORTER' });
add('suspended admin denied', 'create', card, 'DENY', { inactive: true });
add('unreserved / duplicate employee ID denied', 'create', card, 'DENY', { after: { token: 'b'.repeat(32) } });
add('blood group injection denied', 'create', { ...card, bloodGroup: 'B+' });
add('oversized name denied', 'create', { ...card, name: 'x'.repeat(151) });
add('invalid photo denied', 'create', { ...card, photo: 'javascript:alert(1)' });
add('missing fields denied', 'create', { token });
add('backdated issuance denied', 'create', { ...card, issuedAt: '2020-01-01T00:00:00Z' });
add('expired issuance denied', 'create', { ...card, expiresAt: '2020-01-01T00:00:00Z' });
add('legacy revocation frozen', 'update', { ...card, status: 'REVOKED' });
add('legacy renewal frozen', 'update', { ...card, expiresAt: '2029-12-31T18:30:00Z' });
add('revoked card cannot reactivate', 'update', { ...card, expiresAt: '2029-12-31T18:30:00Z' }, 'DENY', { old: { ...card, status: 'REVOKED' } });
add('identity replacement denied', 'update', { ...card, name: 'Someone else', expiresAt: '2029-12-31T18:30:00Z' });
add('ID replacement denied', 'update', { ...card, employeeId: 'INU24-002', expiresAt: '2029-12-31T18:30:00Z' });
add('shortened validity denied', 'update', { ...card, expiresAt: '2027-12-31T18:30:00Z' });
add('schema injection on update denied', 'update', { ...card, status: 'REVOKED', email: 'private@example.com' });
add('malformed timestamp denied', 'update', { ...card, expiresAt: 42 });
add('delete denied', 'delete', card);
add('private registry get denied', 'get', registry, 'DENY', { registry: true, anonymous: true });
add('legacy registry reservation frozen', 'create', registry, 'DENY', { registry: true });
add('orphan registry denied', 'create', registry, 'DENY', { registry: true, after: { employeeId: 'INU24-OTHER' } });
add('issuer spoof denied', 'create', { ...registry, issuedBy: 'someone' }, 'DENY', { registry: true });
add('reservation cannot be reassigned', 'update', { ...registry, token: 'b'.repeat(32) }, 'DENY', { registry: true });
add('reservation cannot be deleted', 'delete', registry, 'DENY', { registry: true });
(async () => {
  await requireAuth({ project: 'in24-news-platform-6f802', ...getProjectDefaultAccount(process.cwd()), nonInteractive: true });
  const client = new Client({ urlPrefix: 'https://firebaserules.googleapis.com', apiVersion: 'v1' });
  const result = await client.post('/projects/in24-news-platform-6f802:test', { source: { files: [{ name: 'firestore.rules', content: fs.readFileSync('firestore.rules', 'utf8') }] }, testSuite: { testCases: cases.map(c => c.test) } }, { skipLog: { body: true } });
  fs.mkdirSync('build/press-card-check', { recursive: true });
  fs.writeFileSync('build/press-card-check/rules-results.json', JSON.stringify(result.body, null, 2));
  const results = (result.body.testResults || []).map((r, i) => ({ name: cases[i].name, state: r.state }));
  console.log(JSON.stringify({ issues: result.body.issues, results }, null, 2));
  if (results.length !== cases.length || results.some(r => r.state !== 'SUCCESS')) process.exitCode = 1;
})().catch(e => { console.error(e.message); process.exitCode = 1; });
