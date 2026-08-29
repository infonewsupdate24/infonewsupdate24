import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Save,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  Check,
  Search,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  Sliders,
  Eye,
  FileText,
  User,
  Palette,
  PhoneCall,
  ShieldCheck,
  Trees,
  Waves,
  Crown,
  LayoutGrid,
} from 'lucide-react';
import {
  GadchiroliSpotlightService,
  GadchiroliSpotlightSettings,
  SpotlightThemeStyle,
} from '../../services/GadchiroliSpotlightService';
import {
  SpotlightStoryItem,
  SpotlightTalukaItem,
} from '../../data/gadchiroliSpotlightData';

export const GadchiroliSpotlightManagerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STORIES' | 'TALUKAS' | 'APPEARANCE'>('STORIES');
  const [settings, setSettings] = useState<GadchiroliSpotlightSettings>(() =>
    GadchiroliSpotlightService.getSettings()
  );
  const [talukas, setTalukas] = useState<SpotlightTalukaItem[]>(() =>
    GadchiroliSpotlightService.getTalukas()
  );
  const [stories, setStories] = useState<SpotlightStoryItem[]>(() =>
    GadchiroliSpotlightService.getStories()
  );
  const [selectedTalukaFilter, setSelectedTalukaFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Story Editor Modal State
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [editingStory, setEditingStory] = useState<SpotlightStoryItem | null>(null);

  // Form fields for Story
  const [formTalukaId, setFormTalukaId] = useState<string>('gadchiroli');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formExcerpt, setFormExcerpt] = useState<string>('');
  const [formFullBody, setFormFullBody] = useState<string>('');
  const [formImage, setFormImage] = useState<string>('');
  const [formAuthor, setFormAuthor] = useState<string>('स्थानिक वार्ताहर');
  const [formTime, setFormTime] = useState<string>('१० मिनिटांपूर्वी');

  // Taluka Editor Modal State
  const [isTalukaModalOpen, setIsTalukaModalOpen] = useState<boolean>(false);
  const [editingTaluka, setEditingTaluka] = useState<SpotlightTalukaItem | null>(null);
  const [talukaName, setTalukaName] = useState<string>('');
  const [talukaIcon, setTalukaIcon] = useState<string>('📍');
  const [talukaTahsil, setTalukaTahsil] = useState<string>('');
  const [talukaPolice, setTalukaPolice] = useState<string>('');
  const [talukaHospital, setTalukaHospital] = useState<string>('');
  const [talukaMseb, setTalukaMseb] = useState<string>('');

  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      const matchTaluka =
        selectedTalukaFilter === 'ALL' || s.talukaId === selectedTalukaFilter;
      const matchSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.taluka.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTaluka && matchSearch;
    });
  }, [stories, selectedTalukaFilter, searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    GadchiroliSpotlightService.saveSettings(settings);
    showToast('✅ स्पॉटलाईट सेटिंग्ज व थीम यशस्वीरीत्या सेव्ह झाली!');
  };

  // STORY ACTIONS
  const handleOpenAddStoryModal = () => {
    setEditingStory(null);
    setFormTalukaId(talukas[1]?.id || 'gadchiroli');
    setFormTitle('');
    setFormExcerpt('');
    setFormFullBody('');
    setFormImage('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80');
    setFormAuthor('स्थानिक वार्ताहर');
    setFormTime('आत्ताच');
    setIsEditorModalOpen(true);
  };

  const handleOpenEditStoryModal = (story: SpotlightStoryItem) => {
    setEditingStory(story);
    setFormTalukaId(story.talukaId);
    setFormTitle(story.title);
    setFormExcerpt(story.excerpt);
    setFormFullBody(story.fullBody || story.excerpt);
    setFormImage(story.image);
    setFormAuthor(story.author);
    setFormTime(story.time);
    setIsEditorModalOpen(true);
  };

  const handleSaveStoryForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('कृपया बातमीचा मथळा भरा.');
      return;
    }

    const talukaObj =
      talukas.find((t) => t.id === formTalukaId) || talukas[1] || { id: 'gadchiroli', name: 'गडचिरोली', icon: '📍' };

    const slug =
      editingStory?.slug ||
      `${formTalukaId}-${Date.now()}`;

    const storyData: SpotlightStoryItem = {
      id: editingStory?.id || `spotlight-${formTalukaId}-${Date.now()}`,
      slug,
      taluka: talukaObj.name.replace(' शहर', ''),
      talukaId: formTalukaId,
      title: formTitle,
      excerpt: formExcerpt,
      fullBody: formFullBody,
      image: formImage || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
      time: formTime || '१० मिनिटांपूर्वी',
      author: formAuthor || 'InfoNews वार्ताहर',
    };

    if (editingStory) {
      GadchiroliSpotlightService.updateStory(storyData);
      showToast(`✅ ${storyData.taluka} तालुक्याची बातमी अपडेट झाली!`);
    } else {
      GadchiroliSpotlightService.addStory(storyData);
      showToast(`✅ नवीन तालुका बातमी जोडली गेली!`);
    }

    setStories(GadchiroliSpotlightService.getStories());
    setIsEditorModalOpen(false);
  };

  const handleDeleteStory = (id: string, taluka: string) => {
    if (confirm(`तुम्हाला खात्री आहे की '${taluka}' ची ही बातमी काढून टाकायची आहे?`)) {
      GadchiroliSpotlightService.deleteStory(id);
      setStories(GadchiroliSpotlightService.getStories());
      showToast('🗑️ बातमी काढून टाकली.');
    }
  };

  // TALUKA MASTER ACTIONS
  const handleOpenAddTalukaModal = () => {
    setEditingTaluka(null);
    setTalukaName('');
    setTalukaIcon('📍');
    setTalukaTahsil('०७१३२-२२२०५०');
    setTalukaPolice('०७१३२-२२२१००');
    setTalukaHospital('०७१३२-२२२०१२');
    setTalukaMseb('१९१२');
    setIsTalukaModalOpen(true);
  };

  const handleOpenEditTalukaModal = (t: SpotlightTalukaItem) => {
    setEditingTaluka(t);
    setTalukaName(t.name);
    setTalukaIcon(t.icon);
    setTalukaTahsil(t.helplines?.tahsil || '०७१३२-२२२०५०');
    setTalukaPolice(t.helplines?.police || '०७१३२-२२२१००');
    setTalukaHospital(t.helplines?.hospital || '०७१३२-२२२०१२');
    setTalukaMseb(t.helplines?.mseb || '१९१२');
    setIsTalukaModalOpen(true);
  };

  const handleSaveTalukaForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!talukaName.trim()) {
      alert('कृपया तालुक्याचे नाव भरा.');
      return;
    }

    const talukaId =
      editingTaluka?.id ||
      talukaName.toLowerCase().replace(/[^a-z0-9]/g, '-') ||
      `taluka-${Date.now()}`;

    const newTalukaObj: SpotlightTalukaItem = {
      id: talukaId,
      name: talukaName.trim(),
      icon: talukaIcon.trim() || '📍',
      helplines: {
        tahsil: talukaTahsil.trim() || '०७१३२-२२२०५०',
        police: talukaPolice.trim() || '०७१३२-२२२१००',
        hospital: talukaHospital.trim() || '०७१३२-२२२०१२',
        mseb: talukaMseb.trim() || '१९१२',
      },
    };

    if (editingTaluka) {
      GadchiroliSpotlightService.updateTaluka(newTalukaObj);
      showToast(`✅ ${newTalukaObj.name} तालुक्याची माहिती व हेल्पलाईन अपडेट झाली!`);
    } else {
      GadchiroliSpotlightService.addTaluka(newTalukaObj);
      showToast(`✅ नवीन तालुका जोडला गेला!`);
    }

    setTalukas(GadchiroliSpotlightService.getTalukas());
    setIsTalukaModalOpen(false);
  };

  const handleDeleteTaluka = (id: string, name: string) => {
    if (confirm(`तुम्हाला खात्री आहे की '${name}' हा तालुका काढून टाकायचा आहे?`)) {
      GadchiroliSpotlightService.deleteTaluka(id);
      setTalukas(GadchiroliSpotlightService.getTalukas());
      showToast('🗑️ तालुका काढून टाकला.');
    }
  };

  const handleResetDefaults = () => {
    if (confirm('सर्व तालुके, हेल्पलाईन व बातम्या मूळ डिफॉल्टवर रिसेट करायचे आहेत का?')) {
      GadchiroliSpotlightService.resetToDefault();
      setSettings(GadchiroliSpotlightService.getSettings());
      setTalukas(GadchiroliSpotlightService.getTalukas());
      setStories(GadchiroliSpotlightService.getStories());
      showToast('🔄 मूळ डिफॉल्ट डेटा पुनर्संचयित झाला.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-3 text-xs font-black shadow-2xl animate-slideUp">
          <Check className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-linear-to-r from-red-900 via-slate-900 to-amber-950 p-6 text-white shadow-xl border border-red-800/40">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-red-600 to-amber-500 text-white font-black shadow-lg">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight font-serif">
                गडचिरोली १२ तालुके स्पॉटलाईट संपूर्ण कस्टमायझेशन
              </h1>
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
                Full Custom Suite
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              १२ तालुक्यांच्या बातम्या, हेल्पलाईन दूरध्वनी क्रमांक, डिझाईन थीम व मुख्य सेटिंग्ज व्यवस्थापन
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 px-3.5 py-2 text-xs font-bold transition-all border border-slate-700 cursor-pointer self-start sm:self-auto"
          title="मूळ डिफॉल्टवर रिसेट करा"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>डिफॉल्ट रिसेट</span>
        </button>
      </div>

      {/* 3 Major Customization Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('STORIES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'STORIES'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>१२ तालुक्यांच्या बातम्या ({stories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TALUKAS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'TALUKAS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>तालुके व हेल्पलाईन क्रमांक ({talukas.length - 1})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('APPEARANCE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'APPEARANCE'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>थीम व स्वरूप कस्टमायझेशन</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 12 TALUKAS STORIES DESK */}
      {/* ========================================================================= */}
      {activeTab === 'STORIES' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-600" />
                <span>स्थानिक बातम्यांची सूची (Taluka News List)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                प्रत्येक तालुक्यासाठी स्वतंत्र ग्राउंड रिपोर्ट व सविस्तर वृत्तांत
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="बातमी किंवा तालुका शोधा..."
                  className="rounded-xl border border-slate-300 pl-9 pr-3 py-1.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-red-600 focus:outline-none w-52"
                />
              </div>

              <select
                value={selectedTalukaFilter}
                onChange={(e) => setSelectedTalukaFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">सर्व तालुके</option>
                {talukas.filter((t) => t.id !== 'all').map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleOpenAddStoryModal}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 text-xs font-black shadow-md transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>नवीन बातमी जोडा</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-2 left-2 rounded bg-slate-900/90 text-amber-300 text-[10px] font-black px-2 py-0.5 shadow-md">
                      📍 {story.taluka}
                    </span>
                    <span className="absolute bottom-2 right-2 rounded bg-black/70 text-white text-[9px] px-1.5 py-0.5">
                      {story.time}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-900 line-clamp-2 leading-snug font-serif">
                      {story.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mt-1 font-sans">
                      {story.excerpt}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-slate-500">
                    ✍️ {story.author}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditStoryModal(story)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                      title="संपादित करा"
                    >
                      <Edit className="h-3 w-3 text-blue-600" />
                      <span>बदला</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteStory(story.id, story.taluka)}
                      className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                      title="काढून टाका"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TALUKAS & HELPLINE MASTER MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'TALUKAS' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600" />
                <span>तालुका यादी व हेल्पलाईन क्रमांक (Talukas & Helplines Master Desk)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                येथून कोणत्याही तालुक्याचे नाव, चिन्ह व प्रशासकीय मदत कक्ष (तहसील, पोलीस, रुग्णालय) नंबर संपादित करा
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddTalukaModal}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 text-xs font-black shadow-md transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>नवीन तालुका / उपविभाग जोडा</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {talukas.filter((t) => t.id !== 'all').map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-black text-slate-900">
                      <span className="text-lg">{t.icon}</span>
                      <span>{t.name}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      ID: {t.id}
                    </span>
                  </div>

                  {/* Helplines Preview */}
                  <div className="rounded-xl bg-white p-3 border border-slate-200 space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-[11px]">🏛️ तहसील:</span>
                      <strong className="font-mono">{t.helplines?.tahsil || '—'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-[11px]">👮 पोलीस:</span>
                      <strong className="font-mono">{t.helplines?.police || '—'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-[11px]">🏥 रुग्णालय:</span>
                      <strong className="font-mono">{t.helplines?.hospital || '—'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-[11px]">⚡ महावितरण:</span>
                      <strong className="font-mono">{t.helplines?.mseb || '—'}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditTalukaModal(t)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5 text-blue-600" />
                    <span>संपादित करा</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTaluka(t.id, t.name)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                    title="काढून टाका"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: THEME & DISPLAY CUSTOMIZATION */}
      {/* ========================================================================= */}
      {activeTab === 'APPEARANCE' && (
        <form
          onSubmit={handleSaveSettings}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 uppercase">
              <Palette className="h-5 w-5 text-red-600" />
              <span>स्पॉटलाईट थीम व स्वरूप कस्टमायझेशन (Appearance & Theme Settings)</span>
            </h3>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, isEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-2 text-xs font-black text-slate-700">
                {settings.isEnabled ? 'विभागास सक्षम करा (Active)' : 'अक्षम (Disabled)'}
              </span>
            </label>
          </div>

          {/* Theme Style Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block uppercase">
              🎨 रंगसंगती व डिझाईन थीम निवडा (Theme Style):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Fiery Red */}
              <div
                onClick={() => setSettings({ ...settings, themeStyle: 'FIERY_RED' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  settings.themeStyle === 'FIERY_RED'
                    ? 'border-red-600 bg-red-50/70 ring-2 ring-red-400'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-linear-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center text-xs">
                    <Flame className="h-4 w-4" />
                  </div>
                  <strong className="text-xs text-slate-900">विदर्भ अग्नी (Fiery Red)</strong>
                </div>
                <p className="text-[11px] text-slate-500">
                  लाल व सुवर्ण शेड्स; ठळक ब्रेकिंग लुक.
                </p>
              </div>

              {/* Forest Green */}
              <div
                onClick={() => setSettings({ ...settings, themeStyle: 'FOREST_GREEN' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  settings.themeStyle === 'FOREST_GREEN'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-400'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xs">
                    <Trees className="h-4 w-4" />
                  </div>
                  <strong className="text-xs text-slate-900">गडचिरोली वनराई (Forest Emerald)</strong>
                </div>
                <p className="text-[11px] text-slate-500">
                  हिरवेगार निसर्ग व आदिवासी संस्कृती शेड.
                </p>
              </div>

              {/* Royal Blue */}
              <div
                onClick={() => setSettings({ ...settings, themeStyle: 'ROYAL_BLUE' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  settings.themeStyle === 'ROYAL_BLUE'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-400'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-linear-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-xs">
                    <Waves className="h-4 w-4" />
                  </div>
                  <strong className="text-xs text-slate-900">प्राणहिता-गोदावरी (Royal Blue)</strong>
                </div>
                <p className="text-[11px] text-slate-500">
                  नदीसंगम व जलप्रकल्प निळसर लुक.
                </p>
              </div>

              {/* Golden Obsidian */}
              <div
                onClick={() => setSettings({ ...settings, themeStyle: 'GOLDEN_OBSIDIAN' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  settings.themeStyle === 'GOLDEN_OBSIDIAN'
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-linear-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center text-xs">
                    <Crown className="h-4 w-4" />
                  </div>
                  <strong className="text-xs text-slate-900">शाही सुवर्ण (Imperial Gold)</strong>
                </div>
                <p className="text-[11px] text-slate-500">
                  सुवर्ण व काळा शाही ब्रॉडशीट लुक.
                </p>
              </div>
            </div>
          </div>

          {/* Titles & Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                मुख्य शीर्षक (Section Title)
              </label>
              <input
                type="text"
                value={settings.sectionTitle}
                onChange={(e) =>
                  setSettings({ ...settings, sectionTitle: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                उपशीर्षक / टॅगलाईन (Subtitle)
              </label>
              <input
                type="text"
                value={settings.sectionSubtitle}
                onChange={(e) =>
                  setSettings({ ...settings, sectionSubtitle: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                लाईव्ह बॅज मजकूर (Live Badge)
              </label>
              <input
                type="text"
                value={settings.highlightBadge}
                onChange={(e) =>
                  setSettings({ ...settings, highlightBadge: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showHelplineDesk}
                onChange={(e) =>
                  setSettings({ ...settings, showHelplineDesk: e.target.checked })
                }
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span>🏛️ प्रशासकीय मदत कक्ष (Helpline Desk) दाखवा</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showAudioButton}
                onChange={(e) =>
                  setSettings({ ...settings, showAudioButton: e.target.checked })
                }
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span>🎙️ AI व्हॉईस बातमी वाचक बटण दाखवा</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showWhatsAppShare}
                onChange={(e) =>
                  setSettings({ ...settings, showWhatsAppShare: e.target.checked })
                }
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span>📲 WhatsApp शेअर बटण दाखवा</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 text-xs font-black shadow-md cursor-pointer transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>सेटिंग्ज व थीम सेव्ह करा</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* STORY EDITOR MODAL */}
      {/* ========================================================================= */}
      {isEditorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white font-black shadow-md">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {editingStory ? `तालुका बातमी संपादित करा` : `नवीन तालुका बातमी जोडा`}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    गडचिरोली जिल्ह्यातील १२ तालुक्यांसाठी विशेष बातमी
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorModalOpen(false)}
                className="rounded-lg bg-slate-200 hover:bg-slate-300 p-1.5 text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStoryForm} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    तालुका निवडा (Select Taluka) *
                  </label>
                  <select
                    value={formTalukaId}
                    onChange={(e) => setFormTalukaId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
                    required
                  >
                    {talukas.filter((t) => t.id !== 'all').map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    बातमीदार / प्रतिनिधी (Reporter Name)
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="उदा. अहेरी विशेष वार्ताहर"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  बातमीचा मुख्य मथळा (Headline) *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="उदा. हेमलकसा व आलापल्ली परिसरात विशेष फिरते रुग्णालय सुरू..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none font-serif"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  संक्षिप्त सारांश (Excerpt) *
                </label>
                <textarea
                  rows={2}
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="होमपेज कार्डवर दिसणारा २ ओळींचा संक्षिप्त मजकूर..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-red-600 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  संपूर्ण सविस्तर बातमी मजकूर (Full Story Body)
                </label>
                <textarea
                  rows={5}
                  value={formFullBody}
                  onChange={(e) => setFormFullBody(e.target.value)}
                  placeholder="बातमीचा संपूर्ण सविस्तर वृत्तांत..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    फोटो URL (Image Link)
                  </label>
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    वेळ / टाइमस्टॅम्प (Time Label)
                  </label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="उदा. ३० मिनिटांपूर्वी, आज सकाळी"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditorModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  रद्द करा
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>बातमी सेव्ह करा</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TALUKA & HELPLINE MASTER MODAL */}
      {/* ========================================================================= */}
      {isTalukaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-md">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {editingTaluka ? `तालुका व हेल्पलाईन संपादित करा` : `नवीन तालुका जोडा`}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    नाव, चिन्ह आणि प्रशासकीय आपत्कालीन हेल्पलाईन क्रमांक
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTalukaModalOpen(false)}
                className="rounded-lg bg-slate-200 hover:bg-slate-300 p-1.5 text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTalukaForm} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    तालुक्याचे नाव *
                  </label>
                  <input
                    type="text"
                    value={talukaName}
                    onChange={(e) => setTalukaName(e.target.value)}
                    placeholder="उदा. चामोर्शी, अहेरी, भामरागड..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    चिन्ह / इमोजी
                  </label>
                  <input
                    type="text"
                    value={talukaIcon}
                    onChange={(e) => setTalukaIcon(e.target.value)}
                    placeholder="उदा. 📍, 🏛️, 🌾"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 text-center focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200">
                <span className="text-xs font-black text-slate-800 block">
                  📞 प्रशासकीय हेल्पलाईन दूरध्वनी क्रमांक (Helplines):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      🏛️ तहसील कार्यालय फोन
                    </label>
                    <input
                      type="text"
                      value={talukaTahsil}
                      onChange={(e) => setTalukaTahsil(e.target.value)}
                      placeholder="०७१३२-२२२०५०"
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      👮 पोलीस ठाणे फोन
                    </label>
                    <input
                      type="text"
                      value={talukaPolice}
                      onChange={(e) => setTalukaPolice(e.target.value)}
                      placeholder="०७१३२-२२२१००"
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      🏥 रुग्णालय / ॲम्ब्युलन्स
                    </label>
                    <input
                      type="text"
                      value={talukaHospital}
                      onChange={(e) => setTalukaHospital(e.target.value)}
                      placeholder="०७१३२-२२२०१२"
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      ⚡ महावितरण तक्रार क्रमांक
                    </label>
                    <input
                      type="text"
                      value={talukaMseb}
                      onChange={(e) => setTalukaMseb(e.target.value)}
                      placeholder="१९१२"
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTalukaModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  रद्द करा
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>तालुका सेव्ह करा</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
