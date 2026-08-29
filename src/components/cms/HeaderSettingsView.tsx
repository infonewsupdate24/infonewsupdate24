import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Facebook,
  Flame,
  Globe,
  HelpCircle,
  Instagram,
  Layers,
  MessageCircle,
  Palette,
  PanelTop,
  Radio,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Sliders,
  Sparkles,
  Twitter,
  Youtube,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SEED_THEME_SETTINGS } from '../../data/seedData';
import { ThemeSettings } from '../../types';

export const HeaderSettingsView: React.FC = () => {
  const { themeSettings, updateThemeSettings, posts, setCmsView } = useApp();

  // Local draft state for fine-grained editing
  const [formData, setFormData] = useState<ThemeSettings>(themeSettings);
  const [activeTab, setActiveTab] = useState<'all' | 'date' | 'breaking' | 'social'>('all');
  const [savedToast, setSavedToast] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Keep local form data in sync if themeSettings changes externally
  useEffect(() => {
    setFormData(themeSettings);
  }, [themeSettings]);

  // Live ticking clock for preview
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateThemeSettings(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        'तुम्हाला हेडर सेटिंग्ज मूळ (Default) स्थितीत आणायच्या आहेत का?'
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        showHeaderDate: SEED_THEME_SETTINGS.showHeaderDate,
        headerDateFormat: SEED_THEME_SETTINGS.headerDateFormat,
        showLiveClock: SEED_THEME_SETTINGS.showLiveClock,
        showBreakingNews: SEED_THEME_SETTINGS.showBreakingNews,
        breakingNewsLabel: SEED_THEME_SETTINGS.breakingNewsLabel,
        breakingNewsBadgeColor: SEED_THEME_SETTINGS.breakingNewsBadgeColor,
        breakingNewsSpeed: SEED_THEME_SETTINGS.breakingNewsSpeed,
        showHeaderSocialIcons: SEED_THEME_SETTINGS.showHeaderSocialIcons,
        enabledSocialPlatforms: { ...SEED_THEME_SETTINGS.enabledSocialPlatforms },
        socialLinks: { ...SEED_THEME_SETTINGS.socialLinks },
      }));
      updateThemeSettings({
        showHeaderDate: SEED_THEME_SETTINGS.showHeaderDate,
        headerDateFormat: SEED_THEME_SETTINGS.headerDateFormat,
        showLiveClock: SEED_THEME_SETTINGS.showLiveClock,
        showBreakingNews: SEED_THEME_SETTINGS.showBreakingNews,
        breakingNewsLabel: SEED_THEME_SETTINGS.breakingNewsLabel,
        breakingNewsBadgeColor: SEED_THEME_SETTINGS.breakingNewsBadgeColor,
        breakingNewsSpeed: SEED_THEME_SETTINGS.breakingNewsSpeed,
        showHeaderSocialIcons: SEED_THEME_SETTINGS.showHeaderSocialIcons,
        enabledSocialPlatforms: { ...SEED_THEME_SETTINGS.enabledSocialPlatforms },
        socialLinks: { ...SEED_THEME_SETTINGS.socialLinks },
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }
  };

  // Format sample date for preview
  const getFormattedDatePreview = () => {
    const daysMarathi = [
      'रविवार',
      'सोमवार',
      'मंगळवार',
      'बुधवार',
      'गुरुवार',
      'शुक्रवार',
      'शनिवार',
    ];
    const monthsMarathi = [
      'जानेवारी',
      'फेब्रुवारी',
      'मार्च',
      'एप्रिल',
      'मे',
      'जून',
      'जुलै',
      'ऑगस्ट',
      'सप्टेंबर',
      'ऑक्टोबर',
      'नोव्हेंबर',
      'डिसेंबर',
    ];
    const now = new Date();
    const dayName = daysMarathi[now.getDay()];
    const day = now.getDate();
    const month = monthsMarathi[now.getMonth()];
    const year = now.getFullYear();

    if (formData.headerDateFormat === 'english') {
      const enDate = now.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return formData.showLiveClock ? `${enDate} | ${currentTime}` : enDate;
    }

    if (formData.headerDateFormat === 'marathi_with_tithi') {
      return `${dayName}, ${day} ${month} ${year} • भाद्रपद कृष्ण पक्ष`;
    }

    if (formData.headerDateFormat === 'marathi_with_time') {
      return `${dayName}, ${day} ${month} ${year} | ${currentTime || '०५:३० PM'}`;
    }

    return `${dayName}, ${day} ${month} ${year}`;
  };

  const sampleBreakingPost =
    posts.find((p) => p.isBreaking && p.status === 'PUBLISHED') || posts[0];

  const colorPresets = [
    { label: 'News Red', color: '#dc2626' },
    { label: 'Crimson Dark', color: '#991b1b' },
    { label: 'Navy Blue', color: '#1e293b' },
    { label: 'Royal Blue', color: '#2563eb' },
    { label: 'Emerald Green', color: '#059669' },
    { label: 'Deep Amber', color: '#d97706' },
    { label: 'Purple Accent', color: '#7c3aed' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <PanelTop className="h-6 w-6 text-red-600" />
            <span>हेडर सेटिंग्ज (Header Customizer)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            पब्लिक न्यूज पोर्टलच्या हेडरमधील दिनांक/तारीख, ब्रेकिंग न्यूज पट्टी आणि सोशल मीडिया आयकॉन्सचे नियंत्रण.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-red-600 transition-colors"
            title="मूळ स्थितीत आणा"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>डिफॉल्ट करा</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            <span>बदल सेव्ह करा</span>
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-900 ring-1 ring-emerald-600/30 animate-in fade-in duration-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>हेडर सेटिंग्ज यशस्वीरित्या सेव्ह झाल्या! पब्लिक पोर्टलवर त्वरित अपडेट झाले आहे.</span>
        </div>
      )}

      {/* LIVE HEADER PREVIEW BOX */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-red-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              लाईव्ह हेडर प्रिव्ह्यू (Live Header Bar Preview)
            </h3>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            Realtime Preview
          </span>
        </div>

        {/* The Mock Top Utility Bar */}
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#1e293b] p-3 text-slate-200 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left: Date + Breaking News */}
            <div className="flex items-center gap-3">
              {formData.showHeaderDate ? (
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Calendar className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span>{getFormattedDatePreview()}</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 italic">
                  (दिनांक बंद आहे)
                </span>
              )}

              {formData.showBreakingNews && (
                <div className="hidden sm:flex items-center gap-2 overflow-hidden max-w-md">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shrink-0 transition-colors"
                    style={{ backgroundColor: formData.breakingNewsBadgeColor || '#dc2626' }}
                  >
                    {formData.breakingNewsLabel || 'Breaking News'}
                  </span>
                  <span className="truncate text-slate-300 font-medium text-[11px]">
                    {sampleBreakingPost?.title || 'महाराष्ट्रात हवामान विभागाकडून सतर्कतेचा इशारा...'}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Social Icons + Switcher */}
            <div className="flex items-center gap-3">
              {formData.showHeaderSocialIcons ? (
                <div className="flex items-center gap-2 text-slate-400">
                  {formData.enabledSocialPlatforms?.facebook && (
                    <span className="rounded p-1 text-slate-300 hover:text-blue-400">
                      <Facebook className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {formData.enabledSocialPlatforms?.twitter && (
                    <span className="rounded p-1 text-slate-300 hover:text-sky-400">
                      <Twitter className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {formData.enabledSocialPlatforms?.instagram && (
                    <span className="rounded p-1 text-slate-300 hover:text-pink-400">
                      <Instagram className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {formData.enabledSocialPlatforms?.youtube && (
                    <span className="rounded p-1 text-slate-300 hover:text-red-500">
                      <Youtube className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {formData.enabledSocialPlatforms?.whatsapp && (
                    <span className="rounded p-1 text-slate-300 hover:text-emerald-400">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {formData.enabledSocialPlatforms?.telegram && (
                    <span className="rounded p-1 text-slate-300 hover:text-sky-300">
                      <Send className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 italic">
                  (सोशल आयकॉन्स बंद आहेत)
                </span>
              )}

              <span className="rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
                Admin CMS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>सर्व सेटिंग्ज (All Settings)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('date')}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'date'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>१. तारीख व वेळ (Date Settings)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('breaking')}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'breaking'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>२. ब्रेकिंग न्यूज (Breaking News)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'social'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>३. सोशल आयकॉन्स (Social Media)</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* ============================================================ */}
        {/* SECTION 1: HEADER DATE & TIME SETTINGS */}
        {/* ============================================================ */}
        {(activeTab === 'all' || activeTab === 'date') && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    १. हेडर दिनांक व घड्याळ सेटिंग्ज (Header Date & Clock)
                  </h3>
                  <p className="text-xs text-slate-500">
                    पोर्टलच्या शीर्षभागी प्रदर्शित होणारी तारीख, वार, तिथी व वेळ नियंत्रित करा.
                  </p>
                </div>
              </div>

              {/* Master Toggle */}
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={formData.showHeaderDate}
                  onChange={(e) => {
                    const updated = { ...formData, showHeaderDate: e.target.checked };
                    setFormData(updated);
                    updateThemeSettings({ showHeaderDate: e.target.checked });
                  }}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-600 peer-checked:after:translate-x-full peer-focus:outline-hidden"></div>
              </label>
            </div>

            {formData.showHeaderDate && (
              <div className="space-y-4 pt-1 text-xs">
                {/* Format Radio Selection */}
                <div>
                  <label className="font-bold text-slate-800 mb-2 block">
                    दिनांक स्वरूप निवडा (Date Display Format):
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {[
                      {
                        value: 'marathi_with_time',
                        title: 'मराठी दिनांक + लाईव्ह वेळ (शिफारस केलेले)',
                        example: 'उदा. मंगळवार, २८ ऑगस्ट २०२६ | ०५:३०:०० PM',
                      },
                      {
                        value: 'marathi',
                        title: 'शुद्ध मराठी दिनांक व वार',
                        example: 'उदा. मंगळवार, २८ ऑगस्ट २०२६',
                      },
                      {
                        value: 'marathi_with_tithi',
                        title: 'मराठी पंचांग / तिथीसह',
                        example: 'उदा. मंगळवार, २८ ऑगस्ट २०२६ • भाद्रपद कृष्ण पक्ष',
                      },
                      {
                        value: 'english',
                        title: 'English Format (इंग्रजी)',
                        example: 'उदा. Tuesday, 28 August 2026',
                      },
                    ].map((fmt) => (
                      <label
                        key={fmt.value}
                        className={`flex cursor-pointer flex-col rounded-xl border p-3 transition-all ${
                          formData.headerDateFormat === fmt.value
                            ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600/30'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="headerDateFormat"
                            value={fmt.value}
                            checked={formData.headerDateFormat === fmt.value}
                            onChange={() => {
                              const updated = {
                                ...formData,
                                headerDateFormat: fmt.value as any,
                              };
                              setFormData(updated);
                              updateThemeSettings({ headerDateFormat: fmt.value as any });
                            }}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="font-bold text-slate-800">{fmt.title}</span>
                        </div>
                        <span className="mt-1 ml-5 text-[11px] text-slate-500">
                          {fmt.example}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clock Toggle */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-600" />
                    <div>
                      <p className="font-bold text-slate-800">
                        रिअल-टाइम सेकंद घड्याळ दाखवा (Live Digital Clock)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        हेडरमध्ये वेळ दर सेकंदाला ऑटोमॅटिक अपडेट होते.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.showLiveClock}
                    onChange={(e) => {
                      const updated = { ...formData, showLiveClock: e.target.checked };
                      setFormData(updated);
                      updateThemeSettings({ showLiveClock: e.target.checked });
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SECTION 2: BREAKING NEWS TICKER SETTINGS */}
        {/* ============================================================ */}
        {(activeTab === 'all' || activeTab === 'breaking') && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    २. ब्रेकिंग न्यूज पट्टी सेटिंग्ज (Top Breaking News Bar)
                  </h3>
                  <p className="text-xs text-slate-500">
                    हेडरमधील ब्रेकिंग न्यूज बॅज, रंग आणि स्क्रोलिंग मजकूर सानुकूलित करा.
                  </p>
                </div>
              </div>

              {/* Master Toggle */}
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={formData.showBreakingNews}
                  onChange={(e) => {
                    const updated = { ...formData, showBreakingNews: e.target.checked };
                    setFormData(updated);
                    updateThemeSettings({ showBreakingNews: e.target.checked });
                  }}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-600 peer-checked:after:translate-x-full peer-focus:outline-hidden"></div>
              </label>
            </div>

            {formData.showBreakingNews && (
              <div className="space-y-4 pt-1 text-xs">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Badge Label */}
                  <div>
                    <label className="font-bold text-slate-800 mb-1 block">
                      बॅजवरील नाव (Badge Label Text):
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. Breaking News / ताजी बातमी / महत्त्वाचे अपडेट"
                      value={formData.breakingNewsLabel}
                      onChange={(e) => {
                        const updated = { ...formData, breakingNewsLabel: e.target.value };
                        setFormData(updated);
                        updateThemeSettings({ breakingNewsLabel: e.target.value });
                      }}
                      className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-red-600 focus:outline-hidden"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[11px] text-slate-400">जलद निवडा:</span>
                      {['Breaking News', 'ताजी बातमी', 'महत्त्वाचे अपडेट', 'LIVE UPDATES'].map(
                        (tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              const updated = { ...formData, breakingNewsLabel: tag };
                              setFormData(updated);
                              updateThemeSettings({ breakingNewsLabel: tag });
                            }}
                            className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            {tag}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Badge Color Presets */}
                  <div>
                    <label className="font-bold text-slate-800 mb-1 block">
                      बॅज बॅकग्राउंड रंग (Badge Color):
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={formData.breakingNewsBadgeColor || '#dc2626'}
                        onChange={(e) => {
                          const updated = {
                            ...formData,
                            breakingNewsBadgeColor: e.target.value,
                          };
                          setFormData(updated);
                          updateThemeSettings({
                            breakingNewsBadgeColor: e.target.value,
                          });
                        }}
                        className="h-9 w-12 cursor-pointer rounded border border-slate-200 p-1"
                      />
                      <input
                        type="text"
                        value={formData.breakingNewsBadgeColor || '#dc2626'}
                        onChange={(e) => {
                          const updated = {
                            ...formData,
                            breakingNewsBadgeColor: e.target.value,
                          };
                          setFormData(updated);
                          updateThemeSettings({
                            breakingNewsBadgeColor: e.target.value,
                          });
                        }}
                        className="h-9 w-28 rounded-lg border border-slate-200 px-2.5 font-mono text-xs text-slate-800"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      {colorPresets.map((cp) => (
                        <button
                          key={cp.color}
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...formData,
                              breakingNewsBadgeColor: cp.color,
                            };
                            setFormData(updated);
                            updateThemeSettings({ breakingNewsBadgeColor: cp.color });
                          }}
                          className="h-5 w-5 rounded-full border border-white shadow-xs transition-transform hover:scale-110"
                          style={{ backgroundColor: cp.color }}
                          title={cp.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Speed selector */}
                <div>
                  <label className="font-bold text-slate-800 mb-1 block">
                    अ‍ॅनिमेशन / स्क्रोलिंग गती (Ticker Speed):
                  </label>
                  <div className="flex items-center gap-3">
                    {[
                      { value: 'slow', label: 'हळू (Slow)' },
                      { value: 'normal', label: 'मध्यम (Normal - Recommended)' },
                      { value: 'fast', label: 'जलद (Fast)' },
                    ].map((spd) => (
                      <label
                        key={spd.value}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                          formData.breakingNewsSpeed === spd.value
                            ? 'border-red-600 bg-red-50 text-red-700'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="breakingNewsSpeed"
                          value={spd.value}
                          checked={formData.breakingNewsSpeed === spd.value}
                          onChange={() => {
                            const updated = {
                              ...formData,
                              breakingNewsSpeed: spd.value as any,
                            };
                            setFormData(updated);
                            updateThemeSettings({ breakingNewsSpeed: spd.value as any });
                          }}
                          className="text-red-600"
                        />
                        <span>{spd.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Direct Shortcut to Sub-Menu Ticker Customizer */}
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shrink-0">
                      <Flame className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-950">
                        मेनू खालील अखंड स्क्रोलिंग ब्रेकिंग न्यूज टिकर (Sub-Menu Marquee Ticker)
                      </h4>
                      <p className="text-[11px] text-red-700 mt-0.5">
                        रंग, ॲनिमेशन स्पीड, कस्टमाइज्ड फ्लॅश बातम्या आणि फॉन्ट स्टाईल बदला.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCmsView('breaking_ticker')}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-xs"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>टिकर कस्टमायझर उघडा</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SECTION 3: HEADER SOCIAL MEDIA ICONS & LINKS */}
        {/* ============================================================ */}
        {(activeTab === 'all' || activeTab === 'social') && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    ३. हेडर सोशल मीडिया आयकॉन्स व लिंक्स (Social Media Icons & Channels)
                  </h3>
                  <p className="text-xs text-slate-500">
                    वाचकांसाठी हेडरमध्ये फेसबुक, ट्विटर, व्हॉट्सअ‍ॅप, टेलिग्राम व युट्यूब चॅनेल लिंक्स व्यवस्थापित करा.
                  </p>
                </div>
              </div>

              {/* Master Toggle */}
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={formData.showHeaderSocialIcons}
                  onChange={(e) => {
                    const updated = {
                      ...formData,
                      showHeaderSocialIcons: e.target.checked,
                    };
                    setFormData(updated);
                    updateThemeSettings({ showHeaderSocialIcons: e.target.checked });
                  }}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-600 peer-checked:after:translate-x-full peer-focus:outline-hidden"></div>
              </label>
            </div>

            {formData.showHeaderSocialIcons && (
              <div className="space-y-3 pt-1 text-xs">
                {/* Platform Rows */}
                {[
                  {
                    key: 'facebook',
                    name: 'Facebook Page',
                    icon: Facebook,
                    iconColor: 'text-blue-600 bg-blue-50',
                    placeholder: 'https://facebook.com/your-news-page',
                  },
                  {
                    key: 'twitter',
                    name: 'X (Twitter) Handle',
                    icon: Twitter,
                    iconColor: 'text-sky-500 bg-sky-50',
                    placeholder: 'https://twitter.com/your_handle',
                  },
                  {
                    key: 'instagram',
                    name: 'Instagram Profile',
                    icon: Instagram,
                    iconColor: 'text-pink-600 bg-pink-50',
                    placeholder: 'https://instagram.com/your_insta',
                  },
                  {
                    key: 'youtube',
                    name: 'YouTube Channel',
                    icon: Youtube,
                    iconColor: 'text-red-600 bg-red-50',
                    placeholder: 'https://youtube.com/@your_channel',
                  },
                  {
                    key: 'whatsapp',
                    name: 'WhatsApp Channel / Group',
                    icon: MessageCircle,
                    iconColor: 'text-emerald-600 bg-emerald-50',
                    placeholder: 'https://whatsapp.com/channel/...',
                  },
                  {
                    key: 'telegram',
                    name: 'Telegram Channel',
                    icon: Send,
                    iconColor: 'text-sky-600 bg-sky-50',
                    placeholder: 'https://t.me/your_news_channel',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isEnabled =
                    formData.enabledSocialPlatforms?.[
                      item.key as keyof typeof formData.enabledSocialPlatforms
                    ] ?? true;
                  const currentUrl =
                    formData.socialLinks?.[
                      item.key as keyof typeof formData.socialLinks
                    ] || '';

                  return (
                    <div
                      key={item.key}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                        isEnabled
                          ? 'border-slate-200 bg-white'
                          : 'border-slate-100 bg-slate-50/70 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:w-1/3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.iconColor}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <label className="flex items-center gap-1.5 mt-0.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => {
                                const updated = {
                                  ...formData,
                                  enabledSocialPlatforms: {
                                    ...formData.enabledSocialPlatforms,
                                    [item.key]: e.target.checked,
                                  },
                                };
                                setFormData(updated);
                                updateThemeSettings({
                                  enabledSocialPlatforms: updated.enabledSocialPlatforms,
                                });
                              }}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-[11px] text-slate-500">
                              {isEnabled ? 'सक्रिय (Active)' : 'बंद (Disabled)'}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="url"
                          placeholder={item.placeholder}
                          value={currentUrl}
                          disabled={!isEnabled}
                          onChange={(e) => {
                            const updated = {
                              ...formData,
                              socialLinks: {
                                ...formData.socialLinks,
                                [item.key]: e.target.value,
                              },
                            };
                            setFormData(updated);
                            updateThemeSettings({
                              socialLinks: updated.socialLinks,
                            });
                          }}
                          className="h-8 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800 disabled:bg-slate-100 focus:border-red-600 focus:outline-hidden"
                        />
                        {currentUrl && (
                          <a
                            href={currentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            title="लिंक तपासा (Open in new tab)"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <span className="text-xs text-slate-500">
          टीप: बदल सेव्ह केल्यावर मुख्य न्यूज पोर्टलवरील हेडर आपोआप अपडेट होतो.
        </span>
        <button
          type="button"
          onClick={() => handleSave()}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>हेडर बदल सेव्ह करा</span>
        </button>
      </div>
    </div>
  );
};
