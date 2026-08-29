import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Radio,
  Bell,
  AlertTriangle,
  Sparkles,
  Pause,
  Play,
  ChevronRight,
  ExternalLink,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Post, BreakingTickerItem } from '../../types';
import { formatNewsTitle } from '../../utils/contentFormatter';

interface BreakingNewsTickerProps {
  onSelectPost?: (post: Post) => void;
  onSelectCategory?: (categorySlug: string) => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  onSelectPost,
  onSelectCategory,
}) => {
  const { themeSettings, posts, categories, setQuickListenPost, aiVoiceSettings } = useApp();
  const [isPausedByUser, setIsPausedByUser] = useState(false);

  const tickerConfig = themeSettings.breakingTicker;

  // If disabled in settings, return null
  if (!tickerConfig || tickerConfig.isEnabled === false) {
    return null;
  }

  // Resolve items according to selected source
  const getTickerItems = (): {
    id: string;
    text: string;
    tag?: string;
    url?: string;
    post?: Post;
  }[] => {
    if (tickerConfig.source === 'CUSTOM_ITEMS') {
      const activeCustom = (tickerConfig.customItems || []).filter((item) => item.isPublished);
      if (activeCustom.length > 0) {
        return activeCustom.map((item) => ({
          id: item.id,
          text: item.text,
          tag: item.tag || 'महत्त्वाचे',
          url: item.url,
        }));
      }
    }

    if (tickerConfig.source === 'CATEGORY_NEWS' && tickerConfig.selectedCategoryId) {
      const catPosts = posts.filter(
        (p) =>
          p.status === 'PUBLISHED' &&
          (p.categoryId === tickerConfig.selectedCategoryId ||
            p.subCategoryId === tickerConfig.selectedCategoryId)
      );
      if (catPosts.length > 0) {
        return catPosts.slice(0, 10).map((p) => ({
          id: p.id,
          text: formatNewsTitle(p.title),
          tag: p.isBreaking ? 'ब्रेकिंग' : 'ताजी बातमी',
          post: p,
        }));
      }
    }

    if (tickerConfig.source === 'ALL_RECENT') {
      const recentPosts = posts.filter((p) => p.status === 'PUBLISHED').slice(0, 10);
      return recentPosts.map((p) => ({
        id: p.id,
        text: formatNewsTitle(p.title),
        tag: p.isBreaking ? 'ब्रेकिंग' : 'ताजी बातमी',
        post: p,
      }));
    }

    // Default: AUTOMATIC_BREAKING
    const breakingPosts = posts.filter((p) => p.isBreaking && p.status === 'PUBLISHED');
    if (breakingPosts.length > 0) {
      return breakingPosts.map((p) => ({
        id: p.id,
        text: formatNewsTitle(p.title),
        tag: 'ब्रेकिंग',
        post: p,
      }));
    }

    // Fallback: If no breaking posts, use custom items or recent posts
    if (tickerConfig.customItems && tickerConfig.customItems.length > 0) {
      return tickerConfig.customItems
        .filter((item) => item.isPublished)
        .map((item) => ({
          id: item.id,
          text: formatNewsTitle(item.text),
          tag: item.tag || 'लाईव्ह',
          url: item.url,
        }));
    }

    return posts
      .filter((p) => p.status === 'PUBLISHED')
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        text: formatNewsTitle(p.title),
        tag: p.isBreaking ? 'ब्रेकिंग' : 'ताजी घडामोड',
        post: p,
      }));
  };

  const tickerItems = getTickerItems();

  if (tickerItems.length === 0) {
    return null;
  }

  // Determine speed in seconds
  const getSpeedDuration = () => {
    switch (tickerConfig.scrollSpeed) {
      case 'ultra_fast':
        return '14s';
      case 'fast':
        return '20s';
      case 'slow':
        return '45s';
      case 'paused':
        return '0s';
      case 'normal':
      default:
        return '30s';
    }
  };

  const speedDuration = getSpeedDuration();

  // Render Badge Icon
  const renderBadgeIcon = () => {
    const iconClass = 'h-3.5 w-3.5 shrink-0 animate-pulse';
    switch (tickerConfig.badgeIcon) {
      case 'zap':
        return <Zap className={iconClass} />;
      case 'radio':
        return <Radio className={iconClass} />;
      case 'bell':
        return <Bell className={iconClass} />;
      case 'alert':
        return <AlertTriangle className={iconClass} />;
      case 'sparkles':
        return <Sparkles className={iconClass} />;
      case 'flame':
      default:
        return <Flame className={iconClass} />;
    }
  };

  // Render Separator Icon
  const renderSeparator = () => {
    switch (tickerConfig.separatorIcon) {
      case 'zap':
        return <Zap className="h-3 w-3 text-amber-400 mx-3 shrink-0" />;
      case 'flame':
        return <Flame className="h-3 w-3 text-red-500 mx-3 shrink-0" />;
      case 'star':
        return <span className="text-amber-400 mx-3 font-bold text-xs">✦</span>;
      case 'pipe':
        return <span className="text-slate-500 mx-3 font-bold">|</span>;
      case 'bullet':
      default:
        return <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 mx-3 shrink-0" />;
    }
  };

  const handleItemClick = (item: (typeof tickerItems)[0]) => {
    if (item.post && onSelectPost) {
      onSelectPost(item.post);
    } else if (item.url) {
      if (item.url.startsWith('/category/') && onSelectCategory) {
        const catSlug = item.url.replace('/category/', '');
        onSelectCategory(catSlug);
      } else if (item.url.startsWith('http')) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div
      id="breaking-news-ticker-bar"
      className={`relative w-full overflow-hidden border-y border-slate-800/80 shadow-md ${
        tickerConfig.isSticky ? 'sticky top-[53px] z-30' : ''
      }`}
      style={{
        backgroundColor: tickerConfig.tickerBgColor || '#0f172a',
        color: tickerConfig.tickerTextColor || '#f8fafc',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center h-10 px-2 sm:px-4">
        {/* Left Badge: Breaking News Title */}
        <div
          className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wider shrink-0 shadow-sm select-none mr-2 sm:mr-3"
          style={{
            backgroundColor: tickerConfig.badgeBgColor || '#dc2626',
            color: tickerConfig.badgeTextColor || '#ffffff',
          }}
        >
          {renderBadgeIcon()}
          <span className="whitespace-nowrap text-[11px] sm:text-xs">
            {tickerConfig.title || '🔴 ब्रेकिंग न्यूज'}
          </span>
          <span className="relative flex h-2 w-2 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </div>

        {/* Ticker Scrolling Area */}
        <div
          className={`relative flex-1 overflow-hidden h-full flex items-center ${
            tickerConfig.pauseOnHover ? 'pause-on-hover' : ''
          }`}
        >
          {/* Continuous Infinite Seamless Scrolling Strip */}
          <div
            className="animate-ticker-marquee flex items-center whitespace-nowrap text-xs font-medium"
            style={
              {
                '--ticker-duration': speedDuration,
                animationPlayState: isPausedByUser || tickerConfig.scrollSpeed === 'paused' ? 'paused' : 'running',
              } as React.CSSProperties
            }
          >
            {/* First Set of Items */}
            {tickerItems.map((item, idx) => (
              <div
                key={`tick-1-${item.id}-${idx}`}
                onClick={() => handleItemClick(item)}
                className="inline-flex items-center cursor-pointer hover:underline group/item px-1"
                title={item.text}
              >
                {item.tag && (
                  <span className="mr-1.5 rounded px-1.5 py-0.5 text-[9px] font-black uppercase bg-red-600/20 text-red-400 ring-1 ring-red-500/30 group-hover/item:bg-red-600 group-hover/item:text-white transition-colors shrink-0">
                    {item.tag}
                  </span>
                )}
                <span className="hover:text-red-400 transition-colors font-medium">
                  {item.text}
                </span>

                {item.post && aiVoiceSettings?.isEnabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickListenPost(item.post!);
                    }}
                    className="ml-1.5 opacity-0 group-hover/item:opacity-100 p-0.5 text-slate-400 hover:text-blue-400 transition-all"
                    title="या बातमीचे AI व्हॉइस बुलेटिन ऐका"
                  >
                    <Volume2 className="h-3 w-3" />
                  </button>
                )}

                {renderSeparator()}
              </div>
            ))}

            {/* Duplicate Second Set of Items for Seamless Endless Loop */}
            {tickerItems.map((item, idx) => (
              <div
                key={`tick-2-${item.id}-${idx}`}
                onClick={() => handleItemClick(item)}
                className="inline-flex items-center cursor-pointer hover:underline group/item px-1"
                title={item.text}
              >
                {item.tag && (
                  <span className="mr-1.5 rounded px-1.5 py-0.5 text-[9px] font-black uppercase bg-red-600/20 text-red-400 ring-1 ring-red-500/30 group-hover/item:bg-red-600 group-hover/item:text-white transition-colors shrink-0">
                    {item.tag}
                  </span>
                )}
                <span className="hover:text-red-400 transition-colors font-medium">
                  {item.text}
                </span>

                {item.post && aiVoiceSettings?.isEnabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickListenPost(item.post!);
                    }}
                    className="ml-1.5 opacity-0 group-hover/item:opacity-100 p-0.5 text-slate-400 hover:text-blue-400 transition-all"
                    title="या बातमीचे AI व्हॉइस बुलेटिन ऐका"
                  >
                    <Volume2 className="h-3 w-3" />
                  </button>
                )}

                {renderSeparator()}
              </div>
            ))}
          </div>

          {/* Left/Right Edge Subtle Gradient Vignette */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-[#0f172a] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0f172a] to-transparent" />
        </div>

        {/* Right Accessibility Pause/Play Control */}
        <div className="relative z-10 hidden sm:flex items-center gap-1 pl-2 border-l border-slate-700/60 shrink-0">
          <button
            type="button"
            onClick={() => setIsPausedByUser(!isPausedByUser)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isPausedByUser ? 'स्क्रोलिंग सुरू करा (Resume)' : 'स्क्रोलिंग थांबवा (Pause)'}
          >
            {isPausedByUser ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};
