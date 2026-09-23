// Explicit one-time issuance of the identity supplied by the site owner.
// Uses existing Firebase CLI project credentials. Never overwrites an issued ID.
const fs = require('fs'), crypto = require('crypto');
const cli = process.argv[2];
if (!cli || process.argv[3] !== '--issue') throw Error('Usage: node scripts/issue_initial_press_card.cjs <firebase-tools/lib> --issue');
const { requireAuth } = require(cli + '/requireAuth'), { getProjectDefaultAccount } = require(cli + '/auth'), { Client } = require(cli + '/apiv2');
(async () => {
  const account = getProjectDefaultAccount(process.cwd());
  await requireAuth({ project: 'in24-news-platform-6f802', ...account, nonInteractive: true });
  const client = new Client({ urlPrefix: 'https://firestore.googleapis.com', apiVersion: 'v1' });
  const base = 'projects/in24-news-platform-6f802/databases/(default)/documents';
  const registryName = `${base}/press_card_ids/INU24-001`;
  let token;
  try { const old = await client.get('/' + registryName); token = old.body.fields.token.stringValue; }
  catch (error) {
    const status = error.status || error.context?.response?.statusCode;
    // A read quota failure is not evidence of absence. The atomic exists:false
    // preconditions below are still authoritative and prevent any overwrite.
    if (![404, 429].includes(status)) throw error;
  }
  if (!token) {
    token = crypto.randomUUID().replaceAll('-', '');
    const stringValue = value => ({ stringValue: value });
    const card = { token: stringValue(token), employeeId: stringValue('INU24-001'), name: stringValue('Komal Daulatrao Dahagaonkar'), designation: stringValue('Chief Editor'), photo: stringValue(''), status: stringValue('ACTIVE'), expiresAt: { timestampValue: '2028-12-31T18:30:00Z' } };
    const registry = { token: stringValue(token), employeeId: stringValue('INU24-001'), issuedBy: stringValue('deployment:' + (account?.user?.email || 'firebase-cli-project-admin')) };
    await client.post('/projects/in24-news-platform-6f802/databases/(default)/documents:commit', { writes: [
      { update: { name: registryName, fields: registry }, currentDocument: { exists: false }, updateTransforms: [{ fieldPath: 'issuedAt', setToServerValue: 'REQUEST_TIME' }] },
      { update: { name: `${base}/press_cards/${token}`, fields: card }, currentDocument: { exists: false }, updateTransforms: [{ fieldPath: 'issuedAt', setToServerValue: 'REQUEST_TIME' }, { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }] },
    ] }, { skipLog: { body: true } });
  }
  const result = { employeeId: 'INU24-001', url: `https://www.infonewsupdate24.com/verify-card/${token}`, token };
  fs.mkdirSync('build/press-card-check', { recursive: true });
  fs.writeFileSync('build/press-card-check/initial-card.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
