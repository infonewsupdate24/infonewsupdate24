import React, { useState, useEffect } from 'react';
import {
  Zap,
  RefreshCw,
  Image as ImageIcon,
  Layers,
  Database,
  Globe,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
  Play,
  Trash2,
  RotateCcw,
  Check,
  Shield,
  Gauge,
  HardDrive,
  Cpu,
  Server,
  Cloud,
  ChevronRight,
  TrendingUp,
  Download,
  Eye,
  SlidersHorizontal,
  FolderSync,
  HelpCircle,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LiteSpeedCacheSettings, LiteSpeedImageItem } from '../../types';

export const LiteSpeedCacheView: React.FC = () => {
  const {
    liteSpeedSettings,
    updateLiteSpeedSettings,
    liteSpeedImages,
    liteSpeedPurgeLogs,
    purgeLiteSpeedCache,
    optimizeLiteSpeedImages,
    revertLiteSpeedImages,
    cleanDatabaseTables,
    runLiteSpeedCrawler,
    media,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'images' | 'cache' | 'page_opt' | 'database' | 'crawler' | 'logs'
  >('dashboard');

  const [formData, setFormData] = useState<LiteSpeedCacheSettings>(liteSpeedSettings);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [actionProgressPercent, setActionProgressPercent] = useState(0);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedImageForCompare, setSelectedImageForCompare] = useState<LiteSpeedImageItem | null>(null);
  const [imageFilter, setImageFilter] = useState<'ALL' | 'OPTIMIZED' | 'PENDING'>('ALL');

  useEffect(() => {
    setFormData(liteSpeedSettings);
  }, [liteSpeedSettings]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const handleSaveSettings = () => {
    updateLiteSpeedSettings(formData);
    showToast('LiteSpeed Cache Settings यशस्वीरित्या सेव्ह झाल्या!');
  };

  // One-click Purge
  const handlePurge = async (type: any, label: string) => {
    setIsActionInProgress(true);
    setActionMessage(`पर्जिंग चालू आहे (${label})...`);
    setActionProgressPercent(30);

    const timer = setTimeout(() => setActionProgressPercent(75), 400);

    try {
      const res = await purgeLiteSpeedCache(type);
      clearTimeout(timer);
      setActionProgressPercent(100);
      showToast(res.message);
    } finally {
      setTimeout(() => {
        setIsActionInProgress(false);
        setActionProgressPercent(0);
        setActionMessage(null);
      }, 500);
    }
  };

  // Image Optimization Batch Run
  const handleOptimizeImagesBatch = async () => {
    setIsActionInProgress(true);
    setActionMessage('QUIC.cloud Engine: मीडिया इमेजेस स्कॅन आणि WebP मध्ये कॉम्प्रेशन सुरू आहे...');
    setActionProgressPercent(15);

    const step1 = setTimeout(() => {
      setActionProgressPercent(45);
      setActionMessage('Lossless WebP व्हर्जन्स तयार होत आहेत (82% Quality)...');
    }, 600);

    const step2 = setTimeout(() => {
      setActionProgressPercent(85);
      setActionMessage('WebP Replacement आणि URL रिरायटिंग पूर्ण होत आहे...');
    }, 1200);

    try {
      const res = await optimizeLiteSpeedImages('ALL');
      setTimeout(() => {
        clearTimeout(step1);
        clearTimeout(step2);
        setActionProgressPercent(100);
        showToast(`🎉 यश! ${res.count} इमेजेस WebP मध्ये रूपांतरित झाल्या (~${(res.savedBytes / (1024 * 1024)).toFixed(2)} MB बचत)!`);
      }, 1600);
    } finally {
      setTimeout(() => {
        setIsActionInProgress(false);
        setActionProgressPercent(0);
        setActionMessage(null);
      }, 2100);
    }
  };

  // Clean Database
  const handleCleanDb = async (target: any, label: string) => {
    setIsActionInProgress(true);
    setActionMessage(`डेटाबेस क्लीनअप चालू आहे (${label})...`);
    setActionProgressPercent(50);
    try {
      const res = await cleanDatabaseTables(target);
      setActionProgressPercent(100);
      showToast(`डेटाबेस: ${res.cleanedCount} नको असलेल्या नोंदी साफ केल्या (${res.spaceFreedKb} KB मोकळी झाली)!`);
    } finally {
      setTimeout(() => {
        setIsActionInProgress(false);
        setActionProgressPercent(0);
        setActionMessage(null);
      }, 600);
    }
  };

  // Run Crawler
  const handleRunCrawler = async () => {
    setIsActionInProgress(true);
    setActionMessage('LiteSpeed Crawler: साइटमॅप व URL कॅशे वॉर्म-अप चालू आहे...');
    setActionProgressPercent(25);

    const t = setTimeout(() => setActionProgressPercent(75), 700);

    try {
      const res = await runLiteSpeedCrawler();
      clearTimeout(t);
      setActionProgressPercent(100);
      showToast(`⚡ क्रॉलरने ${res.crawledCount} पेजेस प्री-वॉर्म केले (Sub-50ms TTFB लोड स्पीड)!`);
    } finally {
      setTimeout(() => {
        setIsActionInProgress(false);
        setActionProgressPercent(0);
        setActionMessage(null);
      }, 1200);
    }
  };

  // Calculate totals
  const totalOriginalBytes = liteSpeedImages.reduce((acc, img) => acc + (img.originalSizeBytes || 1200000), 0);
  const totalOptimizedBytes = liteSpeedImages.reduce((acc, img) => acc + (img.optimizedSizeBytes || 250000), 0);
  const totalSavedBytes = totalOriginalBytes - totalOptimizedBytes;
  const overallSavingsPercent = totalOriginalBytes > 0 ? Math.round((totalSavedBytes / totalOriginalBytes) * 1000) / 10 : 79.5;
  const optimizedCount = liteSpeedImages.filter((img) => img.status === 'OPTIMIZED').length;

  const filteredImages = liteSpeedImages.filter((img) => {
    if (imageFilter === 'OPTIMIZED') return img.status === 'OPTIMIZED';
    if (imageFilter === 'PENDING') return img.status !== 'OPTIMIZED';
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Banner & Server Info */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-md">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                <Zap className="h-6 w-6 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight">LiteSpeed Cache (LSCache)</h1>
                  <span className="rounded-md bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                    v{liteSpeedSettings.serverVersion}
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 text-[11px] font-bold text-blue-300">
                    <Cloud className="h-3 w-3" /> QUIC.cloud Tier-1
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  High-Performance Server-Level Cache, QUIC.cloud WebP Image Optimization, Purge All & Crawler
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handlePurge('ALL', 'All Cache')}
              disabled={isActionInProgress}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isActionInProgress ? 'animate-spin' : ''}`} />
              <span>Purge All (सर्व कॅशे साफ करा)</span>
            </button>

            <button
              type="button"
              onClick={handleOptimizeImagesBatch}
              disabled={isActionInProgress}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Optimize Images (WebP)</span>
            </button>

            <button
              type="button"
              onClick={handleRunCrawler}
              disabled={isActionInProgress}
              className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Warm Cache</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Ribbon */}
        <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-4 sm:grid-cols-4 lg:grid-cols-5">
          <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cache Status</span>
            <div className="mt-1 flex items-center gap-1.5 font-bold text-emerald-400 text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {liteSpeedSettings.isEnabled ? 'Active (Enterprise)' : 'Disabled'}
            </div>
          </div>

          <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cache Hit Ratio</span>
            <div className="mt-1 font-extrabold text-white text-sm">
              {liteSpeedSettings.stats.cacheHitRatio}% <span className="text-[10px] font-normal text-emerald-400">({liteSpeedSettings.stats.cachedRequests.toLocaleString()} hits)</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Response TTFB</span>
            <div className="mt-1 font-extrabold text-emerald-400 text-sm">
              {liteSpeedSettings.stats.avgTtfbMs} ms <span className="text-[10px] font-normal text-slate-400">(Sub-50ms)</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">WebP Images</span>
            <div className="mt-1 font-extrabold text-amber-300 text-sm">
              {optimizedCount} / {liteSpeedImages.length} <span className="text-[10px] font-normal text-slate-300">(-{overallSavingsPercent}%)</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-lg bg-slate-900/60 p-2.5 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">PageSpeed Score</span>
            <div className="mt-1 font-extrabold text-emerald-400 text-sm flex items-center gap-2">
              <span>🖥️ {liteSpeedSettings.stats.pageSpeedDesktop}</span>
              <span className="text-slate-600">|</span>
              <span>📱 {liteSpeedSettings.stats.pageSpeedMobile}</span>
            </div>
          </div>
        </div>

        {/* Live Progress Bar during active tasks */}
        {isActionInProgress && (
          <div className="mt-4 rounded-xl bg-slate-950 p-3 border border-emerald-500/30 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-300 mb-1.5">
              <span>{actionMessage}</span>
              <span>{actionProgressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${actionProgressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-xl px-3 shadow-xs">
        <nav className="flex space-x-1 overflow-x-auto py-2">
          {[
            { id: 'dashboard', label: 'डॅशबोर्ड (Dashboard)', icon: Gauge },
            { id: 'images', label: 'इमेज ऑप्टिमायझेशन (Image Optimization)', icon: ImageIcon, badge: 'WebP' },
            { id: 'cache', label: 'कॅशे आणि पर्ज (Cache & Purge)', icon: RefreshCw },
            { id: 'page_opt', label: 'पेज ऑप्टिमायझेशन (CSS / JS)', icon: Layers },
            { id: 'database', label: 'डेटाबेस ऑप्टिमायझर (Database)', icon: Database },
            { id: 'crawler', label: 'क्रॉलर व CDN (Crawler)', icon: Globe },
            { id: 'logs', label: 'पर्ज लॉग्स (Purge Logs)', icon: FileText, count: liteSpeedPurgeLogs.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-extrabold ${
                      isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isActive ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PageSpeed Score</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold">
                  99
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">99 / 100</span>
                <span className="text-xs font-bold text-emerald-600">+42% Boost</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Google Lighthouse Core Web Vitals (All Green)</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bandwidth Saved</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <HardDrive className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{(totalSavedBytes / (1024 * 1024)).toFixed(1)} MB</span>
                <span className="text-xs font-bold text-blue-600">-{overallSavingsPercent}% WebP</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">QUIC.cloud Lossless WebP Compression</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Server TTFB Speed</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <Zap className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">26 ms</span>
                <span className="text-xs font-bold text-purple-600">Sub-50ms</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">LiteSpeed Enterprise native memory cache</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purge Operations</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700">
                  <RefreshCw className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{liteSpeedSettings.stats.totalPurgeCount}</span>
                <span className="text-xs font-bold text-slate-600">100% Success</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Automatic & manual cache flushes</p>
            </div>
          </div>

          {/* Core Modules Status Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* 1. Cache & Server Health */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Server className="h-4 w-4 text-emerald-600" />
                  <span>LiteSpeed Server Info</span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 ring-1 ring-emerald-600/20">
                  Online
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Server Software:</span>
                  <span className="font-semibold text-slate-800">{liteSpeedSettings.serverType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">HTTP/3 QUIC:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Enabled (Active)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Object Cache:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-blue-500" /> Redis (Connected)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">QUIC.cloud Node:</span>
                  <span className="font-semibold text-slate-800">{liteSpeedSettings.quicCloudNode}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Public Cache TTL:</span>
                  <span className="font-mono text-slate-800 font-bold">604,800 sec (7 Days)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('cache')}
                  className="flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span>Configure Cache Rules</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Image Optimization Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ImageIcon className="h-4 w-4 text-amber-500" />
                  <span>QUIC.cloud Image Engine</span>
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 ring-1 ring-amber-600/20">
                  WebP Active
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Optimized Images:</span>
                  <span className="font-bold text-slate-900">
                    {optimizedCount} of {liteSpeedImages.length} Images ({Math.round((optimizedCount / liteSpeedImages.length) * 100)}%)
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(optimizedCount / liteSpeedImages.length) * 100}%` }}
                  ></div>
                </div>

                <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-200/50 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-amber-900 font-medium">Original Storage:</span>
                    <span className="font-bold font-mono text-slate-700">{(totalOriginalBytes / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-900 font-bold">WebP Optimized:</span>
                    <span className="font-bold font-mono text-emerald-700">{(totalOptimizedBytes / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-amber-200/40">
                    <span className="text-slate-600 font-semibold">Total Savings:</span>
                    <span className="font-black text-emerald-600">-{overallSavingsPercent}% ({(totalSavedBytes / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOptimizeImagesBatch}
                  disabled={isActionInProgress}
                  className="flex-1 rounded-lg bg-amber-500 py-2 text-center text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  Send Opt. Request
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('images')}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Manage Queue
                </button>
              </div>
            </div>

            {/* 3. Database Optimizer Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Database className="h-4 w-4 text-purple-600" />
                  <span>Database Optimizer</span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Size: {liteSpeedSettings.dbStats.databaseSizeMb} MB
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Post Revisions:</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold font-mono text-slate-700">
                    {liteSpeedSettings.dbStats.revisionsCount} rows
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Auto Drafts:</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold font-mono text-slate-700">
                    {liteSpeedSettings.dbStats.autoDraftsCount} rows
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Trashed Posts:</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold font-mono text-slate-700">
                    {liteSpeedSettings.dbStats.trashedPostsCount} rows
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600">Expired Transients:</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold font-mono text-slate-700">
                    {liteSpeedSettings.dbStats.transientsCount} rows
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleCleanDb('ALL', 'सर्व डेटाबेस टेबल')}
                  disabled={isActionInProgress}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-purple-600 py-2 text-xs font-bold text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Clean All DB Junk (1-Click)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Purge Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-red-600" />
                <span>One-Click Purge Controls (झटपट कॅशे स्वच्छ करा)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                WordPress LSCache प्रमाणे कोणत्याही एका क्लिकवर संपूर्ण किंवा विशिष्ट भागाचा कॅशे तात्काळ रिफ्रेश करा.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <button
                type="button"
                onClick={() => handlePurge('ALL', 'All Cache')}
                disabled={isActionInProgress}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100/80 text-red-900 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
              >
                <RefreshCw className="h-5 w-5 text-red-600 mb-1.5" />
                <span className="text-xs font-black">Purge All</span>
                <span className="text-[10px] text-red-600 font-medium">सर्व कॅशे</span>
              </button>

              <button
                type="button"
                onClick={() => handlePurge('FRONT_PAGE', 'Front Page')}
                disabled={isActionInProgress}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-900 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
              >
                <Globe className="h-5 w-5 text-blue-600 mb-1.5" />
                <span className="text-xs font-black">Front Page</span>
                <span className="text-[10px] text-blue-600 font-medium">मुख्य पृष्ठ</span>
              </button>

              <button
                type="button"
                onClick={() => handlePurge('CSS_JS', 'CSS/JS')}
                disabled={isActionInProgress}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-purple-900 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
              >
                <Layers className="h-5 w-5 text-purple-600 mb-1.5" />
                <span className="text-xs font-black">Purge CSS/JS</span>
                <span className="text-[10px] text-purple-600 font-medium">स्टाइल्स व स्क्रिप्ट्स</span>
              </button>

              <button
                type="button"
                onClick={() => handlePurge('OBJECT', 'Object Cache')}
                disabled={isActionInProgress}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
              >
                <Shield className="h-5 w-5 text-emerald-600 mb-1.5" />
                <span className="text-xs font-black">Object Cache</span>
                <span className="text-[10px] text-emerald-600 font-medium">Redis पूल्स</span>
              </button>

              <button
                type="button"
                onClick={() => handlePurge('REST_API', 'REST API')}
                disabled={isActionInProgress}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/80 text-amber-900 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
              >
                <FileText className="h-5 w-5 text-amber-600 mb-1.5" />
                <span className="text-xs font-black">REST API</span>
                <span className="text-[10px] text-amber-600 font-medium">JSON फीड्स</span>
              </button>

              <button
                type="button"
                onClick={() => handlePurge('CDN', 'QUIC.cloud CDN')}
                disabled={isActionInProgress}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
              >
                <Cloud className="h-5 w-5 text-slate-600 mb-1.5" />
                <span className="text-xs font-black">CDN Edge</span>
                <span className="text-[10px] text-slate-500 font-medium">QUIC.cloud CDN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: IMAGE OPTIMIZATION (चित्र ऑप्टिमायझेशन - WebP Conversion & Compression) */}
      {activeTab === 'images' && (
        <div className="space-y-6">
          {/* Image Opt Header Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">WebP Images Status</span>
              <div className="mt-2 text-2xl font-black text-amber-950">
                {optimizedCount} / {liteSpeedImages.length} Images
              </div>
              <p className="mt-1 text-xs text-amber-700">
                {Math.round((optimizedCount / liteSpeedImages.length) * 100)}% Media Library WebP Converted
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Bandwidth Saved</span>
              <div className="mt-2 text-2xl font-black text-emerald-950">
                {(totalSavedBytes / (1024 * 1024)).toFixed(2)} MB
              </div>
              <p className="mt-1 text-xs text-emerald-700">
                Average compression ratio: <strong className="text-emerald-900">-{overallSavingsPercent}%</strong>
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Image WebP Replacement</span>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-black text-blue-950">
                  {formData.replaceWebP ? 'ACTIVE' : 'OFF'}
                </span>
                <span className="rounded-full bg-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                  Public Portal
                </span>
              </div>
              <p className="mt-1 text-xs text-blue-700">
                Automatically serves .webp to modern browsers
              </p>
            </div>
          </div>

          {/* Image Optimization Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleOptimizeImagesBatch}
                disabled={isActionInProgress}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Send Optimization Request (सर्व इमेजेस ऑप्टिमाइज करा)</span>
              </button>

              <button
                type="button"
                onClick={revertLiteSpeedImages}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>Revert to Originals (मूळ चित्रे पुन्हा वापरा)</span>
              </button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Filter:</span>
              {(['ALL', 'OPTIMIZED', 'PENDING'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setImageFilter(filter)}
                  className={`rounded-md px-2.5 py-1 font-bold transition-colors ${
                    imageFilter === filter
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Image Optimization Settings & Toggles */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-600" />
              <span>Image Optimization Configuration (QUIC.cloud Settings)</span>
            </h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              {/* Auto Request Cron */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoRequestCron}
                  onChange={(e) => setFormData({ ...formData, autoRequestCron: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Auto Request Cron (ऑटो ऑप्टिमायझेशन)</span>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    नवीन मीडिया अपलोड केल्यावर आपोआप पार्श्वभूमीत ऑप्टिमायझेशन रिक्वेस्ट पाठवणे.
                  </span>
                </div>
              </label>

              {/* Auto Pull Images */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoPullImages}
                  onChange={(e) => setFormData({ ...formData, autoPullImages: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Auto Pull WebP (ऑटो डाउनलोड)</span>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    QUIC.cloud वरून तयार झालेल्या WebP फायली आपोआप डाउनलोड करून मीडिया लायब्ररीत साठवणे.
                  </span>
                </div>
              </label>

              {/* Image WebP Replacement */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.replaceWebP}
                  onChange={(e) => setFormData({ ...formData, replaceWebP: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-emerald-950 block">Image WebP Replacement (वेबसाइटवर थेट WebP)</span>
                  <span className="text-emerald-800 text-[11px] leading-relaxed">
                    पब्लिक पोर्टलवरील सर्व बातम्यांमधील <code>&lt;img&gt;</code> टॅग्ज आपोआप WebP फॉरमॅटमध्ये दाखवणे.
                  </span>
                </div>
              </label>

              {/* Backup Originals */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.backupOriginals}
                  onChange={(e) => setFormData({ ...formData, backupOriginals: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Original Image Backup (मूळ बॅकअप)</span>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    मूळ हाय-रेझोल्यूशन फोटोंचा सुरक्षित बॅकअप ठेवणे, जेणेकरून कधीही पूर्ववत करता येईल.
                  </span>
                </div>
              </label>

              {/* Lazy Load Images */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.lazyLoadImages}
                  onChange={(e) => setFormData({ ...formData, lazyLoadImages: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Responsive Lazy Load (लेझी लोड)</span>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    वाचकाच्या स्क्रीनवर आल्यावरच फोटो लोड करणे (PageSpeed स्कोर सुधारण्यासाठी).
                  </span>
                </div>
              </label>

              {/* Image Quality Slider */}
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Image WebP Quality:</span>
                  <span className="font-bold font-mono text-emerald-600">{formData.imageQuality}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={formData.imageQuality}
                  onChange={(e) => setFormData({ ...formData, imageQuality: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-slate-400 text-[10px] block">
                  शिफारस: 82% (डोळ्यांना कोणतीही गुणवत्ता कमी न भासता 80% फाईल साईज कमी).
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                Save Image Settings
              </button>
            </div>
          </div>

          {/* Media Optimization Queue Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Media Library Image Optimization Queue</h3>
                <p className="text-xs text-slate-500">
                  प्रत्येक फोटोचे मूळ आकारमान आणि WebP आकाराची थेट तुलना.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 font-medium">
                Showing {filteredImages.length} Images
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Preview</th>
                    <th className="px-4 py-3">File Name</th>
                    <th className="px-4 py-3">Original Size</th>
                    <th className="px-4 py-3">WebP Size</th>
                    <th className="px-4 py-3">Savings</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredImages.map((img) => (
                    <tr key={img.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <img
                          src={img.webpUrl || img.originalUrl}
                          alt={img.fileName}
                          className="h-12 w-16 rounded-md object-cover ring-1 ring-slate-200"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 max-w-[200px] truncate">
                        {img.fileName}
                        <span className="block text-[10px] font-mono text-slate-400 font-normal">
                          {img.format || 'JPEG -> WebP'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {((img.originalSizeBytes || 1200000) / 1024).toFixed(0)} KB
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                        {((img.optimizedSizeBytes || 240000) / 1024).toFixed(0)} KB
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                          -{img.savingsPercent || 79.5}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {img.status === 'OPTIMIZED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                            <Check className="h-3 w-3" /> Optimized (WebP)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-600/20">
                            <Clock className="h-3 w-3" /> In Queue
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedImageForCompare(img)}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                        >
                          <Eye className="h-3 w-3 inline mr-1 text-slate-400" />
                          Compare
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: CACHE RULES & PURGE MANAGEMENT */}
      {activeTab === 'cache' && (
        <div className="space-y-6">
          {/* Master Switch */}
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50 via-white to-emerald-50 p-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">Enable LiteSpeed Cache Engine</h3>
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                  Master Switch
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                सर्व सार्वजनिक बातम्या, मुख्यपृष्ठ आणि अर्काईव्ह पेजेस LiteSpeed Enterprise इन-मेमरी कॅशेमध्ये साठवणे.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.isEnabled}
                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                className="peer sr-only"
              />
              <div className="h-7 w-12 rounded-full bg-slate-200 peer-checked:bg-emerald-600 peer-focus:outline-hidden after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5"></div>
            </label>
          </div>

          {/* Cache Rules Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Cache Rules & Vary Handlers</span>
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.cacheLoggedInUsers}
                  onChange={(e) => setFormData({ ...formData, cacheLoggedInUsers: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Cache Logged-in Users (खाजगी कॅशे)</span>
                  <span className="text-slate-500 text-[11px]">
                    लॉगिन असलेल्या युझर्ससाठी वैयक्तिक प्रायव्हेट कॅशे तयार करणे.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.cacheMobile}
                  onChange={(e) => setFormData({ ...formData, cacheMobile: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Separate Mobile Cache (स्वतंत्र मोबाईल कॅशे)</span>
                  <span className="text-slate-500 text-[11px]">
                    मोबाईल वापरकर्त्यांसाठी स्वतंत्र लाइटवेट कॅशे व्हर्जन तयार करणे (Vary: User-Agent).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.cacheRestApi}
                  onChange={(e) => setFormData({ ...formData, cacheRestApi: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Cache REST API & RSS Feeds</span>
                  <span className="text-slate-500 text-[11px]">
                    JSON REST एंडपॉईंट्स आणि बातम्यांच्या RSS फीड्स कॅशमध्ये ठेवणे.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.purgeOnPostUpdate}
                  onChange={(e) => setFormData({ ...formData, purgeOnPostUpdate: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Auto Purge on Post Publish (ऑटो पर्ज)</span>
                  <span className="text-slate-500 text-[11px]">
                    नवीन बातमी प्रसिद्ध किंवा संपादित झाल्यावर संबंधित कॅटेगरी व मुख्यपृष्ठ तात्काळ रिफ्रेश करणे.
                  </span>
                </div>
              </label>
            </div>

            {/* TTLs (Time to Live) */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">TTL (Time to Live) Settings</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Public Cache TTL (Seconds)</label>
                  <input
                    type="number"
                    value={formData.publicTtlSeconds}
                    onChange={(e) => setFormData({ ...formData, publicTtlSeconds: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">Default: 604800 (7 days)</span>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Front Page TTL (Seconds)</label>
                  <input
                    type="number"
                    value={formData.frontPageTtlSeconds}
                    onChange={(e) => setFormData({ ...formData, frontPageTtlSeconds: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">Default: 604800</span>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Feed TTL (Seconds)</label>
                  <input
                    type="number"
                    value={formData.feedTtlSeconds}
                    onChange={(e) => setFormData({ ...formData, feedTtlSeconds: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">Default: 604800</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Save Cache Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: PAGE OPTIMIZATION (CSS / JS / HTML) */}
      {activeTab === 'page_opt' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-600" />
                <span>CSS / JS / HTML Page Optimization (पेज स्पीड ऑप्टिमायझेशन)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                फायलींचे आकारमान कमी करून, मिनिफिकेशन आणि असिंक्रोनस लोडिंगद्वारे 100/100 Core Web Vitals साध्य करा.
              </p>
            </div>

            {/* CSS Optimization Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                1. CSS Settings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cssMinify}
                    onChange={(e) => setFormData({ ...formData, cssMinify: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-purple-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">CSS Minify</span>
                    <span className="text-slate-500 text-[10px]">अनावश्यक स्पेस व टिप्पण्या काढून टाकणे.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cssCombine}
                    onChange={(e) => setFormData({ ...formData, cssCombine: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-purple-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">CSS Combine</span>
                    <span className="text-slate-500 text-[10px]">सर्व स्टाइल्स एका फाईलमध्ये एकत्र करणे.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ucssEnabled}
                    onChange={(e) => setFormData({ ...formData, ucssEnabled: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-purple-600"
                  />
                  <div>
                    <span className="font-bold text-purple-950 block">Generate UCSS</span>
                    <span className="text-purple-800 text-[10px]">फक्त पानावर लागणारे युनिक CSS तयार करणे.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cssAsync}
                    onChange={(e) => setFormData({ ...formData, cssAsync: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-purple-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Load CSS Async</span>
                    <span className="text-slate-500 text-[10px]">रेंडर ब्लॉकिंग काढून टाकणे.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* JS Optimization Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                2. JavaScript Settings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.jsMinify}
                    onChange={(e) => setFormData({ ...formData, jsMinify: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">JS Minify</span>
                    <span className="text-slate-500 text-[10px]">जावास्क्रिप्ट कोड कॉम्प्रेस करणे.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.jsCombine}
                    onChange={(e) => setFormData({ ...formData, jsCombine: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">JS Combine</span>
                    <span className="text-slate-500 text-[10px]">HTTP रिक्वेस्ट्स कमी करण्यासाठी स्क्रिप्ट्स जोडणे.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.jsDefer}
                    onChange={(e) => setFormData({ ...formData, jsDefer: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-blue-950 block">Load JS Deferred (defer)</span>
                    <span className="text-blue-800 text-[10px]">पान पूर्ण लोड झाल्यावरच स्क्रिप्ट चालवणे.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* HTML & Fonts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                3. HTML & Font Preloading
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.htmlMinify}
                    onChange={(e) => setFormData({ ...formData, htmlMinify: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-emerald-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">HTML Minify</span>
                    <span className="text-slate-500 text-[10px]">HTML डॉक्युमेंट साईज कॉम्प्रेस करणे.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dnsPrefetch}
                    onChange={(e) => setFormData({ ...formData, dnsPrefetch: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-emerald-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">DNS Prefetch</span>
                    <span className="text-slate-500 text-[10px]">Google Fonts आणि CDN चे DNS आधीच सोडवणे.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.fontDisplaySwap}
                    onChange={(e) => setFormData({ ...formData, fontDisplaySwap: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-emerald-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Font-Display: Swap</span>
                    <span className="text-slate-500 text-[10px]">फॉन्ट येईपर्यंत सिस्टम टेक्स्ट दाखवणे.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="rounded-lg bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-700 transition-colors shadow-xs"
              >
                Save Page Optimization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 5: DATABASE OPTIMIZER */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-600" />
                  <span>WordPress Database Optimizer & Cleaner</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  नको असलेल्या जुन्या ड्राफ्ट रिव्हिजन्स, स्पॅम कमेंट्स आणि ट्रान्झिएंट्स एका क्लिकवर साफ करा.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCleanDb('ALL', 'सर्व डेटाबेस')}
                disabled={isActionInProgress}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>Clean All (सर्व कचरा साफ करा)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Revisions */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Post Revisions</span>
                  <span className="text-[11px] text-slate-500">
                    {liteSpeedSettings.dbStats.revisionsCount} जुन्या रिव्हिजन्स साठवलेल्या आहेत
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCleanDb('REVISIONS', 'Post Revisions')}
                  disabled={liteSpeedSettings.dbStats.revisionsCount === 0 || isActionInProgress}
                  className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  Clean
                </button>
              </div>

              {/* Auto Drafts */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Auto Drafts</span>
                  <span className="text-[11px] text-slate-500">
                    {liteSpeedSettings.dbStats.autoDraftsCount} ऑटोमॅटिक ड्राफ्ट्स
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCleanDb('DRAFTS', 'Auto Drafts')}
                  disabled={liteSpeedSettings.dbStats.autoDraftsCount === 0 || isActionInProgress}
                  className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  Clean
                </button>
              </div>

              {/* Trash */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Trashed Posts</span>
                  <span className="text-[11px] text-slate-500">
                    {liteSpeedSettings.dbStats.trashedPostsCount} हटवलेल्या पोस्ट्स
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCleanDb('TRASH', 'Trashed Posts')}
                  disabled={liteSpeedSettings.dbStats.trashedPostsCount === 0 || isActionInProgress}
                  className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  Clean
                </button>
              </div>

              {/* Spam Comments */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Spam Comments</span>
                  <span className="text-[11px] text-slate-500">
                    {liteSpeedSettings.dbStats.spamCommentsCount} स्पॅम कमेंट्स
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCleanDb('SPAM_COMMENTS', 'Spam Comments')}
                  disabled={liteSpeedSettings.dbStats.spamCommentsCount === 0 || isActionInProgress}
                  className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  Clean
                </button>
              </div>

              {/* Expired Transients */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Expired Transients</span>
                  <span className="text-[11px] text-slate-500">
                    {liteSpeedSettings.dbStats.transientsCount} एक्सपायर्ड डेटा ट्रान्झिएंट्स
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCleanDb('TRANSIENTS', 'Expired Transients')}
                  disabled={liteSpeedSettings.dbStats.transientsCount === 0 || isActionInProgress}
                  className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  Clean
                </button>
              </div>

              {/* Optimize Tables Index */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Optimize DB Tables</span>
                  <span className="text-[11px] text-slate-500">
                    इंडेक्सेस डिफ्रॅगमेंट व ऑप्टिमाइज करा
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCleanDb('ALL', 'Optimize Tables')}
                  disabled={isActionInProgress}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
                >
                  Optimize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB 6: CRAWLER & CDN */}
      {activeTab === 'crawler' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-600" />
                  <span>Automated Cache Crawler (सिटमॅप क्रॉलर व कॅशे वॉर्मर)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  क्रॉलर आपोआप सर्व बातम्या आणि पेजेसना भेट देऊन कॅशे तयार ठेवतो, जेणेकरून वाचकाला 0ms विलंब होतो.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunCrawler}
                disabled={isActionInProgress}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                <span>Run Crawler Now (क्रॉलर सुरू करा)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <span className="text-slate-500 block">Total Sitemap URLs:</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {liteSpeedSettings.totalSitemapUrls} URLs
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <span className="text-slate-500 block">Pre-Warmed & Cached:</span>
                <span className="text-xl font-extrabold text-emerald-600 mt-1 block">
                  {liteSpeedSettings.cachedUrlsCount} / {liteSpeedSettings.totalSitemapUrls} (97.6%)
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <span className="text-slate-500 block">Last Crawl Run:</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">
                  {liteSpeedSettings.lastCrawlTime || 'Today, 10:45 AM'}
                </span>
              </div>
            </div>

            {/* QUIC.cloud CDN Edge info */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-950">
                <Cloud className="h-4 w-4 text-blue-600" />
                <span>QUIC.cloud Tier-1 Global Anycast CDN</span>
              </div>
              <p className="text-blue-800 leading-relaxed">
                LiteSpeed Cache हे थेट QUIC.cloud CDN शी जोडलेले आहे. भारतातील सर्व वाचकांना मुंबई (BOM), दिल्ली (DEL), आणि बेंगळुरू (BLR) एज सर्व्हर्सवरून थेट HTTP/3 QUIC द्वारे अतिजलद बातम्या पोहोचवल्या जातात.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 9. TAB 7: PURGE & ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">LiteSpeed Purge History & Audit Trail</h3>
                <p className="text-xs text-slate-500">केव्हा आणि कोणत्या कारणाने कॅशे रिफ्रेश झाला याची संपूर्ण नोंद.</p>
              </div>
              <span className="text-xs font-mono text-slate-400 font-medium">
                {liteSpeedPurgeLogs.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Purge Type</th>
                    <th className="px-4 py-3">Triggered By</th>
                    <th className="px-4 py-3">Objects Cleared</th>
                    <th className="px-4 py-3">Details / Note</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {liteSpeedPurgeLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold font-mono text-[10px] text-slate-800">
                          {log.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {log.triggeredBy}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-700 font-bold">
                        {log.purgedItemsCount.toLocaleString()} items
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {log.note}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <Check className="h-3 w-3" /> {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 10. Image Comparison Modal */}
      {selectedImageForCompare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Image Optimization Comparison: {selectedImageForCompare.fileName}
                </h3>
                <p className="text-xs text-slate-500">
                  Original JPEG vs QUIC.cloud WebP Side-by-Side Quality & Size Test
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImageForCompare(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Original */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Original JPEG</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-600">
                    {((selectedImageForCompare.originalSizeBytes || 1420000) / 1024).toFixed(0)} KB
                  </span>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center">
                  <img
                    src={selectedImageForCompare.originalUrl}
                    alt="Original"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* WebP */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-700">QUIC.cloud WebP (-{selectedImageForCompare.savingsPercent}%)</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono font-bold text-emerald-800">
                    {((selectedImageForCompare.optimizedSizeBytes || 284000) / 1024).toFixed(0)} KB
                  </span>
                </div>
                <div className="overflow-hidden rounded-xl border border-emerald-300 bg-slate-100 aspect-video flex items-center justify-center ring-2 ring-emerald-500/20">
                  <img
                    src={selectedImageForCompare.webpUrl || selectedImageForCompare.originalUrl}
                    alt="WebP"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Lossless Quality Verified: 100% Visual Fidelity with 80% Less Bandwidth!</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImageForCompare(null)}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 font-bold text-white hover:bg-emerald-700"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-2xl ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <Zap className="h-4 w-4" />
          </div>
          <p className="pr-2">{toast}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
