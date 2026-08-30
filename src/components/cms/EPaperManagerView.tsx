import React, { useState } from 'react';
import { EPaperEdition, EPaperSettings } from '../../types';
import { EPAPER_DISTRICTS, INITIAL_EPAPER_EDITIONS, DEFAULT_EPAPER_SETTINGS } from '../../data/epaperSeedData';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Check,
  Download,
  Eye,
  FilePlus,
  FileText,
  Layers,
  MapPin,
  Newspaper,
  Plus,
  Scissors,
  Share2,
  Trash2,
  Upload,
  Settings,
  Image as ImageIcon,
  Sun,
  Volume2,
  Phone,
  Tag,
  Save,
  RotateCcw,
  Sparkles,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { EPaperSyncService } from '../../services/EPaperSyncService';

export const EPaperManagerView: React.FC = () => {
  const { posts, categories, ads, epaperSettings, updateEPaperSettings } = useApp();

  const [activeTab, setActiveTab] = useState<'editions' | 'settings' | 'analytics'>('editions');
  const [editions, setEditions] = useState<EPaperEdition[]>(INITIAL_EPAPER_EDITIONS);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newEditionDate, setNewEditionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newEditionDistrict, setNewEditionDistrict] = useState('gadchiroli');
  const [totalPagesInput, setTotalPagesInput] = useState(6);
  const [toastMsg, setToastMsg] = useState('');

  // Local state for Settings form
  const [formData, setFormData] = useState<EPaperSettings>(epaperSettings);

  const handleAutoPopulateAllEditions = () => {
    const todayIso = new Date().toISOString().split('T')[0];
    const targetDistricts = ['gadchiroli', 'nagpur', 'chandrapur', 'pune', 'mumbai', 'nashik', 'sambhajinagar'];
    const generatedEditions: EPaperEdition[] = targetDistricts.map((distCode) => {
      return EPaperSyncService.generateDynamicEdition(
        posts,
        distCode,
        todayIso,
        categories,
        ads
      );
    });

    setEditions(generatedEditions);
    const pubCount = posts.filter((p) => p.status === 'PUBLISHED' || !p.status).length;
    setToastMsg(`✅ सर्व ७ जिल्ह्यांचे आजचे ई-पेपर अंक ${pubCount} प्रकाशित बातम्यांमधून आपोआप तयार झाले!`);
    setTimeout(() => setToastMsg(''), 5000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateEPaperSettings(formData);
    setToastMsg('✅ ई-पेपर सेटिंग्ज यशस्वीरीत्या सेव्ह झाल्या!');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleToggleDistrict = (distCode: string) => {
    const currentList = formData.enabledDistricts || [];
    const updated = currentList.includes(distCode)
      ? currentList.filter((c) => c !== distCode)
      : [...currentList, distCode];
    setFormData({ ...formData, enabledDistricts: updated });
  };

  const handleUploadNewEdition = (e: React.FormEvent) => {
    e.preventDefault();
    const distObj = EPAPER_DISTRICTS.find((d) => d.code === newEditionDistrict);
    const newEd: EPaperEdition = {
      id: `epaper-${newEditionDistrict}-${Date.now()}`,
      editionCode: newEditionDistrict,
      districtName: distObj?.name || 'विशेष आवृत्ती',
      date: newEditionDate,
      formattedDateMarathi: 'शनिवार, २९ ऑगस्ट २०२६',
      totalPages: totalPagesInput,
      coverImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
      pages: Array.from({ length: totalPagesInput }, (_, i) => ({
        id: `page-${i + 1}-${Date.now()}`,
        pageNumber: i + 1,
        title: `पान ${i + 1} (${i === 0 ? 'मुख्य पान' : i === 1 ? 'महाराष्ट्र' : 'जिल्हा विशेष'})`,
        pageType: i === 0 ? 'main' : 'district',
        imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80',
        articles: [
          {
            id: `art-auto-${i + 1}`,
            pageNumber: i + 1,
            title: `${distObj?.name} मधील ठळक घडामोडी व विकासकामे`,
            category: 'स्थानिक विशेष',
            headline: `🔴 ${distObj?.name}: महत्त्वाच्या प्रकल्पांना मंजुरी; सविस्तर बातमी`,
            summary: 'जिल्ह्यातील विकासाला गती देण्यासाठी नवीन योजनांची अंमलबजावणी सुरू झाली आहे.',
            authorName: 'जिल्हा प्रतिनिधी',
            location: distObj?.name.replace(' आवृत्ती', ''),
            image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
            bounds: { x: 5, y: 10, width: 90, height: 75 },
          },
        ],
      })),
    };

    setEditions([newEd, ...editions]);
    setIsUploadModalOpen(false);
    setToastMsg(`✅ ${distObj?.name} चा नवीन ई-पेपर यशस्वीरीत्या पब्लिश झाला!`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleDeleteEdition = (id: string) => {
    if (confirm('हा ई-पेपर अंक हटवायचा आहे का?')) {
      setEditions(editions.filter((e) => e.id !== id));
      setToastMsg('ई-पेपर अंक हटवला गेला.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-red-100 px-2.5 py-0.5 text-[11px] font-black text-red-700 uppercase tracking-wider">
              Newspaper Suite Pro
            </span>
            <span className="text-xs font-bold text-slate-500">v3.5 Live CMS Edition</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            डिजिटल ई-पेपर व्यवस्थापन (E-Paper Hub Manager)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ई-पेपरच्या आवृत्त्या, मास्टहेड, डिझाईन पर्याय, व्हॉट्सॲप क्लिपर आणि जाहिरातींचे संपूर्ण नियंत्रण.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'editions' && (
            <>
              <button
                type="button"
                onClick={handleAutoPopulateAllEditions}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-200 transition-all cursor-pointer"
                title="सर्व ७ जिल्ह्यांचे आजचे ई-पेपर अंक प्रकाशित बातम्यांमधून एका सेकंदात आपोआप तयार करा"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>⚡ १-क्लिक ऑटो-पॉप्युलेट (Auto-Populate from News)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-200 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>नवीन ई-पेपर अंक अपलोड करा</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('editions')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'editions'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Newspaper className="h-4 w-4" />
          <span>अंक व पाने व्यवस्थापन (Editions & Pages)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFormData(epaperSettings);
            setActiveTab('settings');
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>ई-पेपर संपूर्ण सेटिंग्ज (E-Paper Settings)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>वाचक व क्लिपिंग ॲनालिटिक्स (Analytics)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EDITIONS & PAGES MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'editions' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  सक्रिय आवृत्त्या
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 font-bold">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {formData.enabledDistricts?.length || EPAPER_DISTRICTS.length}
              </p>
              <span className="text-[11px] font-medium text-emerald-600">
                पुणे, मुंबई, नागपूर, नाशिक सह ७ जिल्हे
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  एकूण ई-पेपर वाचक
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                  <Eye className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">४२,८५०</p>
              <span className="text-[11px] font-medium text-blue-600">आजचे सक्रिय डिजिटल वाचक</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  WhatsApp बातमी क्लिप्स
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                  <Scissors className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">६,४२०</p>
              <span className="text-[11px] font-medium text-emerald-600">
                वाचकांनी क्रॉप करून शेअर केल्या
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  PDF डाऊनलोड्स
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">
                  <Download className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">३,१९०</p>
              <span className="text-[11px] font-medium text-amber-600">संपूर्ण आवृत्ती डाऊनलोड</span>
            </div>
          </div>

          {/* District Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setSelectedDistrict('all')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                selectedDistrict === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              सर्व आवृत्त्या
            </button>
            {EPAPER_DISTRICTS.map((d) => (
              <button
                key={d.code}
                type="button"
                onClick={() => setSelectedDistrict(d.code)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  selectedDistrict === d.code
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          {/* Editions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {editions
              .filter((ed) => selectedDistrict === 'all' || ed.editionCode === selectedDistrict)
              .map((ed) => (
                <div
                  key={ed.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Header Cover */}
                    <div className="h-44 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                      <img
                        src={ed.coverImage}
                        alt={ed.districtName}
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                        <span className="rounded bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 w-max mb-1">
                          {ed.districtName}
                        </span>
                        <h3 className="text-white font-bold text-base leading-snug">
                          {ed.formattedDateMarathi}
                        </h3>
                      </div>
                    </div>

                    {/* Info details */}
                    <div className="p-4 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-red-500" />
                          एकूण पाने: <strong>{ed.totalPages} Pages</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          दिनांक: <strong>{ed.date}</strong>
                        </span>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-2.5 text-slate-700">
                        <span className="font-bold block mb-1">प्रमुख पानांचे स्वरूप:</span>
                        <div className="flex flex-wrap gap-1">
                          {ed.pages.slice(0, 4).map((p) => (
                            <span
                              key={p.id}
                              className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600"
                            >
                              पान {p.pageNumber}: {p.title.split('(')[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="border-t border-slate-100 p-3 bg-slate-50 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="h-3 w-3" /> प्रकाशित (Live Auto-Sync)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteEdition(ed.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="अंक हटवा"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPREHENSIVE E-PAPER SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Section 1: Masthead & Branding */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-red-600" />
                <span>१. मास्टहेड व ब्रँडिंग सेटिंग्ज (Masthead & Header Settings)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ई-पेपरच्या शीर्षस्थानी दिसणारे नाव, घोषवाक्य, RNI क्रमांक आणि वृत्तपत्र तपशील.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">वृत्तपत्राचे नाव (Newspaper Name):</label>
                <input
                  type="text"
                  value={formData.newspaperName}
                  onChange={(e) => setFormData({ ...formData, newspaperName: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">RNI नोंदणी क्रमांक (RNI Registration No.):</label>
                <input
                  type="text"
                  value={formData.rniNumber}
                  onChange={(e) => setFormData({ ...formData, rniNumber: e.target.value })}
                  placeholder="RNI No. MAHMAR/2026/89412"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-bold text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">घोषवाक्य / टॅगलाईन (Tagline):</label>
                <input
                  type="text"
                  value={formData.newspaperTagline}
                  onChange={(e) => setFormData({ ...formData, newspaperTagline: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Visual Layout & Features Toggles */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span>२. डिझाईन व लेआऊट पर्याय (Visual Layout & Features)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ई-पेपरमधील इमेजेस, हवामान विजेट, ड्रॉप-कॅप्स आणि ऑटो-सिंक नियंत्रण.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Featured Images */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900">फिचर्ड इमेजेस दाखवा (Show Featured Photos)</h4>
                  <p className="text-[11px] text-slate-500">बातमीचा खरा फोटो ई-पेपरमध्ये दाखवा</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showFeaturedImages}
                  onChange={(e) => setFormData({ ...formData, showFeaturedImages: e.target.checked })}
                  className="h-5 w-5 text-red-600 rounded cursor-pointer"
                />
              </div>

              {/* Weather Widget */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900">हवामान व तापमान विजेट (Weather Widget)</h4>
                  <p className="text-[11px] text-slate-500">मास्टहेडमध्ये तापमान दाखवा</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showWeatherWidget}
                  onChange={(e) => setFormData({ ...formData, showWeatherWidget: e.target.checked })}
                  className="h-5 w-5 text-red-600 rounded cursor-pointer"
                />
              </div>

              {/* Drop-Cap Typography */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900">ड्रॉप-कॅप अक्षर (Drop-Cap Typography)</h4>
                  <p className="text-[11px] text-slate-500">मुख्य बातमीचे पहिले अक्षर मोठे दाखवा</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableDropCap}
                  onChange={(e) => setFormData({ ...formData, enableDropCap: e.target.checked })}
                  className="h-5 w-5 text-red-600 rounded cursor-pointer"
                />
              </div>

              {/* Auto Sync with Posts */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900">CMS बातम्या ऑटो-सिंक (Live Post Sync)</h4>
                  <p className="text-[11px] text-slate-500">वेबसाईटवरील पोस्ट्स आपोआप ई-पेपरमध्ये येतील</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoSyncWithPosts}
                  onChange={(e) => setFormData({ ...formData, autoSyncWithPosts: e.target.checked })}
                  className="h-5 w-5 text-red-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: WhatsApp Clipping & Sponsorship Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-emerald-600" />
                <span>३. व्हॉट्सॲप क्लिपर व वॉटरमार्क सेटिंग्ज (WhatsApp Clip & Watermark)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                वाचकांनी बातमी क्रॉप केल्यावर फोटोवर येणारे प्रायोजक नाव, वॉटरमार्क आणि ऑडिओ बटण.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">क्लिप वॉटरमार्क मजकूर (Watermark Text):</label>
                <input
                  type="text"
                  value={formData.watermarkText}
                  onChange={(e) => setFormData({ ...formData, watermarkText: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">क्लिपवरील प्रायोजक ब्रँड पट्टी (Sponsor Text):</label>
                <input
                  type="text"
                  value={formData.clipSponsorText}
                  onChange={(e) => setFormData({ ...formData, clipSponsorText: e.target.value })}
                  placeholder="📢 प्रायोजक: InfoNewsUpdate24 विशेष वृत्तसेवा"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              {/* Audio on clip */}
              <div className="md:col-span-2 flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900">क्लिपमध्ये AI व्हॉईस प्लेयर दाखवा (AI Audio Player)</h4>
                  <p className="text-[11px] text-slate-500">वाचकांना क्लिप केलेल्या बातमीचा ऑडिओ ऐकण्याची सोय द्या</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableAudioOnClip}
                  onChange={(e) => setFormData({ ...formData, enableAudioOnClip: e.target.checked })}
                  className="h-5 w-5 text-red-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Active Districts Manager */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <span>४. सक्रिय जिल्हा आवृत्त्या (Active Districts Manager)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                वाचकांना पोर्टलवर ज्या जिल्ह्यांचे ई-पेपर दाखवायचे आहेत ते जिल्हे निवडा.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {EPAPER_DISTRICTS.map((dist) => {
                const isChecked = formData.enabledDistricts?.includes(dist.code);
                return (
                  <label
                    key={dist.code}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-red-500 bg-red-50 text-red-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleDistrict(dist.code)}
                      className="h-4 w-4 text-red-600 rounded cursor-pointer"
                    />
                    <span>{dist.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 5: Header Ad & Contact Mobile Number Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-600" />
                <span>५. हेडर जाहिरात व संपर्क मोबाईल नंबर (Header Ad & Contact Mobile Number)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ई-पेपरच्या हेडरवरील Solus जाहिरात पट्टी आणि जाहिरात बुकिंगसाठी तुमचा खरा मोबाईल / WhatsApp नंबर टाका.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  📞 जाहिरात संपर्क मोबाईल / WhatsApp नंबर (Contact Mobile Number) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">📲</span>
                  <input
                    type="text"
                    value={formData.adContactNumber || ''}
                    onChange={(e) => setFormData({ ...formData, adContactNumber: e.target.value })}
                    placeholder="उदा. 9822XXXXXX किंवा +91 9822XXXXXX"
                    className="w-full rounded-xl border border-slate-300 pl-9 p-2.5 font-mono font-bold text-slate-900 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  वाचकांनी हेडरवरील नंबरवर क्लिक केल्यास थेट कॉल किंवा WhatsApp चॅट ओपन होईल.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  टॉप Solus जाहिरात मथळा (Top Header Solus Ad Text):
                </label>
                <input
                  type="text"
                  value={formData.topSolusAdText || ''}
                  onChange={(e) => setFormData({ ...formData, topSolusAdText: e.target.value })}
                  placeholder="उदा. 📢 विशेष जाहिरातीसाठी येथे संपर्क साधा!"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  बॉटम प्रायोजित जाहिरात पट्टी (Bottom Strip Ad Text):
                </label>
                <input
                  type="text"
                  value={formData.bottomStripAdText || ''}
                  onChange={(e) => setFormData({ ...formData, bottomStripAdText: e.target.value })}
                  placeholder="उदा. 🏬 आपल्या ब्रँडची जाहिरात InfoNewsUpdate24 च्या लोकप्रिय डिजिटल ई-पेपरमध्ये द्या!"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl">
            <button
              type="button"
              onClick={() => setFormData(DEFAULT_EPAPER_SETTINGS)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>डिफॉल्ट रिसेट</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-200 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>ई-पेपर सेटिंग्ज सेव्ह करा (Save Settings)</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LIVE ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span>ई-पेपर वाचक व सोशल क्लिपिंग कामगिरी (Telemetry & Virality)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <span className="text-slate-500 font-bold block mb-1">सर्वाधिक वाचली जाणारी आवृत्ती</span>
                <p className="text-lg font-black text-slate-900">पुणे आवृत्ती (३८% वाचक)</p>
                <span className="text-[11px] text-emerald-600">दुसऱ्या क्रमांकावर मुंबई-ठाणे (२६%)</span>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <span className="text-slate-500 font-bold block mb-1">सरासरी वाचन वेळ (Avg Read Time)</span>
                <p className="text-lg font-black text-slate-900">६ मिनिटे ४० सेकंद</p>
                <span className="text-[11px] text-blue-600">पारंपरिक न्यूजपेक्षा ३ पट जास्त</span>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <span className="text-slate-500 font-bold block mb-1">क्लिप शेअरिंग दर (Clip Virality)</span>
                <p className="text-lg font-black text-slate-900">१४.८% वाचक</p>
                <span className="text-[11px] text-emerald-600">दररोज सरासरी ६,०००+ शेअर्स</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Edition Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-red-600" />
                <span>नवीन ई-पेपर आवृत्ती अपलोड करा</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadNewEdition} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">जिल्हा आवृत्ती निवडा:</label>
                <select
                  value={newEditionDistrict}
                  onChange={(e) => setNewEditionDistrict(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-800 focus:border-red-500 focus:outline-hidden"
                >
                  {EPAPER_DISTRICTS.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">अंकाचा दिनांक:</label>
                <input
                  type="date"
                  value={newEditionDate}
                  onChange={(e) => setNewEditionDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">एकूण पानांची संख्या:</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={totalPagesInput}
                  onChange={(e) => setTotalPagesInput(parseInt(e.target.value) || 6)}
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center bg-slate-50 space-y-2">
                <Upload className="h-8 w-8 text-red-500 mx-auto" />
                <p className="font-bold text-slate-700">ई-पेपर PDF किंवा हाय-रिझोल्युशन इमेजेस येथे ड्रॅग करा</p>
                <span className="text-[11px] text-slate-400 block">
                  (PDF, JPG, PNG फाईल्स - स्वयंचलित पाने तयार केली जातील)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-5 py-2 text-white font-bold hover:bg-red-700 shadow-md cursor-pointer"
                >
                  पब्लिश करा (Publish E-Paper)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-bold shadow-xl animate-slideUp">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
