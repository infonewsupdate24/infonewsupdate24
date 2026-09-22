import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { checkArticlePreview, type PreviewResult } from '../../services/ArticlePreviewService';
import { isRoutableArticle, newestArticleFirst } from '../../utils/articleUrls.mjs';

export const LiteSpeedCacheView: React.FC = () => {
  const { posts } = useApp();
  const published = posts.filter(isRoutableArticle).sort(newestArticleFirst);
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PreviewResult | null>(null);
  const post = published.find(p => p.id === selected) || published[0];
  const check = async () => {
    if (!post) return;
    setBusy(true);
    setResult(null);
    try { setResult(await checkArticlePreview(post)); } finally { setBusy(false); }
  };
  return (
    <section className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">WhatsApp Preview तपासणी</h1>
        <p className="mt-2 text-slate-600">प्रकाशित बातमीची सार्वजनिक लिंक, नवीन शीर्षक आणि thumbnail प्रत्यक्ष तपासा.</p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
        LiteSpeed cache सेवा या साइटला जोडलेली नाही. Cache purge करून WhatsApp preview तयार होत नाही.
        येथे प्रत्यक्ष तपासणीचा निकाल दाखवला जातो.
      </div>
      <div className="space-y-4 rounded-xl border bg-white p-5">
        <label htmlFor="preview-article" className="block font-semibold">बातमी निवडा</label>
        <select id="preview-article" className="w-full rounded-lg border p-3" value={post?.id || ''}
          disabled={busy} onChange={event => { setSelected(event.target.value); setResult(null); }}>
          {published.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        {!post && <p>तपासण्यासाठी प्रकाशित सार्वजनिक बातमी उपलब्ध नाही.</p>}
        <button onClick={check} disabled={busy || !post}
          className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50">
          {busy ? 'लिंक आणि फोटो तपासत आहे…' : 'Preview तपासा'}
        </button>
      </div>
      {result && <div role="status" className={`rounded-xl border p-5 ${result.ready ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'}`}>
        <p className="font-semibold">{result.message}</p>
        {result.ready && !result.live && <p className="mt-2">हे preview सध्याच्या प्रकाशित आवृत्तीसाठी तयार आहे. नवीन बातम्यांसाठी तत्काळ server preview अजून सक्रिय नाही.</p>}
        {result.ready && result.live && <p className="mt-2">तत्काळ server preview सक्रिय आहे.</p>}
        <a href={result.url} target="_blank" rel="noreferrer" className="mt-3 inline-block underline">बातमी उघडा</a>
      </div>}
      <p className="text-sm text-slate-600">ही तपासणी साइटवरील उपलब्धता दाखवते. आधी पाठवलेल्या WhatsApp संदेशातील preview आपोआप बदलत नाही.</p>
    </section>
  );
};
