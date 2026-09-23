import { createRemoteJWKSet, jwtVerify } from 'jose';

const keys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
const fields = 'token, employeeId, name, designation, photo, status, issuedAt, expiresAt, createdAt, updatedAt';
const validToken = value => typeof value === 'string' && /^[a-f0-9]{32}$/.test(value);
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store, max-age=0', 'X-Content-Type-Options':'nosniff', 'X-Robots-Tag':'noindex, nofollow', 'Referrer-Policy':'no-referrer' } });
}
export function parseIssue(input, now) {
  const allowed = ['token','employeeId','name','designation','photo','issuedAt','expiresAt'];
  if (!input || typeof input !== 'object' || Object.keys(input).some(k => !allowed.includes(k)) || allowed.some(k => !(k in input))) throw new HttpError(400,'कार्डाची माहिती अपूर्ण आहे.');
  const d = { ...input };
  for (const [key,max] of [['name',150],['designation',120],['employeeId',38],['photo',2000]]) {
    if (typeof d[key] !== 'string' || d[key].length > max || (key !== 'photo' && !d[key].trim())) throw new HttpError(400,'नाव, पद आणि ID तपासा.');
    d[key] = d[key].trim();
  }
  if (!validToken(d.token) || !/^INU24-[A-Z0-9-]{1,32}$/.test(d.employeeId)) throw new HttpError(400,'Employee ID अवैध आहे.');
  if (d.photo) { try { const url = new URL(d.photo); if (url.protocol !== 'https:' || url.username || url.password) throw Error(); } catch { throw new HttpError(400,'फोटोसाठी योग्य HTTPS लिंक द्या.'); } }
  // Issue date is an editable India calendar date, not the immutable registration timestamp.
  if (!Number.isSafeInteger(d.issuedAt) || d.issuedAt < Date.UTC(2000,0,1)-19800000 || d.issuedAt > now || (d.issuedAt + 19800000) % 86400000 !== 0) throw new HttpError(400,'Issue Date आजची किंवा मागील तारीख निवडा.');
  if (!Number.isSafeInteger(d.expiresAt) || d.expiresAt <= Math.max(now,d.issuedAt) || d.expiresAt > Date.UTC(2100,0,1) || (d.expiresAt + 19800000) % 86400000 !== 0) throw new HttpError(400,'वैध अंतिम तारीख निवडा.');
  return d;
}
export async function authenticate(request, env, session, verify = jwtVerify) {
  const bearer = request.headers.get('Authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if (!bearer || bearer.length > 12000) throw new HttpError(401,'Admin login आवश्यक आहे.');
  let payload;
  try {
    ({ payload } = await verify(bearer, keys, { algorithms:['RS256'], issuer:`https://securetoken.google.com/${env.FIREBASE_PROJECT}`, audience:env.FIREBASE_PROJECT, requiredClaims:['sub','iat','exp','auth_time'], maxTokenAge:'1h' }));
    if (typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 128 || payload.iat > Date.now()/1000 || !Number.isFinite(payload.auth_time) || payload.auth_time < 0 || payload.auth_time > Date.now()/1000) throw Error();
  } catch { throw new HttpError(401,'Login कालबाह्य आहे. पुन्हा login करा.'); }
  const admin = await session.prepare('SELECT uid, name, role FROM card_admins WHERE uid = ? AND active = 1').bind(payload.sub).first();
  if (!admin) throw new HttpError(403,'या खात्याला ID कार्ड व्यवस्थापनाची परवानगी नाही.');
  return admin;
}
export function createHandler(authenticateAdmin = authenticate) {
  return async (request, env) => {
    try {
      const url = new URL(request.url), path = url.pathname.replace(/\/$/,'');
      const session = env.CARDS.withSession('first-primary');
      const ready = await session.prepare("SELECT value FROM card_meta WHERE key='migration_ready'").first();
      if (ready?.value !== '1') throw new HttpError(503,'ID नोंदी नवीन पडताळणी सेवेत सुरक्षितपणे हलवण्याचे काम सुरू आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.');
      const publicMatch = path.match(/^\/api\/press-cards\/verify\/([a-f0-9]{32})$/);
      if (request.method === 'GET' && publicMatch) {
        const card = await session.prepare(`SELECT ${fields} FROM press_cards WHERE token = ?`).bind(publicMatch[1]).first();
        return json({ card: card || null, checkedAt:Date.now() });
      }
      if (path.startsWith('/api/press-cards/verify/')) return json({ card:null, checkedAt:Date.now() }, request.method === 'GET' ? 200 : 405);
      if (!['GET','POST'].includes(request.method)) return json({error:'Method not allowed'},405);
      if (request.method === 'POST' && request.headers.get('Origin') !== env.SITE_ORIGIN) throw new HttpError(403,'अनधिकृत वेबसाइटवरून विनंती.');
      const admin = await authenticateAdmin(request,env,session);
      if (path === '/api/press-cards/me' && request.method === 'GET') return json({admin});
      if (path === '/api/press-cards' && request.method === 'GET') {
        // Keyset pagination, bounded reads even if the directory grows.
        const cursor = url.searchParams.get('after') || '';
        if (cursor && !validToken(cursor)) throw new HttpError(400,'Invalid cursor');
        const {results} = await session.prepare(`SELECT ${fields} FROM press_cards WHERE token > ? ORDER BY token LIMIT 101`).bind(cursor).all();
        return json({cards:results.slice(0,100), next:results.length > 100 ? results[99].token : null});
      }
      if (path === '/api/press-cards/admins' && request.method === 'GET' && admin.role === 'OWNER') {
        const {results} = await session.prepare('SELECT uid,name,role,active FROM card_admins ORDER BY name LIMIT 100').all();
        return json({admins:results});
      }
      if (request.method !== 'POST') return json({error:'Not found'},404);
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new HttpError(415,'JSON आवश्यक आहे.');
      const bodyText = await request.text();
      if (bodyText.length > 8000) throw new HttpError(413,'माहिती खूप मोठी आहे.');
      let body; try { body = JSON.parse(bodyText); } catch { throw new HttpError(400,'Invalid JSON'); }
      if (path === '/api/press-cards') {
        const now = Date.now(), d = parseIssue(body,now);
        try {
          await session.prepare('INSERT INTO press_cards(token,employeeId,name,designation,photo,status,issuedAt,expiresAt,createdAt,updatedAt,issuedBy,updatedBy) VALUES(?,?,?,?,?,\'ACTIVE\',?,?,?,?,?,?)')
            .bind(d.token,d.employeeId,d.name,d.designation,d.photo,d.issuedAt,d.expiresAt,now,now,admin.uid,admin.uid).run();
        } catch (e) { if (/UNIQUE constraint/i.test(e.message)) throw new HttpError(409,'हा Employee ID आधीच जारी झाला आहे. जतन केलेली नोंद उघडा.'); throw e; }
        return json({token:d.token},201);
      }
      const change = path.match(/^\/api\/press-cards\/([a-f0-9]{32})\/(renew|revoke)$/);
      if (change) {
        const now = Date.now();
        if (!body || typeof body !== 'object' || Object.keys(body).some(k => k !== 'expiresAt') || (change[2] === 'revoke' && Object.keys(body).length)) throw new HttpError(400,'अवैध बदल.');
        let result;
        if (change[2] === 'renew') {
          if (!Number.isSafeInteger(body.expiresAt) || body.expiresAt <= now || body.expiresAt > Date.UTC(2100,0,1) || (body.expiresAt + 19800000) % 86400000 !== 0) throw new HttpError(400,'भविष्यातील अंतिम तारीख निवडा.');
          result = await session.prepare("UPDATE press_cards SET expiresAt=?,updatedAt=?,updatedBy=? WHERE token=? AND status='ACTIVE' AND expiresAt < ?").bind(body.expiresAt,now,admin.uid,change[1],body.expiresAt).run();
        } else result = await session.prepare("UPDATE press_cards SET status='REVOKED',updatedAt=?,updatedBy=? WHERE token=? AND status='ACTIVE'").bind(now,admin.uid,change[1]).run();
        if (result.meta.changes !== 1) throw new HttpError(409,'कार्ड सापडले नाही, रद्द आहे किंवा नवीन मुदत सध्याच्या मुदतीनंतरची नाही.');
        return json({ok:true});
      }
      if (path === '/api/press-cards/admins' && admin.role === 'OWNER') {
        if (!body || typeof body.uid !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(body.uid) || typeof body.name !== 'string' || !body.name.trim() || body.name.length > 150 || !['OWNER','ISSUER'].includes(body.role) || typeof body.active !== 'boolean' || Object.keys(body).some(k=>!['uid','name','role','active'].includes(k))) throw new HttpError(400,'Admin UID, नाव आणि परवानगी तपासा.');
        if (body.uid === admin.uid) throw new HttpError(400,'स्वतःची परवानगी या स्क्रीनवर बदलता येत नाही.');
        // Owners cannot be demoted via this API; project owner can do that through D1.
        const target = await session.prepare('SELECT role FROM card_admins WHERE uid=?').bind(body.uid).first();
        if (target?.role === 'OWNER') throw new HttpError(403,'Owner बदलण्यासाठी प्रकल्पाच्या मालकाशी संपर्क साधा.');
        const result = await session.prepare("INSERT INTO card_admins(uid,name,role,active,updatedAt) VALUES(?,?,?,?,?) ON CONFLICT(uid) DO UPDATE SET name=excluded.name,role=excluded.role,active=excluded.active,updatedAt=excluded.updatedAt WHERE card_admins.role != 'OWNER'").bind(body.uid,body.name.trim(),body.role,body.active ? 1 : 0,Date.now()).run();
        if (result.meta.changes !== 1) throw new HttpError(409,'परवानगी बदलली आहे. यादी पुन्हा लोड करा.');
        return json({ok:true});
      }
      return json({error:'Not found'},404);
    } catch (error) {
      return json({error:error instanceof HttpError ? error.message : 'पडताळणी सेवा तात्पुरती उपलब्ध नाही. थोड्या वेळाने पुन्हा प्रयत्न करा.'},error instanceof HttpError ? error.status : 503);
    }
  };
}
export default { fetch:createHandler() };
