import React, { useEffect, useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  Share,
  PlusSquare,
  MoreVertical,
  Zap,
  Bell,
  Newspaper,
  Laptop,
  Sparkles,
} from 'lucide-react';
import { PWAService } from '../../services/PWAService';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(false);
  const [installState, setInstallState] = useState<'idle' | 'installing' | 'installed'>('idle');

  useEffect(() => {
    setIsIOS(PWAService.isIOS());
    setIsAndroid(PWAService.isAndroid());
    setHasPrompt(!!PWAService.getDeferredPrompt());

    const unsubscribe = PWAService.subscribe((canInstall) => {
      setHasPrompt(canInstall && !PWAService.isIOS());
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstallState('installing');
    const result = await PWAService.promptInstall(() => {
      // Stay on modal to show visual guide
    });

    if (result === 'accepted') {
      setInstallState('installed');
      setTimeout(() => {
        onClose();
      }, 2500);
    } else {
      setInstallState('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 text-white shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Top Header Background Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-xl ring-4 ring-white/30">
            <img src="/icon-192.svg" alt="InfoNewsUpdate24" className="h-full w-full object-contain" />
          </div>

          <h3 className="text-xl font-black mt-3">InfoNewsUpdate24 ॲप</h3>
          <p className="text-xs text-white/90 font-medium mt-0.5">
            महाराष्ट्राचे नंबर १ डिजिटल न्यूज पोर्टल आता आपल्या मोबाईलमध्ये!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Key Advantages */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/60 p-3 space-y-1">
              <Zap className="h-5 w-5 text-amber-400 mx-auto" />
              <p className="text-[11px] font-bold text-slate-200">सुपर फास्ट</p>
              <p className="text-[9px] text-slate-400">१ सेकंदात लोड</p>
            </div>
            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/60 p-3 space-y-1">
              <Bell className="h-5 w-5 text-red-400 mx-auto" />
              <p className="text-[11px] font-bold text-slate-200">लाईव्ह नोटिफिकेशन्स</p>
              <p className="text-[9px] text-slate-400">ब्रेकिंग अलर्ट</p>
            </div>
            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/60 p-3 space-y-1">
              <Newspaper className="h-5 w-5 text-emerald-400 mx-auto" />
              <p className="text-[11px] font-bold text-slate-200">ई-पेपर व ऑडिओ</p>
              <p className="text-[9px] text-slate-400">मोफत वाचन</p>
            </div>
          </div>

          {/* Installed Success State */}
          {installState === 'installed' ? (
            <div className="rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-4 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-sm font-black text-emerald-300">ॲप यशस्वीरीत्या इन्स्टॉल झाले!</h4>
              <p className="text-xs text-slate-300">
                आपल्या मोबाईल/डेस्कटॉप होम स्क्रीनवर InfoNewsUpdate24 ॲप जोडले गेले आहे.
              </p>
            </div>
          ) : (
            <>
              {/* Direct One-Click Install Button if Prompt Available */}
              {hasPrompt ? (
                <div className="space-y-2 text-center">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    disabled={installState === 'installing'}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white font-black text-sm shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="h-5 w-5 animate-bounce" />
                    <span>
                      {installState === 'installing' ? 'इन्स्टॉल होत आहे...' : '📲 आताच मोफत ॲप इन्स्टॉल करा'}
                    </span>
                  </button>
                  <p className="text-[11px] text-slate-400">
                    प्ले स्टोअरशिवाय १ सेकंदात थेट इन्स्टॉल होते (फक्त ~२ MB).
                  </p>
                </div>
              ) : isIOS ? (
                /* iPhone / iPad Safari Step-by-Step Guide */
                <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4 space-y-3">
                  <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Smartphone className="h-4 w-4" />
                    iPhone / iPad वर इन्स्टॉल करण्याच्या २ सोप्या पायऱ्या:
                  </h4>
                  <div className="space-y-2.5 text-xs text-slate-200">
                    <div className="flex items-start gap-3 bg-slate-900/60 p-2.5 rounded-xl">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-black text-xs">
                        १
                      </span>
                      <p className="leading-relaxed">
                        सफारी ब्राऊझरच्या खालील मेनूमधील <strong>'Share' (शेअर <Share className="inline h-3.5 w-3.5 text-sky-400" />)</strong> आयकॉनवर दाबा.
                      </p>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-900/60 p-2.5 rounded-xl">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-black text-xs">
                        २
                      </span>
                      <p className="leading-relaxed">
                        खाली स्क्रोल करा आणि <strong>'Add to Home Screen' (होम स्क्रीनवर जोडा <PlusSquare className="inline h-3.5 w-3.5 text-emerald-400" />)</strong> वर क्लिक करा.
                      </p>
                    </div>
                  </div>
                </div>
              ) : isAndroid ? (
                /* Android Browser Step-by-Step Guide */
                <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4 space-y-3">
                  <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Smartphone className="h-4 w-4" />
                    Android मोबाईलवर इन्स्टॉल करण्याच्या २ पायऱ्या:
                  </h4>
                  <div className="space-y-2.5 text-xs text-slate-200">
                    <div className="flex items-start gap-3 bg-slate-900/60 p-2.5 rounded-xl">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-black text-xs">
                        १
                      </span>
                      <p className="leading-relaxed">
                        क्रोम ब्राऊझरच्या वर उजव्या कोपऱ्यातील <strong>तीन टिंब (<MoreVertical className="inline h-3.5 w-3.5 text-slate-300" /> मेनू)</strong> वर दाबा.
                      </p>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-900/60 p-2.5 rounded-xl">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-black text-xs">
                        २
                      </span>
                      <p className="leading-relaxed">
                        मेनूमधून <strong>'Install app'</strong> किंवा <strong>'Add to Home screen'</strong> पर्यायावर क्लिक करा.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop Chrome / Windows / Mac Guide */
                <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4 space-y-3 text-center">
                  <Laptop className="h-8 w-8 text-sky-400 mx-auto" />
                  <h4 className="text-xs font-bold text-white">
                    डेस्कटॉप ब्राऊझरच्या ॲड्रेस बारमधील <strong>'Install' (⊕)</strong> आयकॉनवर क्लिक करून ॲप कॉम्प्युटरमध्ये इन्स्टॉल करू शकता.
                  </h4>
                </div>
              )}
            </>
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            बंद करा (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
