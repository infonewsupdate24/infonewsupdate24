import React, { useState } from 'react';
import {
  Check,
  Globe,
  Info,
  Pause,
  Play,
  Sliders,
  Sparkles,
  Volume2,
} from 'lucide-react';
import {
  AIVoiceService,
  GOOGLE_CONVERSATIONAL_VOICES,
  GoogleVoiceAnchor,
} from '../../services/AIVoiceService';

interface GoogleVoiceAnchorSelectorProps {
  selectedAnchor: GoogleVoiceAnchor;
  onSelectAnchor: (anchor: GoogleVoiceAnchor) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  lang: 'mr' | 'en';
  onLangChange: (lang: 'mr' | 'en') => void;
  onStartReading?: () => void;
  compact?: boolean;
}

export const GoogleVoiceAnchorSelector: React.FC<GoogleVoiceAnchorSelectorProps> = ({
  selectedAnchor,
  onSelectAnchor,
  speed,
  onSpeedChange,
  lang,
  onLangChange,
  onStartReading,
  compact = false,
}) => {
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const handlePreview = (e: React.MouseEvent, anchor: GoogleVoiceAnchor) => {
    e.stopPropagation();

    if (previewingId === anchor.id) {
      AIVoiceService.stop();
      setPreviewingId(null);
      return;
    }

    setPreviewingId(anchor.id);
    AIVoiceService.previewAnchorVoice(anchor, lang === 'mr', () => {
      setPreviewingId(null);
    });
  };

  return (
    <div className="space-y-4">
      {/* Header bar matching Google Conversational Voices UI */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Conversational voices</span>
            <span
              className="inline-flex items-center justify-center text-slate-400 hover:text-slate-600"
              title="Google AI News Anchor voices powered by neural speech synthesis"
            >
              <Info className="h-4 w-4" />
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600 border border-blue-200/60">
              New
            </span>
          </h3>
        </div>

        {/* Speed & Language Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Language Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onLangChange('mr')}
              className={`rounded-md px-2.5 py-1 transition-all ${
                lang === 'mr'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => onLangChange('en')}
              className={`rounded-md px-2.5 py-1 transition-all ${
                lang === 'en'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Speed:</span>
            <select
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="0.75">0.75x</option>
              <option value="0.9">0.9x</option>
              <option value="1.0">1.0x (Normal)</option>
              <option value="1.2">1.2x</option>
              <option value="1.4">1.4x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of 12 Google Conversational Voices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GOOGLE_CONVERSATIONAL_VOICES.map((anchor) => {
          const isSelected = selectedAnchor.id === anchor.id;
          const isPreviewing = previewingId === anchor.id;

          return (
            <div
              key={anchor.id}
              onClick={() => {
                onSelectAnchor(anchor);
                AIVoiceService.setSavedAnchor(anchor.id);
              }}
              className={`group relative flex items-center justify-between gap-3 rounded-2xl p-3.5 transition-all cursor-pointer border ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
                  : 'border-slate-200/80 bg-white hover:border-blue-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Play / Preview Circle Button matching Google UI */}
                <button
                  type="button"
                  onClick={(e) => handlePreview(e, anchor)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 ${
                    isPreviewing
                      ? 'bg-blue-600 text-white shadow-xs animate-pulse'
                      : isSelected
                      ? 'bg-blue-200/70 text-blue-700 hover:bg-blue-300'
                      : 'bg-blue-100/60 text-blue-600 group-hover:bg-blue-200/70'
                  }`}
                  title={`Preview ${anchor.name}'s voice`}
                >
                  {isPreviewing ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5 fill-current" />
                  )}
                </button>

                {/* Voice Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {anchor.name}
                    </span>
                    {anchor.badge && (
                      <span className="rounded-full bg-rose-50 px-1.5 py-0.2 text-[9px] font-bold text-rose-600 border border-rose-200/60">
                        {anchor.badge}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 capitalize">
                      ({anchor.gender === 'female' ? 'महिला' : anchor.gender === 'male' ? 'पुरुष' : 'न्यूट्रल'})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {anchor.description}
                  </p>
                </div>
              </div>

              {/* Selected Checkmark Indicator */}
              <div className="shrink-0 flex items-center">
                {isSelected ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xs">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full border border-slate-300 group-hover:border-blue-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {onStartReading && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <span>
              निवडलेला अँकर: <strong className="text-slate-900 font-bold">{selectedAnchor.name}</strong> ({selectedAnchor.description})
            </span>
          </div>
          <button
            type="button"
            onClick={onStartReading}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
          >
            <Volume2 className="h-4 w-4" />
            <span>या अँकरच्या आवाजात बातमी ऐका (Read News)</span>
          </button>
        </div>
      )}
    </div>
  );
};
