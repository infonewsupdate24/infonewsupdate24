import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, CheckCircle2, Eye, FileText, Loader2, MapPin, Plus, Save, Trash2, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EPaperEditionService, type EPaperDistrict, type StoredEPaperEdition } from '../../services/EPaperEditionService';

const todayIso = () => new Date().toISOString().slice(0, 10);

export const EPaperManagerView: React.FC = () => {
  const { epaperSettings, updateEPaperSettings } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editions, setEditions] = useState<StoredEPaperEdition[]>([]);
  const [districts, setDistricts] = useState<EPaperDistrict[]>([EPaperEditionService.defaultDistrict]);
  const [districtCode, setDistrictCode] = useState('gadchiroli');
  const [publicationDate, setPublicationDate] = useState(todayIso);
  const [title, setTitle] = useState('गडचिरोली दैनिक ई-पेपर');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [newDistrictName, setNewDistrictName] = useState('');

  useEffect(() => {
    void EPaperEditionService.ensureDefaultDistrict().catch(() => undefined);
    const stopEditions = EPaperEditionService.subscribeAll(setEditions);
    const stopDistricts = EPaperEditionService.subscribeDistricts(setDistricts);
    return () => { stopEditions(); stopDistricts(); };
  }, []);

  const activeDistrict = useMemo(() => districts.find((item) => item.code === districtCode) || districts[0], [districtCode, districts]);
  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true); setMessage('');
    try { await action(); setMessage(success); }
    catch (error) { setMessage(`❌ ${error instanceof Error ? error.message : 'कृती पूर्ण झाली नाही.'}`); }
    finally { setBusy(false); }
  };

  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !activeDistrict) { setMessage('❌ PDF file निवडा.'); return; }
    await run(async () => {
      await EPaperEditionService.createEdition({ district: activeDistrict, publicationDate, title, file }, setProgress);
      setFile(null); setProgress(0); if (fileInputRef.current) fileInputRef.current.value = '';
    }, '✅ PDF upload झाला. Preview तपासून Publish करा.');
  };

  const addDistrict = async () => {
    const name = newDistrictName.trim(); if (!name) return;
    const code = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `district-${Date.now()}`;
    await run(async () => {
      await EPaperEditionService.saveDistrict({ code, name, isActive: true, displayOrder: districts.length + 1 });
      setNewDistrictName('');
    }, '✅ नवीन district उपलब्ध झाला.');
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div><p className="text-xs font-black uppercase tracking-wider text-red-600">Real E-Newspaper Publishing</p><h1 className="mt-1 text-2xl font-black text-slate-900">ई-पेपर अंक व्यवस्थापन</h1><p className="mt-1 text-sm text-slate-600">PDF upload करा, preview तपासा आणि मग public portal वर publish करा.</p></div>
      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="text-sm font-bold">Public Portal</span><input type="checkbox" checked={epaperSettings.publicPortalEnabled} onChange={(event) => void run(() => updateEPaperSettings({ publicPortalEnabled: event.target.checked }), event.target.checked ? '✅ Public E-paper ON झाला.' : '✅ Public E-paper OFF झाला.')} className="h-5 w-5" /><span className={`text-sm font-black ${epaperSettings.publicPortalEnabled ? 'text-emerald-700' : 'text-red-700'}`}>{epaperSettings.publicPortalEnabled ? 'ON' : 'OFF'}</span></label>
    </div>
    {message && <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold">{message}</div>}
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <form onSubmit={upload} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><Upload className="h-5 w-5 text-red-600" /><h2 className="text-lg font-black">नवीन PDF अंक</h2></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">District<select value={districtCode} onChange={(e) => setDistrictCode(e.target.value)} className="mt-1 block w-full rounded-xl border p-3">{districts.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label><label className="text-sm font-bold">अंकाची तारीख<input type="date" required value={publicationDate} onChange={(e) => setPublicationDate(e.target.value)} className="mt-1 block w-full rounded-xl border p-3" /></label></div>
        <label className="block text-sm font-bold">अंकाचे नाव<input required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-xl border p-3" /></label>
        <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center"><FileText className="mx-auto h-10 w-10 text-red-600" /><span className="mt-3 block text-sm font-black">{file ? file.name : 'PDF file निवडा'}</span><span className="mt-1 block text-xs text-slate-500">कमाल 25 MB</span><input ref={fileInputRef} type="file" accept="application/pdf,.pdf" required onChange={(e) => setFile(e.target.files?.[0] || null)} className="sr-only" /></label>
        {busy && progress > 0 && <div className="h-2 rounded-full bg-slate-200"><div className="h-full rounded-full bg-red-600" style={{ width: `${progress}%` }} /></div>}
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 p-3 text-sm font-black text-white disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Upload as Draft</button>
      </form>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-blue-600" /><h2 className="font-black">District व्यवस्था</h2></div><p className="mt-2 text-xs text-slate-500">सध्या गडचिरोली. नंतर येथे district जोडता येईल.</p><div className="mt-4 flex gap-2"><input value={newDistrictName} onChange={(e) => setNewDistrictName(e.target.value)} placeholder="नवीन district" className="min-w-0 flex-1 rounded-xl border p-2.5 text-sm" /><button type="button" disabled={busy || !newDistrictName.trim()} onClick={() => void addDistrict()} className="rounded-xl bg-slate-900 p-3 text-white disabled:opacity-50"><Plus className="h-4 w-4" /></button></div><div className="mt-4 space-y-2">{districts.map((item) => <div key={item.code} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold">{item.name}</div>)}</div></div>
    </div>
    <section className="space-y-3"><div className="flex items-center gap-2"><Archive className="h-5 w-5" /><h2 className="text-lg font-black">Uploaded editions</h2></div>{!editions.length && <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-slate-500">अजून वास्तविक PDF अंक upload केलेला नाही.</div>}<div className="grid gap-4 lg:grid-cols-2">{editions.map((edition) => <article key={edition.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><div><span className={`rounded-full px-2 py-1 text-xs font-black ${edition.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{edition.status}</span><h3 className="mt-2 font-black">{edition.title}</h3><p className="mt-1 text-xs text-slate-500">{edition.districtName} • {edition.publicationDate} • {(edition.fileSizeBytes / 1048576).toFixed(1)} MB</p></div><FileText className="h-8 w-8 text-red-600" /></div><div className="mt-4 flex flex-wrap gap-2"><a href={edition.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold"><Eye className="h-4 w-4" /> Preview</a><button disabled={busy} onClick={() => void run(() => EPaperEditionService.setPublished(edition, edition.status !== 'PUBLISHED'), edition.status === 'PUBLISHED' ? '✅ अंक public मधून काढला.' : '✅ अंक publish झाला.')} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><CheckCircle2 className="h-4 w-4" />{edition.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</button><button disabled={busy} onClick={() => { if (window.confirm('हा अंक archive मधून delete करायचा?')) void run(() => EPaperEditionService.deleteEdition(edition), '✅ अंक archive मधून delete झाला.'); }} className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700"><Trash2 className="h-4 w-4" /> Delete</button></div></article>)}</div></section>
  </div>;
};
