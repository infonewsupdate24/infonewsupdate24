import React from 'react';
import { MessageCircle, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InArticleWhatsAppBanner: React.FC = () => {
  const { whatsAppSettings } = useApp();

  if (!whatsAppSettings?.isEnabled || !whatsAppSettings.showInArticleBanner) {
    return null;
  }

  return (
    <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-4 sm:p-5 text-white shadow-xl my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/60 ring-2 ring-emerald-400/30">
          <MessageCircle className="h-7 w-7 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase text-white tracking-wider">
              WHATSAPP ALERTS
            </span>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {whatsAppSettings.subscriberCountText}
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white mt-1">
            {whatsAppSettings.inArticleBannerText}
          </h4>
        </div>
      </div>

      <a
        href={whatsAppSettings.officialChannelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-emerald-900/40 transition-all shrink-0 cursor-pointer"
      >
        <MessageCircle className="h-4 w-4 fill-slate-950" />
        <span>चॅनल फॉलो करा (Join Channel)</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
};
