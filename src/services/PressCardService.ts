import { auth } from './firebase';
import { PressCard, validCardToken } from '../utils/pressCard';

const API = 'https://www.infonewsupdate24.com/api/press-cards';
async function request(path: string, options: RequestInit = {}, admin = true) {
  const headers = new Headers(options.headers);
  if (admin) {
    if (!auth.currentUser) throw Error('Admin login आवश्यक आहे.');
    headers.set('Authorization', `Bearer ${await auth.currentUser.getIdToken()}`);
  }
  if (options.body) headers.set('Content-Type','application/json');
  const response = await fetch(API + path, { ...options, headers, cache:'no-store', signal:options.signal || AbortSignal.timeout(15000) });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw Error(data?.error || 'ID पडताळणी सेवा तात्पुरती उपलब्ध नाही. कृपया पुन्हा प्रयत्न करा.');
  return data;
}
export async function getCardAdmin() { return (await request('/me')).admin as {uid:string;name:string;role:'OWNER'|'ISSUER'}; }
export async function listPressCards() {
  const cards: PressCard[] = []; let next: string | null = null;
  do { const data = await request(next ? `?after=${next}` : ''); cards.push(...data.cards); next = data.next; } while (next);
  return cards.sort((a,b) => b.createdAt - a.createdAt);
}
export async function issuePressCard(input: Pick<PressCard,'employeeId'|'name'|'designation'|'photo'|'issuedAt'|'expiresAt'>) {
  return (await request('',{method:'POST',body:JSON.stringify({...input,token:crypto.randomUUID().replaceAll('-','')})})).token as string;
}
export async function changePressCard(token: string, action:'RENEW'|'REVOKE', expiresAt?:number) {
  await request(`/${token}/${action === 'RENEW' ? 'renew' : 'revoke'}`,{method:'POST',body:JSON.stringify(action === 'RENEW' ? {expiresAt} : {})});
}
export async function listCardAdmins() { return (await request('/admins')).admins as Array<{uid:string;name:string;role:'OWNER'|'ISSUER';active:number}>; }
export async function saveCardAdmin(input:{uid:string;name:string;role:'OWNER'|'ISSUER';active:boolean}) { await request('/admins',{method:'POST',body:JSON.stringify(input)}); }
export async function verifyPressCard(token:string, signal?:AbortSignal):Promise<{card:PressCard|null;checkedAt:number}> {
  if (!validCardToken(token)) return {card:null,checkedAt:Date.now()};
  const result = await request(`/verify/${token}`,{signal},false);
  if (!Number.isFinite(result.checkedAt)) throw Error('पडताळणीचा प्रतिसाद अपूर्ण आहे.');
  if (result.card && (result.card.token !== token || !result.card.name || !['ACTIVE','REVOKED'].includes(result.card.status) || ![result.card.issuedAt,result.card.expiresAt,result.card.createdAt,result.card.updatedAt].every(Number.isFinite))) throw Error('कार्डाची नोंद अपूर्ण आहे.');
  return result;
}
