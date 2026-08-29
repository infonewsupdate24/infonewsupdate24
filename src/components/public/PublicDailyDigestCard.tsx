import React, { useState, useMemo } from 'react';
import {
  MessageCircle,
  Copy,
  Check,
  Share2,
  Sun,
  Sunset,
  Zap,
  Calendar,
  ExternalLink,
  Sparkles,
  Radio,
  Headphones,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppBulletinService } from '../../services/WhatsAppBulletinService';
import { AIDailyAudioBulletinPlayer } from './AIDailyAudioBulletinPlayer';

export const PublicDailyDigestCard: React.FC = () => {
  const { posts, whatsAppSettings, epaperSettings } = useApp();
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const publishedPosts = useMemo(
    () => posts.filter((p) => p.status === 'PUBLISHED').slice(0, 5),
    [posts]
  );

  const bulletinType = WhatsAppBulletinService.getSuggestedBulletinType();
  const dateStr = WhatsAppBulletinService.getFormattedDateString();

  const bulletinText = useMemo(() => {
    return WhatsAppBulletinService.generateBulletinText(
      publishedPosts,
      {
        bulletinType,
        includeEPaperLink: true,
        includeChannelLink: true,
        includeAdText: true,
        customAdText: 'ताज्या घडामोडींसाठी InfoNewsUpdate24 शी जोडलेले रहा!',
        includeReadMoreLinks: true,
        selectedPostIds: publishedPosts.map((p) => p.id),
      },
      whatsAppSettings?.officialChannelUrl,
      epaperSettings?.adContactNumber
    );
  }, [publishedPosts, bulletinType, whatsAppSettings, epaperSettings]);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(bulletinText);
      setCopied(true);
      setToastMsg('बातमीपत्र कॉपी झाले!');
      setTimeout(() => {
        setCopied(false);
        setToastMsg('');
      }, 3000);
    }
  };

  const handleShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(bulletinText)}`;
    window.open(url, '_blank');
    setToastMsg('WhatsApp उघडले!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  if (!publishedPosts.length) return null;

  return (
    <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1">
              {bulletinType === 'MORNING' ? (
                <Sun className="h-3 w-3" />
              ) : (
                <Sunset className="h-3 w-3" />
              )}
              {bulletinType === 'MORNING'
                ? 'MORNING RADIO DIGEST'
                : 'EVENING RADIO DIGEST'}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{dateStr}</span>
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white mt-1 flex items-center gap-2">
            <span>📻 आजचे दैनिक AI ऑडिओ बातमीपत्र (Daily News Podcast)</span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            आजच्या टॉप ५ प्रमुख घडामोडी एकाच ठिकाणी स्पष्ट आवाजात ऐका किंवा मित्रांना WhatsApp वर एका क्लिकवर पाठवा.
          </p>
        </div>

        {/* WhatsApp & Copy Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
            title="संपूर्ण बुलेटिन मजकूर कॉपी करा"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{copied ? 'कॉपी झाले!' : 'कॉपी करा'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-4 py-2 text-xs font-black text-slate-950 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            title="WhatsApp वर थेट पाठवा"
          >
            <MessageCircle className="h-4 w-4 fill-slate-950" />
            <span>WhatsApp शेअर</span>
          </button>
        </div>
      </div>

      {/* 🎙️ LIVE AI AUDIO BULLETIN PLAYER */}
      <AIDailyAudioBulletinPlayer
        posts={publishedPosts}
        bulletinType={bulletinType}
        dateStr={dateStr}
      />

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
