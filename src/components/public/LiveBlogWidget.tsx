import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Clock,
  Pin,
  Flame,
  Volume2,
  VolumeX,
  Share2,
  RefreshCw,
  Eye,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ExternalLink,
  Zap,
} from 'lucide-react';
import {
  LiveBlogService,
  LiveBlogEvent,
  LiveBlogUpdateItem,
} from '../../services/LiveBlogService';
import { AIVoiceService } from '../../services/AIVoiceService';
import { cleanTextForTTS, formatNewsTitle } from '../../utils/contentFormatter';

export const LiveBlogWidget: React.FC = () => {
  const [liveBlog, setLiveBlog] = useState<LiveBlogEvent | null>(() =>
    LiveBlogService.getActiveLiveBlog()
  );
  const [filterTab, setFilterTab] = useState<'ALL' | 'PINNED' | 'BREAKING'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState<number>(30);
  const [speakingUpdateId, setSpeakingUpdateId] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState<string>('');
  const [likedUpdates, setLikedUpdates] = useState<Record<string, boolean>>({});
  const [isHighlightsExpanded, setIsHighlightsExpanded] = useState<boolean>(true);

  // Sync with Live Blog updates
  useEffect(() => {
    const handleUpdate = () => {
      setLiveBlog(LiveBlogService.getActiveLiveBlog());
    };
    window.addEventListener('infonews:live-blog-updated', handleUpdate);
    return () =>
      window.removeEventListener('infonews:live-blog-updated', handleUpdate);
  }, []);

  // 30-Second Auto Refresh Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoRefreshCountdown((prev) => {
        if (prev <= 1) {
          // Trigger refresh
          setLiveBlog(LiveBlogService.getActiveLiveBlog());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLiveBlog(LiveBlogService.getActiveLiveBlog());
      setAutoRefreshCountdown(30);
      setIsRefreshing(false);
      setShareToast('🔄 लाईव्ह वार्तापत्र ताजे झाले आहे!');
      setTimeout(() => setShareToast(''), 3000);
    }, 600);
  };

  const handleLike = (id: string) => {
    setLikedUpdates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSpeakUpdate = (update: LiveBlogUpdateItem) => {
    if (speakingUpdateId === update.id) {
      AIVoiceService.stop();
      setSpeakingUpdateId(null);
      return;
    }

    const clean = cleanTextForTTS(
      `${update.timestamp}. ${update.title}। ${update.content}`
    );
    setSpeakingUpdateId(update.id);
    AIVoiceService.speak({
      text: clean,
      onEnd: () => setSpeakingUpdateId(null),
      onError: () => setSpeakingUpdateId(null),
    });
  };

  const handleWhatsAppShare = (update: LiveBlogUpdateItem) => {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://infonewsupdate24.com';
    const text = `🔴 *InfoNewsUpdate24 थेट लाईव्ह ब्लॉग अपडेट*\n⏱️ *वेळ:* ${update.timestamp} (${update.timeAgo})\n\n📌 *${update.title}*\n\n${update.content}\n\n👉 *सर्व लाईव्ह घडामोडी मिनिट-टू-मिनिट पाहण्यासाठी येथे क्लिक करा:*\n🔗 ${origin}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredUpdates = useMemo(() => {
    if (!liveBlog) return [];
    if (filterTab === 'PINNED') {
      return liveBlog.updates.filter((u) => u.isPinned);
    }
    if (filterTab === 'BREAKING') {
      return liveBlog.updates.filter((u) => u.isBreaking);
    }
    return liveBlog.updates;
  }, [liveBlog, filterTab]);

  if (!liveBlog) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-red-600/40 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-7 shadow-2xl text-slate-100 space-y-5 animate-fadeIn">
      {/* Toast */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-3 text-xs font-black shadow-2xl animate-slideUp">
          <Check className="h-4 w-4" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* 1. Header Banner & Live Pulsing Beacon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-white font-black shadow-lg">
            <Radio className="h-6 w-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs animate-pulse">
                🔴 LIVE BLOG
              </span>
              <span className="text-xs font-bold text-amber-400">
                {liveBlog.category} &bull; {liveBlog.location}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5 font-serif leading-snug">
              {formatNewsTitle(liveBlog.title)}
            </h2>
          </div>
        </div>

        {/* Live Viewers & Auto-Refresh Counter */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300">
            <Eye className="h-3.5 w-3.5 text-emerald-400" />
            <span>{liveBlog.viewersCount.toLocaleString('mr-IN')} वाचक लाईव्ह</span>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
            title="लाईव्ह अपडेट्स रिफ्रेश करा"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>{autoRefreshCountdown}s रिफ्रेश</span>
          </button>
        </div>
      </div>

      {/* 2. Key Highlights Strip (महत्त्वाचे ठळक मुद्दे) */}
      {liveBlog.keyHighlights && liveBlog.keyHighlights.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-linear-to-r from-amber-950/30 via-slate-900 to-amber-950/20 p-4 space-y-2.5">
          <div
            onClick={() => setIsHighlightsExpanded(!isHighlightsExpanded)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase font-sans">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>महत्त्वाचे ठळक मुद्दे (Key Highlights)</span>
            </span>
            <button type="button" className="text-slate-400 hover:text-white text-xs">
              {isHighlightsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {isHighlightsExpanded && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-200 pt-1">
              {liveBlog.keyHighlights.map((hl, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                  <span className="leading-snug">{hl}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 3. Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'ALL'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            सर्व अपडेट्स ({liveBlog.updates.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('PINNED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterTab === 'PINNED'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Pin className="h-3 w-3" />
            <span>पिन केलेले</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('BREAKING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterTab === 'BREAKING'
                ? 'bg-red-700 text-white shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Flame className="h-3 w-3 text-amber-400" />
            <span>फक्त ब्रेकिंग</span>
          </button>
        </div>

        <span className="text-[11px] font-medium text-slate-500 hidden sm:block">
          प्रारंभ: {liveBlog.startedAt}
        </span>
      </div>

      {/* 4. Minute-by-Minute Timeline Stream */}
      <div className="relative pl-4 sm:pl-8 space-y-6 before:absolute before:left-[19px] sm:before:left-[35px] before:top-3 before:bottom-3 before:w-0.5 before:bg-linear-to-b before:from-red-600 before:via-amber-500 before:to-slate-800">
        {filteredUpdates.map((item, index) => {
          const isSpeaking = speakingUpdateId === item.id;
          const isLiked = Boolean(likedUpdates[item.id]);

          return (
            <div
              key={item.id}
              className="relative group transition-all animate-fadeIn"
            >
              {/* Timeline Bullet Node */}
              <div className="absolute -left-[23px] sm:-left-[39px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 border-2 border-red-500 shadow-md z-10 group-hover:scale-125 transition-transform">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
              </div>

              {/* Update Card */}
              <div
                className={`rounded-2xl border p-4 sm:p-5 shadow-lg space-y-3 transition-all ${
                  item.isPinned
                    ? 'border-amber-400/60 bg-linear-to-br from-amber-950/30 via-slate-900 to-slate-900 ring-1 ring-amber-400/30'
                    : item.isBreaking
                    ? 'border-red-600/60 bg-linear-to-br from-red-950/30 via-slate-900 to-slate-900'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                {/* Time & Badges Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-0.5 text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{item.timestamp}</span>
                    </span>

                    <span className="text-[11px] text-slate-400 font-medium">
                      ({item.timeAgo})
                    </span>

                    {item.badge && (
                      <span className="rounded-md bg-red-600/30 border border-red-500/40 text-red-300 px-2 py-0.5 text-[10px] font-black uppercase">
                        {item.badge}
                      </span>
                    )}

                    {item.isPinned && (
                      <span className="rounded-md bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase flex items-center gap-0.5">
                        <Pin className="h-3 w-3" /> Pinned
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-bold text-slate-400">
                    ✍️ {item.author}
                  </span>
                </div>

                {/* Headline & Content */}
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug font-serif">
                    {formatNewsTitle(item.title)}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans text-justify">
                    {item.content}
                  </p>

                  {item.image && (
                    <div className="overflow-hidden rounded-xl border border-slate-800 max-h-72 mt-2">
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                  )}
                </div>

                {/* Card Actions: AI Voice, WhatsApp Share, Like */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSpeakUpdate(item)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                        isSpeaking
                          ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
                      }`}
                      title="हा अपडेट मराठी आवाजात ऐका"
                    >
                      {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                      <span>{isSpeaking ? 'थांबवा' : 'ऐका (AI Voice)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppShare(item)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                      title="हा विशिष्ट अपडेट WhatsApp वर पाठवा"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>WhatsApp शेअर</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLike(item.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      isLiked
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>{(item.likesCount || 0) + (isLiked ? 1 : 0)}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
