import {
  AlertCircle,
  Check,
  CheckCircle2,
  Globe,
  Headphones,
  Mic,
  Play,
  Radio,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AIVoiceService,
  GOOGLE_CONVERSATIONAL_VOICES,
  GoogleVoiceAnchor,
} from '../../services/AIVoiceService';
import { GoogleVoiceAnchorSelector } from '../public/GoogleVoiceAnchorSelector';

export const AIVoiceSettingsView: React.FC = () => {
  const { aiVoiceSettings, updateAIVoiceSettings, posts } = useApp();

  // Local form state cloned from global context
  const [isEnabled, setIsEnabled] = useState(aiVoiceSettings.isEnabled);
  const [selectedAnchorId, setSelectedAnchorId] = useState(aiVoiceSettings.anchorId);
  const [speed, setSpeed] = useState(aiVoiceSettings.speed);
  const [lang, setLang] = useState<'mr' | 'en'>(aiVoiceSettings.lang);
  const [showSpeakerOnCards, setShowSpeakerOnCards] = useState(aiVoiceSettings.showSpeakerOnCards);
  const [allowUserToChangeAnchor, setAllowUserToChangeAnchor] = useState(
    aiVoiceSettings.allowUserToChangeAnchor
  );
  const [autoIntroGreeting, setAutoIntroGreeting] = useState(aiVoiceSettings.autoIntroGreeting);
  const [readFullArticleInSequence, setReadFullArticleInSequence] = useState(
    aiVoiceSettings.readFullArticleInSequence
  );

  // Live Test Sandbox State
  const [selectedTestPostId, setSelectedTestPostId] = useState(posts[0]?.id || '');
  const [customTestText, setCustomTestText] = useState('');
  const [isTestingBroadcast, setIsTestingBroadcast] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const activeAnchor =
    GOOGLE_CONVERSATIONAL_VOICES.find((v) => v.id === selectedAnchorId) ||
    GOOGLE_CONVERSATIONAL_VOICES[0];

  const handleSaveSettings = () => {
    updateAIVoiceSettings({
      isEnabled,
      anchorId: selectedAnchorId,
      speed,
      lang,
      showSpeakerOnCards,
      allowUserToChangeAnchor,
      autoIntroGreeting,
      readFullArticleInSequence,
    });
    AIVoiceService.setSavedAnchor(selectedAnchorId);

    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
    }, 3500);
  };

  const handleTestBroadcast = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isTestingBroadcast) {
      AIVoiceService.stop();
      setIsTestingBroadcast(false);
      return;
    }

    const testPost = posts.find((p) => p.id === selectedTestPostId);
    let textToSpeak = '';

    if (customTestText.trim()) {
      textToSpeak = customTestText.trim();
    } else if (testPost) {
      const intro = autoIntroGreeting
        ? lang === 'mr'
          ? `नमस्कार! InfoNewsUpdate24 डिजिटल बुलेटिनमध्ये आपले स्वागत आहे. आजचे वृत्त निवेदक ${activeAnchor.name}. `
          : `Hello, welcome to InfoNewsUpdate24 digital audio bulletin. Your news anchor is ${activeAnchor.name}. `
        : '';
      textToSpeak = `${intro} बातमीचे शीर्षक: ${testPost.title}. ${testPost.excerpt}. ${testPost.content.slice(0, 300)}...`;
    } else {
      textToSpeak = activeAnchor.previewSampleMr;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.pitch = activeAnchor.pitch;
    utterance.rate = speed * activeAnchor.rateModifier;

    const { voice: matchedVoice, langCode } = AIVoiceService.selectBestVoice(activeAnchor, lang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang || langCode;
    } else {
      utterance.lang = langCode;
    }

    utterance.onstart = () => setIsTestingBroadcast(true);
    utterance.onend = () => setIsTestingBroadcast(false);
    utterance.onerror = () => setIsTestingBroadcast(false);

    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {
        setIsTestingBroadcast(false);
      }
    }, 40);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">
              Google Conversational Voices
            </span>
            <span className="text-xs text-slate-400 font-mono">v2.5.0</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2.5">
            <Headphones className="h-7 w-7 text-blue-600" />
            AI Voice News Anchor Settings (व्हॉइस अँकर व्यवस्थापन)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            न्यूज पोर्टलवरील सर्व बातम्यांसाठी मध्यवर्ती (Admin) AI अँकर, वाचन गती आणि स्पीकर बटण सेटिंग्ज नियंत्रित करा.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Save className="h-4 w-4" />
          <span>Save Voice Settings (बदल जतन करा)</span>
        </button>
      </div>

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-extrabold">सेटिंग्ज यशस्वीरीत्या जतन झाल्या!</p>
            <p className="text-emerald-700 font-normal">
              न्यूज पोर्टलवर आता <strong className="font-bold">{activeAnchor.name}</strong> हा अँकर डीफॉल्ट म्हणून सक्रिय करण्यात आला आहे.
            </p>
          </div>
        </div>
      )}

      {/* 2. Master On/Off Switch Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                AI Voice News Reader Feature (पोर्टलवरील AI बातमी वाचक सुविधा)
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                  isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isEnabled ? 'सक्रिय (Active)' : 'बंद (Disabled)'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              हे चालू असल्यास पोर्टलवरील प्रत्येक बातमीवर 'पूर्ण बातमी ऐका' आणि बातम्यांच्या कार्डवर स्पीकर 🔊 बटन दिसेल.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-13 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* 3. 12 Google Conversational Voices Anchor Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 uppercase">
                Admin Central Choice
              </span>
              <span className="text-xs text-slate-400">&bull; सर्व 12 व्हॉइस उपलब्ध</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Select Primary AI News Anchor (मुख्य वृत्त निवेदक निवडा)
            </h3>
            <p className="text-xs text-slate-500">
              तुम्ही निवडलेला अँकर संपूर्ण न्यूज पोर्टलवरील सर्व बातम्या वाचण्यासाठी डीफॉल्ट म्हणून वापरला जाईल.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2">
            <Radio className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-xs text-blue-900 font-medium">
              सक्रिय अँकर: <strong className="font-extrabold text-blue-700">{activeAnchor.name}</strong> ({activeAnchor.toneType})
            </span>
          </div>
        </div>

        {/* 12 Voice Anchors Grid with Preview */}
        <GoogleVoiceAnchorSelector
          selectedAnchor={activeAnchor}
          onSelectAnchor={(anchor) => setSelectedAnchorId(anchor.id)}
          speed={speed}
          onSpeedChange={setSpeed}
          lang={lang}
          onLangChange={setLang}
        />
      </div>

      {/* 4. Portal Behavior & Integration Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card Behavior Settings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-3">
            <Volume2 className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm">News Cards & Reader Behavior (कार्ड व वाचक वर्तन)</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Show Speaker on Cards */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">
                  बातम्यांच्या कार्डवर स्पीकर 🔊 बटन दाखवा
                </p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  होमपेज, ब्रेकिंग न्यूज बार आणि कॅटेगरी यादीत प्रत्येक बातमी कार्डवर १-क्लिक क्विक लिसन स्पीकर चिन्ह दाखवा.
                </p>
              </div>
              <input
                type="checkbox"
                checked={showSpeakerOnCards}
                onChange={(e) => setShowSpeakerOnCards(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
              />
            </div>

            {/* Allow User to change anchor */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">
                  वाचकांना स्वतः अँकर बदलण्याची मुभा द्या
                </p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  हे बंद केल्यास वाचकांना फक्त Admin ने निवडलेल्या <strong>{activeAnchor.name}</strong> या अँकरच्या आवाजातच बातमी ऐकावी लागेल.
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowUserToChangeAnchor}
                onChange={(e) => setAllowUserToChangeAnchor(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
              />
            </div>

            {/* Auto Intro Greeting */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">
                  न्यूज बुलेटिन ऑडिओ सुरुवातीचा संदेश (Intro Greeting)
                </p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  बातमी सुरू होण्यापूर्वी "InfoNewsUpdate24 बातमीपत्रामध्ये आपले स्वागत आहे..." असा व्यावसायिक संदेश जोडा.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoIntroGreeting}
                onChange={(e) => setAutoIntroGreeting(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
              />
            </div>

            {/* Read Full Article in Sequence */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">
                  पूर्ण बातमी अखंडित वाचन (Title + Excerpt + Body)
                </p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Section 17 नियमानुसार बातमीचे शीर्षक, ठळक घडामोडी आणि संपूर्ण मजकूर क्रमाने वाचला जातो.
                </p>
              </div>
              <input
                type="checkbox"
                checked={readFullArticleInSequence}
                onChange={(e) => setReadFullArticleInSequence(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 5. Live Test Broadcast Studio */}
        <div className="rounded-2xl border border-blue-200 bg-linear-to-b from-blue-50/50 to-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Radio className="h-4 w-4 text-red-600" />
                <h3 className="text-sm">Live Broadcast Test Sandbox (थेट वाचन चाचणी)</h3>
              </div>
              <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded">
                {isTestingBroadcast ? 'वाचन सुरू आहे (ON AIR)' : 'रेडी (STANDBY)'}
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Admin म्हणून कोणत्याही बातमीचे किंवा स्वतः टाईप केलेल्या मजकुराचे <strong className="text-blue-700">{activeAnchor.name}</strong> च्या आवाजात थेट वाचन करून तपासा:
            </p>

            {/* Select Post Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">चाचणीसाठी बातमी निवडा:</label>
              <select
                value={selectedTestPostId}
                onChange={(e) => {
                  setSelectedTestPostId(e.target.value);
                  setCustomTestText('');
                }}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden"
              >
                {posts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Textarea */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">किंवा स्वतःचा सानुकूल मराठी मजकूर टाका:</label>
              <textarea
                rows={3}
                placeholder="उदा. आजच्या प्रमुख घडामोडींमध्ये महाराष्ट्रातील हवामान खात्याने जोरदार पावसाचा इशारा दिला आहे..."
                value={customTestText}
                onChange={(e) => setCustomTestText(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden resize-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestBroadcast}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                isTestingBroadcast
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-slate-900 hover:bg-blue-700'
              }`}
            >
              {isTestingBroadcast ? (
                <>
                  <Square className="h-4 w-4 fill-white" />
                  <span>Stop Broadcast (वाचन थांबवा)</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Start Test Broadcast (थेट आवाज ऐका - {activeAnchor.name})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Save Action Bar */}
      <div className="flex items-center justify-between rounded-2xl bg-slate-900 text-white p-4 sm:p-5 shadow-lg">
        <div className="space-y-0.5">
          <p className="text-xs sm:text-sm font-bold">
            सेटिंग्ज सेव्ह केल्यावर संपूर्ण न्यूज पोर्टलवर त्वरित लागू होतील
          </p>
          <p className="text-[11px] text-slate-400">
            पोर्टलवर डीफॉल्ट अँकर: <strong className="text-blue-400">{activeAnchor.name}</strong> ({activeAnchor.gender}, {activeAnchor.description}) &bull; गती: {speed}x &bull; भाषा: {lang === 'mr' ? 'मराठी' : 'English'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-600 active:scale-95 transition-all cursor-pointer shadow-md shrink-0"
        >
          <Save className="h-4 w-4" />
          <span>Save All Settings</span>
        </button>
      </div>
    </div>
  );
};
