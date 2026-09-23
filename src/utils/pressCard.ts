export interface PressCard {
  token: string; employeeId: string; name: string; designation: string; photo: string;
  status: 'ACTIVE' | 'REVOKED'; issuedAt: number; expiresAt: number; updatedAt: number;
}
export const validCardToken = (token: string) => /^[a-f0-9]{32}$/.test(token);
export const cardUrl = (token: string) => `https://www.infonewsupdate24.com/verify-card/${token}`;
export function cardStatus(card: PressCard, now: number) {
  if (card.status === 'REVOKED') return 'REVOKED';
  if (!Number.isFinite(now) || !Number.isFinite(card.expiresAt) || !Number.isFinite(card.issuedAt) || card.issuedAt > now || card.status !== 'ACTIVE') return 'UNAVAILABLE';
  return now >= card.expiresAt ? 'EXPIRED' : 'ACTIVE';
}
export function expiryFromDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw Error('वैध अंतिम तारीख निवडा.');
  const midnight = Date.parse(`${value}T00:00:00+05:30`);
  if (!Number.isFinite(midnight) || new Date(midnight + 19800000).toISOString().slice(0, 10) !== value) throw Error('वैध अंतिम तारीख निवडा.');
  return midnight + 86400000;
}
export const cardDate = (value: number) => new Date(value).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'long', year: 'numeric' });
export const cardNotice = 'हे ओळखपत्र फक्त संबंधित व्यक्तीसाठी वैध असून हस्तांतरणीय नाही. ओळखपत्राची अनधिकृत प्रत तयार करणे, माहिती बदलणे किंवा गैरवापर करणे प्रतिबंधित आहे. हे ओळखपत्र कोणत्याही शासकीय पद, शासकीय अधिकार किंवा सरकारी मान्यतेचा पुरावा मानू नये.';
