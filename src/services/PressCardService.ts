import { collection, doc, getDocsFromServer, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import config from '../../firebase-applet-config.json';
import { PressCard, validCardToken } from '../utils/pressCard';

const decode = (data: any): PressCard => ({ ...data, issuedAt: data.issuedAt.toMillis(), expiresAt: data.expiresAt.toMillis(), updatedAt: data.updatedAt.toMillis() });
export async function listPressCards() {
  const records = await getDocsFromServer(collection(db, 'press_cards'));
  return records.docs.map(s => decode(s.data())).sort((a, b) => b.issuedAt - a.issuedAt);
}
export async function issuePressCard(input: Pick<PressCard, 'employeeId' | 'name' | 'designation' | 'photo' | 'expiresAt'>) {
  if (!auth.currentUser) throw Error('Admin login आवश्यक आहे.');
  if (!/^INU24-[A-Z0-9-]{1,32}$/.test(input.employeeId) || !input.name.trim() || !input.designation.trim() || input.expiresAt <= Date.now()) throw Error('नाव, पद, ID आणि भविष्यातील अंतिम तारीख तपासा.');
  const token = crypto.randomUUID().replaceAll('-', '');
  const registry = doc(db, 'press_card_ids', input.employeeId);
  await runTransaction(db, async tx => {
    if ((await tx.get(registry)).exists()) throw Error('हा Employee ID आधीच जारी झाला आहे. खालील नोंदीतून कार्ड उघडा.');
    tx.set(registry, { token, employeeId: input.employeeId, issuedBy: auth.currentUser!.uid, issuedAt: serverTimestamp() });
    tx.set(doc(db, 'press_cards', token), { ...input, token, status: 'ACTIVE', expiresAt: Timestamp.fromMillis(input.expiresAt), issuedAt: serverTimestamp(), updatedAt: serverTimestamp() });
  });
  return token;
}
export async function changePressCard(token: string, action: 'RENEW' | 'REVOKE', expiresAt?: number) {
  await runTransaction(db, async tx => {
    const ref = doc(db, 'press_cards', token), snapshot = await tx.get(ref);
    if (!snapshot.exists()) throw Error('कार्डाची नोंद सापडली नाही.');
    const card = decode(snapshot.data());
    if (card.status === 'REVOKED') throw Error('रद्द केलेले कार्ड पुन्हा सक्रिय करता येत नाही. नवीन ID जारी करा.');
    if (action === 'RENEW' && (!expiresAt || expiresAt <= Math.max(Date.now(), card.expiresAt))) throw Error('सध्याच्या मुदतीनंतरची तारीख निवडा.');
    tx.update(ref, action === 'REVOKE' ? { status: 'REVOKED', updatedAt: serverTimestamp() } : { expiresAt: Timestamp.fromMillis(expiresAt!), updatedAt: serverTimestamp() });
  });
}

// batchGet supplies a server readTime, so changing the device clock cannot revive an expired card.
// Never fall back to local Firestore persistence or a cached ACTIVE result.
export async function verifyPressCard(token: string, signal?: AbortSignal): Promise<{ card: PressCard | null; checkedAt: number }> {
  if (!validCardToken(token)) return { card: null, checkedAt: Date.now() };
  const database = `projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}`;
  const name = `${database}/documents/press_cards/${token}`;
  const response = await fetch(`https://firestore.googleapis.com/v1/${database}/documents:batchGet?key=${config.apiKey}`, {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ documents: [name] }), signal,
  });
  if (!response.ok) throw Error('सध्या ऑनलाइन पडताळणी उपलब्ध नाही. कृपया पुन्हा प्रयत्न करा किंवा अधिकृत संपर्कावर संपर्क साधा.');
  const results = await response.json();
  const result = Array.isArray(results) && results.find(r => r.found?.name === name || r.missing === name);
  const checkedAt = Date.parse(result?.readTime);
  if (!Number.isFinite(checkedAt)) throw Error('पडताळणीचा प्रतिसाद अपूर्ण आहे.');
  if (result.missing) return { card: null, checkedAt };
  const fields = result.found.fields;
  const str = (key: string) => fields[key]?.stringValue;
  const time = (key: string) => Date.parse(fields[key]?.timestampValue);
  const card: PressCard = { token: str('token'), employeeId: str('employeeId'), name: str('name'), designation: str('designation'), photo: str('photo'), status: str('status'), issuedAt: time('issuedAt'), expiresAt: time('expiresAt'), updatedAt: time('updatedAt') };
  if (card.token !== token || !card.name || !card.employeeId || !card.designation || !['ACTIVE', 'REVOKED'].includes(card.status) || ![card.issuedAt, card.expiresAt, card.updatedAt].every(Number.isFinite)) throw Error('नोंद अपूर्ण आहे. अधिकृत संपर्कावर संपर्क साधा.');
  return { card, checkedAt };
}
