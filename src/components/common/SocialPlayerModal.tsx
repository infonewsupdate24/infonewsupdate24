import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Share2,
  ExternalLink,
  MapPin,
  Eye,
  CheckCircle2,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { SocialMediaPost } from '../../types';

export interface SocialPlayerModalProps {
  post: SocialMediaPost | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export const SocialPlayerModal: React.FC<SocialPlayerModalProps> = ({
  post,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalCount,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(post?.likes || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Sync state when active post changes
  useEffect(() => {
    if (post) {
      setLikesCount(post.likes || 0);
      setIsLiked(false);
    }
  }, [post]);

  // Keyboard navigation support (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        onPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!post) return null;

  const isReel = post.mediaType === 'REEL' || post.mediaType === 'SHORT';
  const isTwitter = post.platform === 'TWITTER';

  const handleLikeToggle = (e: React.MouseEvent) => {
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

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(post.url || window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  const formatCount = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('en-IN');
  };

  return (
    <div
      id="social-player-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Previous Reel Navigation Arrow (Desktop) */}
      {onPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="hidden md:flex absolute left-4 lg:left-8 z-50 h-12 w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-2xl hover:scale-110"
          title="मागील रील (Previous Reel - Left Arrow)"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Next Reel Navigation Arrow (Desktop) */}
      {onNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="hidden md:flex absolute right-4 lg:right-8 z-50 h-12 w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-2xl hover:scale-110"
          title="पुढील रील (Next Reel - Right Arrow)"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* 1. 9:16 VERTICAL REEL PLAYER (Instagram Reels, Facebook Reels, YouTube Shorts) */}
      {isReel ? (
        <div
          id="social-player-reel-container"
          className="relative w-full max-w-[360px] sm:max-w-[400px] h-[90vh] max-h-[760px] rounded-3xl bg-black border border-slate-800 text-white shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Reel Navigation Bar */}
          <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-3.5 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
            <div className="flex items-center gap-2">
              {post.platform === 'INSTAGRAM' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-sm">
                  📸 Instagram Reel
                </span>
              )}
              {post.platform === 'FACEBOOK' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-sm">
                  📘 Facebook Reel
                </span>
              )}
              {post.platform === 'YOUTUBE' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white shadow-sm">
                  ▶ YouTube Short
                </span>
              )}
              {totalCount && currentIndex !== undefined && (
                <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-white/10">
                  {currentIndex + 1} / {totalCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-xs text-white hover:bg-black/80 border border-white/10"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-xs text-white hover:bg-red-600 transition-colors border border-white/10"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 9:16 Reel Vertical Stage */}
          <div className="relative flex-1 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
            {post.embedUrl ? (
              <iframe
                src={`${post.embedUrl}${post.embedUrl.includes('?') ? '&' : '?'}autoplay=1&mute=${isMuted ? 1 : 0}`}
                title={post.title}
                className="h-full w-full border-0 object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="relative h-full w-full">
                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <span className="text-sm font-bold">थेट प्लेबॅक उपलब्ध नाही</span>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 px-4 py-2 text-xs font-bold text-white hover:brightness-110 shadow-lg"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open on {post.platform}</span>
                  </a>
                </div>
              </div>
            )}

            {/* Right Engagement Column */}
            <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-3.5">
              <button
                type="button"
                onClick={handleLikeToggle}
                className="flex flex-col items-center text-white text-[10px] font-bold group/like"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md border shadow-lg transition-all ${
                  isLiked ? 'bg-rose-600 border-rose-400 scale-110' : 'bg-black/70 border-white/20 hover:bg-rose-600'
                }`}>
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} />
                </div>
                <span className="mt-1 font-mono text-[10px]">{formatCount(likesCount)}</span>
              </button>

              <div className="flex flex-col items-center text-white text-[10px] font-bold">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/20 shadow-lg">
                  <Eye className="h-5 w-5 text-sky-400" />
                </div>
                <span className="mt-1 font-mono text-[10px]">{formatCount(post.views)}</span>
              </div>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center text-white text-[10px] font-bold"
                title="WhatsApp वर शेअर करा"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl border border-emerald-400/40 transition-transform hover:scale-110">
                  <Share2 className="h-5 w-5" />
                </div>
                <span className="mt-1 text-[9px] font-bold text-emerald-400">Share</span>
              </button>
            </div>
          </div>

          {/* Bottom Overlay Info & Next/Prev Controls */}
          <div className="relative z-20 p-4 bg-gradient-to-t from-black via-black/90 to-transparent space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="font-bold text-white">{post.authorName}</span>
              {post.location && (
                <span className="flex items-center gap-0.5 text-[10px] text-amber-300">
                  <MapPin className="h-2.5 w-2.5" />
                  <span>{post.location}</span>
                </span>
              )}
            </div>

            <p className="text-xs font-bold text-white line-clamp-2 leading-relaxed pr-12 font-serif">
              {post.title}
            </p>

            {/* Mobile Bottom Next/Prev Reel Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={onPrev}
                disabled={!onPrev}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-colors ${
                  onPrev ? 'bg-white/15 hover:bg-white/25 text-white' : 'opacity-30 text-slate-500 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>मागील</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                {copiedShare ? '✅ लिंक कॉपी झाली' : '🔗 लिंक कॉपी करा'}
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={!onNext}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-colors ${
                  onNext ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:brightness-110' : 'opacity-30 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>पुढील रील</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. 16:9 LANDSCAPE THEATER PLAYER (YouTube / Facebook / Twitter) */
        <div
          id="social-player-theater-container"
          className="relative w-full max-w-3xl rounded-3xl bg-slate-950 border border-slate-800 text-white shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white tracking-wider">
                {post.platform} Video
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-md">
                {post.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 16:9 Video Frame */}
          <div className="relative aspect-video w-full bg-black">
            {post.embedUrl ? (
              <iframe
                src={`${post.embedUrl}${post.embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
                title={post.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <img
                src={post.thumbnailUrl}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Footer Navigation & Share */}
          <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLikeToggle}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-rose-400"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{formatCount(likesCount)} लाईक्स</span>
              </button>
              <span className="text-xs text-slate-400 font-mono">
                &bull; {formatCount(post.views)} व्ह्यूज
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-md"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>WhatsApp शेअर</span>
              </button>

              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="flex items-center gap-1 rounded-xl bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 text-xs font-bold transition-all"
                >
                  <span>पुढील व्हिडिओ</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
