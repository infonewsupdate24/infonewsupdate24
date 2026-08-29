import React, { useState, useMemo } from 'react';
import {
  MessageCircle,
  Copy,
  Check,
  Share2,
  Sparkles,
  Sun,
  Sunset,
  Zap,
  Newspaper,
  Calendar,
  Layers,
  CheckSquare,
  Square,
  Search,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Post, WhatsAppBulletinConfig } from '../../types';
import { WhatsAppBulletinService } from '../../services/WhatsAppBulletinService';

export const WhatsAppBulletinManagerView: React.FC = () => {
  const { posts, whatsAppSettings, epaperSettings } = useApp();

  const publishedPosts = useMemo(
    () => posts.filter((p) => p.status === 'PUBLISHED'),
    [posts]
  );

  const [bulletinType, setBulletinType] = useState<WhatsAppBulletinConfig['bulletinType']>(() =>
    WhatsAppBulletinService.getSuggestedBulletinType()
  );
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>(() =>
    publishedPosts.slice(0, 5).map((p) => p.id)
  );
  const [includeEPaperLink, setIncludeEPaperLink] = useState(true);
  const [includeChannelLink, setIncludeChannelLink] = useState(true);
  const [includeAdText, setIncludeAdText] = useState(true);
  const [customAdText, setCustomAdText] = useState(
    'डिजिटल जाहिरातींसाठी आजच संपर्क करा - InfoNewsUpdate24 ॲड नेटवर्क'
  );
  const [includeReadMoreLinks, setIncludeReadMoreLinks] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return publishedPosts;
    return publishedPosts.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [publishedPosts, searchQuery]);

  const config: WhatsAppBulletinConfig = {
    bulletinType,
    includeEPaperLink,
    includeChannelLink,
    includeAdText,
    customAdText,
    includeReadMoreLinks,
    selectedPostIds,
  };

  const bulletinText = useMemo(() => {
    return WhatsAppBulletinService.generateBulletinText(
      publishedPosts,
      config,
      whatsAppSettings?.officialChannelUrl,
      epaperSettings?.adContactNumber
    );
  }, [publishedPosts, config, whatsAppSettings, epaperSettings]);

  const handleTogglePost = (id: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectTop5 = () => {
    setSelectedPostIds(publishedPosts.slice(0, 5).map((p) => p.id));
    setToastMsg('टॉप ५ ताज्या बातम्या निवडल्या!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(bulletinText);
      setCopied(true);
      setToastMsg('📋 व्हॉट्सॲप बुलेटिन टेक्स्ट कॉपी झाले!');
      setTimeout(() => {
        setCopied(false);
        setToastMsg('');
      }, 4000);
    }
  };

  const handleDirectWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(bulletinText)}`;
    window.open(url, '_blank');
    setToastMsg('WhatsApp उघडले!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
              WhatsApp Bulletin Studio
            </span>
            <span className="text-xs font-bold text-slate-500">१-क्लिक दैनिक बातमीपत्र</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            १-क्लिक व्हॉट्सॲप बुलेटिन जनरेटर (WhatsApp Daily Digest)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            सकाळचे, संध्याकाळचे आणि ब्रेकिंग न्यूज बातमीपत्र एका सेकंदात फॉरमॅट करून हजारो व्हॉट्सॲप ग्रुप्सवर ब्रॉडकास्ट करा.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 shadow-xs transition-all cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'कॉपी झाले!' : 'टेक्स्ट कॉपी करा'}</span>
          </button>

          <button
            type="button"
            onClick={handleDirectWhatsAppShare}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-4 py-2 text-xs font-black text-white shadow-md transition-all cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp वर पाठवा (Broadcast)</span>
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Controls & Story Selector (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Bulletin Type Selector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              १. बातमीपत्राचा प्रकार निवडा (Bulletin Type):
            </label>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setBulletinType('MORNING')}
                className={`p-3 rounded-xl border font-bold text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  bulletinType === 'MORNING'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400/30'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sun className="h-5 w-5 text-amber-500" />
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-black">
                    सकाळ (8 AM)
                  </span>
                </div>
                <span className="block text-xs font-black">🌅 सकाळचे बातमीपत्र</span>
              </button>

              <button
                type="button"
                onClick={() => setBulletinType('EVENING')}
                className={`p-3 rounded-xl border font-bold text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  bulletinType === 'EVENING'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-400/30'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sunset className="h-5 w-5 text-indigo-500" />
                  <span className="text-[10px] bg-indigo-200/80 text-indigo-900 px-1.5 py-0.5 rounded font-black">
                    संध्याकाळ (7 PM)
                  </span>
                </div>
                <span className="block text-xs font-black">🌇 संध्याकाळचे बातमीपत्र</span>
              </button>

              <button
                type="button"
                onClick={() => setBulletinType('BREAKING')}
                className={`p-3 rounded-xl border font-bold text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  bulletinType === 'BREAKING'
                    ? 'border-red-500 bg-red-50 text-red-950 ring-2 ring-red-400/30'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Zap className="h-5 w-5 text-red-500" />
                  <span className="text-[10px] bg-red-200/80 text-red-900 px-1.5 py-0.5 rounded font-black">
                    तात्काळ
                  </span>
                </div>
                <span className="block text-xs font-black">⚡ ब्रेकिंग विशेष बुलेटिन</span>
              </button>
            </div>
          </div>

          {/* Story Selector List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  २. बातमीपत्रात समाविष्ट करावयाच्या बातम्या ({selectedPostIds.length} निवडल्या)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  बुलेटिनमध्ये हव्या असलेल्या बातम्यांसमोरील चेकबॉक्स निवडा.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSelectTop5}
                className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>टॉप ५ ऑटो-निवडा</span>
              </button>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="बातमी शोधा..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Posts Checklist */}
            <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-100 pr-1">
              {filteredPosts.map((post, idx) => {
                const isSelected = selectedPostIds.includes(post.id);
                return (
                  <div
                    key={post.id}
                    onClick={() => handleTogglePost(post.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer pt-2 ${
                      isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-emerald-600 shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-300" />
                      )}
                    </button>

                    <img
                      src={post.featuredImage}
                      alt=""
                      className="h-10 w-14 shrink-0 rounded-md object-cover ring-1 ring-slate-200"
                    />

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-xs font-bold line-clamp-1 leading-snug ${
                          isSelected ? 'text-emerald-950' : 'text-slate-800'
                        }`}
                      >
                        {post.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {post.publishDate} &bull; {post.categorySlug}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Options & Footer Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5 text-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              ३. बुलेटिनमधील अतिरिक्त लिंक्स व जाहिरात:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeReadMoreLinks}
                  onChange={(e) => setIncludeReadMoreLinks(e.target.checked)}
                  className="rounded accent-emerald-600"
                />
                <span className="font-bold text-slate-800 text-[11px]">
                  प्रत्येक बातमीची लिंक जोडा (Read More)
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEPaperLink}
                  onChange={(e) => setIncludeEPaperLink(e.target.checked)}
                  className="rounded accent-emerald-600"
                />
                <span className="font-bold text-slate-800 text-[11px]">
                  ई-पेपर वाचण्याची लिंक जोडा
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeChannelLink}
                  onChange={(e) => setIncludeChannelLink(e.target.checked)}
                  className="rounded accent-emerald-600"
                />
                <span className="font-bold text-slate-800 text-[11px]">
                  व्हॉट्सॲप चॅनल फॉलो लिंक जोडा
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAdText}
                  onChange={(e) => setIncludeAdText(e.target.checked)}
                  className="rounded accent-emerald-600"
                />
                <span className="font-bold text-slate-800 text-[11px]">
                  प्रायोजक / जाहिरात मजकूर जोडा
                </span>
              </label>
            </div>

            {includeAdText && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  प्रायोजक जाहिरात मजकूर (Sponsor Ad Text):
                </label>
                <input
                  type="text"
                  value={customAdText}
                  onChange={(e) => setCustomAdText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live WhatsApp Chat Bubble Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border-4 border-slate-800 bg-[#0b141a] p-4 shadow-2xl space-y-3">
            {/* Mockup Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 px-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">WhatsApp Live Preview</span>
                  <span className="text-[10px] text-emerald-400">InfoNewsUpdate24 Broadcast</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer bg-slate-800 px-2 py-1 rounded"
              >
                <Copy className="h-3 w-3" />
                <span>कॉपी</span>
              </button>
            </div>

            {/* Chat Bubble Container */}
            <div className="p-3.5 rounded-2xl bg-[#1f2c34] text-slate-100 text-xs font-sans whitespace-pre-wrap leading-relaxed shadow-md border border-slate-700/50 max-h-[550px] overflow-y-auto select-text font-serif">
              {bulletinText}
            </div>

            {/* Quick Action Footer inside mockup */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDirectWhatsAppShare}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-black text-white shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>थेट WhatsApp वर पाठवा (1-Click Broadcast)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
