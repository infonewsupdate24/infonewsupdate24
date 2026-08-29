import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Clock,
  Share2,
  Check,
  Wheat,
  Search,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { APMCMandiRate } from '../../types';
import { LiveScoreAndMandiService } from '../../services/LiveScoreAndMandiService';

export const KrishiMandiRatesWidget: React.FC = () => {
  const [rates, setRates] = useState<APMCMandiRate[]>(() =>
    LiveScoreAndMandiService.getMandiRates()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setRates(e.detail);
      }
    };
    window.addEventListener('infonews:mandi-rate-update', handleUpdate);
    return () => window.removeEventListener('infonews:mandi-rate-update', handleUpdate);
  }, []);

  const filteredRates = rates.filter((r) => {
    const matchesCategory =
      selectedCategory === 'ALL' || r.category === selectedCategory;
    const matchesSearch =
      r.commodityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mandiName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleShareRate = (rate: APMCMandiRate) => {
    const text = `📢 *आजचे अधिकृत कृषी बाजारभाव (InfoNewsUpdate24)*\n\n🌾 *पिक/वस्तू:* ${rate.commodityName}\n📍 *बाजार समिती:* ${rate.mandiName}\n💰 *सरासरी लिलाव भाव:* ₹${rate.avgRate.toLocaleString('mr-IN')} ${rate.unit}\n📈 *किमान:* ₹${rate.minRate} | *कमाल:* ₹${rate.maxRate}\n⏱️ *तारीख:* ${rate.updatedAt}\n\n👉 अधिक बाजारभावांसाठी भेट द्या: ${window.location.origin}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setToastMsg('बाजारभाव WhatsApp वर शेअर केला!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/20 p-5 sm:p-7 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-600 px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
              APMC DAILY BULLETIN
            </span>
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>दैनिक अधिकृत बाजारभाव</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-serif">
            🌾 महाराष्ट्रातील प्रमुख बाजार समित्यांचे दैनिक बाजारभाव
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
            <span>कांदा, सोयाबीन, कापूस, डाळी व सोने-चांदीचे अधिकृत लिलाव दर</span>
            <span className="text-amber-800 font-bold">&bull; दैनिक अपडेट: २९ ऑगस्ट २०२६</span>
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="पिक किंवा बाजार समिती शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-amber-300/80 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('ALL')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          सर्व बाजारभाव ({rates.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('VEGETABLES')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'VEGETABLES'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          🧅 कांदा व भाजीपाला
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('OILSEEDS')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'OILSEEDS'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          🌱 सोयाबीन व कापूस
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('GRAINS')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'GRAINS'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          🌾 तूर व कडधान्ये
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('METALS')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'METALS'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          🥇 सोने-चांदी सराफ दर
        </button>
      </div>

      {/* Grid of Verified Daily Mandi Rate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRates.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="rounded bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5">
                  {r.category === 'METALS' ? 'सराफ बाजार' : 'APMC लिलाव'}
                </span>

                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> २९ ऑगस्ट
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm leading-snug">
                {r.commodityName}
              </h3>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                <span className="truncate">{r.mandiName}</span>
              </span>

              {/* Rate Numbers */}
              <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-bold text-slate-500">सरासरी दर:</span>
                  <span className="text-base font-black text-amber-950 font-mono">
                    ₹{r.avgRate.toLocaleString('mr-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-600 border-t border-amber-200/50 pt-1">
                  <span>किमान: ₹{r.minRate.toLocaleString('mr-IN')}</span>
                  <span>कमाल: ₹{r.maxRate.toLocaleString('mr-IN')}</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span className="truncate max-w-[150px]">
                {r.unit}
              </span>

              <button
                type="button"
                onClick={() => handleShareRate(r)}
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded"
                title="WhatsApp वर शेअर करा"
              >
                <Share2 className="h-3 w-3" />
                <span>शेअर</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Official Footnote */}
      <div className="text-[11px] text-slate-500 pt-2 border-t border-amber-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>अधिकृत संदर्भ: महाराष्ट्र राज्य कृषी पणन मंडळ (MSAMB) व स्थानिक APMC दैनिक लिलाव अहवाल.</span>
        </span>
        <span className="text-slate-400 text-[10px]">
          लिलावातील प्रतवारीनुसार दरांमध्ये तफावत असू शकते.
        </span>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-slideUp">
          <Check className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
