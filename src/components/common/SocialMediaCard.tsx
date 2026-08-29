import React, { useState } from 'react';
import {
  Play,
  Heart,
  Share2,
  MapPin,
  ExternalLink,
  Sparkles,
  MessageCircle,
  Repeat2,
  Bookmark,
  Eye,
  CheckCircle2,
  Image as ImageIcon,
  Flame,
} from 'lucide-react';
import { SocialMediaPost } from '../../types';

interface SocialMediaCardProps {
  post: SocialMediaPost;
  onPlay: (post: SocialMediaPost) => void;
  showAdminActions?: boolean;
  onEdit?: (post: SocialMediaPost) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

export const SocialMediaCard: React.FC<SocialMediaCardProps> = ({
  post,
  onPlay,
  showAdminActions = false,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
}) => {
  const isReel = post.mediaType === 'REEL' || post.mediaType === 'SHORT';
  const isTwitter = post.platform === 'TWITTER';
  const isStandardVideo = post.mediaType === 'VIDEO';

  // Smart fallback image state
  const [imageSrc, setImageSrc] = useState<string>(post.thumbnailUrl);
  const [fallbackAttempt, setFallbackAttempt] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(post.likes || 0);

  const handleImageError = () => {
    // If it's a YouTube maxresdefault image that failed (404), fallback to hqdefault
    if (imageSrc.includes('maxresdefault.jpg') && fallbackAttempt === 0) {
      setImageSrc(imageSrc.replace('maxresdefault.jpg', 'hqdefault.jpg'));
      setFallbackAttempt(1);
    } else if (imageSrc.includes('hqdefault.jpg') && fallbackAttempt === 1) {
      setImageSrc(imageSrc.replace('hqdefault.jpg', 'mqdefault.jpg'));
      setFallbackAttempt(2);
    } else {
      // General news fallback
      setImageSrc(
        isReel
          ? 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'
      );
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `*${post.title}*\n\n🎥 InfoNewsUpdate24 वर हा व्हायरल व्हिडिओ पहा:\n${post.url || window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Format large numbers (e.g. 14200 -> 14.2K)
  const formatCount = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('en-IN');
  };

  // Platform Badge Helper
  const renderPlatformBadge = () => {
    switch (post.platform) {
      case 'INSTAGRAM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-md uppercase tracking-wider">
            <span>📸 Instagram {isReel ? 'Reel' : 'Post'}</span>
          </span>
        );
      case 'FACEBOOK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-md uppercase tracking-wider">
            <span>📘 Facebook {isReel ? 'Reel' : 'Watch'}</span>
          </span>
        );
      case 'YOUTUBE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-600 text-white shadow-md uppercase tracking-wider">
            <span>▶ YouTube {isReel ? 'Short' : 'Video'}</span>
          </span>
        );
      case 'TWITTER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-black text-white border border-slate-700 shadow-md uppercase tracking-wider">
            <span>𝕏 Post</span>
          </span>
        );
      default:
        return null;
    }
  };

  // 1. STANDARD 9:16 VERTICAL REEL CARD (Instagram Reel, Facebook Reel, YouTube Shorts)
  if (isReel) {
    return (
      <div
        id={`social-reel-card-${post.id}`}
        className="group relative flex flex-col justify-between rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-pink-500 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer aspect-[9/16] w-full"
        onClick={() => onPlay(post)}
      >
        {/* Background Vertical Poster */}
        <div className="absolute inset-0 z-0 bg-slate-900 overflow-hidden">
          <img
            src={imageSrc || post.thumbnailUrl}
            alt={post.title}
            onError={handleImageError}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          {/* Subtle Smartphone Reel Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95" />
        </div>

        {/* Top Overlay: Platform Badge & Trending Indicator */}
        <div className="relative z-10 p-3.5 flex items-start justify-between gap-2">
          <div className="flex flex-col items-start gap-1">
            {renderPlatformBadge()}
            {post.isFeaturedReel ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[9px] font-black text-slate-950 shadow-md uppercase tracking-wider animate-pulse">
                <Flame className="h-3 w-3 fill-slate-950 text-slate-950" />
                <span>🔥 Trending Reel</span>
              </span>
            ) : (post.views || 0) > 2000 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[9px] font-black text-white shadow-xs uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                <span>Popular</span>
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            {post.duration && (
              <span className="rounded-md bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[10px] font-mono font-bold text-white border border-white/10">
                {post.duration}
              </span>
            )}
          </div>
        </div>

        {/* Center Play Button Overlay */}
        <div className="relative z-10 flex items-center justify-center my-auto pointer-events-none">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-pink-600 to-rose-600 text-white shadow-2xl backdrop-blur-xs group-hover:scale-110 transition-all border-2 border-white/30">
            <Play className="h-6 w-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Right Floating Engagement Column (Reel Style) */}
        <div className="absolute right-2.5 bottom-24 z-20 flex flex-col items-center gap-3">
          {/* Like button */}
          <button
            type="button"
            onClick={handleLike}
            className="flex flex-col items-center text-white text-[10px] font-bold group/like"
            title="Like Reel"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border transition-all ${
              isLiked ? 'bg-rose-600 border-rose-400 scale-110' : 'bg-black/60 border-white/20 hover:bg-rose-600'
            }`}>
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} />
            </div>
            <span className="mt-0.5 text-[10px] font-mono text-slate-200">{formatCount(likesCount)}</span>
          </button>

          {/* Views count */}
          <div className="flex flex-col items-center text-white text-[10px] font-bold">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20">
              <Eye className="h-4 w-4 text-sky-400" />
            </div>
            <span className="mt-0.5 text-[10px] font-mono text-slate-200">{formatCount(post.views)}</span>
          </div>

          {/* Direct WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center text-white text-[10px] font-bold"
            title="WhatsApp वर शेअर करा"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg border border-emerald-400/40 transition-transform hover:scale-110">
              <Share2 className="h-4 w-4" />
            </div>
            <span className="mt-0.5 text-[9px] font-bold text-emerald-400">Share</span>
          </button>
        </div>

        {/* Bottom Overlay: Creator info, Title, Location */}
        <div className="relative z-10 p-3.5 space-y-1.5 bg-gradient-to-t from-black via-black/85 to-transparent pt-6 pr-14">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="h-5 w-5 rounded-full bg-gradient-to-tr from-pink-600 to-rose-600 text-[10px] font-bold text-white flex items-center justify-center">
              24
            </span>
            <span className="font-bold text-white truncate max-w-[120px]">
              {post.authorHandle || post.authorName}
            </span>
            {post.location && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-300 truncate">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{post.location}</span>
              </span>
            )}
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-pink-300 transition-colors font-serif">
            {post.title}
          </h4>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
              {post.category || 'Reels'}
            </span>
            <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
              <span>प्ले करा</span>
              <span>&rarr;</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. STANDARD TWITTER / X POST CARD
  if (isTwitter) {
    return (
      <div
        id={`social-twitter-card-${post.id}`}
        className="group flex flex-col justify-between rounded-2xl border border-slate-700/80 bg-slate-900/90 text-white p-4 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => onPlay(post)}
      >
        {/* Twitter Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-full bg-black border border-slate-700 flex items-center justify-center text-white font-black text-xs shadow-xs">
              𝕏
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-xs truncate">
                  {post.authorName}
                </span>
                <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              </div>
              <span className="text-[10px] text-slate-400 block truncate">
                {post.authorHandle || '@InfoNewsUpdate24'} &bull; {post.publishDate}
              </span>
            </div>
          </div>
          {renderPlatformBadge()}
        </div>

        {/* Tweet Body */}
        <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed mt-3 font-sans">
          {post.title}
        </p>

        {/* Thumbnail if present */}
        {post.thumbnailUrl && (
          <div className="relative mt-3 h-36 w-full rounded-xl overflow-hidden border border-slate-800">
            <img
              src={imageSrc || post.thumbnailUrl}
              alt=""
              onError={handleImageError}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}

        {/* Engagement Stats & Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>{formatCount(post.likes)}</span>
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-sky-400" />
            <span>{formatCount(post.views)} views</span>
          </span>
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1 text-emerald-400 font-bold hover:text-emerald-300"
          >
            <Share2 className="h-3 w-3" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. STANDARD 16:9 LANDSCAPE VIDEO CARD (YouTube Videos, Facebook Watch)
  return (
    <div
      id={`social-video-card-${post.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950 text-white overflow-hidden shadow-lg hover:shadow-2xl hover:border-red-500 transition-all duration-300 cursor-pointer"
      onClick={() => onPlay(post)}
    >
      {/* 16:9 Thumbnail Stage */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={imageSrc || post.thumbnailUrl}
          alt={post.title}
          onError={handleImageError}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-2">
          {renderPlatformBadge()}
          {post.duration && (
            <span className="rounded-md bg-black/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-mono font-bold text-white border border-white/10">
              {post.duration}
            </span>
          )}
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 hover:bg-red-600 text-white shadow-2xl backdrop-blur-xs group-hover:scale-110 transition-all border-2 border-white/30">
            <Play className="h-5 w-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Bottom Thumbnail Bar */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-[11px] text-white">
          <span className="font-bold flex items-center gap-1 truncate max-w-[200px]">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>{post.authorName || 'InfoNews Video Desk'}</span>
          </span>
          <span className="flex items-center gap-1 font-mono text-slate-300">
            <Eye className="h-3 w-3 text-sky-400" />
            <span>{formatCount(post.views)}</span>
          </span>
        </div>
      </div>

      {/* Video Content & Engagement */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-black text-red-400 uppercase tracking-wider">
              {post.category || 'Special Report'}
            </span>
            <span className="text-slate-400">{post.publishDate}</span>
          </div>

          <h4 className="text-sm font-bold text-white group-hover:text-red-400 line-clamp-2 leading-snug font-serif">
            {post.title}
          </h4>
        </div>

        {/* Footer Actions */}
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleLike}
            className="flex items-center gap-1 text-slate-300 hover:text-rose-400 transition-colors"
          >
            <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{formatCount(likesCount)}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-bold transition-all shadow-xs"
          >
            <Share2 className="h-3 w-3" />
            <span>WhatsApp शेअर</span>
          </button>
        </div>
      </div>
    </div>
  );
};
