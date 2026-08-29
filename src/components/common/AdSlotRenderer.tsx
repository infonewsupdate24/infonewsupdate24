import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Info, X, Globe, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdPosition, AdUnit } from '../../types';

interface AdSlotRendererProps {
  position: AdPosition;
  className?: string;
  isDismissible?: boolean;
}

export const AdSlotRenderer: React.FC<AdSlotRendererProps> = ({
  position,
  className = '',
  isDismissible = false,
}) => {
  const { ads, adSenseSettings, recordAdImpression, recordAdClick } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);
  const hasRecordedImpression = useRef(false);

  // Find active ad for this position
  const activeAd = ads.find((a) => a.position === position && a.status === 'ACTIVE');

  // Record Impression once on mount
  useEffect(() => {
    if (activeAd && !hasRecordedImpression.current) {
      recordAdImpression(activeAd.id);
      hasRecordedImpression.current = true;
    }
  }, [activeAd, recordAdImpression]);

  if (!activeAd || isDismissed) {
    return null;
  }

  // Device targeting check (in CSS / classes)
  const deviceClass =
    activeAd.deviceTargeting === 'DESKTOP'
      ? 'hidden md:block'
      : activeAd.deviceTargeting === 'MOBILE'
      ? 'block md:hidden'
      : '';

  const handleAdClick = () => {
    recordAdClick(activeAd.id);
  };

  // 1. MOBILE STICKY BOTTOM ANCHOR AD (320x50)
  if (position === 'MOBILE_STICKY') {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-700 shadow-2xl p-1.5 flex items-center justify-center ${deviceClass} ${className} animate-in slide-in-from-bottom-2`}
      >
        <div className="relative max-w-sm w-full mx-auto flex items-center justify-between gap-2 px-2">
          {/* Dismiss Close Button */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="absolute -top-3 right-0 rounded-full bg-slate-800 text-white border border-slate-600 p-0.5 shadow-md hover:bg-red-600 transition-colors cursor-pointer"
            title="जाहिरात बंद करा (Close Ad)"
          >
            <X className="h-3 w-3" />
          </button>

          {activeAd.type === 'BANNER' || activeAd.type === 'SPONSORED' ? (
            <a
              href={activeAd.targetUrl || '#'}
              target={activeAd.openInNewTab !== false ? '_blank' : '_self'}
              rel="noopener noreferrer sponsored"
              onClick={handleAdClick}
              className="flex items-center gap-2.5 w-full overflow-hidden"
            >
              <img
                src={activeAd.codeOrUrl}
                alt={activeAd.title}
                className="h-10 w-20 rounded object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] uppercase font-black text-amber-400 block tracking-wider">
                  {activeAd.sponsorName || 'Sponsored'}
                </span>
                <p className="text-xs font-bold text-white truncate">{activeAd.title}</p>
              </div>
              <span className="rounded bg-red-600 px-2 py-1 text-[10px] font-black text-white shrink-0 uppercase">
                पहा &rarr;
              </span>
            </a>
          ) : (
            <div className="w-full py-1 text-center text-xs text-slate-300 font-bold flex items-center justify-center gap-2">
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              <span>Google Mobile Ad (320x50)</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. GOOGLE ADSENSE SLOT RENDERER
  if (activeAd.type === 'ADSENSE') {
    return (
      <div
        className={`my-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs ${deviceClass} ${className}`}
      >
        <div className="bg-slate-50 px-3 py-1 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3 text-blue-500" />
            <span>Google AdSense Display Ad</span>
          </span>
          <span>जाहिरात (ADVERTISEMENT)</span>
        </div>

        <div className="p-4 flex flex-col items-center justify-center text-center bg-linear-to-b from-blue-50/30 to-white min-h-[120px]">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-xs mb-1">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            <span>{activeAd.title}</span>
          </div>
          <p className="text-[11px] text-slate-500 max-w-sm">
            Google AdSense Responsive Slot (Client: {adSenseSettings.publisherId})
          </p>
          <span className="mt-2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
            Slot ID: {activeAd.adSenseSlotId || '5849201842'}
          </span>
        </div>
      </div>
    );
  }

  // 3. DIRECT BANNER & SPONSORED ADS
  return (
    <div
      className={`my-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs ${deviceClass} ${className}`}
    >
      {/* Top Sponsored Tag */}
      <div className="bg-slate-50 px-3 py-1 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
        <span className="flex items-center gap-1 font-bold text-slate-600">
          {activeAd.sponsorBadge && <Sparkles className="h-3 w-3 text-amber-500" />}
          <span>{activeAd.sponsorName || 'Sponsored Partner'}</span>
        </span>
        <span>जाहिरात (ADVERTISEMENT)</span>
      </div>

      {/* Clickable Image Banner */}
      <a
        href={activeAd.targetUrl || '#'}
        target={activeAd.openInNewTab !== false ? '_blank' : '_self'}
        rel="noopener noreferrer sponsored"
        onClick={handleAdClick}
        className="group relative block overflow-hidden"
      >
        <img
          src={activeAd.codeOrUrl}
          alt={activeAd.title}
          className="w-full h-auto object-cover max-h-[300px] group-hover:scale-[1.01] transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Hover Target Link Indicator */}
        {activeAd.targetUrl && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white shadow-md group-hover:bg-red-600 transition-colors">
            <span>भेट द्या (Visit)</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </div>
        )}
      </a>
    </div>
  );
};
