import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Sparkles,
  Zap,
  Radio,
  Check,
  X,
  Share,
  PlusSquare,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { PWAService } from '../../services/PWAService';

export const PWAInstallPrompt: React.FC = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    PWAService.init();
    setIsStandalone(PWAService.isStandalone());

    const unsubscribe = PWAService.subscribe((installable) => {
      setCanInstall(installable);
    });

    // Auto-prompt after 5 seconds if not installed and not dismissed in session
    const dismissed = sessionStorage.getItem('infonews_pwa_dismissed');
    if (!PWAService.isStandalone() && !dismissed) {
      const timer = setTimeout(() => {
        setIsBannerVisible(true);
      }, 5000);
      return () => clearTimeout(timer);
    }

    return () => unsubscribe();
  }, []);

  const handleInstallClick = async () => {
    if (PWAService.isIOS()) {
      setShowIOSModal(true);
      return;
    }

    const outcome = await PWAService.promptInstall(() => setShowIOSModal(true));
    if (outcome === 'accepted') {
      setIsBannerVisible(false);
      setToastMsg('🎉 InfoNewsUpdate24 ॲप इन्स्टॉल झाले! तुमच्या मोबाईल स्क्रीनवर आयकॉन तयार झाला आहे.');
      setTimeout(() => setToastMsg(''), 5000);
    } else if (outcome === 'manual_guide') {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setIsBannerVisible(false);
    sessionStorage.setItem('infonews_pwa_dismissed', 'true');
  };

  // If already running as standalone app, don't show prompt
  if (isStandalone) return null;

  return (
    <>
      {/* 1. BOTTOM SLIDE-UP PWA APP PROMPT BANNER */}
      {isBannerVisible && (
        <div className="fixed bottom-20 sm:bottom-6 inset-x-4 sm:left-6 sm:right-auto z-40 max-w-md animate-slideUp">
          <div className="rounded-2xl border-2 border-red-500 bg-slate-900/98 p-5 text-white shadow-2xl backdrop-blur-md space-y-3.5 ring-2 ring-red-500/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white font-bold shadow-lg shadow-red-900/50 border border-red-500/30 p-2">
                  <Smartphone className="h-7 w-7 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                      मोफत मोबाईल ॲप
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                      <Zap className="h-3 w-3" /> 10x जलद
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white mt-0.5 font-serif">
                    InfoNewsUpdate24 ॲप इन्स्टॉल करा
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Feature Bullets */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>प्ले-स्टोअरशिवाय थेट सुरू</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>ऑफलाइन बातम्या वाचन</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>झटपट ब्रेकिंग अलर्ट्स</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>कमी बॅटरी व डेटा वापर</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                नंतर करू
              </button>

              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 px-5 py-2 text-xs font-black text-white shadow-lg shadow-red-900/50 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>आता इन्स्टॉल करा (Install App)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. iOS / iPHONE STEP-BY-STEP INSTRUCTIONS MODAL */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 text-white p-6 shadow-2xl space-y-4 border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-red-500" />
                <h3 className="text-base font-bold text-white">
                  iPhone / iPad वर ॲप कसे जोडावे?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 font-bold text-white shrink-0">
                  १
                </span>
                <p className="leading-relaxed">
                  Safari ब्राऊझरमध्ये खाली असलेल्या <strong className="text-white">Share (शेअर ⎋)</strong> बटणावर टॅप करा.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 font-bold text-white shrink-0">
                  २
                </span>
                <p className="leading-relaxed">
                  खाली स्क्रोल करून <strong className="text-white">"Add to Home Screen" (होम स्क्रीनवर जोडा ➕)</strong> हा पर्याय निवडा.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 font-bold text-white shrink-0">
                  ३
                </span>
                <p className="leading-relaxed">
                  उजव्या कोपऱ्यातील <strong className="text-white">"Add" (जोडा)</strong> वर क्लिक करा. InfoNewsUpdate24 चा ॲप आयकॉन तुमच्या होम स्क्रीनवर दिसेल!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full rounded-xl bg-red-600 hover:bg-red-700 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              समजले (Got it)
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-slideUp">
          <Check className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  );
};
