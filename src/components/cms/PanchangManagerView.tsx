import React, { useState, useMemo } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Share2,
  Calendar,
  Check,
  Award,
  History,
  RotateCcw,
  Layers,
  Save,
  CheckCircle2,
} from 'lucide-react';
import {
  PanchangService,
} from '../../services/PanchangService';
import { DailyPanchangWidget } from '../public/DailyPanchangWidget';

export const PanchangManagerView: React.FC = () => {
  const [toastMsg, setToastMsg] = useState('');

  const panchang = useMemo(() => PanchangService.getTodayPanchang(), []);
  const dinvishesh = useMemo(() => PanchangService.getTodayDinvishesh(), []);

  const handleShare = () => {
    const url = PanchangService.generateWhatsAppPanchangShareUrl(
      panchang,
      dinvishesh
    );
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
              🪔 Vedic Panchang & Horoscope Engine
            </span>
            <span className="text-xs font-bold text-slate-500">
              १००% खरा व ऑटो-कॅल्क्युलेटेड डेटा
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            दैनिक मराठी पंचांग, राशीभविष्य व दिनविशेष स्टुडिओ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            दररोज मध्यरात्री भारतीय खगोलशास्त्रीय गणितानुसार आपोआप तयार होणारे पंचांग, मुहूर्त व १२ राशींचे भविष्य.
          </p>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-4 py-2.5 text-xs font-black text-white shadow-md transition-all cursor-pointer"
        >
          <Share2 className="h-4 w-4" />
          <span>📲 १-क्लिक WhatsApp पंचांग बुलेटिन फॉरवर्ड</span>
        </button>
      </div>

      {/* 2. System Status Card */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm text-lg">
            🪔
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Astronomical Ephemeris Engine: <span className="text-emerald-700 font-black">सक्रिय (ONLINE)</span>
            </h3>
            <p className="text-xs text-slate-600">
              शालिवाहन शक, तिथी, नक्षत्र, करण, योग आणि सूर्योदय-सूर्यास्त गणितीयदृष्ट्या अचूक
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-black flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>मोफत व स्वयंचलित (Auto-Populate)</span>
          </span>
        </div>
      </div>

      {/* 3. Live Preview of Today's Widget */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          आजच्या पंचांग विजेटचे थेट पूर्वावलोकन (Live Homepage Preview)
        </span>
        <DailyPanchangWidget />
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-bold shadow-xl animate-slideUp">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
