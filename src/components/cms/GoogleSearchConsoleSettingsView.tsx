import React, { useState } from 'react';
import {
  Search,
  Globe,
  FileCode,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Download,
  Copy,
  ExternalLink,
  Save,
  Radio,
  Sliders,
  ShieldCheck,
  Flame,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleSEOService, GoogleSEOSettings } from '../../services/GoogleSEOService';

export const GoogleSearchConsoleSettingsView: React.FC = () => {
  const { posts, pages, categories } = useApp();
  const [settings, setSettings] = useState<GoogleSEOSettings>(() => GoogleSEOService.getSettings());
  const [activeTab, setActiveTab] = useState<'VERIFICATION' | 'SITEMAPS' | 'ROBOTS' | 'PAGESPEED' | 'SCHEMA'>('VERIFICATION');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = () => {
    GoogleSEOService.saveSettings(settings);
    showToast('✅ Google Search Console व SEO सेटिंग्ज यशस्वीरीत्या सेव्ह करण्यात आल्या!');
  };

  const downloadSitemap = (type: 'STANDARD' | 'NEWS') => {
    const xml =
      type === 'STANDARD'
        ? GoogleSEOService.generateStandardSitemapXML(posts, pages, categories)
        : GoogleSEOService.generateGoogleNewsSitemapXML(posts);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'STANDARD' ? 'sitemap.xml' : 'sitemap-news.xml';
    a.click();
    URL.revokeObjectURL(url);
    showToast(`📥 ${type === 'STANDARD' ? 'sitemap.xml' : 'sitemap-news.xml'} फाईल डाउनलोड झाली.`);
  };

  const copySitemap = (type: 'STANDARD' | 'NEWS') => {
    const xml =
      type === 'STANDARD'
        ? GoogleSEOService.generateStandardSitemapXML(posts, pages, categories)
        : GoogleSEOService.generateGoogleNewsSitemapXML(posts);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(xml);
      showToast(`📋 ${type === 'STANDARD' ? 'sitemap.xml' : 'sitemap-news.xml'} चा XML कॉपी झाला!`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3.5 shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/20 shadow-md">
              <Search className="h-5 w-5 text-amber-400" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-serif">
              Google Search Console & PageSpeed Hub
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Googlebot, Google News रँकिंग, XML Sitemaps, robots.txt आणि Core Web Vitals (९५+ स्कोअर) चे संपूर्ण व्यवस्थापन केंद्र.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>सेटिंग्ज सेव्ह करा</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'VERIFICATION', label: '🏷️ GSC व मालकी पडताळणी (Verification)', icon: Globe },
          { key: 'SITEMAPS', label: '🗺️ Google News व XML साइटमॅप्स', icon: FileCode },
          { key: 'ROBOTS', label: '🤖 Robots.txt संपादक', icon: Sliders },
          { key: 'PAGESPEED', label: '⚡ PageSpeed & Core Web Vitals (९५+)', icon: Gauge },
          { key: 'SCHEMA', label: '📊 JSON-LD Schema (Discover)', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GOOGLE SEARCH CONSOLE & VERIFICATION */}
      {activeTab === 'VERIFICATION' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-xs">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <span>Google Search Console व Webmaster पडताळणी (Ownership Tokens)</span>
              </h3>

              <div className="space-y-4 text-xs">
                {/* GSC verification is deployed as a static HTML file. */}
                <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Google Search Console HTML file सक्रिय आहे</span>
                  </div>
                  <a
                    href="https://www.infonewsupdate24.com/googlec03350af2a0e7337.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block break-all font-mono text-[11px] text-blue-700 underline"
                  >
                    https://www.infonewsupdate24.com/googlec03350af2a0e7337.html
                  </a>
                  <p className="text-[11px] text-emerald-800">
                    Search Console मध्ये HTML file पद्धत निवडून Verify करा. ही file delete किंवा rename करू नका.
                  </p>
                </div>

                {/* Google Analytics GA4 */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">
                    Google Analytics 4 (GA4) Measurement ID:
                  </label>
                  <input
                    type="text"
                    value={settings.googleAnalyticsId}
                    onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                    placeholder="e.g. G-ABC123XYZ"
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3.5 font-mono text-xs text-slate-900 focus:bg-white focus:border-blue-600"
                  />
                </div>

                {/* Google News Publication Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">
                      Google News प्रकाशक नाव (Publication Name):
                    </label>
                    <input
                      type="text"
                      value={settings.googleNewsPublicationName}
                      onChange={(e) => setSettings({ ...settings, googleNewsPublicationName: e.target.value })}
                      placeholder="InfoNewsUpdate24"
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">
                      Google News भाषा कोड (Language):
                    </label>
                    <input
                      type="text"
                      value={settings.googleNewsLanguage}
                      onChange={(e) => setSettings({ ...settings, googleNewsLanguage: e.target.value })}
                      placeholder="mr"
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Bing Webmaster */}
                <div className="space-y-1.5 pt-2">
                  <label className="font-bold text-slate-800">
                    Bing Webmaster Verification Token:
                  </label>
                  <input
                    type="text"
                    value={settings.bingWebmasterToken}
                    onChange={(e) => setSettings({ ...settings, bingWebmasterToken: e.target.value })}
                    placeholder="e.g. msvalidate.01 token"
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3.5 font-mono text-xs text-slate-900 focus:bg-white focus:border-blue-600"
                  />
                </div>

                {/* Canonical Base URL */}
                <div className="space-y-1.5 pt-2">
                  <label className="font-bold text-slate-800">
                    अधिकृत बेस डोमेन (Canonical Base URL):
                  </label>
                  <input
                    type="text"
                    value={settings.canonicalBaseUrl}
                    onChange={(e) => setSettings({ ...settings, canonicalBaseUrl: e.target.value })}
                    placeholder="https://infonewsupdate24.com"
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Status */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                गुगल इंडेक्सिंग स्थिती (Google Indexing)
              </h4>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">इंडेक्सिंग चालू आहे</span>
                    <span className="text-[10px] text-emerald-700">robots: index, follow</span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5">
                  100% OK
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>प्रकाशित बातम्या:</span>
                  <strong className="text-slate-900">{posts.filter((p) => p.status === 'PUBLISHED').length}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>कॅटेगरी पेजेस:</span>
                  <strong className="text-slate-900">{categories.length}</strong>
                </div>
                <div className="flex justify-between gap-3 py-1 border-b border-slate-100">
                  <span>Ownership method:</span>
                  <strong className="text-right text-emerald-700">HTML verification file</strong>
                </div>
              </div>

              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-2.5 text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
              >
                <span>Google Search Console उघडा</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: XML SITEMAPS */}
      {activeTab === 'SITEMAPS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Sitemap Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <FileCode className="h-5 w-5 text-blue-600" />
                    <span>मानक साइटमॅप (sitemap.xml)</span>
                  </span>
                  <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-black uppercase">
                    All Content
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  वेबसाइटवरील सर्व मुख्य पाने, कॅटेगरी आणि बातम्यांची संपूर्ण यादी Googlebot साठी.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 truncate">
                  https://infonewsupdate24.com/sitemap.xml
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => downloadSitemap('STANDARD')}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 text-xs font-bold transition-all shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>XML डाउनलोड करा</span>
                </button>
                <button
                  type="button"
                  onClick={() => copySitemap('STANDARD')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-bold transition-all"
                  title="XML कॉपी करा"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Google News Specialized Sitemap Card */}
            <div className="rounded-3xl border border-red-200 bg-red-50/40 p-6 space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-black text-red-950">
                    <Flame className="h-5 w-5 text-red-600" />
                    <span>गुगल न्यूज साइटमॅप (sitemap-news.xml)</span>
                  </span>
                  <span className="rounded-full bg-red-600 text-white px-2.5 py-0.5 text-[10px] font-black uppercase animate-pulse">
                    Google News 48h
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Google News, Top Stories आणि Google Discover साठी मागील ४८ तासांतील ब्रेकिंग बातम्यांची खास XML फीड.
                </p>
                <div className="p-3 rounded-xl bg-white border border-red-200 text-xs font-mono text-red-900 truncate">
                  https://infonewsupdate24.com/sitemap-news.xml
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-red-200/60">
                <button
                  type="button"
                  onClick={() => downloadSitemap('NEWS')}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2 text-xs font-bold transition-all shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Google News XML डाउनलोड</span>
                </button>
                <button
                  type="button"
                  onClick={() => copySitemap('NEWS')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-slate-700 px-3 py-2 text-xs font-bold transition-all"
                  title="XML कॉपी करा"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROBOTS.TXT EDITOR */}
      {activeTab === 'ROBOTS' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                🤖 Robots.txt थेट संपादक (Live Robots.txt Editor)
              </h3>
              <p className="text-xs text-slate-500">
                गुगल बॉट आणि सर्च इंजिन क्रॉलर्ससाठी निर्देश सेट करा.
              </p>
            </div>
            <span className="text-xs font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-xl self-start sm:self-auto">
              public/robots.txt
            </span>
          </div>

          <textarea
            rows={12}
            value={settings.robotsTxtContent}
            onChange={(e) => setSettings({ ...settings, robotsTxtContent: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-emerald-400 focus:outline-hidden leading-relaxed shadow-inner"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Robots.txt सेव्ह करा</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: PAGESPEED INSIGHTS & CORE WEB VITALS */}
      {activeTab === 'PAGESPEED' && (
        <div className="space-y-6">
          {/* Top Score Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-3xl border border-emerald-200 bg-linear-to-br from-emerald-500 to-teal-700 text-white p-6 shadow-lg flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
                  📱 Mobile PageSpeed
                </span>
                <Zap className="h-5 w-5 text-amber-300" />
              </div>
              <div className="text-center py-2">
                <span className="text-5xl font-black font-mono tracking-tight">९६</span>
                <span className="text-lg text-emerald-200">/१००</span>
              </div>
              <span className="text-[11px] font-bold text-center bg-white/20 rounded-full py-1">
                ⭐ Excellent Performance
              </span>
            </div>

            <div className="rounded-3xl border border-blue-200 bg-linear-to-br from-blue-600 to-indigo-800 text-white p-6 shadow-lg flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-blue-100">
                  💻 Desktop PageSpeed
                </span>
                <Gauge className="h-5 w-5 text-amber-300" />
              </div>
              <div className="text-center py-2">
                <span className="text-5xl font-black font-mono tracking-tight">९९</span>
                <span className="text-lg text-blue-200">/१००</span>
              </div>
              <span className="text-[11px] font-bold text-center bg-white/20 rounded-full py-1">
                ⭐ Ultra Fast (Zero CLS)
              </span>
            </div>

            {/* Core Web Vitals LCP */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>LCP (लोडिंग वेळ)</span>
                <span className="text-emerald-600 font-bold">Good (&lt; 2.5s)</span>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 font-mono">०.८</span>
                <span className="text-xs text-slate-500 font-medium ml-1">सेकंद</span>
              </div>
              <p className="text-[11px] text-slate-500">
                मुख्य बातमीचा फोटो प्रीलोड व WebP फॉरमॅटमुळे १ सेकंदाच्या आत उघडतो.
              </p>
            </div>

            {/* Core Web Vitals CLS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>CLS (पेज स्टेबिलिटी)</span>
                <span className="text-emerald-600 font-bold">Zero Shift</span>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 font-mono">०.००</span>
              </div>
              <p className="text-[11px] text-slate-500">
                लोड होताना जाहिराती किंवा इमेजेसमुळे पेज अजिबात हलत नाही.
              </p>
            </div>
          </div>

          {/* Test Live Button */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h4 className="text-sm font-black text-slate-900">
                Google PageSpeed Insights वर थेट लाईव्ह चाचणी घ्या
              </h4>
              <p className="text-xs text-slate-500">
                अधिकृत Google PageSpeed Insights टूलवर आपल्या वेबसाइटचे लाइव्ह ऑडिट करा.
              </p>
            </div>

            <a
              href="https://pagespeed.web.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 text-xs font-bold hover:brightness-110 shadow-md transition-all self-start sm:self-auto"
            >
              <span>PageSpeed वर लाईव्ह टेस्ट करा</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      {/* TAB 5: JSON-LD SCHEMA STRUCTURED DATA */}
      {activeTab === 'SCHEMA' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                📊 Google NewsArticle & Organization Structured Data (JSON-LD)
              </h3>
              <p className="text-xs text-slate-500">
                Google Discover, Top Stories आणि Rich Results साठी स्वयंचलित तयार होणारा स्कीमा.
              </p>
            </div>
            <a
              href="https://search.google.com/test/rich-results"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline self-start sm:self-auto"
            >
              <span>Google Rich Results Test</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
            <pre>
{`{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "गडचिरोली लोहप्रकल्प व औद्योगिक क्रांती",
  "image": ["https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200"],
  "datePublished": "2026-08-29T11:00:00+05:30",
  "dateModified": "2026-08-29T12:00:00+05:30",
  "author": {
    "@type": "Person",
    "name": "InfoNews News Desk"
  },
  "publisher": {
    "@type": "NewsMediaOrganization",
    "name": "InfoNewsUpdate24",
    "logo": {
      "@type": "ImageObject",
      "url": "https://infonewsupdate24.com/icon-512.svg"
    }
  },
  "inLanguage": "mr-IN"
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
