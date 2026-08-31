import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MapPin,
  Flame,
  Volume2,
  Share2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  Clock,
  Check,
  Building,
  PhoneCall,
  ShieldCheck,
  HeartPulse,
  Newspaper,
  BookOpen,
  ArrowRight,
  Trees,
  Waves,
  Crown,
} from 'lucide-react';
import { Post } from '../../types';
import { formatNewsTitle } from '../../utils/contentFormatter';
import {
  SpotlightStoryItem,
  SpotlightTalukaItem,
} from '../../data/gadchiroliSpotlightData';
import {
  GadchiroliSpotlightService,
  GadchiroliSpotlightSettings,
  SpotlightThemeStyle,
} from '../../services/GadchiroliSpotlightService';

interface GadchiroliTalukaSpotlightProps {
  posts?: Post[];
  onSelectPost?: (slug: string) => void;
  onSelectTalukaFilter?: (talukaId: string) => void;
  onQuickListen?: (post: Post) => void;
}

// Dynamic Theme Styles
const THEME_CLASSES: Record<
  SpotlightThemeStyle,
  {
    border: string;
    bg: string;
    iconBg: string;
    activePill: string;
    accentText: string;
    heroCardBorder: string;
    heroCardHover: string;
  }
> = {
  FIERY_RED: {
    border: 'border-red-600/40',
    bg: 'bg-linear-to-br from-red-950/30 via-slate-900 to-amber-950/25',
    iconBg: 'bg-linear-to-tr from-red-600 to-amber-500',
    activePill: 'bg-linear-to-r from-red-600 to-amber-600 text-white ring-2 ring-amber-400',
    accentText: 'text-amber-400',
    heroCardBorder: 'border-slate-700/80',
    heroCardHover: 'hover:border-amber-400/80',
  },
  FOREST_GREEN: {
    border: 'border-emerald-600/40',
    bg: 'bg-linear-to-br from-emerald-950/30 via-slate-900 to-teal-950/25',
    iconBg: 'bg-linear-to-tr from-emerald-600 to-teal-500',
    activePill: 'bg-linear-to-r from-emerald-600 to-teal-600 text-white ring-2 ring-emerald-300',
    accentText: 'text-emerald-400',
    heroCardBorder: 'border-emerald-900/60',
    heroCardHover: 'hover:border-emerald-400/80',
  },
  ROYAL_BLUE: {
    border: 'border-blue-600/40',
    bg: 'bg-linear-to-br from-blue-950/30 via-slate-900 to-indigo-950/25',
    iconBg: 'bg-linear-to-tr from-blue-600 to-cyan-500',
    activePill: 'bg-linear-to-r from-blue-600 to-cyan-600 text-white ring-2 ring-cyan-300',
    accentText: 'text-cyan-400',
    heroCardBorder: 'border-blue-900/60',
    heroCardHover: 'hover:border-cyan-400/80',
  },
  GOLDEN_OBSIDIAN: {
    border: 'border-amber-500/50',
    bg: 'bg-linear-to-br from-amber-950/40 via-stone-900 to-yellow-950/25',
    iconBg: 'bg-linear-to-tr from-amber-500 to-yellow-400 text-slate-950',
    activePill: 'bg-linear-to-r from-amber-500 to-yellow-500 text-slate-950 font-black ring-2 ring-amber-300',
    accentText: 'text-amber-300',
    heroCardBorder: 'border-amber-700/60',
    heroCardHover: 'hover:border-amber-300/90',
  },
};

export const GadchiroliTalukaSpotlight: React.FC<GadchiroliTalukaSpotlightProps> = ({
  posts = [],
  onSelectPost,
  onSelectTalukaFilter,
  onQuickListen,
}) => {
  const [activeTaluka, setActiveTaluka] = useState<string>('all');
  const [shareToast, setShareToast] = useState<string>('');
  const [talukas, setTalukas] = useState<SpotlightTalukaItem[]>(() =>
    GadchiroliSpotlightService.getTalukas()
  );
  const [allStories, setAllStories] = useState<SpotlightStoryItem[]>(() =>
    GadchiroliSpotlightService.getStories()
  );
  const [settings, setSettings] = useState<GadchiroliSpotlightSettings>(() =>
    GadchiroliSpotlightService.getSettings()
  );

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setTalukas(GadchiroliSpotlightService.getTalukas());
      setAllStories(GadchiroliSpotlightService.getStories());
      setSettings(GadchiroliSpotlightService.getSettings());
    };
    window.addEventListener('infonews:gadchiroli-spotlight-updated', handleUpdate);
    return () =>
      window.removeEventListener('infonews:gadchiroli-spotlight-updated', handleUpdate);
  }, []);

  if (!settings.isEnabled) return null;

  const currentTheme = THEME_CLASSES[settings.themeStyle] || THEME_CLASSES.FIERY_RED;

  // Scroll controls for taluka pills
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  // 100% accurate taluka filtering (No wrong fallback)
  const filteredStories = useMemo(() => {
    if (activeTaluka === 'all') {
      return allStories.slice(0, 6);
    }
    const matched = allStories.filter((s) => s.talukaId === activeTaluka);
    return matched.length > 0 ? matched : [];
  }, [activeTaluka, allStories]);

  const activeTalukaObj =
    talukas.find((t) => t.id === activeTaluka) || talukas[0] || { id: 'all', name: 'सर्व तालुके', icon: '🚩' };

  const currentHelpline = activeTalukaObj.helplines || {
    tahsil: '०७१३२-२२२०५०',
    police: '०७१३२-२२२१००',
    hospital: '०७१३२-२२२०१२',
    mseb: '१९१२ / १८००-२३३-३४३५',
  };

  const handleWhatsAppShare = (
    e: React.MouseEvent,
    story: SpotlightStoryItem
  ) => {
    e.stopPropagation();
    const shareUrl = `https://www.infonewsupdate24.com/news/${story.slug}`;
    const text = `🚩 *InfoNewsUpdate24 गडचिरोली १२ तालुके स्पॉटलाईट*\n📍 *${story.taluka}*\n\n📌 *${story.title}*\n\n${story.excerpt}\n\n👉 *संपूर्ण बातमी वाचण्यासाठी येथे क्लिक करा:*\n${shareUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border-2 ${currentTheme.border} ${currentTheme.bg} p-4 sm:p-7 shadow-xl transition-all space-y-5`}
    >
      {/* Toast */}
      {shareToast && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold shadow-lg animate-fadeIn">
          <Check className="h-3.5 w-3.5" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Top Header & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${currentTheme.iconBg} text-white font-black shadow-md`}
          >
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-serif">
                <span>{settings.sectionTitle}</span>
                <span className={`${currentTheme.accentText} text-xs sm:text-sm font-sans font-bold`}>
                  • {talukas.length - 1} तालुके थेट कव्हरेज
                </span>
              </h2>
              <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-red-600/20 border border-red-500/50 px-2.5 py-0.5 text-[10px] font-black uppercase text-red-400 animate-pulse">
                {settings.highlightBadge}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              {settings.sectionSubtitle}
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 text-xs font-bold ${currentTheme.accentText} bg-slate-900/70 border border-slate-700 px-3 py-1 rounded-full`}
        >
          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
          <span>२४ तास अखंड स्थानिक वार्तापत्र</span>
        </div>
      </div>

      {/* Talukas Horizontal Filter Pills Bar with Left/Right Scroll Controls */}
      <div className="relative flex items-center">
        {/* Left Scroll Button */}
        <button
          type="button"
          onClick={handleScrollLeft}
          className="absolute -left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/95 text-white border border-slate-700 shadow-xl hover:bg-red-600 hover:scale-110 transition-all cursor-pointer"
          title="डावीकडे स्क्रोल करा"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Scrollable Pills Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto px-7 py-1 scroll-smooth scrollbar-none w-full"
        >
          {talukas.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActiveTaluka(t.id);
                if (onSelectTalukaFilter && t.id !== 'all') {
                  onSelectTalukaFilter(t.id);
                }
              }}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTaluka === t.id
                  ? `${currentTheme.activePill} shadow-lg scale-105`
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          type="button"
          onClick={handleScrollRight}
          className="absolute -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/95 text-white border border-slate-700 shadow-xl hover:bg-red-600 hover:scale-110 transition-all cursor-pointer"
          title="उजवीकडे स्क्रोल करा"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SINGLE TALUKA SELECTED: GRAND 2-COLUMN SHOWCASE HERO CARD */}
      {/* ========================================================================= */}
      {activeTaluka !== 'all' && filteredStories.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between bg-slate-950/90 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-200 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-base">{activeTalukaObj.icon}</span>
              <span className="text-sm">
                <strong>{activeTalukaObj.name}</strong> विशेष ग्राउंड रिपोर्ट व थेट घडामोडी:
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTaluka('all')}
              className={`flex items-center gap-1 text-xs font-black ${currentTheme.accentText} bg-slate-900 border border-slate-700 hover:bg-slate-800 px-3 py-1 rounded-xl transition-all cursor-pointer`}
            >
              <span>सर्व तालुके पहा</span>
              <span>(✕)</span>
            </button>
          </div>

          {/* Grand Horizontal 2-Column Hero Card */}
          {filteredStories.map((story) => (
            <div
              key={story.id}
              onClick={() => {
                if (onSelectPost) onSelectPost(story.slug);
              }}
              className={`group rounded-3xl border-2 ${currentTheme.heroCardBorder} bg-slate-900/95 p-5 sm:p-7 shadow-2xl ${currentTheme.heroCardHover} transition-all cursor-pointer overflow-hidden`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left 5 Cols: Big Image with Badge & Timer */}
                <div className="lg:col-span-5 relative h-64 sm:h-72 w-full overflow-hidden rounded-2xl border border-slate-700 shadow-xl">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-slate-950/90 backdrop-blur-xs border border-amber-400/50 px-3 py-1 text-xs font-black text-amber-300 shadow-xl">
                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                    <span>{story.taluka} विशेष रिपोर्ट</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg bg-black/80 backdrop-blur-xs px-3 py-1.5 text-[11px] font-medium text-slate-300">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-400" />
                      <span>{story.time}</span>
                    </span>
                    <span className="text-red-400 font-bold">InfoNewsUpdate24 ग्राउंड ब्युरो</span>
                  </div>
                </div>

                {/* Right 7 Cols: Punchy Content, Lead Excerpt, Helpline & Action Buttons */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-red-600 px-2.5 py-0.5 text-[11px] font-black uppercase text-white shadow-xs">
                        स्थानिक मथळा
                      </span>
                      <span className={`text-xs font-bold ${currentTheme.accentText}`}>
                        {story.taluka} तालुका विशेष वार्ता
                      </span>
                    </div>

                    <h3
                      className={`text-xl sm:text-2xl font-black text-white group-hover:${currentTheme.accentText} leading-snug font-serif`}
                    >
                      {formatNewsTitle(story.title)}
                    </h3>

                    <p className="text-sm text-slate-300 leading-relaxed font-sans text-justify bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      {story.excerpt}
                    </p>
                  </div>

                  {/* Actions & Byline */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      ✍️ अधिकृत बातमीदार: <strong className="text-white">{story.author}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {settings.showAudioButton && onQuickListen && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickListen({
                              id: story.id,
                              title: story.title,
                              slug: story.slug,
                              content: story.fullBody || story.excerpt,
                              summary: story.excerpt,
                              featuredImage: story.image,
                              category: 'स्थानिक वार्ता',
                              status: 'PUBLISHED',
                              authorId: 'admin',
                              authorName: story.author,
                              publishDate: '2026-08-29',
                              tags: ['गडचिरोली', story.taluka],
                              viewCount: 2150,
                              readingTimeMinutes: 3,
                            });
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition-colors cursor-pointer border border-slate-700"
                          title="बातमी मराठीत ऐका (AI Audio)"
                        >
                          <Volume2 className="h-4 w-4 animate-pulse" />
                          <span>बातमी ऐका</span>
                        </button>
                      )}

                      {settings.showWhatsAppShare && (
                        <button
                          type="button"
                          onClick={(e) => handleWhatsAppShare(e, story)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
                          title="WhatsApp वर शेअर करा"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>WhatsApp शेअर</span>
                        </button>
                      )}

                      <div
                        className={`flex items-center gap-1 text-xs font-black ${currentTheme.accentText} bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all`}
                      >
                        <span>संपूर्ण बातमी वाचा</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Quick Taluka Helpline Desk */}
          {settings.showHelplineDesk && (
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className={`text-xs font-black ${currentTheme.accentText} flex items-center gap-1.5`}>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>📍 {activeTalukaObj.name} • महत्त्वाची प्रशासकीय संपर्क व मदत केंद्रे (Helpline Desk)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-bold">२४ तास आपत्कालीन सेवा</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-medium text-slate-300">
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold">🏛️ तहसील कार्यालय</span>
                  <strong className="text-white font-mono text-xs">{currentHelpline.tahsil}</strong>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold">👮 पोलीस ठाणे</span>
                  <strong className="text-white font-mono text-xs">{currentHelpline.police}</strong>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold">🏥 रुग्णालय / ॲम्ब्युलन्स</span>
                  <strong className="text-white font-mono text-xs">{currentHelpline.hospital}</strong>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold">⚡ महावितरण तक्रार</span>
                  <strong className="text-white font-mono text-xs">{currentHelpline.mseb}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ALL TALUKAS VIEW: 3-COLUMN FEATURED CARDS GRID */}
      {/* ========================================================================= */}
      {activeTaluka === 'all' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              onClick={() => {
                if (onSelectPost) onSelectPost(story.slug);
              }}
              className={`group relative flex flex-col justify-between rounded-2xl border border-slate-700/70 bg-slate-900/90 p-4 shadow-md ${currentTheme.heroCardHover} hover:shadow-xl transition-all cursor-pointer overflow-hidden`}
            >
              <div className="space-y-3">
                {/* Image & Taluka Badge */}
                <div className="relative h-44 w-full overflow-hidden rounded-xl">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-slate-950/85 backdrop-blur-xs border border-amber-400/40 px-2.5 py-0.5 text-[10px] font-black text-amber-300 shadow-md">
                    <MapPin className="h-3 w-3 text-red-500" />
                    <span>{story.taluka}</span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-medium text-slate-300">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{story.time}</span>
                  </div>
                </div>

                {/* Title & Excerpt */}
                <div className="space-y-1.5">
                  <h3
                    className={`text-sm font-bold text-white group-hover:${currentTheme.accentText} line-clamp-2 leading-snug font-serif`}
                  >
                    {formatNewsTitle(story.title)}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                    {story.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer: Author + Actions */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-medium">
                  ✍️ {story.author}
                </span>

                <div className="flex items-center gap-1.5">
                  {settings.showAudioButton && onQuickListen && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickListen({
                          id: story.id,
                          title: story.title,
                          slug: story.slug,
                          content: story.fullBody || story.excerpt,
                          summary: story.excerpt,
                          featuredImage: story.image,
                          category: 'स्थानिक वार्ता',
                          status: 'PUBLISHED',
                          authorId: 'admin',
                          authorName: story.author,
                          publishDate: '2026-08-29',
                          tags: ['गडचिरोली', story.taluka],
                          viewCount: 1840,
                          readingTimeMinutes: 2,
                        });
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
                      title="बातमी ऐका (AI Audio)"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {settings.showWhatsAppShare && (
                    <button
                      type="button"
                      onClick={(e) => handleWhatsAppShare(e, story)}
                      className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-colors cursor-pointer"
                      title="WhatsApp वर शेअर करा"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <div
                    className={`flex items-center text-[11px] font-bold ${currentTheme.accentText} group-hover:translate-x-0.5 transition-transform`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
