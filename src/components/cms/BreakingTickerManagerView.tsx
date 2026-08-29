import React, { useState, useEffect } from 'react';
import {
  Flame,
  Zap,
  Radio,
  Bell,
  AlertTriangle,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Layers,
  MoveUp,
  MoveDown,
  Globe,
  Tag,
  ExternalLink,
  Check,
  Pause,
  Play,
  CheckSquare,
  Square,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SEED_THEME_SETTINGS } from '../../data/seedData';
import { BreakingTickerItem, BreakingTickerSettings, ThemeSettings } from '../../types';
import { BreakingNewsTicker } from '../common/BreakingNewsTicker';

export const BreakingTickerManagerView: React.FC = () => {
  const { themeSettings, updateThemeSettings, categories, posts } = useApp();

  // Local draft state for fine-grained editing
  const [formData, setFormData] = useState<BreakingTickerSettings>(
    themeSettings.breakingTicker || SEED_THEME_SETTINGS.breakingTicker
  );

  const [activeTab, setActiveTab] = useState<'general' | 'motion' | 'source' | 'custom_items'>('general');
  const [savedToast, setSavedToast] = useState(false);

  // New Custom Item Form State
  const [newItemText, setNewItemText] = useState('');
  const [newItemTag, setNewItemTag] = useState('लाईव्ह');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Keep local state in sync if themeSettings updates
  useEffect(() => {
    if (themeSettings.breakingTicker) {
      setFormData(themeSettings.breakingTicker);
    }
  }, [themeSettings]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateThemeSettings({
      breakingTicker: formData,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  const handleResetToDefault = () => {
    if (window.confirm('तुम्हाला ब्रेकिंग न्यूज टिकर सेटिंग्ज मूळ (Default) स्थितीत आणायच्या आहेत का?')) {
      const defaultTicker = SEED_THEME_SETTINGS.breakingTicker;
      setFormData(defaultTicker);
      updateThemeSettings({
        breakingTicker: defaultTicker,
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }
  };

  // Custom Items Operations
  const handleAddOrUpdateItem = () => {
    if (!newItemText.trim()) return;

    if (editingItemId) {
      // Update existing item
      setFormData((prev) => ({
        ...prev,
        customItems: (prev.customItems || []).map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                text: newItemText.trim(),
                tag: newItemTag.trim() || 'महत्त्वाचे',
                url: newItemUrl.trim() || undefined,
              }
            : item
        ),
      }));
      setEditingItemId(null);
    } else {
      // Add new item
      const newItem: BreakingTickerItem = {
        id: `tick-${Date.now()}`,
        text: newItemText.trim(),
        tag: newItemTag.trim() || 'लाईव्ह',
        url: newItemUrl.trim() || undefined,
        isPublished: true,
        priority: (formData.customItems?.length || 0) + 1,
        createdAt: new Date().toISOString(),
      };
      setFormData((prev) => ({
        ...prev,
        customItems: [...(prev.customItems || []), newItem],
      }));
    }

    setNewItemText('');
    setNewItemTag('लाईव्ह');
    setNewItemUrl('');
  };

  const handleEditItem = (item: BreakingTickerItem) => {
    setEditingItemId(item.id);
    setNewItemText(item.text);
    setNewItemTag(item.tag || 'लाईव्ह');
    setNewItemUrl(item.url || '');
    setActiveTab('custom_items');
  };

  const handleDeleteItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customItems: (prev.customItems || []).filter((item) => item.id !== id),
    }));
  };

  const handleToggleItemStatus = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customItems: (prev.customItems || []).map((item) =>
        item.id === id ? { ...item, isPublished: !item.isPublished } : item
      ),
    }));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const items = [...(formData.customItems || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    setFormData((prev) => ({
      ...prev,
      customItems: items,
    }));
  };

  const badgeColorPresets = [
    { label: 'News Red (न्यूज रेड)', color: '#dc2626' },
    { label: 'Crimson Dark (गडद लाल)', color: '#991b1b' },
    { label: 'Navy Blue (नेव्ही ब्ल्यू)', color: '#1e293b' },
    { label: 'Royal Blue (रॉयल ब्ल्यू)', color: '#2563eb' },
    { label: 'Deep Amber (अंबर गोल्ड)', color: '#d97706' },
    { label: 'Emerald (एमराल्ड हिरवा)', color: '#059669' },
    { label: 'Purple (जांभळा)', color: '#7c3aed' },
  ];

  const tickerBgPresets = [
    { label: 'Dark Navy (गडद नेव्ही)', color: '#0f172a', text: '#f8fafc' },
    { label: 'Slate Dark (स्लेट डार्क)', color: '#1e293b', text: '#ffffff' },
    { label: 'Midnight Black (काळा)', color: '#000000', text: '#ffffff' },
    { label: 'Soft Crimson (मॅरून)', color: '#7f1d1d', text: '#fef2f2' },
    { label: 'Clean White (पांढरा)', color: '#ffffff', text: '#0f172a' },
    { label: 'Light Slate (हलका राखाडी)', color: '#f1f5f9', text: '#0f172a' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-black text-red-700 uppercase">
              Live Portal Ticker
            </span>
            <span className="text-xs text-slate-400">&bull; मेनू खालील स्क्रोलिंग पट्टी</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mt-1">
            <Flame className="h-6 w-6 text-red-600" />
            <span>ब्रेकिंग न्यूज टिकर कस्टमायझर (Breaking News Ticker)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            पब्लिक पोर्टलवर मुख्य मेन्यूच्या खाली अखंड स्क्रोल होणारी ब्रेकिंग न्यूज पट्टी, रंग, ॲनिमेशन स्पीड आणि बातम्यांचे संपूर्ण नियंत्रण.
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
          <span>ब्रेकिंग न्यूज टिकर सेटिंग्ज यशस्वीरित्या सेव्ह झाल्या! पब्लिक पोर्टलवर त्वरित अपडेट झाले आहे.</span>
        </div>
      )}

      {/* LIVE REALTIME PREVIEW BOX */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-red-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              लाईव्ह टिकर प्रिव्ह्यू (Live Ticker Preview Below Menu)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                formData.isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {formData.isEnabled ? 'सक्रिय (Active)' : 'बंद (Disabled)'}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Realtime</span>
          </div>
        </div>

        {/* Mock Menu Bar + Ticker */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a] shadow-inner">
          {/* Simulated Top Navigation Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 text-white text-[11px] font-bold">
            <div className="flex items-center gap-3">
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px]">मुख्य मेन्यू</span>
              <span className="text-slate-300">महाराष्ट्र</span>
              <span className="text-slate-300">राजकारण</span>
              <span className="text-slate-300">क्रीडा</span>
              <span className="text-slate-300">मनोरंजन</span>
            </div>
            <span className="text-[10px] text-slate-400 italic">← मेन्यू बारच्या लगेच खाली टिकर दिसतो</span>
          </div>

          {/* Rendered Live Ticker */}
          {formData.isEnabled ? (
            <div
              className="w-full overflow-hidden flex items-center h-10 px-3 transition-colors"
              style={{
                backgroundColor: formData.tickerBgColor || '#0f172a',
                color: formData.tickerTextColor || '#f8fafc',
              }}
            >
              {/* Badge */}
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-black uppercase tracking-wider shrink-0 shadow-sm mr-3"
                style={{
                  backgroundColor: formData.badgeBgColor || '#dc2626',
                  color: formData.badgeTextColor || '#ffffff',
                }}
              >
                {formData.badgeIcon === 'zap' && <Zap className="h-3 w-3 animate-pulse" />}
                {formData.badgeIcon === 'radio' && <Radio className="h-3 w-3 animate-pulse" />}
                {formData.badgeIcon === 'bell' && <Bell className="h-3 w-3 animate-pulse" />}
                {formData.badgeIcon === 'alert' && <AlertTriangle className="h-3 w-3 animate-pulse" />}
                {formData.badgeIcon === 'sparkles' && <Sparkles className="h-3 w-3 animate-pulse" />}
                {(!formData.badgeIcon || formData.badgeIcon === 'flame') && (
                  <Flame className="h-3 w-3 animate-pulse" />
                )}
                <span>{formData.title || '🔴 ब्रेकिंग न्यूज'}</span>
              </div>

              {/* Scrolling Text Preview */}
              <div className="overflow-hidden relative flex-1 text-xs font-medium truncate flex items-center gap-2">
                <span className="rounded bg-red-600/30 text-red-300 px-1.5 py-0.2 text-[9px] font-bold">
                  {formData.customItems?.[0]?.tag || 'लाईव्ह'}
                </span>
                <span className="truncate">
                  {formData.customItems?.[0]?.text ||
                    'महायुती आणि महाविकास आघाडीच्या जागावाटपाची बैठक मुंबईत संपन्न...'}
                </span>
                <span className="text-amber-400 font-bold ml-2">⚡</span>
                <span className="truncate text-slate-300 hidden md:inline">
                  {formData.customItems?.[1]?.text || 'हवामान विभागाकडून सतर्कतेचा इशारा...'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-slate-400 italic bg-slate-900/60">
              टिकर सध्या बंद आहे. खालील 'टिकर चालू करा' टॉगल ऑन करा.
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-bold overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'general'
              ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>१. मुख्य सेटिंग्ज व रंग (Design & Colors)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('motion')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'motion'
              ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>२. मोशन व स्क्रोलिंग गती (Animation Speed)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('source')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'source'
              ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>३. न्यूज सोर्स (Data Source)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom_items')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'custom_items'
              ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>४. कस्टमाइज्ड फ्लॅश बातम्या ({formData.customItems?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: GENERAL & DESIGN */}
      {activeTab === 'general' && (
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          {/* Master Enable/Disable Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                मेनू खालील ब्रेकिंग न्यूज टिकर (Show Ticker Below Menu)
              </h3>
              <p className="text-xs text-slate-500">
                पब्लिक न्यूज पोर्टलवर मुख्य मेन्यूच्या खाली अखंड स्क्रोल होणारी ब्रेकिंग न्यूज पट्टी दाखवायची का?
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.isEnabled}
                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-600 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
            </label>
          </div>

          {/* Sticky Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">स्टिकि टिकर (Sticky Ticker Bar)</h3>
              <p className="text-xs text-slate-500">
                पेज खाली स्क्रोल करताना मेन्यू सोबत टिकर पट्टीसुद्धा स्क्रीनवर फिक्स राहू द्या.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.isSticky}
                onChange={(e) => setFormData({ ...formData, isSticky: e.target.checked })}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-600 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
            </label>
          </div>

          {/* Ticker Title & Icon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                डाव्या बाजूचे टिकर शीर्षक (Badge Label)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="उदा. 🔴 ब्रेकिंग न्यूज किंवा ⚡ ताज्या घडामोडी"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none font-bold"
              />
              <p className="text-[10px] text-slate-400">
                उदा. '🔴 ब्रेकिंग न्यूज', '⚡ ताज्या घडामोडी', '🚨 महत्त्वाचे अपडेट्स'
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">बॅज आयकॉन (Badge Icon)</label>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { id: 'flame', icon: Flame, label: 'Flame' },
                  { id: 'zap', icon: Zap, label: 'Zap' },
                  { id: 'radio', icon: Radio, label: 'Live' },
                  { id: 'bell', icon: Bell, label: 'Alert' },
                  { id: 'alert', icon: AlertTriangle, label: 'Warning' },
                  { id: 'sparkles', icon: Sparkles, label: 'Star' },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSelected = formData.badgeIcon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, badgeIcon: item.id as any })}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-red-600 bg-red-50 text-red-600 font-bold ring-1 ring-red-600'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <IconComp className="h-4 w-4" />
                      <span className="text-[9px] mt-1">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Badge Background Color */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800">
              बॅजचा रंग (Badge Background Color)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {badgeColorPresets.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() => setFormData({ ...formData, badgeBgColor: preset.color })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    formData.badgeBgColor === preset.color
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span>{preset.label}</span>
                </button>
              ))}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <input
                  type="color"
                  value={formData.badgeBgColor || '#dc2626'}
                  onChange={(e) => setFormData({ ...formData, badgeBgColor: e.target.value })}
                  className="h-7 w-7 rounded cursor-pointer border border-slate-300"
                />
                <span className="text-xs font-mono text-slate-600">{formData.badgeBgColor}</span>
              </div>
            </div>
          </div>

          {/* Ticker Bar Background & Text Colors */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800">
              टिकर पट्टीचा बॅकग्राउंड रंग (Ticker Bar Background Color)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {tickerBgPresets.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tickerBgColor: preset.color,
                      tickerTextColor: preset.text,
                    })
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    formData.tickerBgColor === preset.color
                      ? 'border-red-600 bg-red-50 text-red-700 shadow-xs ring-1 ring-red-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span>{preset.label}</span>
                </button>
              ))}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <input
                  type="color"
                  value={formData.tickerBgColor || '#0f172a'}
                  onChange={(e) => setFormData({ ...formData, tickerBgColor: e.target.value })}
                  className="h-7 w-7 rounded cursor-pointer border border-slate-300"
                />
                <span className="text-xs font-mono text-slate-600">{formData.tickerBgColor}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOTION & SCROLL SPEED */}
      {activeTab === 'motion' && (
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          {/* Scrolling Speed */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              स्क्रोलिंग गती (Marquee Scrolling Speed)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { id: 'slow', label: 'हळूवार (Slow)', desc: '45 सेकंद / फिरणे', icon: '🐢' },
                { id: 'normal', label: 'सामान्य (Normal)', desc: '30 सेकंद / स्टँडर्ड', icon: '⚡' },
                { id: 'fast', label: 'वेगवान (Fast)', desc: '20 सेकंद / फास्ट', icon: '🚀' },
                { id: 'ultra_fast', label: 'अतिवेगवान (Ultra)', desc: '14 सेकंद / हाय स्पीड', icon: '🔥' },
                { id: 'paused', label: 'थांबवलेले (Static)', desc: 'स्थिर टिकर', icon: '⏸️' },
              ].map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, scrollSpeed: sp.id as any })}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    formData.scrollSpeed === sp.id
                      ? 'border-red-600 bg-red-50 ring-1 ring-red-600 text-red-950 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-lg">{sp.icon}</div>
                  <div className="text-xs font-bold mt-1">{sp.label}</div>
                  <div className="text-[10px] text-slate-500">{sp.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pause on Hover */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                माउस नेल्यावर थांबवा (Pause on Mouse Hover)
              </h3>
              <p className="text-xs text-slate-500">
                वाचकाने टिकरवर कर्सर नेल्यावर किंवा मोबाईलवर बोट टेकवल्यावर बातमी वाचण्यासाठी स्क्रोलिंग तात्पुरते थांबेल.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.pauseOnHover}
                onChange={(e) => setFormData({ ...formData, pauseOnHover: e.target.checked })}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-600 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
            </label>
          </div>

          {/* Separator Icon */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800">
              बातम्यांमधील चिन्ह (Headline Separator)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: 'bullet', label: '🔴 लाल ठिपका (Bullet)' },
                { id: 'zap', label: '⚡ वीज (Lightning)' },
                { id: 'star', label: '✦ चमकणारा तारा (Star)' },
                { id: 'flame', label: '🔥 ज्वाला (Flame)' },
                { id: 'pipe', label: '| उभी रेषा (Pipe)' },
              ].map((sep) => (
                <button
                  key={sep.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, separatorIcon: sep.id as any })}
                  className={`p-3 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                    formData.separatorIcon === sep.id
                      ? 'border-red-600 bg-red-50 text-red-700 font-bold ring-1 ring-red-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {sep.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATA SOURCE */}
      {activeTab === 'source' && (
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">न्यूज डेटा सोर्स (News Source)</h3>
            <p className="text-xs text-slate-500">
              टिकर पट्टीमध्ये कोणत्या प्रकारच्या बातम्या स्क्रोल करायच्या आहेत ते निवडा.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                id: 'AUTOMATIC_BREAKING',
                title: '🌟 ऑटोमॅटिक ब्रेकिंग न्यूज (Auto-Breaking)',
                desc: 'पोस्ट ॲडिटरमध्ये "Breaking News" म्हणून मार्क केलेल्या सर्व ताज्या बातम्या आपोआप स्क्रोल होतील.',
              },
              {
                id: 'CUSTOM_ITEMS',
                title: '✍️ कस्टमाइज्ड फ्लॅश न्यूज (Custom Flash Alerts)',
                desc: 'ॲडमिनने टॅब ४ मध्ये स्वतः लिहिलेल्या महत्त्वाच्या हेडलाईन्स आणि लिंक्स स्क्रोल होतील.',
              },
              {
                id: 'ALL_RECENT',
                title: '📰 सर्व ताज्या बातम्या (All Recent Headlines)',
                desc: 'पोर्टलवरील सर्व ताज्या १० ताज्या बातम्या आपोआप स्क्रोल केल्या जातील.',
              },
              {
                id: 'CATEGORY_NEWS',
                title: '📂 विशिष्ट कॅटेगरीच्या बातम्या (Category Specific)',
                desc: 'खाली निवडलेल्या विशिष्ट विभागाच्या ताज्या बातम्या टिकरवर दिसतील.',
              },
            ].map((src) => (
              <button
                key={src.id}
                type="button"
                onClick={() => setFormData({ ...formData, source: src.id as any })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  formData.source === src.id
                    ? 'border-red-600 bg-red-50 ring-1 ring-red-600 text-red-950 font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{src.title}</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-relaxed font-normal">{src.desc}</div>
              </button>
            ))}
          </div>

          {/* Category Dropdown if CATEGORY_NEWS is chosen */}
          {formData.source === 'CATEGORY_NEWS' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">कॅटेगरी निवडा:</label>
              <select
                value={formData.selectedCategoryId || ''}
                onChange={(e) => setFormData({ ...formData, selectedCategoryId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
              >
                <option value="">-- सर्व कॅटेगरीज --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.slug})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CUSTOM FLASH ITEMS MANAGER */}
      {activeTab === 'custom_items' && (
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          {/* Header & Add Item Form */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-red-600" />
                <span>
                  {editingItemId ? 'फ्लॅश बातमी एडिट करा (Edit Item)' : 'नवीन फ्लॅश बातमी जोडा (Add Flash News)'}
                </span>
              </h3>
              {editingItemId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItemId(null);
                    setNewItemText('');
                    setNewItemTag('लाईव्ह');
                    setNewItemUrl('');
                  }}
                  className="text-xs text-red-600 hover:underline font-bold"
                >
                  रद्द करा (Cancel)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3 space-y-1">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="बातमीची हेडलाईन लिहा... उदा. हवामान विभागाकडून मुंबईत मुसळधार पावसाचा इशारा"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-red-600 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <select
                  value={newItemTag}
                  onChange={(e) => setNewItemTag(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-red-600 focus:outline-none font-bold"
                >
                  <option value="लाईव्ह">🔴 लाईव्ह</option>
                  <option value="महत्त्वाचे">⚡ महत्त्वाचे</option>
                  <option value="विशेष">🌟 विशेष</option>
                  <option value="अलर्ट">🚨 अलर्ट</option>
                  <option value="हवामान">🌧️ हवामान</option>
                  <option value="बाजारभाव">💰 बाजारभाव</option>
                  <option value="क्रीडा">🏆 क्रीडा</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <input
                type="text"
                value={newItemUrl}
                onChange={(e) => setNewItemUrl(e.target.value)}
                placeholder="पर्यायी बातमी लिंक (URL or /category/maharashtra)"
                className="w-full sm:w-2/3 rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
              />

              <button
                type="button"
                onClick={handleAddOrUpdateItem}
                disabled={!newItemText.trim()}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-50 transition-colors shadow-xs"
              >
                {editingItemId ? 'अपडेट करा (Save)' : '+ टिकरमध्ये जोडा'}
              </button>
            </div>
          </div>

          {/* List of Custom Ticker Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                सध्याच्या फ्लॅश बातम्यांची यादी ({formData.customItems?.length || 0})
              </h4>
              <span className="text-[11px] text-slate-400">
                (वरून खाली स्क्रोलिंग क्रमाने बातम्या दिसतील)
              </span>
            </div>

            {formData.customItems && formData.customItems.length > 0 ? (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-xs">
                {formData.customItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Priority Move buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-900 disabled:opacity-20"
                          title="वर घ्या"
                        >
                          <MoveUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx, 'down')}
                          disabled={idx === formData.customItems.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-900 disabled:opacity-20"
                          title="खाली घ्या"
                        >
                          <MoveDown className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Status Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleItemStatus(item.id)}
                        className={`p-1 rounded text-xs font-bold ${
                          item.isPublished ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                        title={item.isPublished ? 'चालू आहे (सक्रिय)' : 'बंद आहे'}
                      >
                        {item.isPublished ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                      </button>

                      {/* Tag & Text */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-red-100 text-red-700 px-1.5 py-0.5 text-[10px] font-bold">
                            {item.tag || 'लाईव्ह'}
                          </span>
                          <span
                            className={`font-semibold truncate ${
                              item.isPublished ? 'text-slate-900' : 'text-slate-400 line-through'
                            }`}
                          >
                            {item.text}
                          </span>
                        </div>
                        {item.url && (
                          <span className="text-[10px] text-slate-400 truncate block mt-0.5">{item.url}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditItem(item)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                        title="एडिट करा"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="हटवा"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-400 text-xs">
                कोणतीही कस्टमाइज्ड फ्लॅश बातमी नाही. वरील फॉर्ममधून पहिली बातमी जोडा.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
