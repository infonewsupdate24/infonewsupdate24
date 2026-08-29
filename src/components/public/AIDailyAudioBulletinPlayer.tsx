import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Info,
  Mic,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import {
  AIVoiceService,
  GOOGLE_CONVERSATIONAL_VOICES,
  GoogleVoiceAnchor,
} from '../../services/AIVoiceService';
import { LanguageService } from '../../services/LanguageService';
import { Post } from '../../types';
import { cleanTextForTTS, splitIntoSpeechParagraphs } from '../../utils/contentFormatter';

interface AIDailyAudioBulletinPlayerProps {
  posts: Post[];
  bulletinType?: 'MORNING' | 'EVENING' | 'BREAKING';
  dateStr?: string;
  onPostSelect?: (post: Post) => void;
}

interface BulletinSegment {
  type: 'INTRO' | 'STORY' | 'OUTRO';
  storyIndex?: number;
  post?: Post;
  text: string;
  displayTitle: string;
}

export const AIDailyAudioBulletinPlayer: React.FC<AIDailyAudioBulletinPlayerProps> = ({
  posts,
  bulletinType = 'MORNING',
  dateStr,
  onPostSelect,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0);
  const [activeStoryIdx, setActiveStoryIdx] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [lang, setLang] = useState<string>(() => LanguageService.getCurrentLanguage() || 'mr');
  const [selectedAnchor, setSelectedAnchor] = useState<GoogleVoiceAnchor>(() =>
    AIVoiceService.getSavedAnchor()
  );
  const [speechError, setSpeechError] = useState<string | null>(null);

  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const activeSegmentIdxRef = useRef(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    isPausedRef.current = isPaused;
  }, [isPlaying, isPaused]);

  useEffect(() => {
    activeSegmentIdxRef.current = currentSegmentIdx;
  }, [currentSegmentIdx]);

  // Pre-load voices on mount
  useEffect(() => {
    AIVoiceService.initVoices();
  }, []);

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

  // Cleanup on unmount
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
        // Safe
      }
    };
  }, []);

  // Construct sequential news broadcast playlist in active language
  const playlist: BulletinSegment[] = useMemo(() => {
    const list: BulletinSegment[] = [];
    const topPosts = Array.isArray(posts) ? posts.filter(Boolean).slice(0, 5) : [];
    if (!topPosts.length) return list;

    const anchorName = selectedAnchor?.name || 'News Anchor';

    // 1. INTRO
    let introText = '';
    let introTitle = '🎙️ बुलेटिन प्रस्तावना (Intro)';
    if (lang === 'mr') {
      const greeting = bulletinType === 'EVENING' ? 'शुभ संध्याकाळ!' : bulletinType === 'BREAKING' ? 'ताजी व महत्त्वाची बातमी!' : 'शुभ प्रभात!';
      introText = `${greeting} InfoNewsUpdate24 च्या आजच्या दैनिक ऑडिओ बुलेटिनमध्ये आपले सहर्ष स्वागत आहे. मी आपली डिजिटल वृत्त निवेदक ${anchorName}. पाहुयात आजच्या ठळक ५ घडामोडी.`;
      introTitle = '🎙️ बुलेटिन प्रस्तावना (Intro)';
    } else if (lang === 'hi') {
      const greeting = bulletinType === 'EVENING' ? 'शुभ संध्या!' : bulletinType === 'BREAKING' ? 'ताज़ा और महत्वपूर्ण खबर!' : 'सुप्रभात!';
      introText = `${greeting} InfoNewsUpdate24 के आज के दैनिक ऑडियो बुलेटिन में आपका स्वागत है. मैं आपकी डिजिटल समाचार एंकर ${anchorName}. आइए सुनते हैं आज की टॉप ५ प्रमुख खबरें.`;
      introTitle = '🎙️ बुलेटिन प्रस्तावना (Intro)';
    } else if (lang === 'gu') {
      introText = `નમસ્કાર! InfoNewsUpdate24 ના આજના દૈનિક ઓડિયો બુલેટિનમાં આપનું સ્વાગત છે. હું તમારી ડિજિટલ સમાચાર એન્કર ${anchorName}. સાંભળીએ આજના ટોપ ૫ મુખ્ય સમાચાર.`;
      introTitle = '🎙️ બુલેટિન પ્રસ્તાવના';
    } else if (lang === 'kn') {
      introText = `ನಮಸ್ಕಾರ! InfoNewsUpdate24 ನ ಇಂದಿನ ದೈನಂದಿನ ಆಡಿಯೊ ಬುಲೆಟಿನ್‌ಗೆ ಸ್ವಾಗತ. ಇಂದಿನ ಟಾಪ್ ೫ ಮುಖ್ಯಾಂಶಗಳನ್ನು ಕೇಳೋಣ.`;
      introTitle = '🎙️ ಸುದ್ದಿ ಮುಖ್ಯಾಂಶಗಳು';
    } else if (lang === 'te') {
      introText = `నమస్కారం! InfoNewsUpdate24 నేటి ఆడియో వార్తా బులెటిన్‌కు స్వాగతం. నేటి టాప్ 5 ముఖ్య వార్తలను విందాం.`;
      introTitle = '🎙️ వార్తా ముఖ్యాంశాలు';
    } else if (lang === 'bn') {
      introText = `নমস্কার! InfoNewsUpdate24 এর আজকের দৈনিক অডিও বুলেটিনে স্বাগতম। আসুন জেনে নেই আজকের সেরা ৫টি প্রধান খবর।`;
      introTitle = '🎙️ সংবাদ বুলেটিন';
    } else {
      const greeting = bulletinType === 'EVENING' ? 'Good evening!' : bulletinType === 'BREAKING' ? 'Breaking news alert!' : 'Good morning!';
      introText = `${greeting} Welcome to InfoNewsUpdate24 Daily AI Audio Bulletin. I am your voice anchor ${anchorName}. Here are today's top 5 headline stories.`;
      introTitle = '🎙️ Daily Audio Bulletin Intro';
    }

    list.push({
      type: 'INTRO',
      text: introText,
      displayTitle: introTitle,
    });

    // 2. STORIES (1 to 5)
    topPosts.forEach((p, idx) => {
      const cleanTitle = cleanTextForTTS(p.title || '');
      const rawExp = p.excerpt || (p.content && typeof p.content === 'string' ? p.content.slice(0, 160) : '');
      const cleanExp = cleanTextForTTS(rawExp);
      const storyNarrative = `${cleanTitle}। ${cleanExp}`;

      list.push({
        type: 'STORY',
        storyIndex: idx,
        post: p,
        text: storyNarrative,
        displayTitle: `${idx + 1}. ${cleanTitle || 'Headline'}`,
      });
    });

    // 3. OUTRO
    let outroText = '';
    if (lang === 'mr') {
      outroText = `या होत्या आजच्या ५ महत्त्वाच्या घडामोडी. सर्व बातम्या सविस्तर वाचण्यासाठी आणि ताज्या अपडेट्ससाठी भेट देत राहा www.infonewsupdate24.com वर. धन्यवाद आणि आपला दिवस शुभ जावो!`;
    } else if (lang === 'hi') {
      outroText = `ये थीं आज की ५ मुख्य खबरें. ताजा अपडेट्स और विस्तार से पढ़ने के लिए विजिट करते रहें www.infonewsupdate24.com. धन्यवाद और आपका दिन शुभ हो!`;
    } else if (lang === 'gu') {
      outroText = `આ હતા આજના ૫ મુખ્ય સમાચાર. વધુ અપડેટ્સ માટે મુલાકાત લો www.infonewsupdate24.com. આભાર અને આપનો દિવસ શુભ રહે!`;
    } else if (lang === 'kn') {
      outroText = `ಇವು ಇಂದಿನ ೫ ಮುಖ್ಯ ಸುದ್ದಿಗಳು. ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ www.infonewsupdate24.com ಗೆ ಭೇಟಿ ನೀಡಿ. ಧನ್ಯವಾದಗಳು!`;
    } else if (lang === 'te') {
      outroText = `ఇవి నేటి 5 ముఖ్య వార్తలు. మరిన్ని వివరాల కోసం www.infonewsupdate24.com ను సందర్శించండి. ధన్యవాదాలు!`;
    } else if (lang === 'bn') {
      outroText = `এই ছিল আজকের ৫টি প্রধান খবর। বিস্তারিত পড়তে ভিজিট করুন www.infonewsupdate24.com। ধন্যবাদ!`;
    } else {
      outroText = `Those were today's top 5 stories. For full reports and real-time alerts, stay tuned to www.infonewsupdate24.com. Thank you and have a wonderful day!`;
    }

    list.push({
      type: 'OUTRO',
      text: outroText,
      displayTitle: '📢 बुलेटिन समारोप (Outro)',
    });

    return list;
  }, [posts, bulletinType, selectedAnchor, lang]);

  // Fallback to Web Speech API if neural audio stream encounters network restriction
  const fallbackToWebSpeech = (cleanText: string, segIdx: number) => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) {
        setIsPlaying(false);
        setIsPaused(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const anchor = selectedAnchor || AIVoiceService.getSavedAnchor();
      const { voice: matchedVoice, langCode } = AIVoiceService.selectBestVoice(anchor, 'mr');
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang || langCode;
      } else {
        utterance.lang = langCode || 'mr-IN';
      }

      utterance.pitch = Math.max(0.6, Math.min(1.4, anchor?.pitch ?? 1.0));
      utterance.rate = Math.max(0.7, Math.min(1.3, speed * (anchor?.rateModifier ?? 1.0)));

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentSegmentIdx(segIdx);
      };

      utterance.onend = () => {
        if (isPlayingRef.current && !isPausedRef.current) {
          setTimeout(() => {
            playSegment(segIdx + 1);
          }, 120);
        }
      };

      utterance.onerror = () => {
        if (isPlayingRef.current && segIdx + 1 < playlist.length) {
          setTimeout(() => {
            playSegment(segIdx + 1);
          }, 150);
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

  // Play a single segment from the playlist using High-Quality Indic Neural TTS
  const playSegment = (segIdx: number) => {
    try {
      setSpeechError(null);

      if (segIdx >= playlist.length) {
        // Bulletin completed!
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSegmentIdx(0);
        setActiveStoryIdx(0);
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

      const segment = playlist[segIdx];
      if (!segment) return;

      // Update story index if segment is a story
      if (segment.type === 'STORY' && typeof segment.storyIndex === 'number') {
        setActiveStoryIdx(segment.storyIndex);
      }

      const rawText = segment.text;
      const cleanText = cleanTextForTTS(rawText);

      // 1. Check if we should use Google Indic Neural Audio (Supports Marathi, Hindi, English, Gujarati, Kannada, Telugu, Bengali, Tamil)
      const audioUrl = AIVoiceService.getIndicAudioUrl(cleanText, lang);
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      audio.playbackRate = speed;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentSegmentIdx(segIdx);
      };

      audio.onended = () => {
        if (isPlayingRef.current && !isPausedRef.current) {
          setTimeout(() => {
            playSegment(segIdx + 1);
          }, 120);
        }
      };

      audio.onerror = (err) => {
        console.warn('Neural audio stream fallback to Web Speech:', err);
        fallbackToWebSpeech(cleanText, segIdx);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play prevented, attempting Web Speech:', err);
          fallbackToWebSpeech(cleanText, segIdx);
        });
      }
    } catch (err) {
      console.warn('Bulletin playback error:', err);
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleStartBroadcast = () => {
    // Play broadcasting sound chime
    AIVoiceService.playNewsBulletinJingle();

    if (isPaused && audioPlayerRef.current) {
      try {
        audioPlayerRef.current.play();
        setIsPaused(false);
        setIsPlaying(true);
      } catch {
        playSegment(currentSegmentIdx);
      }
    } else if (isPaused && typeof window !== 'undefined' && window.speechSynthesis?.paused) {
      try {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
      } catch {
        playSegment(currentSegmentIdx);
      }
    } else {
      playSegment(currentSegmentIdx);
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
      console.warn('Pause error:', err);
    }
  };

  const handleStop = () => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (err) {
      console.warn('Cancel error:', err);
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegmentIdx(0);
    setActiveStoryIdx(0);
  };

  const handleNextStory = () => {
    // Find next story segment
    const nextIdx = currentSegmentIdx + 1;
    if (nextIdx < playlist.length) {
      playSegment(nextIdx);
    }
  };

  const handlePrevStory = () => {
    // Find previous story segment
    const prevIdx = Math.max(0, currentSegmentIdx - 1);
    playSegment(prevIdx);
  };

  const handleJumpToStory = (storyIdx: number) => {
    // Playlist structure: 0 is intro, 1..5 are stories, 6 is outro
    const targetSegIdx = storyIdx + 1;
    if (targetSegIdx < playlist.length) {
      AIVoiceService.playNewsBulletinJingle();
      playSegment(targetSegIdx);
    }
  };

  const handleAnchorChange = (anchorId: string) => {
    const anchor = GOOGLE_CONVERSATIONAL_VOICES.find((v) => v.id === anchorId);
    if (anchor) {
      setSelectedAnchor(anchor);
      AIVoiceService.setSavedAnchor(anchor.id);
      if (isPlaying && !isPaused) {
        setTimeout(() => {
          playSegment(currentSegmentIdx);
        }, 80);
      }
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying && !isPaused) {
      setTimeout(() => {
        playSegment(currentSegmentIdx);
      }, 80);
    }
  };

  const currentSegment = playlist[currentSegmentIdx];

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-4 sm:p-5 text-white shadow-2xl backdrop-blur-md space-y-4">
      {/* Broadcast Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all shadow-md ${
              isPlaying && !isPaused
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse ring-2 ring-red-400/50'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            <Radio className={`h-5 w-5 ${isPlaying && !isPaused ? 'animate-bounce' : ''}`} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                AI ऑडिओ न्यूज बुलेटिन
              </span>

              <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                अँकर: {selectedAnchor?.name || 'नायला (Nyla)'}
              </span>

              {isPlaying && !isPaused && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                  LIVE ON-AIR
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-slate-300 mt-0.5">
              {isPlaying
                ? isPaused
                  ? 'बुलेटिन थांबवले आहे (Paused). पुढे ऐकण्यासाठी Resume दाबा.'
                  : `🎙️ ${currentSegment?.displayTitle || 'बातम्यांचे वाचन सुरू आहे...'}`
                : 'आजच्या टॉप ५ ठळक घडामोडी एकाच क्लिकवर रेडिओप्रमाणे सलग ऐका.'}
            </p>
          </div>
        </div>

        {/* Top Controls: Voice & Speed */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Anchor Selector */}
          <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-300 shadow-xs">
            <Mic className="h-3 w-3 text-emerald-400" />
            <select
              value={selectedAnchor?.id || 'nyla'}
              onChange={(e) => handleAnchorChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-hidden cursor-pointer"
              title="वृत्त निवेदक बदला (Change Voice Anchor)"
            >
              {GOOGLE_CONVERSATIONAL_VOICES.map((anchor) => (
                <option key={anchor.id} value={anchor.id} className="bg-slate-900 text-white">
                  {anchor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-xl px-2 py-1 text-xs text-slate-300 shadow-xs">
            <Zap className="h-3 w-3 text-amber-400" />
            <select
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="bg-transparent text-xs font-bold text-white focus:outline-hidden cursor-pointer"
              title="वाचन गती बदला (Playback Speed)"
            >
              <option value="0.75" className="bg-slate-900 text-white">0.75x</option>
              <option value="0.9" className="bg-slate-900 text-white">0.9x</option>
              <option value="1.0" className="bg-slate-900 text-white">1.0x</option>
              <option value="1.15" className="bg-slate-900 text-white">1.15x</option>
              <option value="1.3" className="bg-slate-900 text-white">1.3x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Broadcast Control Center */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
        <div className="flex items-center gap-2">
          {/* Main Big Play / Pause Button */}
          {!isPlaying || isPaused ? (
            <button
              type="button"
              onClick={handleStartBroadcast}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>{isPaused ? 'पुढे सुरू करा (Resume)' : '🎙️ संपूर्ण आजचे ऑडिओ बुलेटिन ऐका'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg transition-all cursor-pointer"
            >
              <Pause className="h-4 w-4 fill-slate-950" />
              <span>थांबवा (Pause)</span>
            </button>
          )}

          {/* Previous Story */}
          {isPlaying && (
            <button
              type="button"
              onClick={handlePrevStory}
              disabled={currentSegmentIdx <= 0}
              className="flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 p-2.5 text-slate-200 transition-colors cursor-pointer"
              title="मागील बातमी (Previous Story)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Next Story */}
          {isPlaying && (
            <button
              type="button"
              onClick={handleNextStory}
              disabled={currentSegmentIdx >= playlist.length - 1}
              className="flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 p-2.5 text-slate-200 transition-colors cursor-pointer"
              title="पुढील बातमी (Next Story)"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {/* Stop Button */}
          {isPlaying && (
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
              title="बुलेटिन बंद करा"
            >
              <Square className="h-3.5 w-3.5 fill-red-400" />
              <span>Stop</span>
            </button>
          )}
        </div>

        {/* Live Audio Equalizer Wave Animation */}
        <div className="flex items-center gap-3">
          {isPlaying && !isPaused ? (
            <div className="flex items-center gap-1 h-6">
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-4"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-6"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-5"></span>
              <span className="text-[10px] font-bold text-emerald-400 ml-1.5 font-mono">
                {currentSegment?.type === 'INTRO'
                  ? 'PROLOGUE'
                  : currentSegment?.type === 'OUTRO'
                  ? 'EPILOGUE'
                  : `HEADLINE ${(currentSegment?.storyIndex ?? 0) + 1}/5`}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">
              📻 ५ ठळक घडामोडी • ~२ मिनिटे
            </span>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {speechError && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Interactive 5-Story Clickable Playlist Cards */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
          <span>🎧 ऐकण्यासाठी खालील कोणत्याही बातमीवर क्लिक करा:</span>
          {isPlaying && (
            <span className="text-emerald-400">
              {currentSegmentIdx + 1} / {playlist.length} भाग
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {posts.slice(0, 5).map((post, idx) => {
            const isThisStoryActive =
              isPlaying &&
              currentSegment?.type === 'STORY' &&
              currentSegment?.storyIndex === idx;

            return (
              <div
                key={post.id}
                onClick={() => handleJumpToStory(idx)}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                  isThisStoryActive
                    ? 'bg-emerald-950/70 border-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-black transition-colors ${
                    isThisStoryActive
                      ? 'bg-emerald-400 text-slate-950 animate-pulse'
                      : 'bg-slate-700/60 text-slate-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-400'
                  }`}
                >
                  {isThisStoryActive ? (
                    <Volume2 className="h-4 w-4 text-slate-950" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-xs font-bold line-clamp-2 leading-snug transition-colors ${
                      isThisStoryActive
                        ? 'text-emerald-300 font-extrabold'
                        : 'text-white group-hover:text-emerald-300'
                    }`}
                  >
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span>{post.categorySlug || 'महाराष्ट्र'}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400/90 font-medium">
                      {isThisStoryActive ? '▶ आता ऐकवत आहे' : 'ऐका 🎙️'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
