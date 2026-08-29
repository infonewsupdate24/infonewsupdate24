import { cleanTextForTTS } from '../utils/contentFormatter';

export interface GoogleVoiceAnchor {
  id: string;
  name: string;
  gender: 'female' | 'male' | 'neutral';
  description: string;
  pitch: number; // 0.5 to 1.5
  rateModifier: number; // multiplier for baseline rate
  toneType: string;
  badge?: string;
  previewSampleMr: string;
  previewSampleEn: string;
  avatarColor: string;
}

export const GOOGLE_CONVERSATIONAL_VOICES: GoogleVoiceAnchor[] = [
  {
    id: 'nyla',
    name: 'Nyla (नायला)',
    gender: 'female',
    description: 'Soft, higher pitch',
    pitch: 1.25,
    rateModifier: 0.98,
    toneType: 'Soft & High Pitch',
    badge: 'Popular',
    previewSampleMr: 'नमस्कार, मी नायला. InfoNewsUpdate24 च्या डिजिटल बुलेटिनमध्ये आपले स्वागत आहे.',
    previewSampleEn: "Hello, I'm Nyla. Welcome to InfoNewsUpdate24 AI voice news bulletin.",
    avatarColor: 'from-pink-500 to-rose-400',
  },
  {
    id: 'elio',
    name: 'Elio (एलियो)',
    gender: 'male',
    description: 'Friendly, lower middle pitch',
    pitch: 0.92,
    rateModifier: 0.95,
    toneType: 'Friendly & Warm',
    previewSampleMr: 'नमस्कार, मी एलियो. आजच्या ठळक घडामोडी आणि बातम्या ऐकूया.',
    previewSampleEn: "Hi there, I'm Elio. Let's bring you today's top headline stories.",
    avatarColor: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'knox',
    name: 'Knox (नॉक्स)',
    gender: 'male',
    description: 'Smooth, low pitch',
    pitch: 0.78,
    rateModifier: 0.92,
    toneType: 'Smooth & Low Pitch',
    previewSampleMr: 'नमस्कार, मी नॉक्स. InfoNewsUpdate24 वर विश्लेषणात्मक बातमीपत्र सादर करत आहे.',
    previewSampleEn: "Good day, I'm Knox. Delivering in-depth news coverage on InfoNewsUpdate24.",
    avatarColor: 'from-indigo-600 to-slate-700',
  },
  {
    id: 'jett',
    name: 'Jett (जेट)',
    gender: 'male',
    description: 'Gravelly, low pitch',
    pitch: 0.72,
    rateModifier: 0.96,
    toneType: 'Gravelly & Deep',
    previewSampleMr: 'नमस्कार, मी जेट. राज्यातील आणि देशातील ताज्या घडामोडी जाणून घ्या.',
    previewSampleEn: "Greetings, I'm Jett. Bringing you verified ground news updates.",
    avatarColor: 'from-amber-600 to-orange-500',
  },
  {
    id: 'zeno',
    name: 'Zeno (झेनो)',
    gender: 'male',
    description: 'Firm, lower middle pitch',
    pitch: 0.86,
    rateModifier: 1.02,
    toneType: 'Firm & Authoritative',
    previewSampleMr: 'नमस्कार, मी झेनो. मुख्य बातमीपत्रातील महत्त्वाचे मुद्दे थेट आपल्यासाठी.',
    previewSampleEn: "Hello, I'm Zeno. Fast and authoritative news briefs for you.",
    avatarColor: 'from-emerald-600 to-teal-500',
  },
  {
    id: 'tova',
    name: 'Tova (तोव्हा)',
    gender: 'female',
    description: 'Breezy, medium pitch',
    pitch: 1.08,
    rateModifier: 1.04,
    toneType: 'Breezy & Natural',
    previewSampleMr: 'नमस्कार, मी तोव्हा. सकाळच्या ताज्या बातम्या आणि महत्त्वाचे अपडेट्स.',
    previewSampleEn: "Hi, I'm Tova. Fresh updates and trending stories right here.",
    avatarColor: 'from-cyan-500 to-blue-400',
  },
  {
    id: 'kaci',
    name: 'Kaci (कासी)',
    gender: 'female',
    description: 'Bright, medium pitch',
    pitch: 1.18,
    rateModifier: 1.0,
    toneType: 'Bright & Clear',
    badge: 'Trending',
    previewSampleMr: 'नमस्कार, मी कासी. जलद आणि अचूक बातम्यांचा वेध InfoNewsUpdate24 वर.',
    previewSampleEn: "Welcome, I'm Kaci. Bright and fast news commentary on your feed.",
    avatarColor: 'from-violet-500 to-purple-400',
  },
  {
    id: 'lani',
    name: 'Lani (लानी)',
    gender: 'female',
    description: 'Easy-going, medium pitch',
    pitch: 1.02,
    rateModifier: 0.95,
    toneType: 'Easy-going & Conversational',
    previewSampleMr: 'नमस्कार, मी लानी. आजच्या सविस्तर बातम्या सहज आणि सुलभ आवाजात.',
    previewSampleEn: "Hello, I'm Lani. Relaxed, conversational news narration for your day.",
    avatarColor: 'from-teal-500 to-emerald-400',
  },
  {
    id: 'holt',
    name: 'Holt (होल्ट)',
    gender: 'male',
    description: 'Informative, low pitch',
    pitch: 0.8,
    rateModifier: 0.94,
    toneType: 'Informative & Crisp',
    previewSampleMr: 'नमस्कार, मी होल्ट. InfoNewsUpdate24 वर विशेष वृत्तांकन आणि आढावा.',
    previewSampleEn: "Hello, I'm Holt. Informative, precise reportage from our newsroom.",
    avatarColor: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'lora',
    name: 'Lora (लोरा)',
    gender: 'female',
    description: 'Smooth, medium pitch',
    pitch: 1.06,
    rateModifier: 0.96,
    toneType: 'Smooth & Articulate',
    badge: 'Popular',
    previewSampleMr: 'नमस्कार, मी लोरा. आजचे सविस्तर वृत्तपत्र आणि महत्त्वपूर्ण घडामोडी.',
    previewSampleEn: "Hello, I'm Lora. Clear, smooth journalism brought directly to you.",
    avatarColor: 'from-fuchsia-500 to-pink-500',
  },
  {
    id: 'paz',
    name: 'Paz (पाझ)',
    gender: 'neutral',
    description: 'Breathy, low pitch',
    pitch: 0.88,
    rateModifier: 0.92,
    toneType: 'Breathy & Calm',
    previewSampleMr: 'नमस्कार, मी पाझ. शांत आणि स्पष्ट आवाजात आजच्या बातम्या ऐका.',
    previewSampleEn: "Greetings, I'm Paz. Calm and composed audio news experience.",
    avatarColor: 'from-amber-500 to-yellow-600',
  },
  {
    id: 'tyra',
    name: 'Tyra (टायरा)',
    gender: 'female',
    description: 'Clear, medium pitch',
    pitch: 1.12,
    rateModifier: 1.0,
    toneType: 'Clear & Professional',
    previewSampleMr: 'नमस्कार, मी टायरा. InfoNewsUpdate24 वरील ताज्या घडामोडींचे सविस्तर बातमीपत्र.',
    previewSampleEn: "Hello, I'm Tyra. Professional and crystal clear broadcast audio.",
    avatarColor: 'from-sky-500 to-indigo-500',
  },
];

const DEFAULT_ANCHOR_ID = 'nyla';

export class AIVoiceService {
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static isListeningToVoices = false;
  private static audioCtx: AudioContext | null = null;

  /**
   * Initializes voice list and listens for asynchronous voiceschanged events
   */
  public static initVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];

    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        this.cachedVoices = voices;
      }

      if (!this.isListeningToVoices) {
        this.isListeningToVoices = true;
        window.speechSynthesis.onvoiceschanged = () => {
          try {
            const updated = window.speechSynthesis.getVoices();
            if (updated && updated.length > 0) {
              this.cachedVoices = updated;
            }
          } catch {
            // Ignore
          }
        };
      }
    } catch {
      // Ignore
    }

    return this.cachedVoices;
  }

  public static getAnchor(id: string): GoogleVoiceAnchor {
    return GOOGLE_CONVERSATIONAL_VOICES.find((v) => v.id === id) || GOOGLE_CONVERSATIONAL_VOICES[0];
  }

  public static getSavedAnchor(): GoogleVoiceAnchor {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('infonews_voice_anchor_id');
      if (saved) {
        const found = GOOGLE_CONVERSATIONAL_VOICES.find((v) => v.id === saved);
        if (found) return found;
      }
    }
    return GOOGLE_CONVERSATIONAL_VOICES.find((v) => v.id === DEFAULT_ANCHOR_ID) || GOOGLE_CONVERSATIONAL_VOICES[0];
  }

  public static setSavedAnchor(anchorId: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('infonews_voice_anchor_id', anchorId);
    }
  }

  /**
   * Plays a subtle broadcast news chime / intro tone via Web Audio API to unlock audio context
   */
  public static playNewsBulletinJingle() {
    try {
      if (typeof window === 'undefined') return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      
      // Tone 1 (News Alert chime)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Tone 2 (Harmonic finish)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(783.99, now + 0.12); // G5
      gain2.gain.setValueAtTime(0.06, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.4);
    } catch {
      // Audio context silently handled
    }
  }

  /**
   * Checks if the device/browser has a native Marathi or Hindi speech synthesis voice installed.
   * If false (e.g. Windows desktop without Indic language pack), Web Speech API will skip Devanagari text.
   */
  public static hasNativeIndicVoice(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    const voices = window.speechSynthesis.getVoices() || [];
    return voices.some(
      (v) =>
        v.lang.toLowerCase().startsWith('mr') ||
        v.lang.toLowerCase().startsWith('hi') ||
        v.name.toLowerCase().includes('marathi') ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('मराठी') ||
        v.name.toLowerCase().includes('हिन्दी')
    );
  }

  /**
   * Returns a streaming audio URL for authentic Marathi / Indic text narration via Google Indic Neural TTS.
   */
  public static getIndicAudioUrl(text: string, lang = 'mr'): string {
    const clean = cleanTextForTTS(text).slice(0, 190);
    return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(clean)}`;
  }

  /**
   * Finds the most suitable SpeechSynthesisVoice and matching langCode based on language and anchor gender.
   */
  public static selectBestVoice(
    anchor: GoogleVoiceAnchor,
    preferredLang = 'mr'
  ): { voice: SpeechSynthesisVoice | null; langCode: string } {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return { voice: null, langCode: preferredLang === 'mr' ? 'hi-IN' : 'en-US' };
    }

    let voices = this.initVoices();
    if (!voices || voices.length === 0) {
      voices = window.speechSynthesis.getVoices();
    }

    if (!voices || voices.length === 0) {
      return { voice: null, langCode: preferredLang === 'mr' ? 'hi-IN' : 'en-US' };
    }

    // 1. Check exact Marathi voices (Google मराठी, Microsoft Hemant Marathi, mr-IN)
    const marathiVoices = voices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith('mr') ||
        v.name.toLowerCase().includes('marathi') ||
        v.name.toLowerCase().includes('मराठी')
    );

    // 2. Check Hindi / Indic voices as high-quality phonetic fallback for Devanagari script
    const hindiVoices = voices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith('hi') ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('हिन्दी')
    );

    // 3. Check Indian English voices
    const indianVoices = voices.filter(
      (v) =>
        v.lang.toLowerCase().includes('in') ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('swara') ||
        v.name.toLowerCase().includes('madhav') ||
        v.name.toLowerCase().includes('heera') ||
        v.name.toLowerCase().includes('neerja')
    );

    // Helper: Filter by gender preference
    const filterByGender = (voiceList: SpeechSynthesisVoice[]): SpeechSynthesisVoice => {
      if (anchor.gender === 'female') {
        const female = voiceList.find(
          (v) =>
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('woman') ||
            v.name.toLowerCase().includes('swara') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('heera') ||
            v.name.toLowerCase().includes('ananya') ||
            v.name.toLowerCase().includes('kalpana')
        );
        if (female) return female;
      } else if (anchor.gender === 'male') {
        const male = voiceList.find(
          (v) =>
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('man') ||
            v.name.toLowerCase().includes('madhav') ||
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('ravi') ||
            v.name.toLowerCase().includes('hemant')
        );
        if (male) return male;
      }
      return voiceList[0];
    };

    if (preferredLang === 'mr') {
      if (marathiVoices.length > 0) {
        const v = filterByGender(marathiVoices);
        return { voice: v, langCode: v.lang || 'mr-IN' };
      }
      if (hindiVoices.length > 0) {
        const v = filterByGender(hindiVoices);
        return { voice: v, langCode: v.lang || 'hi-IN' };
      }
      if (indianVoices.length > 0) {
        const v = filterByGender(indianVoices);
        return { voice: v, langCode: v.lang || 'hi-IN' };
      }
    } else {
      if (indianVoices.length > 0) {
        const v = filterByGender(indianVoices);
        return { voice: v, langCode: v.lang || 'en-IN' };
      }
      const generalEnVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
      if (generalEnVoices.length > 0) {
        const v = filterByGender(generalEnVoices);
        return { voice: v, langCode: v.lang || 'en-US' };
      }
    }

    const defaultV = voices[0] || null;
    return { voice: defaultV, langCode: defaultV?.lang || (preferredLang === 'mr' ? 'hi-IN' : 'en-US') };
  }

  /**
   * Previews an anchor's voice with a short intro greeting.
   */
  public static previewAnchorVoice(
    anchor: GoogleVoiceAnchor,
    useMarathi = true,
    onEnd?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.playNewsBulletinJingle();

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const rawSample = useMarathi ? anchor.previewSampleMr : anchor.previewSampleEn;
      const cleanSample = cleanTextForTTS(rawSample);
      const utterance = new SpeechSynthesisUtterance(cleanSample);

      const { voice: matchedVoice, langCode } = this.selectBestVoice(anchor, useMarathi ? 'mr' : 'en');
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang || langCode;
      } else {
        utterance.lang = langCode;
      }

      utterance.pitch = Math.max(0.6, Math.min(1.4, anchor.pitch));
      utterance.rate = Math.max(0.7, Math.min(1.3, 1.0 * anchor.rateModifier));

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          if (onEnd) onEnd();
        }
      }, 50);
    } catch {
      if (onEnd) onEnd();
    }
  }

  /**
   * Stop any current speech
   */
  public static stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Safe
      }
    }
  }

  /**
   * Pause current speech
   */
  public static pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch {
        // Safe
      }
    }
  }

  /**
   * Resume current speech
   */
  public static resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // Safe
      }
    }
  }

  /**
   * Universal speak method for reading clips and articles
   */
  public static speak(options: {
    text: string;
    lang?: 'mr' | 'en';
    anchor?: GoogleVoiceAnchor;
    onEnd?: () => void;
    onError?: () => void;
  }) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const anchor = options.anchor || this.getSavedAnchor();
      const clean = cleanTextForTTS(options.text);
      const utterance = new SpeechSynthesisUtterance(clean);
      const { voice: matchedVoice, langCode } = this.selectBestVoice(
        anchor,
        options.lang || 'mr'
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang || langCode;
      } else {
        utterance.lang = langCode;
      }

      utterance.pitch = Math.max(0.6, Math.min(1.4, anchor.pitch));
      utterance.rate = Math.max(0.7, Math.min(1.3, 1.0 * anchor.rateModifier));

      utterance.onend = () => {
        if (options.onEnd) options.onEnd();
      };
      utterance.onerror = () => {
        if (options.onError) options.onError();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      if (options.onError) options.onError();
    }
  }
}
