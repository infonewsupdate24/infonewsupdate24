import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  ExternalLink,
  Volume2,
  VolumeX,
  Eye,
  Sparkles,
  Check,
} from 'lucide-react';
import { WebStory } from '../../types';
import { WebStoryService } from '../../services/WebStoryService';

interface WebStoryPlayerModalProps {
  story: WebStory | null;
  onClose: () => void;
}

export const WebStoryPlayerModal: React.FC<WebStoryPlayerModalProps> = ({
  story,
  onClose,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION_MS = 5000; // 5 seconds per slide
  const INTERVAL_MS = 50;

  useEffect(() => {
    if (story) {
      WebStoryService.incrementViews(story.id);
      setCurrentSlideIndex(0);
      setProgress(0);
    }
  }, [story]);

  // Slide Auto-Advance Timer
  useEffect(() => {
    if (!story || isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (INTERVAL_MS / SLIDE_DURATION_MS) * 100;
        if (next >= 100) {
          // Advance to next slide or close if at end
          if (currentSlideIndex < story.slides.length - 1) {
            setCurrentSlideIndex((curr) => curr + 1);
            return 0;
          } else {
            // Reached last slide
            return 100;
          }
        }
        return next;
      });
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [story, currentSlideIndex, isPaused]);

  if (!story) return null;

  const currentSlide = story.slides[currentSlideIndex] || story.slides[0];

  const handleNext = () => {
    if (currentSlideIndex < story.slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = WebStoryService.generateWhatsAppShareUrl(story);
    window.open(url, '_blank');
    setToastMsg('WhatsApp शेअर लिंक उघडली!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      {/* Background click to close on desktop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main 9:16 Story Frame Container */}
      <div
        className="relative z-10 w-full max-w-[420px] h-full sm:h-[92vh] sm:max-h-[820px] bg-slate-950 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between select-none border border-slate-800"
        onClick={(e) => {
          // Tap right half for next, left half for prev
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX > rect.width * 0.4) {
            handleNext();
          } else {
            handlePrev();
          }
        }}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Background Slide Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.title}
            className="w-full h-full object-cover animate-scaleSlow"
            onError={(e) => {
              (e.target as any).src = story.coverImage;
            }}
          />
          {/* Dual Gradient Overlay for Maximum Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95" />
        </div>

        {/* 1. TOP BAR: Progress Indicators & Controls */}
        <div className="relative z-20 p-4 space-y-3">
          {/* Multi-Segment Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {story.slides.map((_, idx) => {
              let fillPercent = 0;
              if (idx < currentSlideIndex) fillPercent = 100;
              else if (idx === currentSlideIndex) fillPercent = progress;

              return (
                <div
                  key={idx}
                  className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-xs"
                >
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Header Info & Actions */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 font-black text-[10px] ring-2 ring-white/50 shadow-md">
                24
              </div>
              <div>
                <span className="text-xs font-black block leading-none">
                  InfoNewsUpdate24
                </span>
                <span className="text-[10px] text-amber-300 font-bold">
                  {story.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-colors cursor-pointer"
                title="WhatsApp वर शेअर करा"
              >
                <Share2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-colors cursor-pointer"
                title="बंद करा"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. MIDDLE TAP AREAS (Visual feedback for next/prev) */}
        <div className="relative z-10 flex-1 flex items-center justify-between px-2 opacity-0 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="p-2 rounded-full bg-black/30 text-white hover:bg-black/60"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="p-2 rounded-full bg-black/30 text-white hover:bg-black/60"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* 3. BOTTOM CAPTION & CTA OVERLAY */}
        <div className="relative z-20 p-5 space-y-3 pb-8 text-white">
          {currentSlide.tag && (
            <span className="inline-block rounded-md bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
              {currentSlide.tag}
            </span>
          )}

          <h3 className="text-xl sm:text-2xl font-black text-white leading-snug drop-shadow-md font-serif">
            {currentSlide.title}
          </h3>

          {currentSlide.description && (
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans drop-shadow-sm font-medium">
              {currentSlide.description}
            </p>
          )}

          {/* Swipe-Up / Click CTA Link */}
          {currentSlide.ctaText && (
            <div className="pt-2">
              <a
                href={currentSlide.ctaUrl || 'https://infonewsupdate24.com'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-white/20 hover:bg-white/30 active:scale-95 border border-white/40 backdrop-blur-md py-3 text-xs font-black text-white shadow-xl transition-all cursor-pointer"
              >
                <span>{currentSlide.ctaText}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {/* Slide index hint */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>टॅप करून पुढे जा &rarr;</span>
            <span className="font-mono">
              {currentSlideIndex + 1} / {story.slides.length}
            </span>
          </div>
        </div>
      </div>

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
