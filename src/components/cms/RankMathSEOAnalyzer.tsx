import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  Smartphone,
  Monitor,
  Share2,
  Globe,
  Code2,
  FileCode,
  Tag,
  Plus,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Flame,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Eye,
  Sliders,
  Award,
} from 'lucide-react';

import {
  calculateEditorialSEOScore,
  checkGoogleNewsReadiness,
  checkGoogleDiscoverReadiness,
  checkFeaturedImageSafety,
  MARATHI_POWER_WORDS,
} from '../../services/SEOAutoOptimizer';

export interface RankMathProps {
  title: string;
  setTitle: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  content: string;
  setContent: (val: string) => void;
  excerpt: string;
  setExcerpt: (val: string) => void;
  featuredImage: string;
  featuredImageAlt: string;
  setFeaturedImageAlt: (val: string) => void;
  focusKeyword: string;
  setFocusKeyword: (val: string) => void;
  seoTitle: string;
  setSeoTitle: (val: string) => void;
  metaDescription: string;
  setMetaDescription: (val: string) => void;
  categoryName?: string;
  authorName?: string;
  publishDate?: string;
  isPublished?: boolean;
  onAutoPopulate?: () => void;
}

export const RankMathSEOAnalyzer: React.FC<RankMathProps> = ({
  title,
  setTitle,
  slug,
  setSlug,
  content,
  setContent,
  excerpt,
  setExcerpt,
  featuredImage,
  featuredImageAlt,
  setFeaturedImageAlt,
  focusKeyword,
  setFocusKeyword,
  seoTitle,
  setSeoTitle,
  metaDescription,
  setMetaDescription,
  categoryName = 'महाराष्ट्र',
  authorName = 'संपादकीय मंडळ',
  publishDate = new Date().toLocaleDateString('mr-IN'),
  isPublished = false,
  onAutoPopulate,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'google_readiness' | 'advanced' | 'schema' | 'social' | 'ai_tools'>('general');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [isEditSnippetOpen, setIsEditSnippetOpen] = useState(false);
  const [schemaType, setSchemaType] = useState<'NewsArticle' | 'Article' | 'FAQPage'>('NewsArticle');
  const [isNoIndex, setIsNoIndex] = useState(false);
  const [isNoFollow, setIsNoFollow] = useState(false);
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Single Authoritative 100-Point Editorial SEO Evaluation
  const seoEvaluation = calculateEditorialSEOScore({
    title,
    slug,
    content,
    excerpt,
    featuredImage,
    featuredImageAlt,
    focusKeyword,
    seoTitle,
    metaDescription,
    authorName,
    publishDate,
    isPublished,
  });

  const {
    score: finalScore,
    checks,
    prioritySuggestions,
    newsReadiness,
    discoverReadiness,
    imageSafety,
    badge,
  } = seoEvaluation;

  // Helper calculations for SERP Preview
  const effectiveSeoTitle = seoTitle.trim() || title.trim() || 'बातम्यांचे शीर्षक (Title)';
  const effectiveMetaDesc =
    metaDescription.trim() ||
    excerpt.trim() ||
    (content.length > 0
      ? content.slice(0, 155).replace(/[#*`_]/g, '') + '...'
      : 'बातमीचा संक्षिप्त तपशील गुगल सर्चमध्ये येथे दिसेल...');
  const effectiveSlug = slug.trim() || 'news-article-slug';

  const titleCharCount = effectiveSeoTitle.length;
  const descCharCount = effectiveMetaDesc.length;

  // Secondary Keyword Management
  const handleAddSecondaryKeyword = () => {
    if (newKeywordInput.trim() && !secondaryKeywords.includes(newKeywordInput.trim())) {
      setSecondaryKeywords([...secondaryKeywords, newKeywordInput.trim()]);
      setNewKeywordInput('');
    }
  };

  const handleRemoveSecondaryKeyword = (kwToRemove: string) => {
    setSecondaryKeywords(secondaryKeywords.filter((k) => k !== kwToRemove));
  };

  // AI Headline & Meta Generator (Smart Suggestions)
  const handleGenerateAiSuggestions = () => {
    setAiLoading(true);
    setTimeout(() => {
      const raw = title.trim() || focusKeyword.trim() || 'ताज्या घडामोडी';
      const cleanTopic = raw.replace(/^[🔴⚡🚨📢]\s*/, '').replace(/^.*?:\s*/, '').trim();

      setAiSuggestions([
        `🔴 ${cleanTopic}: ५ मोठे बदल आणि महत्त्वाचे नियम जाहीर; पाहा सविस्तर`,
        `⚡ ${cleanTopic} विषयी मोठी बातमी! नागरिकांना दिलासा; तात्काळ वाचा संपूर्ण माहिती`,
        `🚨 ${cleanTopic} संदर्भात महत्त्वाचा निर्णय; ३ महत्त्वाचे मुद्दे समोर`,
        `📢 ${cleanTopic}: काय आहेत नवीन नियम? जाणून घ्या सविस्तर वृत्त`,
      ]);
      setAiLoading(false);
    }, 450);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden text-xs">
      {/* 1. TOP HEADER WITH EDITORIAL SEO QUALITY SPEEDOMETER SCORE */}
      <div className={`p-5 border-b ${badge.borderColor} ${badge.bgColor} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          {/* Circular Score Meter */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white font-black shadow-md">
            <span className="text-xl">{finalScore}</span>
            <span className="text-[9px] text-slate-400 absolute -bottom-1">/100</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-red-600" />
                <span>Editorial SEO Quality Assistant</span>
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black text-white ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
              {badge.message} <span className="text-slate-400 font-normal">(अंतर्गत संपादकीय गुणवत्ता मार्गदर्शक)</span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onAutoPopulate && (
            <button
              type="button"
              onClick={onAutoPopulate}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-black text-white shadow-sm hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer active:scale-95"
              title="केवळ रिकामी किंवा अपूर्ण SEO फील्ड्स भरा (मूळ मजकूर व URL सुरक्षित राहतील)"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              <span>⚡ Fill Missing SEO Fields (95+)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditSnippetOpen(!isEditSnippetOpen)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5 text-amber-400" />
            <span>{isEditSnippetOpen ? 'स्निपेट लपवा' : 'Edit SERP Snippet (गुगल प्रिव्ह्यू)'}</span>
          </button>
        </div>
      </div>

      {/* 2. FOCUS KEYWORDS BAR */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
        <div>
          <label className="font-black text-slate-800 text-xs mb-1 block flex items-center justify-between">
            <span>🎯 Primary Focus Keyword (मुख्य कीवर्ड):</span>
            <span className="text-[11px] font-normal text-slate-500">
              हा कीवर्ड ज्यावर तुम्हाला ही बातमी गुगलमध्ये #1 वर आणायची आहे.
            </span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="उदा. मान्सून पाऊस अलर्ट किंवा IPL मुंबई विजय..."
                className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 font-bold text-slate-900 focus:border-red-600 focus:outline-hidden"
              />
            </div>

            {/* Quick Auto-detect keyword button */}
            <button
              type="button"
              onClick={() => {
                if (!focusKeyword && title) {
                  const words = title.split(/\s+/).slice(0, 3).join(' ');
                  setFocusKeyword(words);
                }
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="शीर्षकातून कीवर्ड निवडा"
            >
              शीर्षकातून घ्या
            </button>
          </div>
        </div>

        {/* Secondary Keywords */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60">
          <span className="text-[11px] font-bold text-slate-600">अतिरिक्त कीवर्ड्स (Secondary Keywords):</span>
          {secondaryKeywords.map((skw) => (
            <span
              key={skw}
              className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-2xs"
            >
              <span>{skw}</span>
              <button
                type="button"
                onClick={() => handleRemoveSecondaryKeyword(skw)}
                className="text-slate-400 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {/* Add Secondary Keyword input */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="+ आणखी कीवर्ड..."
              value={newKeywordInput}
              onChange={(e) => setNewKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSecondaryKeyword();
                }
              }}
              className="h-6 w-32 rounded border border-slate-200 bg-white px-2 text-[11px] text-slate-800 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleAddSecondaryKeyword}
              className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-300"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 3. GOOGLE SERP PREVIEW BOX (COLLAPSIBLE / TOGGLEABLE) */}
      {isEditSnippetOpen && (
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                Google SERP Snippet Preview
              </span>
              <span className="text-xs text-slate-400">गुगल सर्च परिणामांमध्ये बातमी कशी दिसेल</span>
            </div>

            {/* Desktop / Mobile Preview Toggle */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  previewDevice === 'desktop' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="h-3 w-3" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  previewDevice === 'mobile' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-3 w-3" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Real Google Search Mock Card */}
          <div
            className={`p-4 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-lg font-sans space-y-1.5 ${
              previewDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-black">
                24
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="font-bold text-slate-800 text-[11px]">InfoNewsUpdate24</span>
                <span className="text-[10px] text-slate-500 font-mono truncate">
                  https://infonewsupdate24.com &rsaquo; news &rsaquo; {effectiveSlug}
                </span>
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
              {effectiveSeoTitle}
            </h3>

            <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
              <span className="text-slate-400 font-normal">{publishDate} &mdash; </span>
              {effectiveMetaDesc}
            </p>
          </div>

          {/* Quick Edit Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-300 mb-1">
                <span>SEO Meta Title:</span>
                <span className={titleCharCount > 70 ? 'text-red-400 font-mono' : 'text-emerald-400 font-mono'}>
                  {titleCharCount}/60 chars
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Google Search साठी आकर्षक शीर्षक..."
                className="h-8 w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 text-xs text-white focus:border-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-300 mb-1">
                <span>Meta Description:</span>
                <span className={descCharCount > 160 ? 'text-red-400 font-mono' : 'text-emerald-400 font-mono'}>
                  {descCharCount}/160 chars
                </span>
              </div>
              <input
                type="text"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Google सर्च स्निपेटमध्ये दिसणारा सारांश..."
                className="h-8 w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 text-xs text-white focus:border-red-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. TABS NAVIGATION */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 px-4 pt-3 text-xs font-bold bg-white">
        {[
          { id: 'general', label: '📊 SEO Diagnostics', count: checks.filter((c) => c.passed).length + '/' + checks.length },
          {
            id: 'google_readiness',
            label: '📰 Google News & Discover',
            status: newsReadiness.status === 'READY' && discoverReadiness.status === 'READY' ? '🟢 Ready' : '🟡 Review',
          },
          { id: 'ai_tools', label: '🤖 AI Headline Tools' },
          { id: 'schema', label: '📜 NewsArticle Schema' },
          { id: 'social', label: '📱 Social OpenGraph' },
          { id: 'advanced', label: '⚙️ Advanced Robots' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-red-600 text-red-600 font-black'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count && (
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${activeTab === tab.id ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                {tab.count}
              </span>
            )}
            {tab.status && (
              <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-700">
                {tab.status}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ======================================================================= */}
      {/* TAB CONTENT 1: SEO DIAGNOSTIC CHECKLIST */}
      {/* ======================================================================= */}
      {activeTab === 'general' && (
        <div className="p-5 space-y-6">
          {/* Published Slug Lock Warning */}
          {isPublished && (
            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 flex items-center gap-2.5 text-xs font-semibold">
              <span className="text-base">🔒</span>
              <div>
                <strong>प्रकाशित बातमी URL (Slug) सुरक्षित:</strong> ही बातमी आधीपासून प्रकाशित आहे. सोशल मीडिया व सर्च इंजिनवरील जुन्या लिंक्स चालू राहण्यासाठी मूळ URL बदलू नये.
              </div>
            </div>
          )}

          {/* Featured Image Safety Check Alert */}
          {imageSafety.warning && (
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
              imageSafety.type === 'OK' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}>
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <div>{imageSafety.warning}</div>
            </div>
          )}

          {/* Priority Improvement Suggestions */}
          {prioritySuggestions.length > 0 && finalScore < 90 && (
            <div className="p-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 space-y-2">
              <div className="flex items-center gap-2 font-black text-amber-900 text-xs">
                <Flame className="h-4 w-4 text-amber-600 fill-amber-500" />
                <span>🔥 सर्वात महत्त्वाच्या सुधारणा (Top Recommendations):</span>
              </div>
              <ul className="space-y-1.5 pl-1">
                {prioritySuggestions.map((sug, idx) => (
                  <li key={idx} className="text-xs text-amber-950 font-bold flex items-start gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] shrink-0 mt-0.5 font-mono">
                      {idx + 1}
                    </span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 1: Basic SEO (25 Points) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span>१. मूलभूत SEO (Basic SEO — २५ गुण)</span>
              <span className="text-emerald-700 font-bold">
                {checks.filter((c) => c.category === 'basic').reduce((sum, c) => sum + c.earnedPoints, 0)} / 25 गुण
              </span>
            </h4>

            <div className="divide-y divide-slate-100">
              {checks
                .filter((c) => c.category === 'basic')
                .map((chk) => (
                  <div key={chk.id} className="py-2 flex items-start gap-2.5">
                    {chk.passed && !chk.warning && !chk.info ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : chk.info ? (
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    ) : chk.warning ? (
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-bold ${chk.passed ? 'text-slate-800' : 'text-slate-700'}`}>
                          {chk.label}
                        </p>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-full shrink-0 ${
                          chk.passed && !chk.warning && !chk.info ? 'bg-emerald-100 text-emerald-800' : chk.info ? 'bg-blue-100 text-blue-800' : chk.warning ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          +{chk.earnedPoints}/{chk.scoreWeight} गुण
                        </span>
                      </div>
                      {!chk.passed && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{chk.tip}</p>}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Section 2: Additional SEO (20 Points) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span>२. अतिरिक्त SEO (Additional SEO — २० गुण)</span>
              <span className="text-emerald-700 font-bold">
                {checks.filter((c) => c.category === 'additional').reduce((sum, c) => sum + c.earnedPoints, 0)} / 20 गुण
              </span>
            </h4>

            <div className="divide-y divide-slate-100">
              {checks
                .filter((c) => c.category === 'additional')
                .map((chk) => (
                  <div key={chk.id} className="py-2 flex items-start gap-2.5">
                    {chk.passed && !chk.warning && !chk.info ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : chk.info ? (
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    ) : chk.warning ? (
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-bold ${chk.passed ? 'text-slate-800' : 'text-slate-700'}`}>
                          {chk.label}
                        </p>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-full shrink-0 ${
                          chk.passed && !chk.warning && !chk.info ? 'bg-emerald-100 text-emerald-800' : chk.info ? 'bg-blue-100 text-blue-800' : chk.warning ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          +{chk.earnedPoints}/{chk.scoreWeight} गुण
                        </span>
                      </div>
                      {!chk.passed && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{chk.tip}</p>}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Section 3: Title & CTR Quality (15 Points) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span>३. शीर्षक व CTR दर्जा (Title & CTR Quality — १५ गुण)</span>
              <span className="text-emerald-700 font-bold">
                {checks.filter((c) => c.category === 'title').reduce((sum, c) => sum + c.earnedPoints, 0)} / 15 गुण
              </span>
            </h4>

            <div className="divide-y divide-slate-100">
              {checks
                .filter((c) => c.category === 'title')
                .map((chk) => (
                  <div key={chk.id} className="py-2 flex items-start gap-2.5">
                    {chk.passed && !chk.warning ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : chk.warning ? (
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-bold ${chk.passed ? 'text-slate-800' : 'text-slate-700'}`}>
                          {chk.label}
                        </p>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-full shrink-0 ${
                          chk.passed && !chk.warning ? 'bg-emerald-100 text-emerald-800' : chk.warning ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          +{chk.earnedPoints}/{chk.scoreWeight} गुण
                        </span>
                      </div>
                      {!chk.passed && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{chk.tip}</p>}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Section 4: Content Quality (20 Points) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span>४. मजकूर गुणवत्ता व रचना (Content Quality — २० गुण)</span>
              <span className="text-emerald-700 font-bold">
                {checks.filter((c) => c.category === 'content').reduce((sum, c) => sum + c.earnedPoints, 0)} / 20 गुण
              </span>
            </h4>

            <div className="divide-y divide-slate-100">
              {checks
                .filter((c) => c.category === 'content')
                .map((chk) => (
                  <div key={chk.id} className="py-2 flex items-start gap-2.5">
                    {chk.passed && !chk.warning ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : chk.warning ? (
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-bold ${chk.passed ? 'text-slate-800' : 'text-slate-700'}`}>
                          {chk.label}
                        </p>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-full shrink-0 ${
                          chk.passed && !chk.warning ? 'bg-emerald-100 text-emerald-800' : chk.warning ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          +{chk.earnedPoints}/{chk.scoreWeight} गुण
                        </span>
                      </div>
                      {!chk.passed && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{chk.tip}</p>}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Section 5: Image & Accessibility (5 Points) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span>५. इमेज व ॲक्सेसिबिलिटी (Image & Accessibility — ५ गुण)</span>
              <span className="text-emerald-700 font-bold">
                {checks.filter((c) => c.category === 'image').reduce((sum, c) => sum + c.earnedPoints, 0)} / 5 गुण
              </span>
            </h4>

            <div className="divide-y divide-slate-100">
              {checks
                .filter((c) => c.category === 'image')
                .map((chk) => (
                  <div key={chk.id} className="py-2 flex items-start gap-2.5">
                    {chk.passed && !chk.warning ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : chk.warning ? (
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-bold ${chk.passed ? 'text-slate-800' : 'text-slate-700'}`}>
                          {chk.label}
                        </p>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-full shrink-0 ${
                          chk.passed && !chk.warning ? 'bg-emerald-100 text-emerald-800' : chk.warning ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          +{chk.earnedPoints}/{chk.scoreWeight} गुण
                        </span>
                      </div>
                      {!chk.passed && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{chk.tip}</p>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB CONTENT: GOOGLE NEWS & DISCOVER READINESS */}
      {/* ======================================================================= */}
      {activeTab === 'google_readiness' && (
        <div className="p-5 space-y-6">
          {/* Section 1: Google News Technical Readiness */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">📰 Google News Technical Readiness</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black text-white ${
                  newsReadiness.status === 'READY' ? 'bg-emerald-600' : newsReadiness.status === 'NEEDS_IMPROVEMENT' ? 'bg-amber-500' : 'bg-red-600'
                }`}>
                  {newsReadiness.status === 'READY' ? '🟢 Ready (तयार)' : newsReadiness.status === 'NEEDS_IMPROVEMENT' ? '🟡 Needs Review' : '🔴 Missing Elements'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-bold">
                {newsReadiness.items.filter(i => i.passed).length} / {newsReadiness.items.length} उत्तीर्ण
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {newsReadiness.items.map((item, idx) => (
                <div key={idx} className="py-2 flex items-start gap-2.5">
                  {item.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold ${item.passed ? 'text-slate-800' : 'text-slate-700'}`}>{item.label}</p>
                    {!item.passed && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.tip}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Google Discover Editorial Readiness */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">✨ Google Discover Editorial Readiness</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black text-white ${
                  discoverReadiness.status === 'READY' ? 'bg-emerald-600' : discoverReadiness.status === 'NEEDS_IMPROVEMENT' ? 'bg-amber-500' : 'bg-red-600'
                }`}>
                  {discoverReadiness.status === 'READY' ? '🟢 Ready (तयार)' : discoverReadiness.status === 'NEEDS_IMPROVEMENT' ? '🟡 Needs Review' : '🔴 Missing Elements'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-bold">
                {discoverReadiness.items.filter(i => i.passed).length} / {discoverReadiness.items.length} उत्तीर्ण
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {discoverReadiness.items.map((item, idx) => (
                <div key={idx} className="py-2 flex items-start gap-2.5">
                  {item.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold ${item.passed ? 'text-slate-800' : 'text-slate-700'}`}>{item.label}</p>
                    {!item.passed && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.tip}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            ℹ️ टीप: हे चेकलिस्ट तांत्रिक व संपादकीय दर्जा तपासण्यासाठी आहे. हे इंडेक्सिंग किंवा ट्रॅफिकची हमी देत नाही, तर बातमी गुगलच्या सर्वोत्तम नियमांनुसार तयार करण्यास मदत करते.
          </p>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB CONTENT 2: AI HEADLINE & META TOOLS */}
      {/* ======================================================================= */}
      {activeTab === 'ai_tools' && (
        <div className="p-5 space-y-4">
          {onAutoPopulate && (
            <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-purple-950 text-xs flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-purple-600 fill-purple-600" />
                  1-Click Complete Auto-Populate &amp; Rank Math 95+ Optimizer
                </span>
                <button
                  type="button"
                  onClick={onAutoPopulate}
                  className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition-all cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                  <span>आताच Auto-Populate करा</span>
                </button>
              </div>
              <p className="text-xs text-purple-900 leading-relaxed">
                फक्त कच्ची बातमी टाका; ही सिस्टीम Focus Keyword, High-CTR शीर्षक, URL Slug, H2/H3 सबहेडिंग्ज, इमेज Alt आणि मेटा टॅग्ज एका सेकंदात आपोआप भरून देईल.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-blue-600" />
                AI SEO Headline & Title Suggester (मराठी हेडलाइन्स)
              </span>
              <button
                type="button"
                onClick={handleGenerateAiSuggestions}
                disabled={aiLoading}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{aiLoading ? 'तयार करत आहे...' : 'नवीन 4 हेडलाइन्स सुचवा'}</span>
              </button>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              गुगल सर्च आणि सोशल मीडियामध्ये जास्त क्लिक्स् (High CTR) मिळवण्यासाठी AI द्वारे प्रमाणित मराठी हेडलाइन्स.
            </p>
          </div>

          {/* Suggestions List */}
          {aiSuggestions.length > 0 && (
            <div className="space-y-2.5">
              <h5 className="font-bold text-slate-800 text-xs">सुचवलेली शीर्षके (Click to Apply):</h5>
              {aiSuggestions.map((sug, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setTitle(sug);
                    setSeoTitle(sug);
                  }}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-red-500 hover:bg-red-50/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <p className="font-bold text-slate-900 group-hover:text-red-600 leading-snug">{sug}</p>
                  <span className="rounded bg-slate-100 group-hover:bg-red-600 group-hover:text-white px-2 py-1 text-[10px] font-bold text-slate-600 shrink-0 transition-colors">
                    हे वापरा &rarr;
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Excerpt to Meta Description Copy */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <h5 className="font-bold text-slate-900 text-xs">एका क्लिकवर सारांश मेटा वर्णनात टाका:</h5>
            <p className="text-slate-600 text-xs">{excerpt || 'सध्या कोणताही सारांश नाही.'}</p>
            <button
              type="button"
              disabled={!excerpt}
              onClick={() => setMetaDescription(excerpt)}
              className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-white hover:bg-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
            >
              सारांश मेटा वर्णनात कॉपी करा
            </button>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB CONTENT 3: SCHEMA GENERATOR (JSON-LD) */}
      {/* ======================================================================= */}
      {activeTab === 'schema' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Google News Schema Structured Data</h4>
              <p className="text-slate-500 text-[11px]">
                Google News आणि Discover मध्ये बातमी दाखवण्यासाठी JSON-LD कोड.
              </p>
            </div>
            <select
              value={schemaType}
              onChange={(e) => setSchemaType(e.target.value as any)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-800 focus:outline-hidden"
            >
              <option value="NewsArticle">NewsArticle (बातमीसाठी सर्वोत्तम)</option>
              <option value="Article">Standard Article</option>
              <option value="FAQPage">FAQ Schema</option>
            </select>
          </div>

          {/* JSON-LD Code Block */}
          {(() => {
            const schemaJson = {
              '@context': 'https://schema.org',
              '@type': schemaType,
              headline: effectiveSeoTitle,
              description: effectiveMetaDesc,
              image: [featuredImage],
              datePublished: new Date().toISOString(),
              dateModified: new Date().toISOString(),
              author: {
                '@type': 'Person',
                name: authorName,
              },
              publisher: {
                '@type': 'Organization',
                name: 'InfoNewsUpdate24',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://infonewsupdate24.com/logo.png',
                },
              },
              articleSection: categoryName,
              keywords: [focusKeyword, ...secondaryKeywords].filter(Boolean).join(', '),
            };

            const jsonString = JSON.stringify(schemaJson, null, 2);

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">&lt;script type="application/ld+json"&gt;</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(jsonString);
                        setCopiedSnippet(true);
                        setTimeout(() => setCopiedSnippet(false), 2000);
                      }
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    {copiedSnippet ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSnippet ? 'कॉपी झाले!' : 'JSON-LD कॉपी करा'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-[11px] text-emerald-400 leading-relaxed max-h-64">
                  {jsonString}
                </pre>
              </div>
            );
          })()}
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB CONTENT 4: SOCIAL OPENGRAPH */}
      {/* ======================================================================= */}
      {activeTab === 'social' && (
        <div className="p-5 space-y-4">
          <h4 className="font-bold text-slate-900 text-xs">Facebook &amp; WhatsApp OpenGraph Card Preview:</h4>
          <div className="max-w-md rounded-xl border border-slate-200 overflow-hidden bg-white shadow-md">
            <img
              src={featuredImage}
              alt=""
              className="h-48 w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">INFONEWSUPDATE24.COM</span>
              <h5 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                {effectiveSeoTitle}
              </h5>
              <p className="text-xs text-slate-500 line-clamp-2">{effectiveMetaDesc}</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB CONTENT 5: ADVANCED ROBOTS */}
      {/* ======================================================================= */}
      {activeTab === 'advanced' && (
        <div className="p-5 space-y-4">
          <h4 className="font-bold text-slate-900 text-xs">Robots Meta Directives:</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isNoIndex}
                onChange={(e) => setIsNoIndex(e.target.checked)}
                className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
              />
              <span>NoIndex (सर्च इंजिनमध्ये ही बातमी इंडेक्स करू नका)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isNoFollow}
                onChange={(e) => setIsNoFollow(e.target.checked)}
                className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
              />
              <span>NoFollow (या बातमीतील लिंक्स फॉलो करू नका)</span>
            </label>

            <div>
              <label className="font-bold text-slate-700 text-xs mb-1 block">Canonical URL:</label>
              <input
                type="url"
                placeholder="https://infonewsupdate24.com/news/..."
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="h-8 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-red-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
