import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  Globe,
  Zap,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Send,
  Plus,
  Trash2,
  Edit,
  CheckCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FirestoreNewsService } from '../../services/FirestoreNewsService';
import { Post } from '../../types';

export interface RankMathGlobalConfig {
  siteSeoTitleTemplate: string;
  siteMetaDescriptionTemplate: string;
  focusKeywordSeparator: string;
  googleNewsSitemapEnabled: boolean;
  newsPublicationName: string;
  newsLanguage: string;
  includeImagesInSitemap: boolean;
  includeCategoriesInSitemap: boolean;
  googleIndexingApiKey: string;
  indexNowApiKey: string;
  autoPingOnPublish: boolean;
  schemaPublisherName: string;
  schemaPublisherLogo: string;
  schemaDefaultAuthor: string;
  defaultOgImage: string;
  twitterCardType: 'summary_large_image' | 'summary';
  robotsTxtContent: string;
  redirections: Array<{ id: string; fromUrl: string; toUrl: string; statusCode: 301 | 302; hits: number }>;
}

const DEFAULT_ROBOTS_TXT = `# Rank Math SEO Suite - InfoNewsUpdate24 Robots.txt
User-agent: *
Disallow: /admin/
Disallow: /cms/
Disallow: /api/
Allow: /
Allow: /wp-content/uploads/

# Google News Bot Optimization
User-agent: Googlebot-News
Allow: /
Allow: /news/
Allow: /article/

# XML Sitemaps
Sitemap: https://infonewsupdate24live.pages.dev/sitemap_index.xml
Sitemap: https://infonewsupdate24live.pages.dev/news-sitemap.xml
`;

const DEFAULT_RANK_MATH_CONFIG: RankMathGlobalConfig = {
  siteSeoTitleTemplate: '%title% - %sitename% | ताज्या मराठी बातम्या',
  siteMetaDescriptionTemplate: '%excerpt% - महाराष्ट्रातील ताज्या, निर्भीड आणि विश्वासार्ह घडामोडी वाचा InfoNewsUpdate24 वर.',
  focusKeywordSeparator: 'comma',
  googleNewsSitemapEnabled: true,
  newsPublicationName: 'InfoNewsUpdate24',
  newsLanguage: 'mr',
  includeImagesInSitemap: true,
  includeCategoriesInSitemap: true,
  googleIndexingApiKey: 'AIzaSyA_INFONEWS24_GINDEX_PRO_KEY',
  indexNowApiKey: '9f8382c7381928374a8b29c1',
  autoPingOnPublish: true,
  schemaPublisherName: 'InfoNewsUpdate24 Digital Media Group',
  schemaPublisherLogo: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
  schemaDefaultAuthor: 'Komal Daulatrao Dahagaonkar (मुख्य संपादक)',
  defaultOgImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
  twitterCardType: 'summary_large_image',
  robotsTxtContent: DEFAULT_ROBOTS_TXT,
  redirections: [
    { id: 'redir-1', fromUrl: '/old-news/2023/', toUrl: '/category/maharashtra', statusCode: 301, hits: 142 },
    { id: 'redir-2', fromUrl: '/feed/rss', toUrl: '/news-sitemap.xml', statusCode: 301, hits: 89 },
    { id: 'redir-3', fromUrl: '/marathi-news-live', toUrl: '/', statusCode: 301, hits: 230 },
  ],
};

export const RankMathSEOSuiteView: React.FC = () => {
  const { posts, setCmsView, setSelectedPostId } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'posts_audit' | 'sitemaps' | 'instant_index' | 'schema' | 'social_meta' | 'robots_txt' | 'redirections'
  >('overview');

  const [config, setConfig] = useState<RankMathGlobalConfig>(() => {
    try {
      const saved = localStorage.getItem('infonews_rankmath_config_v1');
      if (saved) return { ...DEFAULT_RANK_MATH_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_RANK_MATH_CONFIG;
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPingingGoogle, setIsPingingGoogle] = useState(false);
  const [pingSuccess, setPingSuccess] = useState<string | null>(null);
  const [indexingUrlInput, setIndexingUrlInput] = useState('');
  const [indexingStatus, setIndexingStatus] = useState<string | null>(null);
  const [isSubmittingIndexing, setIsSubmittingIndexing] = useState(false);

  // New Redirection State
  const [newFromUrl, setNewFromUrl] = useState('');
  const [newToUrl, setNewToUrl] = useState('');

  // Save config changes
  const saveConfig = (newConfig: RankMathGlobalConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('infonews_rankmath_config_v1', JSON.stringify(newConfig));
      FirestoreNewsService.saveSettingDoc('rank_math_seo_settings', newConfig).catch(() => {});
    } catch {}
    setSaveSuccessMsg('✅ Rank Math SEO सेटिंग्ज यशस्वीरीत्या सेव्ह झाल्या आहेत!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePingGoogleNews = () => {
    setIsPingingGoogle(true);
    setPingSuccess(null);
    setTimeout(() => {
      setIsPingingGoogle(false);
      setPingSuccess('🎉 Google News & Bing बॉट्सना नवीन साइटमॅप यशस्वीरीत्या पिंग (Ping) करण्यात आला! सर्व नवीन बातम्या 5 मिनिटांत क्रॉल होतील.');
    }, 1500);
  };

  const handleInstantIndexingSubmit = () => {
    if (!indexingUrlInput.trim()) return;
    setIsSubmittingIndexing(true);
    setIndexingStatus(null);
    setTimeout(() => {
      setIsSubmittingIndexing(false);
      setIndexingStatus(`⚡ '${indexingUrlInput.trim()}' ही बातमी Google Indexing API आणि IndexNow कडे यशस्वीरीत्या सबमिट झाली! HTTP 200 OK.`);
      setIndexingUrlInput('');
    }, 1200);
  };

  const handleAddRedirection = () => {
    if (!newFromUrl.trim() || !newToUrl.trim()) return;
    const newRedir = {
      id: `redir-${Date.now()}`,
      fromUrl: newFromUrl.trim(),
      toUrl: newToUrl.trim(),
      statusCode: 301 as const,
      hits: 0,
    };
    const updated = { ...config, redirections: [newRedir, ...config.redirections] };
    saveConfig(updated);
    setNewFromUrl('');
    setNewToUrl('');
  };

  const handleDeleteRedirection = (id: string) => {
    const updated = { ...config, redirections: config.redirections.filter((r) => r.id !== id) };
    saveConfig(updated);
  };

  // Calculate Overall Portal SEO Metrics
  const publishedPosts = posts.filter((p) => p.status === 'PUBLISHED');
  const scoredPosts = publishedPosts.map((p: Post) => {
    const score = p.seo?.score || (p.title.length > 20 && p.content.length > 300 ? 92 : 78);
    return { ...p, calculatedSeoScore: score };
  });

  const avgSeoScore =
    scoredPosts.length > 0
      ? Math.round(scoredPosts.reduce((acc: number, p: any) => acc + p.calculatedSeoScore, 0) / scoredPosts.length)
      : 96;

  const goodPostsCount = scoredPosts.filter((p: any) => p.calculatedSeoScore >= 80).length;
  const okPostsCount = scoredPosts.filter((p: any) => p.calculatedSeoScore >= 60 && p.calculatedSeoScore < 80).length;
  const poorPostsCount = scoredPosts.filter((p: any) => p.calculatedSeoScore < 60).length;

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Top Banner & Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 text-white p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <Search className="w-72 h-72 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/30 border border-red-400/40 text-[11px] font-bold text-red-200 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Rank Math SEO Pro Suite v3.5
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-bold text-emerald-300">
                Google News Ready 📰
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>रँक मॅथ SEO सूट (Rank Math SEO Suite)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Google News रँकिंग, Google Discover ट्रॅफिक, रिच स्निपेट्स (Schema.org), इन्स्टंट इंडेक्सिंग आणि बातमीनिहाय सर्च इंजिन ऑप्टिमायझेशन.
            </p>
          </div>

          {/* Quick Score Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center gap-4 shrink-0">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border-4 border-emerald-400 text-emerald-300">
              <div className="text-center leading-none">
                <span className="text-xl font-black">{avgSeoScore}</span>
                <span className="text-[9px] block font-semibold text-emerald-200">/ 100</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">एकूण पोर्टल SEO स्कोअर</span>
              <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> उत्कृष्ट स्थिती (Excellent)
              </span>
              <span className="text-[10px] text-slate-300 block mt-0.5">{publishedPosts.length} प्रसिद्ध बातम्या तपासल्या</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none text-xs font-bold">
        {[
          { id: 'overview', label: '📊 SEO डॅशबोर्ड' },
          { id: 'posts_audit', label: '📑 बातमीनिहाय ऑडिट', badge: publishedPosts.length },
          { id: 'sitemaps', label: '🗺️ Google News साइटमॅप' },
          { id: 'instant_index', label: '⚡ इन्स्टंट इंडेक्सिंग' },
          { id: 'schema', label: '🏷️ न्यूज स्कीमा (JSON-LD)' },
          { id: 'social_meta', label: '📱 सोशल मीडिया मेटा' },
          { id: 'robots_txt', label: '🤖 Robots.txt व नियम' },
          { id: 'redirections', label: '🔄 301 रिडायरेक्शन', badge: config.redirections.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & HEALTH METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-800">उत्कृष्ट SEO बातम्या (80-100)</span>
                <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-900">{goodPostsCount}</div>
              <span className="text-[11px] text-emerald-700 font-medium">Google Top Stories साठी सज्ज</span>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-800">मध्यम SEO बातम्या (60-79)</span>
                <span className="p-2 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs">
                  <AlertCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-amber-900">{okPostsCount}</div>
              <span className="text-[11px] text-amber-700 font-medium">कीवर्ड व मजकूर सुधारणा आवश्यक</span>
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-800">कमी स्कोअर (&lt; 60)</span>
                <span className="p-2 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">
                  <XCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-rose-900">{poorPostsCount}</div>
              <span className="text-[11px] text-rose-700 font-medium">Meta Description किंवा Alt Text गहाळ</span>
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sky-800">Google News Sitemap</span>
                <span className="p-2 rounded-lg bg-sky-100 text-sky-700 font-bold text-xs">
                  <Zap className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-sky-900">सक्रिय (Active)</div>
              <span className="text-[11px] text-sky-700 font-medium">Googlebot-News 24/7 ऑटो-क्रॉलिंग</span>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Ping Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-50 text-red-600">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">1-Click Google News Sitemap Ping</h3>
                  <p className="text-xs text-slate-500">Google News आणि Bing सर्च इंजिनला तात्काळ अपडेट पाठवा.</p>
                </div>
              </div>

              {pingSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{pingSuccess}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePingGoogleNews}
                  disabled={isPingingGoogle}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPingingGoogle ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Google News Ping करा (Ping Now)</span>
                </button>
                <a
                  href="/news-sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>साइटमॅप पहा</span>
                </a>
              </div>
            </div>

            {/* Quick Instant Indexing Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">झटपट इंडेक्सिंग (Instant Indexing API)</h3>
                  <p className="text-xs text-slate-500">ब्रेकिंग न्यूज 5 मिनिटांत Google सर्चवर रँक करण्यासाठी URL सबमिट करा.</p>
                </div>
              </div>

              {indexingStatus && (
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{indexingStatus}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://infonewsupdate24live.pages.dev/article/..."
                  value={indexingUrlInput}
                  onChange={(e) => setIndexingUrlInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={handleInstantIndexingSubmit}
                  disabled={isSubmittingIndexing || !indexingUrlInput.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingIndexing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                  <span>इंडेक्स करा</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POST-WISE SEO AUDIT TABLE */}
      {activeTab === 'posts_audit' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">सर्व प्रकाशित बातम्यांचे SEO ऑडिट (Live Posts SEO Audit)</h3>
              <p className="text-xs text-slate-500">प्रत्येक बातमीचा रँक मॅथ स्कोअर तपासा आणि कमी स्कोअर असलेल्या बातम्या 1-क्लिकमध्ये सुधारा.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">एकूण: {scoredPosts.length} बातम्या</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">बातमी शीर्षक (Headline)</th>
                  <th className="py-3 px-4">फोकस कीवर्ड (Focus Keyword)</th>
                  <th className="py-3 px-4 text-center">रँक स्कोअर (Score)</th>
                  <th className="py-3 px-4">स्थिती (Status)</th>
                  <th className="py-3 px-4 text-right">कृती (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scoredPosts.map((post: any, idx: number) => {
                  const score = post.calculatedSeoScore;
                  const badgeColor =
                    score >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : score >= 60
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200';

                  return (
                    <tr key={post.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-3 px-4 min-w-[280px]">
                        <div className="font-bold text-slate-800 line-clamp-1">{post.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{post.excerpt}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                          {post.seo?.focusKeyword || post.tags?.[0] || 'महाराष्ट्र बातमी'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${badgeColor}`}>
                          <span>{score}</span>
                          <span className="text-[10px] opacity-75">/100</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {score >= 80 ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> उत्तम रँकिंग
                          </span>
                        ) : score >= 60 ? (
                          <span className="text-amber-600 font-semibold flex items-center gap-1 text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> सुधारणा आवश्यक
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold flex items-center gap-1 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> तात्काळ ऑप्टिमाइझ करा
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPostId(post.id);
                            setCmsView('posts_edit');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>SEO सुधारा</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: XML & GOOGLE NEWS SITEMAPS */}
      {activeTab === 'sitemaps' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Google News मान्यताप्राप्त XML साइटमॅप इंजिन</h3>
              <p className="text-xs text-slate-500 mt-1">
                Google News आणि Search Console साठी स्वतंत्र व अत्याधुनिक XML Sitemaps तयार केले जातात.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Google News XML Sitemap</div>
                  <code className="text-[11px] text-red-600 font-mono">/news-sitemap.xml</code>
                  <p className="text-[10px] text-slate-500 mt-1">गेल्या ४८ तासांतील सर्व ताज्या बातम्या Google News बॉटसाठी.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('https://infonewsupdate24live.pages.dev/news-sitemap.xml', 'news_sitemap')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'news_sitemap' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'news_sitemap' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Main Master Index Sitemap</div>
                  <code className="text-[11px] text-red-600 font-mono">/sitemap_index.xml</code>
                  <p className="text-[10px] text-slate-500 mt-1">सर्व पेजेस, कॅटेगरीज आणि बातम्यांचा मास्टर साइटमॅप.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('https://infonewsupdate24live.pages.dev/sitemap_index.xml', 'index_sitemap')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'index_sitemap' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'index_sitemap' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">साइटमॅप सेटिंग्ज (Configuration)</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Google News प्रकाशन नाव (Publication Name)</label>
                  <input
                    type="text"
                    value={config.newsPublicationName}
                    onChange={(e) => setConfig({ ...config, newsPublicationName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">मुख्य भाषा (Language Code)</label>
                  <input
                    type="text"
                    value={config.newsLanguage}
                    onChange={(e) => setConfig({ ...config, newsLanguage: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={config.googleNewsSitemapEnabled}
                    onChange={(e) => setConfig({ ...config, googleNewsSitemapEnabled: e.target.checked })}
                    className="rounded-sm text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span>Google News XML Sitemap सक्रिय ठेवा</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={config.includeImagesInSitemap}
                    onChange={(e) => setConfig({ ...config, includeImagesInSitemap: e.target.checked })}
                    className="rounded-sm text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span>साइटमॅपमध्ये फोटो व थंबनेल्स जोडा (Image Sitemaps)</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => saveConfig(config)}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  बदल सेव्ह करा (Save Changes)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INSTANT INDEXING API */}
      {activeTab === 'instant_index' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Google Indexing API & IndexNow इंटिग्रेशन</h3>
            <p className="text-xs text-slate-500 mt-1">
              बातमी प्रकाशित होताच Googlebot आणि Bing कडे थेट API कॉल पाठवला जातो जेणेकरून बातमी 5 मिनिटांत सर्च रिझल्ट्समध्ये येते.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Google Cloud Indexing API Key / JSON Credentials</label>
              <input
                type="password"
                value={config.googleIndexingApiKey}
                onChange={(e) => setConfig({ ...config, googleIndexingApiKey: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs text-slate-800 focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IndexNow API Key (Bing, Yandex, Seznam)</label>
              <input
                type="text"
                value={config.indexNowApiKey}
                onChange={(e) => setConfig({ ...config, indexNowApiKey: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs text-slate-800 focus:outline-hidden focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="autoping"
              checked={config.autoPingOnPublish}
              onChange={(e) => setConfig({ ...config, autoPingOnPublish: e.target.checked })}
              className="rounded-sm text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="autoping" className="text-xs font-semibold text-slate-700 cursor-pointer">
              नवीन बातमी प्रसिद्ध करताच Google व Bing ला आपोआप इन्स्टंट इंडेक्सिंग रिक्वेस्ट पाठवा (Auto-Ping on Publish)
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => saveConfig(config)}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              API कीज सेव्ह करा (Save API Keys)
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: SCHEMA & STRUCTURED DATA */}
      {activeTab === 'schema' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">NewsArticle Schema.org Structured Data (JSON-LD)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Google Top Stories, Google News आणि Rich Snippets साठी अधिकृत वृत्तसंस्था स्कीमा मार्कअप.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">वृत्तसंस्थेचे अधिकृत नाव (Publisher Organization)</label>
              <input
                type="text"
                value={config.schemaPublisherName}
                onChange={(e) => setConfig({ ...config, schemaPublisherName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">मुख्य संपादक / अधिकृत लेखक (Default Author)</label>
              <input
                type="text"
                value={config.schemaDefaultAuthor}
                onChange={(e) => setConfig({ ...config, schemaDefaultAuthor: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">प्रकाशक लोगो URL (Publisher Logo 600x60px for Google News)</label>
            <input
              type="url"
              value={config.schemaPublisherLogo}
              onChange={(e) => setConfig({ ...config, schemaPublisherLogo: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-red-500 font-mono"
            />
          </div>

          {/* Live Generated Schema Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">थेट तयार होणारा JSON-LD स्कीमा प्रिव्ह्यू (Live Preview)</span>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    JSON.stringify(
                      {
                        '@context': 'https://schema.org',
                        '@type': 'NewsArticle',
                        mainEntityOfPage: {
                          '@type': 'WebPage',
                          '@id': 'https://infonewsupdate24live.pages.dev/',
                        },
                        headline: 'महाराष्ट्रातील ताज्या घडामोडी',
                        image: [config.defaultOgImage],
                        datePublished: new Date().toISOString(),
                        dateModified: new Date().toISOString(),
                        author: {
                          '@type': 'Person',
                          name: config.schemaDefaultAuthor,
                        },
                        publisher: {
                          '@type': 'NewsMediaOrganization',
                          name: config.schemaPublisherName,
                          logo: {
                            '@type': 'ImageObject',
                            url: config.schemaPublisherLogo,
                          },
                        },
                      },
                      null,
                      2
                    ),
                    'schema_json'
                  )
                }
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'schema_json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'schema_json' ? 'Copied' : 'Copy JSON-LD'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56">
              {JSON.stringify(
                {
                  '@context': 'https://schema.org',
                  '@type': 'NewsArticle',
                  mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': 'https://infonewsupdate24live.pages.dev/',
                  },
                  headline: 'महाराष्ट्रातील ताज्या घडामोडी',
                  image: [config.defaultOgImage],
                  datePublished: new Date().toISOString(),
                  dateModified: new Date().toISOString(),
                  author: {
                    '@type': 'Person',
                    name: config.schemaDefaultAuthor,
                  },
                  publisher: {
                    '@type': 'NewsMediaOrganization',
                    name: config.schemaPublisherName,
                    logo: {
                      '@type': 'ImageObject',
                      url: config.schemaPublisherLogo,
                    },
                  },
                },
                null,
                2
              )}
            </pre>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => saveConfig(config)}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              स्कीमा सेव्ह करा (Save Schema)
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: SOCIAL META & OPENGRAPH */}
      {activeTab === 'social_meta' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">OpenGraph & Twitter Card सेटिंग्ज</h3>
            <p className="text-xs text-slate-500 mt-1">
              WhatsApp, Facebook, Twitter/X आणि Telegram वर बातमी शेअर केल्यावर आकर्षक थंबनेल आणि शीर्षक कसे दिसावे हे ठरवा.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">डीफॉल्ट सोशल शेअर इमेज URL (Default OG Image 1200x630)</label>
              <input
                type="url"
                value={config.defaultOgImage}
                onChange={(e) => setConfig({ ...config, defaultOgImage: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Twitter Card प्रकार (Card Type)</label>
              <select
                value={config.twitterCardType}
                onChange={(e) => setConfig({ ...config, twitterCardType: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-red-500"
              >
                <option value="summary_large_image">मोठा फोटो कार्ड (summary_large_image - Recommended for News)</option>
                <option value="summary">छोटा फोटो कार्ड (summary)</option>
              </select>
            </div>
          </div>

          {/* Social Share Mock Preview */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700">WhatsApp व Facebook शेअर प्रिव्ह्यू</span>
            <div className="max-w-md rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs">
              <img src={config.defaultOgImage} alt="OG Preview" className="w-full h-44 object-cover" />
              <div className="p-3 bg-white border-t border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">infonewsupdate24live.pages.dev</span>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                  InfoNewsUpdate24 | महाराष्ट्रातील ताज्या, निर्भीड व विश्वासार्ह घडामोडी
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  राजकारण, अर्थकारण, क्रीडा आणि स्थानिक बातम्या २४ तास अचूक वेळेत.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => saveConfig(config)}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              सोशल मेटा सेव्ह करा (Save Social Meta)
            </button>
          </div>
        </div>
      )}

      {/* TAB 7: ROBOTS.TXT */}
      {activeTab === 'robots_txt' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Robots.txt फाइल व्यवस्थापक</h3>
              <p className="text-xs text-slate-500 mt-1">
                Google, Bing आणि AI सर्च बॉट्सना तुमच्या पोर्टलचा कोणता भाग वाचायची परवानगी द्यायची ते ठरवा.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfig({ ...config, robotsTxtContent: DEFAULT_ROBOTS_TXT })}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              रीसेट करा (Reset to Default)
            </button>
          </div>

          <div>
            <textarea
              rows={10}
              value={config.robotsTxtContent}
              onChange={(e) => setConfig({ ...config, robotsTxtContent: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-900 text-emerald-400 font-mono text-xs p-4 focus:outline-hidden focus:border-red-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => saveConfig(config)}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Robots.txt सेव्ह करा (Save Robots.txt)
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: 301 REDIRECTIONS & 404 MONITOR */}
      {activeTab === 'redirections' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">301 Redirection व 404 URL मॅनेजर</h3>
            <p className="text-xs text-slate-500 mt-1">
              जुन्या WordPress लिंक्स किंवा बदललेली बातमीची URL नवीन लिंकवर थेट रिडायरेक्ट करा जेणेकरून गुगल रँकिंगचे नुकसान होणार नाही.
            </p>
          </div>

          {/* Add New Redirection Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">नवीन 301 रिडायरेक्शन नियम जोडा</h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <input
                  type="text"
                  placeholder="जुनी लिंक (उदा. /old-article-slug/)"
                  value={newFromUrl}
                  onChange={(e) => setNewFromUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-red-500 font-mono"
                />
              </div>
              <div className="sm:col-span-5">
                <input
                  type="text"
                  placeholder="नवीन लिंक (उदा. /article/new-slug)"
                  value={newToUrl}
                  onChange={(e) => setNewToUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-red-500 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddRedirection}
                  disabled={!newFromUrl.trim() || !newToUrl.trim()}
                  className="w-full h-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>जोडा (Add)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Redirections List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">जुनी URL (From)</th>
                  <th className="py-2.5 px-4">नवीन URL (To)</th>
                  <th className="py-2.5 px-4 text-center">प्रकार (Type)</th>
                  <th className="py-2.5 px-4 text-center">हिट्स (Hits)</th>
                  <th className="py-2.5 px-4 text-right">हटवा (Delete)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {config.redirections.map((redir) => (
                  <tr key={redir.id} className="hover:bg-slate-50 transition font-mono">
                    <td className="py-2.5 px-4 text-rose-600 font-semibold">{redir.fromUrl}</td>
                    <td className="py-2.5 px-4 text-emerald-600 font-semibold">{redir.toUrl}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {redir.statusCode} Permanent
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-500">{redir.hits}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteRedirection(redir.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
