import React, { useState } from 'react';
import {
  Headphones,
  Radio,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  AIVoiceService,
  GoogleVoiceAnchor,
} from '../../services/AIVoiceService';
import { Post } from '../../types';
import { GoogleVoiceAnchorSelector } from './GoogleVoiceAnchorSelector';

interface AIVoiceNewsStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onSelectPostToListen?: (post: Post) => void;
}

export const AIVoiceNewsStudioModal: React.FC<AIVoiceNewsStudioModalProps> = ({
  isOpen,
  onClose,
  posts,
  onSelectPostToListen,
}) => {
  const [selectedAnchor, setSelectedAnchor] = useState<GoogleVoiceAnchor>(() =>
    AIVoiceService.getSavedAnchor()
  );
  const [speed, setSpeed] = useState(1.0);
  const [lang, setLang] = useState<'mr' | 'en'>('mr');
  const [selectedPostId, setSelectedPostId] = useState<string>(
    posts[0]?.id || ''
  );

  if (!isOpen) return null;

  const currentPost = posts.find((p) => p.id === selectedPostId) || posts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 bg-white p-5 sm:p-7 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-md">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                  Google Conversational Voices
                </span>
                <span className="text-xs text-slate-400 font-semibold">&bull; 12 AI News Anchors</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                AI Voice News Studio (गुगल न्यूज अँकर्स)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              AIVoiceService.stop();
              onClose();
            }}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 12 Voices Selector Component */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 shadow-xs">
          <GoogleVoiceAnchorSelector
            selectedAnchor={selectedAnchor}
            onSelectAnchor={(anchor) => {
              setSelectedAnchor(anchor);
              AIVoiceService.setSavedAnchor(anchor.id);
            }}
            speed={speed}
            onSpeedChange={setSpeed}
            lang={lang}
            onLangChange={setLang}
          />
        </div>

        {/* Choose a News Article to Listen */}
        {posts.length > 0 && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-red-600 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  बातमी निवडा आणि ऐका (Select Article to Read with {selectedAnchor.name}):
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {posts.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPostId(p.id)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    selectedPostId === p.id
                      ? 'border-blue-600 bg-white shadow-2xs ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <img
                    src={p.featuredImage}
                    alt={p.title}
                    className="h-10 w-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 line-clamp-1 leading-snug">
                      {p.title}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {p.excerpt}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-600 font-medium">
                निवडलेली बातमी: <strong className="text-slate-900">{currentPost?.title}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (onSelectPostToListen && currentPost) {
                    AIVoiceService.stop();
                    onSelectPostToListen(currentPost);
                    onClose();
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
              >
                <Volume2 className="h-4 w-4" />
                <span>या बातमीचे वाचन सुरू करा</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
