import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../../context/AuthContext';
import { changePressCard, issuePressCard, listPressCards, verifyPressCard } from '../../services/PressCardService';
import { cardDate, cardNotice, cardStatus, cardUrl, expiryFromDate, indiaToday, issueFromDate, PressCard } from '../../utils/pressCard';

export function PressCardManagerView() {
  const { currentUser } = useAuth();
  const admin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUser?.role || '') && currentUser?.status === 'ACTIVE';
  return <PressCardManagerContent admin={admin} />;
}

export function PressCardManagerContent({admin}: {admin:boolean}) {
  const [cards, setCards] = useState<PressCard[]>([]), [selected, setSelected] = useState<PressCard | null>(null);
  const [form, setForm] = useState({ name: '', designation: '', employeeId: 'INU24-', photo: '', issued: indiaToday(), expiry: '2028-12-31' });
  const [renewal, setRenewal] = useState(''), [confirmRevoke, setConfirmRevoke] = useState(false);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [qr, setQr] = useState('');
  const [serviceState,setServiceState] = useState<'checking'|'ready'|'blocked'>('checking');
  const [serviceError,setServiceError] = useState('');
  const reload = async () => {
    setServiceState('checking'); setServiceError('');
    try { const rows = await listPressCards(); setCards(rows); setServiceState('ready'); return rows; }
    catch(e) { setServiceState('blocked'); setServiceError(e instanceof Error ? e.message : 'कार्ड सेवा उपलब्ध नाही.'); throw e; }
  };
  useEffect(() => { if (admin) void reload().catch(() => {}); }, [admin]);
  useEffect(() => {
    setQr(''); setConfirmRevoke(false); setRenewal(''); let active = true;
    if (selected) void QRCode.toDataURL(cardUrl(selected.token), { width: 320, margin: 4, errorCorrectionLevel: 'M' }).then(value => { if (active) setQr(value); }).catch(() => setMessage('QR तयार झाला नाही. कार्ड पुन्हा उघडा.'));
    return () => { active = false; };
  }, [selected?.token]);
  const perform = async (action: () => Promise<void>) => {
    setBusy(true); setMessage('');
    try { await action(); } catch (e) { setMessage(e instanceof Error ? e.message : 'क्रिया पूर्ण झाली नाही. पुन्हा प्रयत्न करा.'); } finally { setBusy(false); }
  };
  const mutate = async (action: 'RENEW' | 'REVOKE') => {
    if (!selected) return;
    await changePressCard(selected.token, action, action === 'RENEW' ? expiryFromDate(renewal) : undefined);
    setSelected(null); setConfirmRevoke(false);
    const rows = await reload(); setSelected(rows.find(c => c.token === selected.token) || null);
    setMessage(action === 'RENEW' ? 'मुदत वाढवली. QR लिंक कायम आहे.' : 'कार्ड कायमचे रद्द केले. जुना QR आता REVOKED दाखवेल.');
  };
  const print = async () => {
    if (!selected || !qr) return;
    const result = await verifyPressCard(selected.token, AbortSignal.timeout(12000));
    if (!result.card || cardStatus(result.card, result.checkedAt) !== 'ACTIVE') throw Error('ऑनलाइन पडताळणीत कार्ड ACTIVE नाही. प्रिंट थांबवली आहे.');
    setSelected(result.card);
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    window.print();
  };
  if (!admin) return <div className="p-8">ओळखपत्र जारी / रद्द करण्यासाठी सक्रिय Admin खाते आवश्यक आहे.</div>;
  const inputClass = 'w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900';
  const buttonClass = 'rounded-lg bg-slate-900 px-4 py-3 text-white disabled:opacity-50';
  return <div className="space-y-6 text-slate-900">
    <style>{`@media print { body * { visibility:hidden !important; } #issued-press-card, #issued-press-card * { visibility:visible !important; } #issued-press-card { position:absolute; left:0; top:0; width:95mm; margin:0; box-shadow:none; print-color-adjust:exact; -webkit-print-color-adjust:exact; } }`}</style>
    <header><h1 className="text-2xl font-black">अधिकृत ओळखपत्र आणि QR पडताळणी</h1><p className="mt-2 text-slate-600">जारी केलेली नोंद जतन राहते. मुदत आपोआप तपासली जाते. रद्द केलेल्या कार्डाचा QR पुन्हा सक्रिय होत नाही.</p></header>
    {serviceState !== 'ready' && <div role="alert" className="rounded-xl border border-amber-400 bg-amber-50 p-4 space-y-2"><strong>{serviceState === 'checking' ? 'कार्ड जतन करण्याची सेवा तपासत आहोत…' : 'सध्या नवीन कार्ड जतन करता येणार नाही'}</strong>{serviceError && <p>{serviceError}</p>}<p className="text-sm">सेवा उपलब्ध झाल्यानंतरच जतन करा बटण सुरू होईल.</p><button type="button" disabled={serviceState === 'checking' || busy} className={buttonClass} onClick={()=>void perform(async()=>{await reload();setMessage('कार्ड सेवा उपलब्ध आहे. आता कार्ड जतन करू शकता.');})}>सेवा पुन्हा तपासा</button></div>}
    {message && <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4">{message}</p>}
    <form className="rounded-xl border bg-white p-5 space-y-4" onSubmit={e => { e.preventDefault(); void perform(async () => {
      if (serviceState !== 'ready') throw Error('कार्ड सेवा उपलब्ध झाल्याशिवाय जतन करता येणार नाही.');
      const token = await issuePressCard({ name: form.name.trim(), designation: form.designation.trim(), employeeId: form.employeeId.trim().toUpperCase(), photo: form.photo.trim(), issuedAt: issueFromDate(form.issued), expiresAt: expiryFromDate(form.expiry) });
      setMessage('कार्ड जारी झाले आणि अधिकृत नोंद जतन झाली.');
      try { const rows = await reload(); setSelected(rows.find(c => c.token === token) || null); }
      catch { setMessage('कार्ड जतन झाले आहे, पण यादी पुन्हा लोड झाली नाही. हे कार्ड पुन्हा जारी करू नका; सेवा उपलब्ध झाल्यावर नोंदी पुन्हा लोड करा.'); }
    }); }}>
      <h2 className="text-lg font-bold">नवीन कार्ड जारी करा</h2>
      <div className="grid gap-4 md:grid-cols-2">{([{ key: 'name', label: 'पूर्ण नाव', max: 150 }, { key: 'designation', label: 'पद', max: 120 }, { key: 'employeeId', label: 'Employee ID (उदा. INU24-001)', max: 38 }, { key: 'photo', label: 'अधिकृत फोटोची HTTPS लिंक (ऐच्छिक)', max: 2000 }, { key: 'issued', label: 'Issue Date — जारी तारीख', max: 10 }, { key: 'expiry', label: 'वैध अंतिम तारीख — भारताची वेळ', max: 10 }] as const).map(field => <label key={field.key} className="space-y-1 text-sm"><span>{field.label}</span><input required={field.key !== 'photo'} type={(field.key === 'expiry' || field.key === 'issued') ? 'date' : field.key === 'photo' ? 'url' : 'text'} max={field.key === 'issued' ? indiaToday() : undefined} maxLength={field.max} value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className={inputClass} /></label>)}</div>
      <p className="text-sm text-slate-600">जारी करण्यापूर्वी नाव, पद आणि फोटो तपासा. जारी केल्यानंतर ओळख बदलता येत नाही. चुकीचे कार्ड रद्द करून नवीन ID जारी करा. रक्तगट सार्वजनिक नोंदीत साठवला जात नाही.</p>
      <button disabled={busy || serviceState !== 'ready'} className={buttonClass}>{busy ? 'प्रक्रिया सुरू आहे…' : serviceState !== 'ready' ? 'कार्ड जतन करणे सध्या बंद आहे' : 'अधिकृत कार्ड जारी व जतन करा'}</button>
    </form>
    <section className="rounded-xl border bg-white p-5 space-y-4"><div className="flex justify-between items-center"><h2 className="font-bold">जारी केलेली कार्डे ({cards.length})</h2><button disabled={busy} className={buttonClass} onClick={() => void perform(async () => { await reload(); setMessage('नोंदी अद्ययावत केल्या.'); })}>नोंदी पुन्हा लोड करा</button></div>
      {!cards.length && <p>सध्या कोणतीही नोंद लोड झालेली नाही.</p>}
      <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr>{['ID', 'नाव', 'मुदत', 'स्थिती', ''].map((h, i) => <th className="p-3" key={i}>{h}</th>)}</tr></thead><tbody>{cards.map(card => <tr key={card.token} className="border-t"><td className="p-3">{card.employeeId}</td><td className="p-3">{card.name}</td><td className="p-3">{cardDate(card.expiresAt - 1)}</td><td className="p-3">{cardStatus(card, Date.now())}</td><td className="p-3"><button disabled={busy} className="font-bold underline" onClick={() => setSelected(card)}>कार्ड उघडा</button></td></tr>)}</tbody></table></div>
    </section>
    {selected && <section className="grid gap-6 lg:grid-cols-2">
      <article id="issued-press-card" className="max-w-sm overflow-hidden rounded-xl border-2 border-slate-900 bg-white shadow-lg">
        <header className="bg-slate-950 p-5 text-white"><h2 className="text-xl font-black">INFO NEWS UPDATE 24</h2><p className="text-xs tracking-widest mt-1">OFFICIAL PRESS ID CARD</p></header>
        <div className="p-5 space-y-3 text-center">{selected.photo && <img src={selected.photo} alt={selected.name} className="mx-auto h-28 w-24 object-cover rounded" referrerPolicy="no-referrer" />}
          <h3 className="text-xl font-bold">{selected.name}</h3><p>{selected.designation}</p><p className="font-mono font-bold">{selected.employeeId}</p>
          <p className="text-sm">Issued: {cardDate(selected.issuedAt)}<br/>Valid till: {cardDate(selected.expiresAt - 1)}</p>
          <p className="font-bold">{cardStatus(selected, Date.now())}</p>
          {qr && <img src={qr} alt="Scan to verify this ID" className="mx-auto h-40 w-40" />}
          <p className="text-xs">QR स्कॅन करून सध्याची स्थिती पडताळा.<br/>www.infonewsupdate24.com</p>
          <p className="text-[10px] text-left leading-relaxed">{cardNotice}</p>
          <p className="text-xs">Etapalli, Gadchiroli, Maharashtra<br/>8799933629 / 7588782301<br/>info@infonewsupdate24.com</p>
        </div>
      </article>
      <div className="rounded-xl border bg-white p-5 space-y-4"><h2 className="font-bold">कार्ड व्यवस्थापन</h2>
        <a href={cardUrl(selected.token)} target="_blank" rel="noreferrer" className="block text-blue-700 underline break-all">प्रत्यक्ष पडताळणी पेज उघडा</a>
        <button disabled={busy} className={buttonClass} onClick={() => void perform(async () => { await navigator.clipboard.writeText(cardUrl(selected.token)); setMessage('पडताळणी लिंक कॉपी केली.'); })}>लिंक कॉपी करा</button>{' '}
        <button disabled={busy || !qr || cardStatus(selected, Date.now()) !== 'ACTIVE'} className={buttonClass} onClick={() => void perform(print)}>पडताळा आणि प्रिंट / PDF</button>
        {qr && <a download={`${selected.employeeId}-QR.png`} href={qr} className="block text-blue-700 underline">QR PNG डाउनलोड करा</a>}
        {selected.status !== 'REVOKED' && <><label className="block space-y-2"><span>नवीन अंतिम तारीख</span><input type="date" value={renewal} onChange={e => setRenewal(e.target.value)} className={inputClass}/></label><button disabled={busy || !renewal} className={buttonClass} onClick={() => void perform(() => mutate('RENEW'))}>मुदत वाढवा</button>
          <div className="border-t pt-4"><label className="flex gap-2"><input type="checkbox" checked={confirmRevoke} onChange={e => setConfirmRevoke(e.target.checked)}/> हे कार्ड कायमचे रद्द करायचे आहे.</label><button disabled={busy || !confirmRevoke} className="mt-3 rounded-lg bg-red-700 text-white px-4 py-3 disabled:opacity-40" onClick={() => void perform(() => mutate('REVOKE'))}>कार्ड कायमचे रद्द करा</button></div></>}
      </div>
    </section>}
  </div>;
}
