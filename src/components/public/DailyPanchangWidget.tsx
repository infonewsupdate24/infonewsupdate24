import React, { useState, useMemo } from 'react';
import {
  Sun,
  Moon,
  Compass,
  Calendar,
  Sparkles,
  Share2,
  Clock,
  Award,
  History,
  Star,
  CheckCircle2,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';
import {
  PanchangService,
} from '../../services/PanchangService';
import {
  DailyPanchangData,
  DailyDinvishesh,
  DailyRashiForecast,
} from '../../types';

export const DailyPanchangWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'panchang' | 'dinvishesh' | 'horoscope'>(
    'panchang'
  );
  const [selectedRashiId, setSelectedRashiId] = useState<string>('mesh');

  const panchang: DailyPanchangData = useMemo(
    () => PanchangService.getTodayPanchang(),
    []
  );
  const dinvishesh: DailyDinvishesh = useMemo(
    () => PanchangService.getTodayDinvishesh(),
    []
  );
  const horoscope: DailyRashiForecast[] = useMemo(
    () => PanchangService.getTodayHoroscope(),
    []
  );

  const selectedRashi = useMemo(
    () => horoscope.find((r) => r.id === selectedRashiId) || horoscope[0],
    [horoscope, selectedRashiId]
  );

  const handleWhatsAppShare = () => {
    const url = PanchangService.generateWhatsAppPanchangShareUrl(
      panchang,
      dinvishesh
    );
    window.open(url, '_blank');
  };

  return (
    <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-yellow-50/60 p-5 sm:p-7 shadow-sm text-slate-900 space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-500 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white font-bold shadow-sm">
            🪔
          </span>
          <div>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 font-serif">
              दैनिक मराठी पंचांग, राशीभविष्य व दिनविशेष
            </h3>
            <p className="text-xs text-amber-900 font-medium">
              {panchang.dayNameMr}, {panchang.dateFormatted} &bull; {panchang.shakaYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {panchang.festivalOrSpecialDay && (
            <span className="rounded-full bg-red-100 text-red-800 px-3 py-1 text-[11px] font-black uppercase flex items-center gap-1 shadow-2xs">
              <Sparkles className="h-3 w-3 text-red-600" />
              <span>{panchang.festivalOrSpecialDay}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-1.5 text-xs font-black shadow-xs transition-transform cursor-pointer"
            title="संपूर्ण पंचांग व्हॉट्सॲपवर शेअर करा"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">WhatsApp शेअर</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-amber-200/80 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('panchang')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'panchang'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-100/60'
          }`}
        >
          <span>🪔 आजचे पंचांग व शुभ मुहूर्त</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dinvishesh')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'dinvishesh'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-100/60'
          }`}
        >
          <span>📜 आजचा दिनविशेष व सुविचार</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('horoscope')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'horoscope'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-100/60'
          }`}
        >
          <span>⭐ १२ राशींचे आजचे राशीभविष्य</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PANCHANG & MUHURAT */}
      {/* ========================================================================= */}
      {activeTab === 'panchang' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-fadeIn">
          {/* Left 5 Cols: Sun / Moon / Muhurat Telemetry */}
          <div className="md:col-span-5 space-y-3">
            {/* Sunrise & Sunset Card */}
            <div className="rounded-2xl border border-amber-200 bg-white p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  सूर्य व चंद्र स्थिती
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  महाराष्ट्र प्रमाणवेळ
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-orange-50/80 border border-orange-100 space-y-1">
                  <Sun className="h-6 w-6 text-amber-500 mx-auto animate-spin-slow" />
                  <span className="text-[11px] text-slate-500 block">सूर्योदय</span>
                  <strong className="text-base font-black text-slate-900 font-mono">
                    {panchang.sunrise}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-100 space-y-1">
                  <Moon className="h-6 w-6 text-indigo-500 mx-auto" />
                  <span className="text-[11px] text-slate-500 block">सूर्यास्त</span>
                  <strong className="text-base font-black text-slate-900 font-mono">
                    {panchang.sunset}
                  </strong>
                </div>
              </div>
            </div>

            {/* Shubh & Ashubh Muhurat Card */}
            <div className="rounded-2xl border border-amber-200 bg-white p-4 space-y-2.5 shadow-xs text-xs">
              <span className="text-xs font-black text-slate-900 block border-b border-slate-100 pb-1.5">
                मुहूर्त व राहुकाळ
              </span>

              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-950 font-bold border border-emerald-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>अभिजीत मुहूर्त (शुभ):</span>
                </div>
                <span className="font-mono">{panchang.abhijitMuhurat}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-red-50 text-red-950 font-bold border border-red-200">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-red-600 shrink-0" />
                  <span>राहुकाळ (वर्ज्य वेळ):</span>
                </div>
                <span className="font-mono">{panchang.rahuKaal}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 text-amber-950 font-bold border border-amber-200">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>अमृत काळ:</span>
                </div>
                <span className="font-mono">{panchang.amritKaal}</span>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Detailed Vedic Table */}
          <div className="md:col-span-7 rounded-2xl border border-amber-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3 text-xs">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block border-b border-slate-100 pb-2">
                वैदिक पंचांग घटक
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">तिथी</span>
                  <strong className="text-sm font-black text-slate-900">{panchang.tithi}</strong>
                  <span className="text-[10px] text-slate-500 block">{panchang.tithiDetails}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">नक्षत्र</span>
                  <strong className="text-sm font-black text-slate-900">{panchang.nakshatra}</strong>
                  <span className="text-[10px] text-slate-500 block">शुभ प्रभाव</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">योग</span>
                  <strong className="text-sm font-black text-slate-900">{panchang.yoga} योग</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">करण</span>
                  <strong className="text-sm font-black text-slate-900">{panchang.karana}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">मास व पक्ष</span>
                  <strong className="text-sm font-black text-slate-900">{panchang.maasName}, {panchang.paksha}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">संवत्सर व अयन</span>
                  <strong className="text-sm font-black text-slate-900">{panchang.samvatsarName}</strong>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-700 text-xs flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>टीप:</strong> हे पंचांग भारतीय प्रमाणवेळ (IST) आणि महाराष्ट्राच्या अक्षांश-रेखांशानुसार गणितीयदृष्ट्या अचूक आहे.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DINVISHESH & HISTORICAL EVENTS */}
      {/* ========================================================================= */}
      {activeTab === 'dinvishesh' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Quote of the Day Banner */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-100/80 via-orange-50 to-white p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
              🌟 आजचा प्रेरणादायी विचार (Thought of the Day)
            </span>
            <blockquote className="text-base sm:text-lg font-black text-slate-900 font-serif italic leading-relaxed">
              "{dinvishesh.quoteOfTheDay.text}"
            </blockquote>
            <p className="text-xs font-bold text-amber-900 text-right">
              — {dinvishesh.quoteOfTheDay.author}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Historical Events */}
            <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs space-y-3 text-xs">
              <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2 text-sm">
                <History className="h-4 w-4 text-amber-600" />
                <span>आजच्या दिवसातील ऐतिहासिक घटना ({dinvishesh.dateFormatted})</span>
              </h4>
              <ul className="space-y-2 text-slate-700">
                {dinvishesh.historicalEvents.map((evt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-black font-mono">•</span>
                    <span className="leading-relaxed">{evt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Birthdays & Memorials */}
            <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs space-y-3 text-xs">
              <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-red-600" />
                <span>जन्म व स्मृती दिन (Birthdays & Memorials)</span>
              </h4>

              <div className="space-y-2">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 block">🎂 जयंती / जन्म दिवस:</span>
                  <ul className="space-y-1 mt-1 text-slate-700">
                    {dinvishesh.birthdays.map((b, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-emerald-600">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-red-800 block">🌺 स्मृती दिवस / पुण्यतिथी:</span>
                  <ul className="space-y-1 mt-1 text-slate-700">
                    {dinvishesh.memorials.map((m, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-red-600">✓</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 12 RASHI BHAVISHYA */}
      {/* ========================================================================= */}
      {activeTab === 'horoscope' && (
        <div className="space-y-4 animate-fadeIn">
          {/* 12 Rashi Quick Selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {horoscope.map((r) => {
              const isSelected = r.id === selectedRashiId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRashiId(r.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-md scale-105'
                      : 'bg-white text-slate-800 border border-amber-200 hover:bg-amber-100/60'
                  }`}
                >
                  <span className="text-sm">{r.symbol}</span>
                  <span>{r.nameMr}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Rashi Full Forecast Card */}
          <div className="rounded-2xl border border-amber-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedRashi.symbol}</span>
                <div>
                  <h4 className="text-lg font-black text-slate-900 font-serif">
                    {selectedRashi.nameMr} राशीचे आजचे राशिफळ ({selectedRashi.nameEn})
                  </h4>
                  <span className="text-xs text-amber-700 font-bold">
                    {selectedRashi.element}
                  </span>
                </div>
              </div>

              {/* Lucky Badges */}
              <div className="flex items-center gap-2 text-xs">
                <div className="rounded-xl bg-orange-50 border border-orange-200 px-3 py-1.5">
                  <span className="text-[10px] text-slate-400 block">शुभ रंग</span>
                  <strong className="text-orange-950 font-bold">{selectedRashi.luckyColor}</strong>
                </div>
                <div className="rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5">
                  <span className="text-[10px] text-slate-400 block">शुभ अंक</span>
                  <strong className="text-purple-950 font-bold font-mono">{selectedRashi.luckyNumber}</strong>
                </div>
              </div>
            </div>

            {/* General Prediction */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
              <strong>आजचा दिवस:</strong> {selectedRashi.prediction}
            </div>

            {/* 3 Pillars: Career, Finance, Health */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                  💼 करिअर व नोकरी:
                </span>
                <p className="text-slate-600 leading-relaxed">{selectedRashi.career}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                  💰 आर्थिक स्थिती:
                </span>
                <p className="text-slate-600 leading-relaxed">{selectedRashi.finance}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                  ❤️ आरोग्य व स्वास्थ्य:
                </span>
                <p className="text-slate-600 leading-relaxed">{selectedRashi.health}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
