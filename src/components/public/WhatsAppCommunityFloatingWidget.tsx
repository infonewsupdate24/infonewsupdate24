import React, { useState } from 'react';
import {
  MessageCircle,
  Users,
  ChevronRight,
  X,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Share2,
  Check,
  Radio,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WhatsAppCommunityFloatingWidget: React.FC = () => {
  const { whatsAppSettings, epaperSettings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  if (!whatsAppSettings?.isEnabled || !whatsAppSettings.showFloatingButton) {
    return null;
  }

  const handleShareWebsite = () => {
    const services = epaperSettings?.publicPortalEnabled !== false
      ? 'ताज्या बातम्या, ई-पेपर, कृषी बाजारभाव व विश्लेषणासाठी'
      : 'ताज्या बातम्या, कृषी बाजारभाव व विश्लेषणासाठी';
    const text = `📢 *InfoNewsUpdate24 - महाराष्ट्रातील सर्वात वेगवान डिजिटल वृत्तपत्र!*\n\n${services} आताच भेट द्या:\n👉 ${window.location.origin}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setToastMsg('शेअर लिंक उघडली!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <>
      {/* 1. FLOATING PULSATING WHATSAPP BUTTON (BOTTOM-RIGHT) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 animate-bounce-subtle">
          {/* Subscriber Count Pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-950/90 text-white px-3 py-1 text-[10px] font-black shadow-lg border border-emerald-500/40 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">{whatsAppSettings.subscriberCountText}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl transition-all duration-300 active:scale-95 ring-4 ring-emerald-400/30 hover:ring-emerald-400/60 cursor-pointer"
            title="व्हॉट्सॲप चॅनल व जिल्हा ग्रुप्स जॉईन करा"
          >
            <MessageCircle className="h-8 w-8 text-white transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white items-center justify-center">
                ✓
              </span>
            </span>
          </button>
        </div>
      )}

      {/* 2. INTERACTIVE WHATSAPP HUB DRAWER / MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 text-white shadow-2xl overflow-hidden border border-emerald-500/30 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-5 border-b border-slate-800 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-900/50">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase text-white">
                      OFFICIAL COMMUNITY
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {whatsAppSettings.subscriberCountText}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">
                    InfoNewsUpdate24 व्हॉट्सॲप हब
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Main Official WhatsApp Channel Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/40 via-slate-800 to-slate-800/80 border-2 border-emerald-500/60 shadow-lg space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 border border-emerald-500/30">
                      ★ मुख्य अधिकृत चॅनल (1-Click Follow)
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">
                      {whatsAppSettings.channelName}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {whatsAppSettings.inArticleBannerText}
                    </p>
                  </div>
                </div>

                <a
                  href={whatsAppSettings.officialChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-950/60 transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>अधिकृत चॅनल फॉलो करा (Follow Channel)</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* District & Special Groups Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-emerald-400" />
                    <span>तुमच्या जिल्ह्याचा व्हॉट्सॲप ग्रुप निवडा:</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {whatsAppSettings.districtGroups
                    ?.filter((g) => g.isActive)
                    .map((group) => (
                      <a
                        key={group.id}
                        href={group.inviteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-emerald-500/60 transition-all"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-white text-xs block truncate group-hover:text-emerald-400">
                            {group.districtName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {group.memberCount}
                          </span>
                        </div>

                        <span className="shrink-0 flex items-center gap-1 rounded-lg bg-emerald-950/80 border border-emerald-600/60 group-hover:bg-emerald-600 text-emerald-300 group-hover:text-white px-2 py-1 text-[10px] font-bold transition-all">
                          <span>जॉईन</span>
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </a>
                    ))}
                </div>
              </div>

              {/* Share With Friends Option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleShareWebsite}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Share2 className="h-4 w-4 text-emerald-400" />
                  <span>मित्रांना आणि व्हॉट्सॲप ग्रुपवर पोर्टल शेअर करा</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>सुरक्षित व अधिकृत व्हॉट्सॲप कम्युनिटी</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                बंद करा
              </button>
            </div>
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
