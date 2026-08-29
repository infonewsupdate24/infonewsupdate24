import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Film,
  Flame,
  GripVertical,
  HardDrive,
  Laptop,
  Layers,
  LayoutDashboard,
  Mail,
  Maximize2,
  Monitor,
  Moon,
  Move,
  Newspaper,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings,
  Sliders,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  Upload,
  Wheat,
  X,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  HomepageLayoutService,
  HomepageSectionConfig,
  HomepageSectionId,
  LAYOUT_PRESETS,
  LayoutPreset,
} from '../../services/HomepageLayoutService';

export const HomepageLayoutBuilderView: React.FC = () => {
  const { setPortalMode } = useApp();

  const [sections, setSections] = useState<HomepageSectionConfig[]>(() =>
    HomepageLayoutService.getSections()
  );

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Device Preview State: 'DESKTOP' | 'TABLET' | 'MOBILE'
  const [previewDevice, setPreviewDevice] = useState<'DESKTOP' | 'TABLET' | 'MOBILE'>('DESKTOP');

  // Block Settings Modal State
  const [editingSection, setEditingSection] = useState<HomepageSectionConfig | null>(null);
  const [modalCustomTitle, setModalCustomTitle] = useState('');
  const [modalPostCount, setModalPostCount] = useState<number>(6);
  const [modalDisplayStyle, setModalDisplayStyle] = useState<'GRID' | 'LIST' | 'CAROUSEL'>('GRID');
  const [modalDeviceVisibility, setModalDeviceVisibility] = useState<'ALL' | 'DESKTOP_ONLY' | 'MOBILE_ONLY'>('ALL');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    const handleUpdate = () => {
      setSections(HomepageLayoutService.getSections());
    };
    window.addEventListener('infonews:homepage-layout-updated', handleUpdate);
    return () =>
      window.removeEventListener('infonews:homepage-layout-updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // DRAG & DROP HANDLERS
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (draggedIndex !== targetIndex) {
      HomepageLayoutService.reorderSections(draggedIndex, targetIndex);
      setSections(HomepageLayoutService.getSections());
      showToast('🔄 विभागांचा क्रम यशस्वीरीत्या बदलला!');
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // MOVE UP / DOWN
  const handleMoveUp = (id: HomepageSectionId) => {
    HomepageLayoutService.moveSectionUp(id);
    setSections(HomepageLayoutService.getSections());
    showToast('⬆️ विभाग वर हलवला.');
  };

  const handleMoveDown = (id: HomepageSectionId) => {
    HomepageLayoutService.moveSectionDown(id);
    setSections(HomepageLayoutService.getSections());
    showToast('⬇️ विभाग खाली हलवला.');
  };

  // TOGGLE VISIBILITY
  const handleToggleVisibility = (id: HomepageSectionId) => {
    HomepageLayoutService.toggleVisibility(id);
    setSections(HomepageLayoutService.getSections());
    const target = sections.find((s) => s.id === id);
    showToast(
      target?.isVisible
        ? `👁️ "${target.nameMr}" विभाग लपवला.`
        : `👁️ "${target?.nameMr}" विभाग प्रदर्शित केला.`
    );
  };

  // APPLY PRESET
  const handleApplyPreset = (preset: LayoutPreset) => {
    const updated = HomepageLayoutService.applyPreset(preset.id);
    setSections(updated);
    showToast(`⚡ "${preset.name.split('(')[0]}" लेआउट प्रीसेट यशस्वीरित्या लागू झाला!`);
  };

  // OPEN EDIT BLOCK SETTINGS
  const handleOpenSettings = (sec: HomepageSectionConfig) => {
    setEditingSection(sec);
    setModalCustomTitle(sec.customTitleMr || sec.nameMr);
    setModalPostCount(sec.postCount || 6);
    setModalDisplayStyle(sec.displayStyle || 'GRID');
    setModalDeviceVisibility(sec.deviceVisibility || 'ALL');
  };

  // SAVE BLOCK SETTINGS
  const handleSaveBlockSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    const updated = HomepageLayoutService.updateSectionConfig(editingSection.id, {
      customTitleMr: modalCustomTitle.trim(),
      postCount: modalPostCount,
      displayStyle: modalDisplayStyle,
      deviceVisibility: modalDeviceVisibility,
    });
    setSections(updated);
    setEditingSection(null);
    showToast(`⚙️ "${editingSection.nameMr}" ची सानुकूल सेटिंग्ज सेव्ह झाली!`);
  };

  // 1-CLICK RESET
  const handleReset = () => {
    if (window.confirm('तुम्हाला खात्री आहे का की होमपेज रचना मूळ मानक क्रमानुसार रीसेट करायची आहे?')) {
      HomepageLayoutService.resetToDefault();
      setSections(HomepageLayoutService.getSections());
      showToast('🔄 होमपेज लेआउट मूळ मानक रचनेवर रीसेट झाला.');
    }
  };

  // EXPORT JSON
  const handleExportJson = () => {
    const jsonStr = HomepageLayoutService.exportLayoutJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infonews_homepage_layout_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('💾 होमपेज लेआउट JSON बॅकअप डाऊनलोड झाला!');
  };

  // IMPORT JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = HomepageLayoutService.importLayoutJson(content);
      if (ok) {
        setSections(HomepageLayoutService.getSections());
        showToast('🔄 होमपेज लेआउट JSON वरून यशस्वीरित्या रिस्टोअर झाला!');
      } else {
        showToast('❌ अवैध लेआउट फाईल.');
      }
    };
    reader.readAsText(file);
  };

  // Filtered Sections
  const filteredSections = sections.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.nameMr.toLowerCase().includes(q) ||
      s.nameEn.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            व्हिज्युअल होमपेज ड्रॅग आणि ड्रॉप बिल्डर (Visual Canvas)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            InfoNewsUpdate24 च्या होमपेजवरील बातम्यांचे सर्व १४ विभाग ड्रॅग-अँड-ड्रॉप करून रचना ठरवा व थेट लाईव्ह प्रिव्ह्यू पहा.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPortalMode('PUBLIC')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            <ExternalLink className="h-4 w-4 text-slate-600" />
            <span>पब्लिक होमपेज पहा</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-2 text-xs font-bold shadow-2xs transition cursor-pointer"
            title="लेआउट JSON बॅकअप घ्या"
          >
            <Download className="h-4 w-4" />
            <span>बॅकअप</span>
          </button>

          <label className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-xs font-bold shadow-2xs transition cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>रिस्टोअर</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 text-xs font-bold shadow-2xs transition cursor-pointer"
            title="मूळ मानक रचनेवर रीसेट करा"
          >
            <RotateCcw className="h-4 w-4" />
            <span>रीसेट</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-between shadow-lg border border-slate-700 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1-CLICK PRESETS TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>१-क्लिक रेडीमेड होमपेज लेआउट प्रीसेट्स (Instant Layout Presets):</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {LAYOUT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-300 text-left transition flex flex-col justify-between space-y-2 cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{preset.icon}</span>
                <span className="font-bold text-xs text-slate-900 group-hover:text-red-700 transition">
                  {preset.name.split('(')[0]}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                {preset.description}
              </p>
              <span className="text-[9px] font-black text-red-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 self-start">
                लागू करा &rarr;
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SPLIT SCREEN CANVAS: DRAG & DROP LIST (LEFT) & LIVE MULTI-DEVICE PREVIEW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: DRAGGABLE SECTIONS LIST */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="विभाग नाव किंवा कीवर्डने शोधा..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white"
              />
            </div>
            <span className="text-xs font-bold text-slate-500 shrink-0">
              एकूण: {filteredSections.length} विभाग
            </span>
          </div>

          {/* Draggable Blocks Container */}
          <div className="space-y-2.5">
            {filteredSections.map((section, idx) => {
              const isDragging = draggedIndex === idx;
              const isOver = dragOverIndex === idx;

              return (
                <div
                  key={section.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-2xl border p-3.5 transition-all select-none shadow-xs flex items-center justify-between gap-3 ${
                    isDragging
                      ? 'opacity-40 scale-95 border-red-400'
                      : isOver
                      ? 'border-red-500 bg-red-50/50 shadow-md translate-y-0.5'
                      : section.isVisible
                      ? 'border-slate-200 hover:border-slate-300'
                      : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  {/* Left: Drag Handle & Order Badge */}
                  <div className="flex items-center gap-2.5">
                    <div className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="w-7 h-7 rounded-xl bg-slate-100 font-mono font-black text-xs text-slate-700 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>

                    <div className="text-lg shrink-0">{section.icon}</div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {section.customTitleMr || section.nameMr}
                        </span>
                        {section.badge && (
                          <span className="rounded bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.2 shrink-0">
                            {section.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs sm:max-w-sm">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions (Up, Down, Settings ⚙️, Visibility) */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveUp(section.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                      title="वर घ्या"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Down */}
                    <button
                      type="button"
                      disabled={idx === filteredSections.length - 1}
                      onClick={() => handleMoveDown(section.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                      title="खाली घ्या"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* Block Settings ⚙️ */}
                    <button
                      type="button"
                      onClick={() => handleOpenSettings(section)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition"
                      title="ब्लॉक सेटिंग्ज सानुकूलित करा"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(section.id)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        section.isVisible
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-slate-400 hover:bg-slate-200'
                      }`}
                      title={section.isVisible ? 'हा विभाग लपवा' : 'हा विभाग दाखवा'}
                    >
                      {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: MULTI-DEVICE LIVE MINI-PREVIEW CANVAS */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-black">थेट होमपेज व्हिज्युअल प्रिव्ह्यू (Live Canvas)</span>
              </div>

              {/* Device Selector */}
              <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('DESKTOP')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                    previewDevice === 'DESKTOP' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDevice('TABLET')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                    previewDevice === 'TABLET' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDevice('MOBILE')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                    previewDevice === 'MOBILE' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Canvas Mockup Frame */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-[620px] overflow-y-auto flex justify-center">
              <div
                className={`w-full bg-slate-100 text-slate-900 rounded-lg shadow-inner overflow-hidden transition-all duration-300 ${
                  previewDevice === 'MOBILE'
                    ? 'max-w-[340px]'
                    : previewDevice === 'TABLET'
                    ? 'max-w-[520px]'
                    : 'max-w-full'
                }`}
              >
                {/* Mockup Header */}
                <div className="bg-red-600 text-white p-2 text-center text-[10px] font-black uppercase tracking-wider flex items-center justify-between px-3">
                  <span>InfoNewsUpdate24</span>
                  <span className="text-[8px] bg-red-800 px-1.5 py-0.5 rounded">LIVE PREVIEW</span>
                </div>

                {/* Mockup Ordered Sections Flow */}
                <div className="p-2 space-y-2 text-[10px]">
                  {sections
                    .filter((s) => s.isVisible)
                    .map((s, i) => (
                      <div
                        key={s.id}
                        className="bg-white p-2.5 rounded-lg border border-slate-300 shadow-2xs space-y-1 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <span>{s.icon}</span>
                            <span>{s.customTitleMr || s.nameMr}</span>
                          </span>
                          <span className="text-[8px] font-mono text-slate-400">#{i + 1}</span>
                        </div>

                        {/* Skeleton Graphic based on Section Type */}
                        {s.id === 'HERO_SHOWCASE' && (
                          <div className="grid grid-cols-3 gap-1 pt-1">
                            <div className="col-span-2 h-16 bg-red-100 rounded flex items-center justify-center font-bold text-[9px] text-red-800">
                              🔥 १ मोठी लीड बातमी
                            </div>
                            <div className="space-y-1">
                              <div className="h-7 bg-slate-100 rounded" />
                              <div className="h-7 bg-slate-100 rounded" />
                            </div>
                          </div>
                        )}

                        {s.id === 'WEB_STORIES' && (
                          <div className="flex gap-1 pt-1 overflow-x-auto">
                            {[1, 2, 3, 4].map((n) => (
                              <div key={n} className="w-10 h-14 bg-purple-100 rounded flex items-end p-0.5 text-[7px] text-purple-900 shrink-0 font-bold">
                                9:16
                              </div>
                            ))}
                          </div>
                        )}

                        {s.id === 'LIVE_BLOG' && (
                          <div className="p-1 bg-red-50 rounded border border-red-200 text-red-800 font-bold text-[8px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                            <span>थेट वार्तांकन: मिनिटागणिक अपडेट्स</span>
                          </div>
                        )}

                        {s.id === 'MAIN_EDITORIAL_GRID' && (
                          <div className="grid grid-cols-3 gap-1 pt-1">
                            <div className="col-span-2 h-12 bg-slate-100 rounded flex items-center justify-center text-[8px] text-slate-500 font-bold">
                              ८: बातमी प्रवाह
                            </div>
                            <div className="h-12 bg-amber-50 rounded flex items-center justify-center text-[8px] text-amber-800 font-bold">
                              ४: साइडबार
                            </div>
                          </div>
                        )}

                        {s.id === 'DAILY_PANCHANG' && (
                          <div className="h-8 bg-amber-100 rounded flex items-center justify-center text-[8px] text-amber-900 font-bold">
                            ☀️ पंचांग, तिथी, नक्षत्र व १२ राशीभविष्य
                          </div>
                        )}

                        {s.id === 'KRISHI_MANDI_RATES' && (
                          <div className="h-8 bg-emerald-100 rounded flex items-center justify-center text-[8px] text-emerald-900 font-bold">
                            🌾 कृषी बाजारभाव व सराफ दर
                          </div>
                        )}

                        {s.id === 'LIVE_WEATHER' && (
                          <div className="h-8 bg-sky-100 rounded flex items-center justify-center text-[8px] text-sky-900 font-bold">
                            ⛅ १२ तालुके हवामान व पाऊस रडार
                          </div>
                        )}

                        {s.id === 'SOCIAL_MEDIA_REELS' && (
                          <div className="h-8 bg-pink-100 rounded flex items-center justify-center text-[8px] text-pink-900 font-bold">
                            🎥 Reels, Shorts व व्हिडिओ कट्टा
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCK-LEVEL CUSTOMIZATION MODAL (⚙️ SETTINGS DRAWER) */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{editingSection.icon}</span>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    {editingSection.nameMr}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">{editingSection.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBlockSettings} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  मराठी सानुकूल शीर्षक (Custom Section Title)
                </label>
                <input
                  type="text"
                  value={modalCustomTitle}
                  onChange={(e) => setModalCustomTitle(e.target.value)}
                  placeholder="उदा. विदर्भ व गडचिरोली विशेष घडामोडी"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-bold focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    बातम्यांची संख्या (Post Count)
                  </label>
                  <select
                    value={modalPostCount}
                    onChange={(e) => setModalPostCount(Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-bold text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                  >
                    <option value={4}>४ बातम्या</option>
                    <option value={6}>६ बातम्या (Standard)</option>
                    <option value={8}>८ बातम्या</option>
                    <option value={12}>१२ बातम्या (Mega)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ग्रिड मांडणी स्टाईल (Style)
                  </label>
                  <select
                    value={modalDisplayStyle}
                    onChange={(e) => setModalDisplayStyle(e.target.value as any)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-bold text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                  >
                    <option value="GRID">४-कॉलम ग्रिड (Grid)</option>
                    <option value="LIST">यादी मांडणी (List View)</option>
                    <option value="CAROUSEL">स्लायडर (Carousel)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  डिव्हाइस टार्गेटिंग (Device Target)
                </label>
                <select
                  value={modalDeviceVisibility}
                  onChange={(e) => setModalDeviceVisibility(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-bold text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                >
                  <option value="ALL">सर्व डिव्हाइसेसवर दाखवा (Desktop & Mobile)</option>
                  <option value="MOBILE_ONLY">फक्त मोबाईलवर दाखवा (Mobile Only)</option>
                  <option value="DESKTOP_ONLY">फक्त कॉम्प्युटरवर दाखवा (Desktop Only)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black shadow-md cursor-pointer"
                >
                  बदल सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
