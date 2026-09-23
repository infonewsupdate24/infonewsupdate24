import fs from 'node:fs';
import assert from 'node:assert/strict';
const data=JSON.parse(fs.readFileSync('build/press-card-check/migration.json','utf8'));
assert.ok(Date.now()-data.exportedAt<15*60*1000,'Export is stale. Re-read Firestore after freezing legacy card writes.');
assert.ok(data.admins.some(a=>a.role==='SUPER_ADMIN'),'Verified existing owner is required.');
const quote=value=>typeof value==='number' ? (assert.ok(Number.isSafeInteger(value)),String(value)) : "'"+String(value).replaceAll("'","''")+"'";
const statements=[];
for(const a of data.admins) {
  assert.ok(a.status==='ACTIVE' && ['SUPER_ADMIN','ADMIN'].includes(a.role));
  statements.push(`INSERT INTO card_admins(uid,name,role,active,updatedAt) VALUES(${[a.uid,a.name,a.role==='SUPER_ADMIN'?'OWNER':'ISSUER',1,data.exportedAt].map(quote).join(',')});`);
}
for(const card of data.cards) {
  assert.match(card.token,/^[a-f0-9]{32}$/);assert.ok(['ACTIVE','REVOKED'].includes(card.status));
  assert.ok([card.issuedAt,card.expiresAt,card.updatedAt].every(Number.isFinite));
  const row=[card.token,card.employeeId,card.name,card.designation,card.photo,card.status,card.issuedAt,card.expiresAt,card.issuedAt,card.updatedAt,'migration:firestore','migration:firestore'];
  statements.push(`INSERT INTO press_cards(token,employeeId,name,designation,photo,status,issuedAt,expiresAt,createdAt,updatedAt,issuedBy,updatedBy) VALUES(${row.map(quote).join(',')});`);
}
// Import through D1 file execution (atomic). Never overwrite a card or reset a revocation.
statements.push("INSERT INTO card_meta(key,value) VALUES('migration_ready','1');");
fs.writeFileSync('build/press-card-check/migration.sql',statements.join('\n')+'\n');
console.log(`Prepared ${data.cards.length} cards and ${data.admins.length} admins; original QR tokens preserved.`);
