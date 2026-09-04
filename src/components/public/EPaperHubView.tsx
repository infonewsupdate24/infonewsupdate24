import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Archive, Calendar, Download, FileText, Loader2, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EPaperEditionService, type EPaperDistrict, type StoredEPaperEdition } from '../../services/EPaperEditionService';

interface EPaperHubViewProps { onBackToPortal?: () => void; }

export const EPaperHubView: React.FC<EPaperHubViewProps> = ({ onBackToPortal }) => {
  const { epaperSettings } = useApp();
  const [editions, setEditions] = useState<StoredEPaperEdition[]>([]);
  const [districts, setDistricts] = useState<EPaperDistrict[]>([EPaperEditionService.defaultDistrict]);
  const [districtCode, setDistrictCode] = useState('gadchiroli');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stopEditions = EPaperEditionService.subscribePublished((items) => { setEditions(items); setReady(true); });
    const stopDistricts = EPaperEditionService.subscribeDistricts(setDistricts);
    return () => { stopEditions(); stopDistricts(); };
  }, []);

  const districtEditions = useMemo(() => editions.filter((item) => item.districtCode === districtCode), [districtCode, editions]);
  const activeEdition = districtEditions.find((item) => item.id === selectedId) || districtEditions[0];
  useEffect(() => setSelectedId(null), [districtCode]);

  return <div className="min-h-screen bg-slate-950 text-white">
    <header className="border-b border-slate-800 bg-slate-900 px-4 py-4"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
      <button onClick={onBackToPortal} className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-bold hover:bg-slate-800"><ArrowLeft className="h-4 w-4" /> मुख्य पोर्टल</button>
      <div className="text-center"><p className="text-xs font-black uppercase tracking-[0.22em] text-red-500">Official Digital Edition</p><h1 className="text-xl font-black">{epaperSettings.newspaperName}</h1></div>
      <a href={activeEdition?.pdfUrl || '#'} target="_blank" rel="noreferrer" aria-disabled={!activeEdition} className={`flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-black ${!activeEdition ? 'pointer-events-none opacity-40' : ''}`}><Download className="h-4 w-4" /> PDF Download</a>
    </div></header>
    <main className="mx-auto grid max-w-7xl gap-5 p-4 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="mb-3 flex items-center gap-2 text-sm font-black"><MapPin className="h-4 w-4 text-red-500" /> District</div><select value={districtCode} onChange={(e) => setDistrictCode(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm font-bold">{districts.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="mb-3 flex items-center gap-2 text-sm font-black"><Archive className="h-4 w-4 text-amber-400" /> प्रकाशित अंक</div><div className="max-h-[60vh] space-y-2 overflow-y-auto">{districtEditions.map((edition) => <button key={edition.id} onClick={() => setSelectedId(edition.id)} className={`w-full rounded-xl border p-3 text-left ${activeEdition?.id === edition.id ? 'border-red-500 bg-red-950/40' : 'border-slate-700 bg-slate-950 hover:border-slate-500'}`}><span className="flex items-center gap-2 text-xs text-slate-400"><Calendar className="h-3.5 w-3.5" />{edition.publicationDate}</span><span className="mt-1 block text-sm font-bold">{edition.title}</span></button>)}{ready && !districtEditions.length && <p className="rounded-xl border border-dashed border-slate-700 p-4 text-center text-xs text-slate-400">या district चा प्रकाशित अंक उपलब्ध नाही.</p>}</div></section>
      </aside>
      <section className="min-h-[70vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        {!ready && <div className="flex min-h-[70vh] items-center justify-center gap-3 text-sm font-bold text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /> प्रकाशित अंक तपासत आहे...</div>}
        {ready && !activeEdition && <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center"><FileText className="h-14 w-14 text-slate-600" /><h2 className="mt-4 text-xl font-black">अंक उपलब्ध नाही</h2><p className="mt-2 max-w-md text-sm text-slate-400">CMS मधून वास्तविक PDF upload करून Publish केल्यानंतर तो येथे दिसेल.</p></div>}
        {activeEdition && <div><div className="border-b border-slate-800 px-4 py-3"><h2 className="font-black">{activeEdition.title}</h2><p className="text-xs text-slate-400">{activeEdition.districtName} • {activeEdition.publicationDate}</p></div><iframe key={activeEdition.id} title={activeEdition.title} src={`${activeEdition.pdfUrl}#view=FitH&toolbar=1`} className="h-[78vh] w-full bg-white" /></div>}
      </section>
    </main>
  </div>;
};
