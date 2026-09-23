// Private, read-only migration snapshot. No passwords, contacts or Auth credentials.
const fs = require('node:fs');
const cli = process.argv[2];
const { requireAuth } = require(cli + '/requireAuth');
const { getProjectDefaultAccount } = require(cli + '/auth');
const { Client } = require(cli + '/apiv2');
(async () => {
  await requireAuth({ project: 'in24-news-platform-6f802', ...getProjectDefaultAccount(process.cwd()), nonInteractive: true });
  const client = new Client({ urlPrefix: 'https://firestore.googleapis.com', apiVersion: 'v1' });
  const base = '/projects/in24-news-platform-6f802/databases/(default)/documents';
  const decode = fields => Object.fromEntries(Object.entries(fields).map(([k,v]) => [k, v.stringValue ?? (v.timestampValue ? Date.parse(v.timestampValue) : v.booleanValue)]));
  const cards = await client.get(base + '/press_cards', { queryParams: { pageSize: 1000 } });
  if (cards.body.nextPageToken) throw Error('More than 1000 cards: paginate before migration.');
  const users = await client.post(base + ':runQuery', { structuredQuery: { from:[{collectionId:'users'}], select:{fields:['role','status','name'].map(fieldPath=>({fieldPath}))}, where:{compositeFilter:{op:'AND',filters:[{fieldFilter:{field:{fieldPath:'status'},op:'EQUAL',value:{stringValue:'ACTIVE'}}},{fieldFilter:{field:{fieldPath:'role'},op:'IN',value:{arrayValue:{values:[{stringValue:'ADMIN'},{stringValue:'SUPER_ADMIN'}]}}}}]}}, limit:1000 } }, {skipLog:{body:true}});
  const admins = (users.body || []).filter(r=>r.document).map(r => ({ uid:r.document.name.split('/').pop(),...decode(r.document.fields) }));
  const data = { exportedAt: Date.now(), cards: (cards.body.documents || []).map(d => decode(d.fields)), admins };
  if (!data.cards.length || !admins.length) throw Error('No verified cards/admins to migrate.');
  fs.mkdirSync('build/press-card-check', { recursive: true });
  fs.writeFileSync('build/press-card-check/migration.json', JSON.stringify(data, null, 2));
  console.log(JSON.stringify({ cards: data.cards.length, admins: admins.map(a => ({ uid: a.uid, role: a.role, name: a.name })) }));
})().catch(e => { console.error(e.message); process.exitCode = 1; });
