import { useEffect, useState } from 'react';
import { verifyPressCard } from '../../services/PressCardService';
import { cardDate, cardNotice, cardStatus, PressCard } from '../../utils/pressCard';

export function PressCardVerificationView({ token }: { token: string }) {
  const [result, setResult] = useState<{ card: PressCard | null; checkedAt: number } | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    document.title = 'Official ID Card Verification | Info News Update 24';
    let alive = true, controller: AbortController | null = null, generation = 0, checked = performance.now();
    const load = async () => {
      const current = ++generation;
      controller?.abort(); controller = new AbortController();
      setResult(null); setError(''); setElapsed(0);
      if (document.hidden) return;
      const timeout = window.setTimeout(() => controller?.abort(), 12000);
      try {
        const value = await verifyPressCard(token, controller.signal);
        if (alive && current === generation) { checked = performance.now(); setResult(value); }
      } catch {
        if (alive && current === generation) setError('ऑनलाइन पडताळणी उपलब्ध नाही. इंटरनेट तपासा किंवा अधिकृत संपर्कावर संपर्क साधा.');
      } finally { clearTimeout(timeout); }
    };
    const offline = () => { ++generation; controller?.abort(); setResult(null); setError('इंटरनेट बंद आहे. पडताळणी पूर्ण झालेली नाही.'); };
    void load();
    const poll = window.setInterval(load, 60000);
    const tick = window.setInterval(() => setElapsed(performance.now() - checked), 1000);
    document.addEventListener('visibilitychange', load);
    window.addEventListener('online', load); window.addEventListener('offline', offline);
    return () => { alive = false; controller?.abort(); clearInterval(poll); clearInterval(tick); document.removeEventListener('visibilitychange', load); window.removeEventListener('online', load); window.removeEventListener('offline', offline); };
  }, [token, refresh]);
  const card = result?.card;
  const status = card && result ? cardStatus(card, result.checkedAt + elapsed) : result ? 'NOT_FOUND' : error ? 'UNAVAILABLE' : 'CHECKING';
  const labels = { ACTIVE: '✓ VERIFIED – ACTIVE', EXPIRED: 'EXPIRED — मुदत संपलेली आहे', REVOKED: 'REVOKED — ओळखपत्र रद्द केले आहे', NOT_FOUND: 'NOT FOUND — अधिकृत नोंद सापडली नाही', UNAVAILABLE: 'पडताळणी उपलब्ध नाही', CHECKING: 'अधिकृत नोंद तपासत आहोत…' };
  return <main className="min-h-screen bg-slate-100 py-10 px-4 text-slate-900"><article className="mx-auto max-w-xl overflow-hidden rounded-2xl bg-white shadow-lg">
    <header className="bg-slate-950 px-6 py-7 text-white"><a href="/" className="font-black text-2xl">INFO NEWS UPDATE 24</a><p className="mt-2 text-sm tracking-wide">OFFICIAL ID CARD VERIFICATION</p></header>
    <div className="p-6 space-y-6"><h1 role="status" className={`rounded-xl p-4 font-bold ${status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>{labels[status]}</h1>
      {error && <p role="alert">{error}</p>}
      {card && <>
        {status === 'ACTIVE' && <p>सदर ओळखपत्र Info News Update 24 द्वारे जारी केलेले असून संस्थेच्या अधिकृत नोंदीनुसार सक्रिय आहे.</p>}
        {card.photo && <img src={card.photo} alt={card.name} className="w-28 h-32 rounded-lg object-cover" referrerPolicy="no-referrer" />}
        <dl className="space-y-3">{Object.entries({ Name: card.name, Designation: card.designation, 'Employee ID': card.employeeId, Organization: 'Info News Update 24', 'Issued On': cardDate(card.issuedAt), 'Valid Till': cardDate(card.expiresAt - 1), 'ID Status': status, 'Verification ID': card.employeeId }).map(([label, value]) => <div key={label} className="border-b pb-2"><dt className="text-xs text-slate-500">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl>
      </>}
      {result && <p className="text-sm text-slate-600">Last checked: {new Date(result.checkedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>}
      <button onClick={() => setRefresh(v => v + 1)} className="rounded-lg bg-slate-900 px-5 py-3 text-white">पुन्हा पडताळा</button>
      <p className="text-sm leading-relaxed">{cardNotice}</p>
      <address className="not-italic border-t pt-4 text-sm space-y-1"><strong>Official Contact — Info News Update 24</strong><p>Etapalli, Dist. Gadchiroli, Maharashtra</p><p><a href="tel:+918799933629">8799933629</a> / <a href="tel:+917588782301">7588782301</a></p><p><a href="mailto:info@infonewsupdate24.com">info@infonewsupdate24.com</a></p><a href="https://www.infonewsupdate24.com">www.infonewsupdate24.com</a></address>
      <footer className="text-center text-xs text-slate-500">“माहितीचा अधिकार, जनतेचा आवाज!”<br/>© {new Date().getFullYear()} Info News Update 24. All Rights Reserved.</footer>
    </div></article></main>;
}
