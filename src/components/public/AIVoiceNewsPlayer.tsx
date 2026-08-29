import React, { useEffect, useRef, useState } from 'react';
import {
  AIVoiceService,
  GOOGLE_CONVERSATIONAL_VOICES,
  GoogleVoiceAnchor,
} from '../../services/AIVoiceService';
import { LanguageService } from '../../services/LanguageService';
import { AIVoiceSettings, Post } from '../../types';
import { cleanTextForTTS, splitIntoSpeechParagraphs } from '../../utils/contentFormatter';
import {
  AlertCircle,
  Headphones,
  Info,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface AIVoiceNewsPlayerProps {
  post: Post;
  aiVoiceSettings?: AIVoiceSettings;
  autoPlay?: boolean;
  onClose?: () => void;
  isFloating?: boolean;
}

export const AIVoiceNewsPlayer: React.FC<AIVoiceNewsPlayerProps> = ({
  post,
  aiVoiceSettings,
  autoPlay = false,
  onClose,
  isFloating = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(aiVoiceSettings?.speed || 1.0);
  const [lang, setLang] = useState<string>(() => aiVoiceSettings?.lang || LanguageService.getCurrentLanguage() || 'mr');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [selectedAnchor, setSelectedAnchor] = useState<GoogleVoiceAnchor>(() =>
    AIVoiceService.getSavedAnchor()
  );

  const activeIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Sync settings when changed from admin or parent
  useEffect(() => {
    if (aiVoiceSettings?.anchorId) {
      const updated = GOOGLE_CONVERSATIONAL_VOICES.find((v) => v.id === aiVoiceSettings.anchorId);
      if (updated) setSelectedAnchor(updated);
    }
    if (aiVoiceSettings?.speed) setSpeed(aiVoiceSettings.speed);
    if (aiVoiceSettings?.lang) setLang(aiVoiceSettings.lang);
  }, [aiVoiceSettings?.anchorId, aiVoiceSettings?.speed, aiVoiceSettings?.lang]);

  // Auto-sync with live language switcher changes
  useEffect(() => {
    const handleGlobalLangChange = (e: any) => {
      if (e.detail?.code) {
        setLang(e.detail.code);
      }
    };
    window.addEventListener('infonews:language-changed', handleGlobalLangChange);
    return () => window.removeEventListener('infonews:language-changed', handleGlobalLangChange);
  }, []);

  // Pre-load voices on component mount
  useEffect(() => {
    AIVoiceService.initVoices();
  }, []);

  // Breakdown article into clean, HTML-stripped sequential segments in the active language
  const paragraphs = React.useMemo(() => {
    let introText = '';
    if (aiVoiceSettings?.autoIntroGreeting) {
      switch (lang) {
        case 'mr':
          introText = `नमस्कार! InfoNewsUpdate24 डिजिटल बातमीपत्रामध्ये आपले स्वागत आहे.`;
          break;
        case 'hi':
          introText = `नमस्कार! InfoNewsUpdate24 डिजिटल समाचार बुलेटिन में आपका स्वागत है.`;
          break;
        case 'gu':
          introText = `નમસ્કાર! InfoNewsUpdate24 ડિજિટલ સમાચાર બુલેટિનમાં આપનું સ્વાગત છે.`;
          break;
        case 'kn':
          introText = `ನಮಸ್ಕಾರ! InfoNewsUpdate24 ಡಿಜಿಟಲ್ ಸುದ್ದಿ ಬುಲೆಟಿನ್‌ಗೆ ಸ್ವಾಗತ.`;
          break;
        case 'te':
          introText = `నమస్కారం! InfoNewsUpdate24 డిజిటల్ న్యూస్ బులిటెన్‌కు స్వాగతం.`;
          break;
        case 'bn':
          introText = `নমস্কার! InfoNewsUpdate24 ডিজিটাল সংবাদ বুলেটিনে আপনাকে স্বাগতম।`;
          break;
        case 'ta':
          introText = `வணக்கம்! InfoNewsUpdate24 டிஜிட்டல் செய்தி அறிக்கைக்கு வரவேற்கிறோம்.`;
          break;
        default:
          introText = `Welcome to InfoNewsUpdate24 audio news bulletin.`;
      }
    }

    const segments = splitIntoSpeechParagraphs(
      post.title || '',
      post.excerpt || '',
      post.content || '',
      introText
    );

    return segments.length > 0 ? segments : [cleanTextForTTS(post.title || 'बातमी')];
  }, [post.title, post.excerpt, post.content, aiVoiceSettings?.autoIntroGreeting, lang]);

  useEffect(() => {
    activeIndexRef.current = currentParagraphIndex;
  }, [currentParagraphIndex]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    isPausedRef.current = isPaused;
  }, [isPlaying, isPaused]);

  // Clean up Audio and SpeechSynthesis on unmount
  useEffect(() => {
    return () => {
      try {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // Safe cleanup
      }
    };
  }, []);

  // Web Speech API fallback method
  const fallbackToWebSpeech = (cleanSegment: string, index: number) => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) {
        setIsPlaying(false);
        setIsPaused(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanSegment);
      const { voice: matchedVoice, langCode } = AIVoiceService.selectBestVoice(selectedAnchor, lang);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang || langCode;
      } else {
        utterance.lang = langCode || 'mr-IN';
      }

      utterance.pitch = Math.max(0.6, Math.min(1.4, selectedAnchor.pitch));
      utterance.rate = Math.max(0.7, Math.min(1.3, speed * selectedAnchor.rateModifier));

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentParagraphIndex(index);
        const pct = Math.round(((index + 1) / paragraphs.length) * 100);
        setProgress(pct);
      };

      utterance.onend = () => {
        if (isPlayingRef.current && !isPausedRef.current) {
          setTimeout(() => {
            playSegment(index + 1);
          }, 30);
        }
      };

      utterance.onerror = () => {
        if (isPlayingRef.current && index + 1 < paragraphs.length) {
          setTimeout(() => {
            playSegment(index + 1);
          }, 40);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  // High-Quality continuous sentence streamer (Google Indic Neural TTS + Web Speech API)
  const playSegment = (index: number) => {
    try {
      setSpeechError(null);

      if (index >= paragraphs.length) {
        // Completed reading full article
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(100);
        setCurrentParagraphIndex(0);
        return;
      }

      // Stop previous audio playback
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }

      try {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch {}

      const rawSegment = paragraphs[index] || '';
      const cleanSegment = cleanTextForTTS(rawSegment);

      if (!cleanSegment || cleanSegment.trim().length === 0) {
        if (index + 1 < paragraphs.length) {
          playSegment(index + 1);
        }
        return;
      }

      // Stream authentic Marathi audio
      const audioUrl = AIVoiceService.getIndicAudioUrl(cleanSegment, lang === 'mr' ? 'mr' : 'en');
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      audio.playbackRate = speed;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentParagraphIndex(index);
        const pct = Math.round(((index + 1) / paragraphs.length) * 100);
        setProgress(pct);
      };

      audio.onended = () => {
        if (isPlayingRef.current && !isPausedRef.current) {
          setTimeout(() => {
            playSegment(index + 1);
          }, 40);
        }
      };

      audio.onerror = (err) => {
        console.warn('Neural stream note, using Web Speech fallback:', err);
        fallbackToWebSpeech(cleanSegment, index);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play prevented, fallback to Web Speech:', err);
          fallbackToWebSpeech(cleanSegment, index);
        });
      }
    } catch (err) {
      console.warn('Speech playback error:', err);
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handlePlay = () => {
    // Play subtle news chime to unlock audio context & provide immediate feedback
    AIVoiceService.playNewsBulletinJingle();

    if (isPaused && audioPlayerRef.current) {
      try {
        audioPlayerRef.current.play();
        setIsPaused(false);
        setIsPlaying(true);
      } catch {
        playSegment(currentParagraphIndex);
      }
    } else if (isPaused && typeof window !== 'undefined' && window.speechSynthesis?.paused) {
      try {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
      } catch {
        playSegment(currentParagraphIndex);
      }
    } else {
      playSegment(currentParagraphIndex);
    }
  };

  const handlePause = () => {
    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.pause();
      }
      setIsPaused(true);
    } catch (err) {
      console.warn('Speech synthesis pause error:', err);
    }
  };

  const handleStop = () => {
    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (err) {
      console.warn('Speech synthesis cancel error:', err);
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentParagraphIndex(0);
  };

  const handleRestart = () => {
    handleStop();
    setTimeout(() => {
      setCurrentParagraphIndex(0);
      playSegment(0);
    }, 100);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying && !isPaused) {
      setTimeout(() => {
        playSegment(currentParagraphIndex);
      }, 60);
    }
  };

  const handleAnchorChange = (anchorId: string) => {
    const anchor = GOOGLE_CONVERSATIONAL_VOICES.find((v) => v.id === anchorId);
    if (anchor) {
      setSelectedAnchor(anchor);
      AIVoiceService.setSavedAnchor(anchor.id);
      if (isPlaying && !isPaused) {
        setTimeout(() => {
          playSegment(currentParagraphIndex);
        }, 60);
      }
    }
  };

  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => {
        handlePlay();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, post.id]);

  if (aiVoiceSettings && !aiVoiceSettings.isEnabled) {
    return null;
  }

  const currentDisplaySentence = paragraphs[currentParagraphIndex] || '';

  return (
    <div
      id="ai-voice-news-reader-card"
      className="rounded-2xl border border-red-200/80 bg-linear-to-r from-red-50/80 via-white to-amber-50/50 p-4 sm:p-5 shadow-sm transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Speaker Symbol & Status */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all shadow-xs ${
              isPlaying && !isPaused
                ? 'bg-red-600 text-white shadow-red-200 animate-pulse'
                : 'bg-red-100 text-red-600'
            }`}
          >
            <Headphones className={`h-6 w-6 ${isPlaying && !isPaused ? 'animate-bounce' : ''}`} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black text-red-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI ऑडिओ न्यूज बुलेटिन
              </span>

              <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                अँकर: {selectedAnchor.name}
              </span>

              {isPlaying && !isPaused && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  वाचन सुरू आहे
                </span>
              )}
              {isPaused && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  थांबवले (Paused)
                </span>
              )}
            </div>

            <p className="text-xs font-bold text-slate-800 mt-1">
              {isPlaying
                ? isPaused
                  ? 'वाचन थांबवले आहे, पुढे सुरू करण्यासाठी Resume दाबा'
                  : 'संपूर्ण बातमी स्पष्ट आवाजात ऐका...'
                : 'ही बातमी ऑडिओमध्ये ऐकण्यासाठी Play बटण दाबा'}
            </p>
          </div>
        </div>

        {/* Right Side: Audio Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Play / Resume / Pause Button */}
          {!isPlaying || isPaused ? (
            <button
              type="button"
              id="btn-play-news-voice"
              onClick={handlePlay}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-red-200 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>{isPaused ? 'पुढे सुरू करा (Resume)' : 'पूर्ण बातमी ऐका (Play News)'}</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-pause-news-voice"
              onClick={handlePause}
              className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition-all cursor-pointer"
            >
              <Pause className="h-4 w-4 fill-white" />
              <span>थांबवा (Pause)</span>
            </button>
          )}

          {/* Stop / Reset Button */}
          {isPlaying && (
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
              title="वाचन पूर्ण बंद करा"
            >
              <Square className="h-3.5 w-3.5 fill-red-600" />
              <span>Stop</span>
            </button>
          )}

          {/* Voice Anchor Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">आवाज:</span>
            <select
              value={selectedAnchor.id}
              onChange={(e) => handleAnchorChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {GOOGLE_CONVERSATIONAL_VOICES.map((anchor) => (
                <option key={anchor.id} value={anchor.id}>
                  {anchor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold">वेग:</span>
            <select
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="0.75">0.75x</option>
              <option value="0.9">0.9x</option>
              <option value="1.0">1.0x</option>
              <option value="1.15">1.15x</option>
              <option value="1.3">1.3x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {speechError && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Progress Bar and Live Segment Reading Subtitle */}
      {(isPlaying || isPaused || progress > 0) && (
        <div className="mt-3 pt-3 border-t border-red-100/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <div className="flex items-center gap-1.5 text-red-600 font-bold">
              <Volume2 className="h-3.5 w-3.5" />
              <span>
                मुद्दा {currentParagraphIndex + 1} / {paragraphs.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestart}
                className="text-[11px] font-medium text-slate-600 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                title="सुरुवातीपासून ऐका"
              >
                <RotateCcw className="h-3 w-3" />
                पुन्हा ऐका
              </button>
              <span className="font-mono font-bold text-slate-800">{progress}%</span>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-linear-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Clean Subtitle */}
          <div className="rounded-xl bg-white/90 border border-slate-100 p-2.5 shadow-2xs">
            <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed line-clamp-2">
              "{currentDisplaySentence}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
