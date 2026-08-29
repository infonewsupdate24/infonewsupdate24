import React, { useState } from 'react';
import {
  Percent,
  Plus,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  Globe,
  Sliders,
  DollarSign,
  TrendingUp,
  Eye,
  MousePointer,
  Sparkles,
  Layers,
  Smartphone,
  Monitor,
  ExternalLink,
  Download,
  AlertTriangle,
  RefreshCw,
  Info,
  Check,
  X,
  ShieldCheck,
  FileCode,
  Search,
  LayoutTemplate,
  ToggleLeft,
  ToggleRight,
  Radio,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdPosition, AdType, AdUnit } from '../../types';

export const AdvertisementManagerView: React.FC = () => {
  const {
    ads,
    addAd,
    updateAd,
    deleteAd,
    duplicateAd,
    resetAdStats,
    adSenseSettings,
    updateAdSenseSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'units' | 'adsense' | 'adstxt' | 'revenue' | 'wireframe'>('units');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State for Add / Edit Ad Unit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [modalFormData, setModalFormData] = useState<Partial<AdUnit>>({
    title: '',
    type: 'BANNER',
    position: 'HEADER',
    codeOrUrl: '',
    targetUrl: '',
    status: 'ACTIVE',
    priority: 1,
    deviceTargeting: 'ALL',
    adSizePreset: 'RESPONSIVE',
    sponsorName: '',
    sponsorBadge: true,
    openInNewTab: true,
    adSenseSlotId: '',
  });

  // Revenue Simulator State
  const [simMonthlyViews, setSimMonthlyViews] = useState(250000);
  const [simCpm, setSimCpm] = useState(adSenseSettings?.estimatedCpmInr || 65);
  const [simCtr, setSimCtr] = useState(2.5);
  const [simCpc, setSimCpc] = useState(4.5);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Metrics Calculations
  const totalImpressions = ads.reduce((acc, a) => acc + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.clicks || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const activeAdsCount = ads.filter((a) => a.status === 'ACTIVE').length;
  const estMonthlyEarningsInr = Math.round((totalImpressions / 1000) * (adSenseSettings?.estimatedCpmInr || 65));

  // Filtered Ads
  const filteredAds = ads.filter((ad) => {
    if (positionFilter !== 'ALL' && ad.position !== positionFilter) return false;
    if (typeFilter !== 'ALL' && ad.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ad.title.toLowerCase().includes(q) ||
        ad.position.toLowerCase().includes(q) ||
        (ad.sponsorName && ad.sponsorName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Open Modal for New Ad
  const handleOpenAddModal = (defaultPosition?: AdPosition) => {
    setEditingAdId(null);
    setModalFormData({
      title: '',
      type: 'BANNER',
      position: defaultPosition || 'HEADER',
      codeOrUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=970&h=90&auto=format&fit=crop&q=80',
      targetUrl: 'https://example.com',
      status: 'ACTIVE',
      priority: 1,
      deviceTargeting: 'ALL',
      adSizePreset: 'RESPONSIVE',
      sponsorName: '',
      sponsorBadge: true,
      openInNewTab: true,
      adSenseSlotId: '',
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit Ad
  const handleOpenEditModal = (ad: AdUnit) => {
    setEditingAdId(ad.id);
    setModalFormData({ ...ad });
    setIsModalOpen(true);
  };

  // Save Modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFormData.title?.trim()) {
      alert('कृपया जाहिरातीचे नाव (Title) प्रविष्ट करा.');
      return;
    }

    if (editingAdId) {
      updateAd(editingAdId, modalFormData);
      showToast(`'${modalFormData.title}' जाहिरात स्लॉट यशस्वीरित्या अपडेट करण्यात आला!`);
    } else {
      addAd({
        title: modalFormData.title.trim(),
        type: modalFormData.type || 'BANNER',
        position: modalFormData.position || 'HEADER',
        codeOrUrl: modalFormData.codeOrUrl?.trim() || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=970',
        targetUrl: modalFormData.targetUrl?.trim() || undefined,
        status: modalFormData.status || 'ACTIVE',
        priority: modalFormData.priority || 1,
        deviceTargeting: modalFormData.deviceTargeting || 'ALL',
        adSizePreset: modalFormData.adSizePreset,
        sponsorName: modalFormData.sponsorName?.trim() || undefined,
        sponsorBadge: modalFormData.sponsorBadge,
        openInNewTab: modalFormData.openInNewTab,
        adSenseSlotId: modalFormData.adSenseSlotId?.trim() || undefined,
      });
      showToast(`'${modalFormData.title}' नवीन जाहिरात स्लॉट यशस्वीरित्या जोडण्यात आला!`);
    }

    setIsModalOpen(false);
  };

  // Download ads.txt file
  const handleDownloadAdsTxt = () => {
    const blob = new Blob([adSenseSettings.adsTxtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ads.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('ads.txt फाईल डाउनलोड झाली!');
  };

  // Copy ads.txt
  const handleCopyAdsTxt = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(adSenseSettings.adsTxtContent);
      showToast('ads.txt मजकूर क्लिपबोर्डवर कॉपी केला!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. TOP HEADER & MAIN ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  जाहिरात व ॲडसेन्स व्यवस्थापक (Advertisement & AdSense Manager)
                </h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                  v2.5 PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Google AdSense, डायरेक्ट बॅनर जाहिराती, इन-आर्टिकल स्लॉट्स, ads.txt आणि महसूल ट्रॅकिंग.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadAdsTxt}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>ads.txt डाउनलोड</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>नवीन जाहिरात स्लॉट जोडा</span>
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME MONETIZATION METRICS BAR */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Metric 1: Active Slots */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">सक्रिय स्लॉट्स</span>
            <Layers className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {activeAdsCount} <span className="text-xs font-normal text-slate-400">/ {ads.length}</span>
          </p>
          <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
            <Check className="h-3 w-3" />
            <span>सर्व मुख्य पोझिशन्स सक्रिय</span>
          </p>
        </div>

        {/* Metric 2: Impressions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">एकूण इम्प्रेशन्स</span>
            <Eye className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {totalImpressions.toLocaleString()}
          </p>
          <p className="text-[10px] font-semibold text-slate-500">
            पोर्टलवरील एकूण डिस्प्ले व्ह्यूज
          </p>
        </div>

        {/* Metric 3: Total Clicks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">एकूण क्लिक्स् (Clicks)</span>
            <MousePointer className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {totalClicks.toLocaleString()}
          </p>
          <p className="text-[10px] font-semibold text-emerald-600">
            वाचकांचा सक्रिय प्रतिसाद
          </p>
        </div>

        {/* Metric 4: Avg CTR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">सरासरी CTR</span>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{avgCtr}%</p>
          <p className="text-[10px] font-semibold text-slate-500">
            Click-Through-Rate
          </p>
        </div>

        {/* Metric 5: Estimated Revenue */}
        <div className="rounded-2xl border border-red-200 bg-linear-to-br from-red-50 to-white p-4 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-red-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">अंदाजे मासिक कमाई</span>
            <DollarSign className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-red-600">
            ₹{estMonthlyEarningsInr.toLocaleString()}
          </p>
          <p className="text-[10px] font-semibold text-slate-500">
            CPM: ₹{adSenseSettings?.estimatedCpmInr || 65} / 1K Views
          </p>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2 text-xs font-bold">
        {[
          { id: 'units', label: '📌 जाहिरात स्लॉट्स व्यवस्थापन (Ad Units)', count: ads.length },
          { id: 'adsense', label: '🌐 Google AdSense & Auto Ads' },
          { id: 'adstxt', label: '📄 ads.txt व्यवस्थापक' },
          { id: 'revenue', label: '💰 कमाई व महसूल कॅल्क्युलेटर' },
          { id: 'wireframe', label: '🗺️ पोर्टल वायरफ्रेम व प्लेसमेंट मॅप' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AD UNITS & PLACEMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="जाहिरात किंवा स्लॉट शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-48 sm:w-60 rounded-lg border border-slate-200 pl-8 pr-2.5 text-xs text-slate-800 focus:border-red-600 focus:outline-hidden"
                />
              </div>

              {/* Position Filter */}
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">सर्व पोझिशन्स (All Positions)</option>
                <option value="HEADER">HEADER (टॉप हेडर)</option>
                <option value="BELOW_HEADER">BELOW_HEADER (हेडरखालील)</option>
                <option value="HOME_TOP">HOME_TOP (होमपेज टॉप)</option>
                <option value="HOME_MIDDLE">HOME_MIDDLE (फीडमधील बॅनर)</option>
                <option value="ARTICLE_TOP">ARTICLE_TOP (बातमीच्या सुरुवातीला)</option>
                <option value="ARTICLE_MIDDLE">ARTICLE_MIDDLE (बातमीच्या मध्यभागी)</option>
                <option value="ARTICLE_BOTTOM">ARTICLE_BOTTOM (बातमीच्या शेवटी)</option>
                <option value="SIDEBAR_TOP">SIDEBAR_TOP (साइडबार टॉप)</option>
                <option value="SIDEBAR_BOTTOM">SIDEBAR_BOTTOM (साइडबार स्टिकी)</option>
                <option value="FOOTER">FOOTER (फुटर बॅनर)</option>
                <option value="MOBILE_STICKY">MOBILE_STICKY (मोबाईल बॉटम स्टिकी)</option>
                <option value="EPAPER_HEADER">📰 EPAPER_HEADER (ई-पेपर टॉप बॅनर)</option>
                <option value="EPAPER_PAGE_BOTTOM">📰 EPAPER_PAGE_BOTTOM (ई-पेपर बॉटम पट्टी)</option>
                <option value="EPAPER_CLIP_SPONSOR">📰 EPAPER_CLIP_SPONSOR (व्हॉट्सॲप क्लिप स्पॉन्सर)</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">सर्व प्रकार (All Types)</option>
                <option value="ADSENSE">Google AdSense</option>
                <option value="BANNER">डायरेक्ट इमेज बॅनर (Banner)</option>
                <option value="SPONSORED">प्रायोजित / Sponsored Card</option>
                <option value="HTML">HTML / JavaScript Script</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              दाखवत आहे: <strong className="text-slate-900">{filteredAds.length}</strong> स्लॉट्स
            </div>
          </div>

          {/* Ad Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAds.map((ad) => {
              const ctr =
                ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
              const isActive = ad.status === 'ACTIVE';

              return (
                <div
                  key={ad.id}
                  className={`rounded-2xl border bg-white shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                    isActive
                      ? 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                      : 'border-slate-200 opacity-65 bg-slate-50'
                  }`}
                >
                  {/* Top Ad Card Header */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                            ad.type === 'ADSENSE'
                              ? 'bg-blue-100 text-blue-800'
                              : ad.type === 'SPONSORED'
                              ? 'bg-purple-100 text-purple-800'
                              : ad.type === 'BANNER'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ad.type}
                        </span>

                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600">
                          {ad.position}
                        </span>

                        {ad.deviceTargeting !== 'ALL' && (
                          <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 flex items-center gap-1">
                            {ad.deviceTargeting === 'MOBILE' ? (
                              <Smartphone className="h-2.5 w-2.5" />
                            ) : (
                              <Monitor className="h-2.5 w-2.5" />
                            )}
                            <span>{ad.deviceTargeting}</span>
                          </span>
                        )}
                      </div>

                      {/* Status Toggle Button */}
                      <button
                        type="button"
                        onClick={() =>
                          updateAd(ad.id, {
                            status: isActive ? 'PAUSED' : 'ACTIVE',
                          })
                        }
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/30 hover:bg-emerald-100'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {isActive ? '● चालू (Active)' : '○ बंद (Paused)'}
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                        {ad.title}
                      </h3>
                      {ad.sponsorName && (
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          प्रायोजक: <span className="font-bold text-slate-700">{ad.sponsorName}</span>
                        </p>
                      )}
                    </div>

                    {/* Visual Preview Slot Box */}
                    <div className="relative rounded-xl border border-slate-100 bg-slate-50 p-2 overflow-hidden max-h-32 flex items-center justify-center text-center">
                      {ad.type === 'BANNER' || ad.type === 'SPONSORED' ? (
                        <div className="relative w-full h-24 overflow-hidden rounded-lg">
                          <img
                            src={ad.codeOrUrl}
                            alt={ad.title}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                            Preview
                          </span>
                        </div>
                      ) : ad.type === 'ADSENSE' ? (
                        <div className="w-full py-4 px-2 border border-dashed border-blue-300 rounded-lg bg-blue-50/50 space-y-1">
                          <div className="flex items-center justify-center gap-1.5 text-blue-700 font-bold text-xs">
                            <Globe className="h-3.5 w-3.5" />
                            <span>Google AdSense Slot</span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-500">
                            Slot ID: {ad.adSenseSlotId || '5849201842'}
                          </p>
                        </div>
                      ) : (
                        <div className="w-full py-4 px-2 border border-dashed border-amber-300 rounded-lg bg-amber-50/50">
                          <span className="text-xs font-mono font-bold text-amber-800">
                            &lt;/&gt; Custom HTML / Script
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats Telemetry */}
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center text-[11px] border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Views</span>
                        <strong className="text-slate-800 font-mono">
                          {ad.impressions.toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Clicks</span>
                        <strong className="text-slate-800 font-mono">
                          {ad.clicks.toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">CTR</span>
                        <strong className="text-emerald-700 font-mono font-bold">{ctr}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(ad)}
                        className="p-1.5 rounded-md text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                        title="एडिट करा (Edit)"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          duplicateAd(ad.id);
                          showToast(`'${ad.title}' ची कॉपी तयार केली.`);
                        }}
                        className="p-1.5 rounded-md text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                        title="डुप्लिकेट करा (Duplicate)"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('या जाहिरातीची इम्प्रेशन्स व क्लिक्स् आकडेवारी रिसेट करायची का?')) {
                            resetAdStats(ad.id);
                            showToast('आकडेवारी रिसेट करण्यात आली.');
                          }
                        }}
                        className="p-1.5 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                        title="आकडेवारी रिसेट करा (Reset stats)"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`'${ad.title}' हा जाहिरात स्लॉट कायमचा हटवायचा आहे का?`)) {
                          deleteAd(ad.id);
                          showToast(`'${ad.title}' हटवण्यात आला.`);
                        }
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="हटवा (Delete)"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GOOGLE ADSENSE & AUTO ADS MASTER SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'adsense' && (
        <div className="space-y-6 max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Google AdSense मास्टर खाती व ऑटो ॲड्स (Auto Ads)
                  </h2>
                  <p className="text-xs text-slate-500">
                    तुमचा गुगल ॲडसेन्स प्रकाशक आयडी (Publisher ID) आणि ऑप्टिमायझेशन कॉन्फिगरेशन.
                  </p>
                </div>
              </div>

              {/* Master Toggle */}
              <button
                type="button"
                onClick={() =>
                  updateAdSenseSettings({
                    isEnabled: !adSenseSettings.isEnabled,
                  })
                }
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  adSenseSettings.isEnabled
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {adSenseSettings.isEnabled ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>AdSense सक्रिय आहे (Enabled)</span>
                  </>
                ) : (
                  <span>AdSense बंद आहे (Disabled)</span>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Publisher ID */}
              <div>
                <label className="font-bold text-slate-800 mb-1.5 block">
                  Google AdSense Publisher ID (पब्लिशर आयडी)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={adSenseSettings.publisherId}
                    onChange={(e) => updateAdSenseSettings({ publisherId: e.target.value })}
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    className="h-9 w-full rounded-lg border border-slate-200 px-3 font-mono font-bold text-slate-900 focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  उदा. <code>ca-pub-9842109847120934</code> (AdSense खात्यातून कॉपी करा)
                </p>
              </div>

              {/* Estimated CPM */}
              <div>
                <label className="font-bold text-slate-800 mb-1.5 block">
                  अपेक्षित सरासरी CPM दर (₹ / 1,000 Views)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={adSenseSettings.estimatedCpmInr}
                    onChange={(e) =>
                      updateAdSenseSettings({ estimatedCpmInr: Number(e.target.value) || 0 })
                    }
                    className="h-9 w-full rounded-lg border border-slate-200 pl-7 pr-3 font-bold text-slate-900 focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  मराठी व प्रादेशिक न्यूजसाठी सामान्य दर ₹40 ते ₹90 दरम्यान असतो.
                </p>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              {/* Auto Ads */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Google Auto Ads (स्वयंचलित स्मार्ट जाहिराती)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    गुगलचे AI अल्गोरिदम योग्य ठिकाणी स्वतःहून जाहिराती प्लेस करते.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={adSenseSettings.autoAdsEnabled}
                  onChange={(e) => updateAdSenseSettings({ autoAdsEnabled: e.target.checked })}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
              </div>

              {/* Lazy Loading */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Lazy Load AdSense Scripts (स्पीड ऑप्टिमायझेशन)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    वाचक स्क्रोल करतील तेव्हाच जाहिरात स्क्रिप्ट लोड होते, ज्यामुळे PageSpeed व LiteSpeed स्कोर 99+ राहतो.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={adSenseSettings.lazyLoadAds}
                  onChange={(e) => updateAdSenseSettings({ lazyLoadAds: e.target.checked })}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
              </div>

              {/* Hide for Logged in Users */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    पत्रकार व संपादकांसाठी जाहिराती लपवा (Hide for Staff)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    CMS ॲडमिन व संपादकांना बातमी एडिट करताना जाहिरातींचा अडथळा येणार नाही.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={adSenseSettings.hideAdsForLoggedInUsers}
                  onChange={(e) =>
                    updateAdSenseSettings({ hideAdsForLoggedInUsers: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Auto Generated Header Injection Script Box */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <FileCode className="h-4 w-4 text-blue-600" />
                  WordPress / HTML &lt;head&gt; साठी AdSense व्हेरिफिकेशन कोड
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const code = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseSettings.publisherId}" crossorigin="anonymous"></script>`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(code);
                      showToast('AdSense Header Script कॉपी केले!');
                    }
                  }}
                  className="rounded bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  कोड कॉपी करा
                </button>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-[11px] font-mono text-emerald-400">
                {`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseSettings.publisherId}" crossorigin="anonymous"></script>`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ADS.TXT MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'adstxt' && (
        <div className="space-y-6 max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span>ads.txt व्हेरिफिकेशन व्यवस्थापक</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  गुगल ॲडसेन्स व अधिकृत ॲड नेटवर्क व्हेरिफिकेशनसाठी आवश्यक असलेली फाईल.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAdsTxt}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>मजकूर कॉपी करा</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadAdsTxt}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>ads.txt डाऊनलोड</span>
                </button>
              </div>
            </div>

            {/* Editable ads.txt Editor */}
            <div>
              <label className="font-bold text-slate-800 text-xs mb-1.5 block">
                ads.txt मजकूर (Direct Content):
              </label>
              <textarea
                rows={8}
                value={adSenseSettings.adsTxtContent}
                onChange={(e) => updateAdSenseSettings({ adsTxtContent: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-900 p-3.5 font-mono text-xs text-emerald-400 leading-relaxed focus:border-red-600 focus:outline-hidden"
              />
            </div>

            {/* Instructions box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-blue-600" />
                Hostinger / cPanel वर ही फाईल कशी अपलोड करावी?
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
                <li>वरील <strong>"ads.txt डाऊनलोड"</strong> बटणावर क्लिक करून फाईल सेव्ह करा.</li>
                <li>तुमच्या <strong>Hostinger File Manager</strong> किंवा <strong>cPanel</strong> मध्ये जा.</li>
                <li><strong><code>public_html/</code></strong> या रूट फोल्डरमध्ये ही फाईल थेट अपलोड करा.</li>
                <li>
                  तपासणीसाठी तुमच्या डोमेनवर उघडून पहा:{' '}
                  <code className="text-red-600 font-bold">https://infonewsupdate24.com/ads.txt</code>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REVENUE & RPM CALCULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'revenue' && (
        <div className="space-y-6 max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <span>डिजिटल न्यूज महसूल अंदाज व कमाई सिम्युलेटर (Revenue Simulator)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                तुमच्या पोर्टलच्या व्हिजिटर्सनुसार दैनिक, मासिक व वार्षिक कमाईचा अचूक अंदाज घ्या.
              </p>
            </div>

            {/* Sliders and Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Slider 1: Monthly Page Views */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">अंदाजे मासिक पेज व्ह्यूज (Monthly Views)</span>
                  <span className="text-red-600 font-mono text-sm">
                    {simMonthlyViews.toLocaleString()} Views
                  </span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="2000000"
                  step="25000"
                  value={simMonthlyViews}
                  onChange={(e) => setSimMonthlyViews(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>25K</span>
                  <span>500K</span>
                  <span>10 Lakh</span>
                  <span>20 Lakh</span>
                </div>
              </div>

              {/* Slider 2: Average CPM Rate */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">अंदाजे CPM दर (₹ प्रति १,००० व्ह्यूज)</span>
                  <span className="text-emerald-700 font-mono text-sm">₹{simCpm} CPM</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="5"
                  value={simCpm}
                  onChange={(e) => setSimCpm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>₹20 (Basic)</span>
                  <span>₹65 (Marathi News)</span>
                  <span>₹120 (Finance/Tech)</span>
                  <span>₹200+</span>
                </div>
              </div>
            </div>

            {/* Real-time Projected Earnings Display Cards */}
            {(() => {
              const monthlyEarnings = Math.round((simMonthlyViews / 1000) * simCpm);
              const dailyEarnings = Math.round(monthlyEarnings / 30);
              const annualEarnings = monthlyEarnings * 12;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Daily */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center space-y-1">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      दैनिक कमाई (Daily)
                    </span>
                    <p className="text-2xl font-black text-slate-900">
                      ₹{dailyEarnings.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      ~${(dailyEarnings / 86).toFixed(1)} USD
                    </p>
                  </div>

                  {/* Monthly */}
                  <div className="rounded-2xl border-2 border-red-600 bg-linear-to-b from-red-50 to-white p-5 text-center space-y-1 shadow-sm">
                    <span className="text-red-700 text-xs font-black uppercase tracking-wider">
                      मासिक कमाई (Monthly)
                    </span>
                    <p className="text-3xl font-black text-red-600">
                      ₹{monthlyEarnings.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-600 font-mono">
                      ~${(monthlyEarnings / 86).toFixed(1)} USD
                    </p>
                  </div>

                  {/* Annual */}
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 text-center space-y-1">
                    <span className="text-emerald-800 text-xs font-bold uppercase tracking-wider">
                      वार्षिक उत्पन्न (Annual)
                    </span>
                    <p className="text-2xl font-black text-emerald-800">
                      ₹{annualEarnings.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-mono">
                      ~${(annualEarnings / 86).toFixed(1)} USD
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* High-Paying Marathi News Niches */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                जास्त कमाई मिळवून देणारे विषय (High CPC Niche Recommendations):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <strong className="block text-slate-900">📈 शेअर्स व फायनान्स</strong>
                  <span className="text-[10px] text-slate-500">CPM: ₹90 - ₹180</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <strong className="block text-slate-900">🚗 ऑटोमोबाईल & बाईक्स</strong>
                  <span className="text-[10px] text-slate-500">CPM: ₹70 - ₹130</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <strong className="block text-slate-900">🌾 कृषी योजना व हवामान</strong>
                  <span className="text-[10px] text-slate-500">CPM: ₹50 - ₹95</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <strong className="block text-slate-900">📚 नोकरी व स्पर्धा परीक्षा</strong>
                  <span className="text-[10px] text-slate-500">CPM: ₹60 - ₹110</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: VISUAL WIREFRAME & PLACEMENT MAP */}
      {/* ========================================================================= */}
      {activeTab === 'wireframe' && (
        <div className="space-y-6 max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5 text-red-600" />
                <span>पोर्टल जाहिरात रचना व प्लेसमेंट नकाशा (Visual Placement Map)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                तुमच्या वेबसाईटवर जाहिराती नेमक्या कुठे दिसतात याचे संपूर्ण चित्र.
              </p>
            </div>

            {/* Visual Wireframe Diagram */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-900 text-white text-xs font-mono">
              {/* Header Box */}
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                <span>[1] TOP UTILITY BAR (Date, Breaking Ticker, Social, CMS Link)</span>
                <span className="text-emerald-400 text-[10px]">ALWAYS VISIBLE</span>
              </div>

              {/* Header Ad Slot */}
              <div className="p-3.5 rounded-xl border-2 border-dashed border-red-500 bg-red-950/40 flex items-center justify-between text-red-400 font-bold">
                <span>🎯 POSITION: HEADER (Leaderboard 728x90 Banner)</span>
                <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded">
                  {ads.find((a) => a.position === 'HEADER' && a.status === 'ACTIVE')
                    ? 'ACTIVE'
                    : 'EMPTY'}
                </span>
              </div>

              {/* Navigation Menu */}
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-center text-slate-300">
                [2] MAIN NAVIGATION MENU (Home, Maharashtra, Politics, Sports, Videos)
              </div>

              {/* Below Header Banner */}
              <div className="p-3 rounded-xl border border-dashed border-amber-500/60 bg-amber-950/20 flex items-center justify-between text-amber-400">
                <span>🎯 POSITION: BELOW_HEADER (Full Width Banner)</span>
                <span className="text-[10px]">
                  {ads.find((a) => a.position === 'BELOW_HEADER' && a.status === 'ACTIVE')
                    ? 'ACTIVE'
                    : 'OPTIONAL'}
                </span>
              </div>

              {/* 2-Column Body Layout */}
              <div className="grid grid-cols-12 gap-3 pt-2">
                {/* Left 8 Cols News Feed */}
                <div className="col-span-8 space-y-3">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
                    [3] HERO SECTION (Big Headline News Story + Side Grid)
                  </div>

                  {/* Home Middle In-Feed Ad */}
                  <div className="p-3.5 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-950/30 flex items-center justify-between text-emerald-400 font-bold">
                    <span>🎯 POSITION: HOME_MIDDLE (Billboard 970x250 In-Feed Ad)</span>
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded">
                      {ads.find((a) => a.position === 'HOME_MIDDLE' && a.status === 'ACTIVE')
                        ? 'ACTIVE'
                        : 'EMPTY'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
                    [4] LATEST NEWS FEED &amp; CATEGORIES GRID
                  </div>

                  {/* Article In-Body Placements */}
                  <div className="p-3 rounded-xl border border-blue-500/60 bg-blue-950/20 space-y-1.5 text-blue-300">
                    <span className="font-bold text-white block">📄 SINGLE ARTICLE PAGE PLACEMENTS:</span>
                    <div className="text-[11px] space-y-1 pl-2">
                      <p>• <strong>ARTICLE_TOP:</strong> बातमीच्या सुरुवातीला (Below Title)</p>
                      <p>• <strong>ARTICLE_MIDDLE:</strong> बातमीच्या परिच्छेदांमध्ये (In-Content Dynamic)</p>
                      <p>• <strong>ARTICLE_BOTTOM:</strong> कमेंट्स आणि शेअरिंगच्या वर (Above Comments)</p>
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols Sidebar */}
                <div className="col-span-4 space-y-3">
                  {/* Sidebar Top Ad */}
                  <div className="p-3.5 rounded-xl border-2 border-dashed border-purple-500 bg-purple-950/30 flex flex-col justify-between text-purple-300 font-bold min-h-24">
                    <span>🎯 SIDEBAR_TOP (300x250 Ad)</span>
                    <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded w-fit mt-2">
                      {ads.find((a) => a.position === 'SIDEBAR_TOP' && a.status === 'ACTIVE')
                        ? 'ACTIVE'
                        : 'EMPTY'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400">
                    [5] TRENDING &amp; POLL WIDGET
                  </div>

                  {/* Sidebar Bottom Sticky */}
                  <div className="p-3.5 rounded-xl border-2 border-dashed border-purple-500/70 bg-purple-950/20 flex flex-col justify-between text-purple-300 font-bold min-h-28">
                    <span>🎯 SIDEBAR_BOTTOM (300x600 Half Page Sticky)</span>
                    <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded w-fit mt-2">
                      {ads.find((a) => a.position === 'SIDEBAR_BOTTOM' && a.status === 'ACTIVE')
                        ? 'ACTIVE'
                        : 'OPTIONAL'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Sticky Bar */}
              <div className="p-3 rounded-xl border border-dashed border-pink-500 bg-pink-950/30 flex items-center justify-between text-pink-300 font-bold mt-2">
                <span>📱 MOBILE_STICKY (मोबाईल स्क्रीनच्या तळाशी तरंगणारी ३२०x५० पट्टी)</span>
                <span className="bg-pink-600 text-white text-[10px] px-2 py-0.5 rounded">
                  {ads.find((a) => a.position === 'MOBILE_STICKY' && a.status === 'ACTIVE')
                    ? 'ACTIVE'
                    : 'EMPTY'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT AD UNIT */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingAdId ? 'जाहिरात स्लॉट संपादित करा (Edit Ad Slot)' : 'नवीन जाहिरात स्लॉट जोडा (Add New Ad Slot)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Row 1: Title & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 mb-1 block">
                    स्लॉटचे नाव (Slot Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. Header Leaderboard 728x90"
                    value={modalFormData.title || ''}
                    onChange={(e) => setModalFormData({ ...modalFormData, title: e.target.value })}
                    className="h-8 w-full rounded-lg border border-slate-200 px-3 font-semibold text-slate-900 focus:border-red-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 mb-1 block">
                    जाहिरातीचा प्रकार (Ad Type) *
                  </label>
                  <select
                    value={modalFormData.type || 'BANNER'}
                    onChange={(e) =>
                      setModalFormData({ ...modalFormData, type: e.target.value as AdType })
                    }
                    className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 font-semibold text-slate-800 focus:outline-hidden"
                  >
                    <option value="BANNER">डायरेक्ट इमेज बॅनर (Banner Image)</option>
                    <option value="ADSENSE">Google AdSense</option>
                    <option value="SPONSORED">प्रायोजित / Sponsored Native Card</option>
                    <option value="HTML">HTML / JavaScript Code Snippet</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Position & Preset Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 mb-1 block">
                    प्लेसमेंट पोझिशन (Position) *
                  </label>
                  <select
                    value={modalFormData.position || 'HEADER'}
                    onChange={(e) =>
                      setModalFormData({
                        ...modalFormData,
                        position: e.target.value as AdPosition,
                      })
                    }
                    className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 font-semibold text-slate-800 focus:outline-hidden"
                  >
                    <option value="HEADER">HEADER (टॉप हेडर 728x90)</option>
                    <option value="BELOW_HEADER">BELOW_HEADER (हेडरखालील फुल बॅनर)</option>
                    <option value="HOME_TOP">HOME_TOP (होमपेज टॉप)</option>
                    <option value="HOME_MIDDLE">HOME_MIDDLE (होमपेज फीडमधील Billboard 970x250)</option>
                    <option value="ARTICLE_TOP">ARTICLE_TOP (बातमीच्या सुरुवातीला)</option>
                    <option value="ARTICLE_MIDDLE">ARTICLE_MIDDLE (बातमीच्या मध्यभागी - In-Content)</option>
                    <option value="ARTICLE_BOTTOM">ARTICLE_BOTTOM (बातमीच्या शेवटी)</option>
                    <option value="SIDEBAR_TOP">SIDEBAR_TOP (साइडबार 300x250)</option>
                    <option value="SIDEBAR_BOTTOM">SIDEBAR_BOTTOM (साइडबार 300x600 स्टिकी)</option>
                    <option value="FOOTER">FOOTER (फुटर बॅनर)</option>
                    <option value="MOBILE_STICKY">MOBILE_STICKY (मोबाईल बॉटम 320x50 स्टिकी)</option>
                    <option value="EPAPER_HEADER">📰 EPAPER_HEADER (ई-पेपर टॉप Solus 728x90)</option>
                    <option value="EPAPER_PAGE_BOTTOM">📰 EPAPER_PAGE_BOTTOM (ई-पेपर बॉटम Sponsored Strip)</option>
                    <option value="EPAPER_CLIP_SPONSOR">📰 EPAPER_CLIP_SPONSOR (व्हॉट्सॲप क्लिप प्रायोजक)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 mb-1 block">
                    डिव्हाइस टार्गेटिंग (Device Targeting)
                  </label>
                  <select
                    value={modalFormData.deviceTargeting || 'ALL'}
                    onChange={(e) =>
                      setModalFormData({
                        ...modalFormData,
                        deviceTargeting: e.target.value as any,
                      })
                    }
                    className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 font-semibold text-slate-800 focus:outline-hidden"
                  >
                    <option value="ALL">सर्व डिव्हाइसेस (Desktop, Tablet & Mobile)</option>
                    <option value="DESKTOP">फक्त डेस्कटॉप (Desktop Only)</option>
                    <option value="MOBILE">फक्त मोबाईल (Mobile Only)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Inputs based on Type */}
              {modalFormData.type === 'ADSENSE' ? (
                <div>
                  <label className="font-bold text-slate-800 mb-1 block">
                    Google AdSense Slot ID (स्लॉट आयडी)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. 5849201842"
                    value={modalFormData.adSenseSlotId || ''}
                    onChange={(e) =>
                      setModalFormData({ ...modalFormData, adSenseSlotId: e.target.value })
                    }
                    className="h-8 w-full rounded-lg border border-slate-200 px-3 font-mono font-bold text-slate-900 focus:border-red-600 focus:outline-hidden"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    तुमच्या AdSense डॅशबोर्डवरील Ad Unit Slot ID इथे पेस्ट करा.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="font-bold text-slate-800 mb-1 block">
                      {modalFormData.type === 'HTML' ? 'HTML / Script Code' : 'बॅनर इमेज URL (Banner Image URL)'} *
                    </label>
                    {modalFormData.type === 'HTML' ? (
                      <textarea
                        rows={3}
                        placeholder="<script> ... </script> किंवा <div> ... </div>"
                        value={modalFormData.codeOrUrl || ''}
                        onChange={(e) =>
                          setModalFormData({ ...modalFormData, codeOrUrl: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 p-2.5 font-mono text-xs text-slate-900 focus:border-red-600 focus:outline-hidden"
                      />
                    ) : (
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={modalFormData.codeOrUrl || ''}
                        onChange={(e) =>
                          setModalFormData({ ...modalFormData, codeOrUrl: e.target.value })
                        }
                        className="h-8 w-full rounded-lg border border-slate-200 px-3 font-semibold text-slate-900 focus:border-red-600 focus:outline-hidden"
                      />
                    )}
                  </div>

                  {modalFormData.type !== 'HTML' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-slate-800 mb-1 block">
                          लक्ष्यित लिंक (Target Click URL)
                        </label>
                        <input
                          type="url"
                          placeholder="https://clientwebsite.com"
                          value={modalFormData.targetUrl || ''}
                          onChange={(e) =>
                            setModalFormData({ ...modalFormData, targetUrl: e.target.value })
                          }
                          className="h-8 w-full rounded-lg border border-slate-200 px-3 font-semibold text-slate-900 focus:border-red-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-800 mb-1 block">
                          प्रायोजकाचे नाव (Sponsor / Brand Name)
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. महा-क्रेडिट बँक"
                          value={modalFormData.sponsorName || ''}
                          onChange={(e) =>
                            setModalFormData({ ...modalFormData, sponsorName: e.target.value })
                          }
                          className="h-8 w-full rounded-lg border border-slate-200 px-3 font-semibold text-slate-900 focus:border-red-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Status and Priority */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={modalFormData.status === 'ACTIVE'}
                      onChange={(e) =>
                        setModalFormData({
                          ...modalFormData,
                          status: e.target.checked ? 'ACTIVE' : 'PAUSED',
                        })
                      }
                      className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span>सक्रिय ठेवा (Active)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={modalFormData.openInNewTab !== false}
                      onChange={(e) =>
                        setModalFormData({
                          ...modalFormData,
                          openInNewTab: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span>नवीन टॅबमध्ये उघडा (_blank)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    रद्द करा
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-5 py-2 font-bold text-white shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    {editingAdId ? 'बदल सेव्ह करा' : 'स्लॉट सेव्ह करा'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
