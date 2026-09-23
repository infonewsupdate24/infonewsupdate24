import { useEffect, useState } from 'react';
import { ArrowUpRight, BadgeCheck, CircleAlert, LoaderCircle, Mail, MapPin, Phone, RefreshCw, ShieldCheck } from 'lucide-react';
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
      } catch (e) {
        if (alive && current === generation) setError(e instanceof Error && e.name !== 'AbortError' ? e.message : 'पडताळणी सेवा प्रतिसाद देत नाही. थोड्या वेळाने पुन्हा प्रयत्न करा.');
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
  const StatusIcon = status === 'ACTIVE' ? BadgeCheck : status === 'CHECKING' ? LoaderCircle : CircleAlert;
  const statusColors = status === 'ACTIVE' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : status === 'CHECKING' ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-amber-200 bg-amber-50 text-amber-950';
  return <main className="min-h-screen bg-[#f3f5f8] px-4 py-6 text-slate-900 sm:py-12">
    <article className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="h-1.5 bg-red-600" />
      <header className="flex flex-col items-center gap-5 border-b border-slate-100 px-6 py-7 text-center sm:flex-row sm:px-9 sm:text-left">
        <a href="/" aria-label="Info News Update 24 home" className="shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600">
          <img src="/brand/infonewsupdate24-logo.png" alt="Info News Update 24" width="1254" height="1254" className="h-28 w-28 object-contain sm:h-32 sm:w-32" />
        </a>
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">Info News Update 24</p><h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Official ID Card Verification</h1><p className="mt-2 text-sm text-slate-500">अधिकृत ओळखपत्र पडताळणी</p></div>
      </header>
      <div className="space-y-6 p-5 sm:p-9">
        <section role="status" aria-live="polite" className={`flex items-start gap-3 rounded-2xl border p-4 sm:p-5 ${statusColors}`}>
          <StatusIcon aria-hidden="true" className={`mt-0.5 h-7 w-7 shrink-0 ${status === 'CHECKING' ? 'animate-spin motion-reduce:animate-none' : ''}`} />
          <div><h2 className="text-lg font-bold">{labels[status]}</h2>{status === 'ACTIVE' && <p className="mt-1 text-sm leading-6">सदर ओळखपत्र Info News Update 24 द्वारे जारी केलेले असून संस्थेच्या अधिकृत नोंदीनुसार सक्रिय आहे.</p>}</div>
        </section>
        {error && <p role="alert" className="text-sm leading-6 text-amber-900">{error}</p>}
        {card && <section aria-label="Card holder details" className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="flex items-center gap-4 bg-slate-950 p-5 text-white sm:p-6">
            {card.photo && <img src={card.photo} alt={card.name} className="h-28 w-24 shrink-0 rounded-xl border border-white/20 object-cover" referrerPolicy="no-referrer" />}
            <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Card holder / नाव</p><h2 className="mt-2 break-words text-xl font-bold sm:text-2xl">{card.name}</h2><p className="mt-1 text-sm text-slate-300">{card.designation}</p><p className="mt-3 inline-block rounded-md border border-white/20 px-2.5 py-1 font-mono text-sm">{card.employeeId}</p></div>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 px-5 py-2 sm:grid-cols-2 sm:px-6">{Object.entries({ Organization: 'Info News Update 24', 'Employee ID': card.employeeId, 'Issued On': cardDate(card.issuedAt), 'Valid Till': cardDate(card.expiresAt - 1), 'ID Status': status, 'Verification ID': card.employeeId }).map(([label, value]) => <div key={label} className="min-w-0 border-b border-slate-100 py-4"><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className={`mt-1 break-words text-sm font-semibold ${label === 'ID Status' && status === 'ACTIVE' ? 'text-emerald-700' : 'text-slate-900'}`}>{value}</dd></div>)}</dl>
        </section>}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {result && <p className="text-xs leading-5 text-slate-500">Last checked<br/><span className="text-slate-700">{new Date(result.checkedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span></p>}
          <button onClick={() => setRefresh(v => v + 1)} disabled={status === 'CHECKING'} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-wait disabled:opacity-50"><RefreshCw aria-hidden="true" size={16} />पुन्हा पडताळा</button>
        </div>
        <aside className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"><ShieldCheck aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-slate-500" /><p className="text-xs leading-6 text-slate-600">{cardNotice}</p></aside>
      </div>
      <address className="space-y-4 border-t border-slate-200 bg-slate-50 px-5 py-6 text-sm not-italic sm:px-9">
        <h2 className="font-bold text-slate-900">Official Contact — Info News Update 24</h2>
        <div className="grid gap-3 text-slate-600 sm:grid-cols-2">
          <p className="flex items-start gap-2"><MapPin aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-red-700" />Dist. Gadchiroli, Maharashtra</p>
          <p className="flex flex-wrap items-center gap-2"><Phone aria-hidden="true" size={16} className="shrink-0 text-red-700" /><a className="hover:underline" href="tel:+918799933629">8799933629</a><span>/</span><a className="hover:underline" href="tel:+917588782301">7588782301</a></p>
          <a className="flex min-w-0 items-center gap-2 hover:underline" href="mailto:info@infonewsupdate24.com"><Mail aria-hidden="true" size={17} className="shrink-0 text-red-700" /><span className="break-all">info@infonewsupdate24.com</span></a>
          <a className="flex min-w-0 items-center gap-2 hover:underline" href="https://www.infonewsupdate24.com"><ArrowUpRight aria-hidden="true" size={17} className="shrink-0 text-red-700" /><span className="break-all">www.infonewsupdate24.com</span></a>
        </div>
      </address>
    </article>
    <footer className="mx-auto mt-6 max-w-3xl text-center text-xs leading-6 text-slate-500"><p className="font-medium text-slate-600">“माहितीचा अधिकार, जनतेचा आवाज!”</p><p>© {new Date().getFullYear()} Info News Update 24. All Rights Reserved.</p></footer>
  </main>;
}
