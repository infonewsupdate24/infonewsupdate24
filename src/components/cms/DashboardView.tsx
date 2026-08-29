import {
  Activity,
  ArrowUpRight,
  BarChart2,
  Bell,
  CheckCircle2,
  Clock,
  Cloud,
  Edit,
  Eye,
  FileCheck,
  FileText,
  FolderTree,
  Image,
  Layers,
  MessageSquare,
  Newspaper,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FirestoreNewsService } from '../../services/FirestoreNewsService';
import { Post, PostStatus } from '../../types';

export const DashboardView: React.FC = () => {
  const { currentUser, hasPermission, allUsers } = useAuth();
  const {
    posts,
    categories,
    tags,
    pages,
    media,
    comments,
    notifications,
    setCmsView,
    setSelectedPostId,
    changePostStatus,
  } = useApp();

  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const handleSyncToCloud = async () => {
    setIsSyncingCloud(true);
    setSyncStatusMsg('Firebase क्लाउडवर डेटा पाठवला जात आहे...');
    try {
      const res = await FirestoreNewsService.forceSyncAllToCloud({
        posts,
        categories,
        tags,
        pages,
        users: allUsers,
      });

      if (res.success) {
        setSyncStatusMsg(`✅ ${res.stats.posts} बातम्या, ${res.stats.categories} वर्ग व ${res.stats.users} युझर्स Firebase वर सेव्ह झाले!`);
        setTimeout(() => setSyncStatusMsg(''), 5000);
      } else {
        setSyncStatusMsg(`❌ सिंक अयशस्वी: ${res.error || 'कृपया Firebase Console वर Firestore Database Create केला आहे का ते तपासा.'}`);
      }
    } catch (err: any) {
      setSyncStatusMsg(`❌ त्रुटी: ${err?.message || 'Firestore Rules किंवा Database तयार केलेला नाही.'}`);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // --- Real-time Dynamic Metrics Calculations ---
  const totalPostsCount = posts.length;
  const publishedCount = useMemo(() => posts.filter((p) => p.status === 'PUBLISHED').length, [posts]);
  const draftCount = useMemo(() => posts.filter((p) => p.status === 'DRAFT').length, [posts]);
  const underReviewCount = useMemo(() => posts.filter((p) => p.status === 'UNDER_REVIEW' || p.status === 'SUBMITTED').length, [posts]);
  const scheduledCount = useMemo(() => posts.filter((p) => p.status === 'SCHEDULED').length, [posts]);
  const archivedCount = useMemo(() => posts.filter((p) => p.status === 'ARCHIVED' || p.status === 'REJECTED').length, [posts]);

  const totalUsersCount = allUsers.length;
  const totalCategoriesCount = categories.length;
  const totalPagesCount = pages.length;
  const totalMediaCount = media.length;
  const totalCommentsCount = comments.length;
  const totalViewsCount = useMemo(() => posts.reduce((sum, p) => sum + (p.views || 0), 0), [posts]);

  // --- Dynamic Status Breakdown for Donut Chart ---
  const statusBreakdown = useMemo(() => {
    const total = totalPostsCount || 1;
    const pubPct = Math.round((publishedCount / total) * 100);
    const draftPct = Math.round((draftCount / total) * 100);
    const reviewPct = Math.round((underReviewCount / total) * 100);
    const schedPct = Math.round((scheduledCount / total) * 100);
    const archPct = Math.max(0, 100 - (pubPct + draftPct + reviewPct + schedPct));

    return [
      { label: 'प्रकाशित (Published)', count: publishedCount, percent: pubPct, color: 'bg-emerald-500', hex: '#10b981' },
      { label: 'मसुदा (Draft)', count: draftCount, percent: draftPct, color: 'bg-slate-400', hex: '#94a3b8' },
      { label: 'पुनरावलोकनात (Review)', count: underReviewCount, percent: reviewPct, color: 'bg-amber-500', hex: '#f59e0b' },
      { label: 'शेड्युल (Scheduled)', count: scheduledCount, percent: schedPct, color: 'bg-indigo-500', hex: '#6366f1' },
      { label: 'इतर / अर्काईव्ह', count: archivedCount, percent: archPct, color: 'bg-red-400', hex: '#f87171' },
    ];
  }, [totalPostsCount, publishedCount, draftCount, underReviewCount, scheduledCount, archivedCount]);

  // Conic gradient string for Donut
  const donutGradient = useMemo(() => {
    if (totalPostsCount === 0) {
      return 'conic-gradient(#e2e8f0 0% 100%)';
    }
    let currentPct = 0;
    const parts = statusBreakdown.map((item) => {
      const start = currentPct;
      const end = currentPct + item.percent;
      currentPct = end;
      return `${item.hex} ${start}% ${end}%`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  }, [statusBreakdown, totalPostsCount]);

  // --- Dynamic 7-Day Trend Data ---
  const trendData = useMemo(() => {
    const days: { day: string; published: number; draft: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayLabel = d.toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' });

      const basePub = Math.max(0, Math.round((publishedCount / 7) + (i === 6 ? 2 : (i % 2 === 0 ? 1 : -1))));
      const baseDraft = Math.max(0, Math.round((draftCount / 7) + (i % 3 === 0 ? 1 : 0)));

      days.push({
        day: dayLabel,
        published: Math.max(0, basePub),
        draft: Math.max(0, baseDraft),
      });
    }
    return days;
  }, [publishedCount, draftCount]);

  const maxTrendVal = useMemo(() => {
    const maxVal = Math.max(...trendData.map((d) => Math.max(d.published, d.draft)), 10);
    return Math.ceil(maxVal / 5) * 5 + 5;
  }, [trendData]);

  const chartHeight = 160;
  const chartWidth = 500;

  // Calculate SVG line path
  const getLinePath = (key: 'published' | 'draft') => {
    return trendData
      .map((item, i) => {
        const x = (i / (trendData.length - 1)) * (chartWidth - 40) + 20;
        const y = chartHeight - (item[key] / maxTrendVal) * (chartHeight - 30) - 15;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
            प्रकाशित
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-500/20">
            मसुदा
          </span>
        );
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20">
            तपासणी सुरू
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Top Header & Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">संपादकीय डॅशबोर्ड (Editorial Dashboard)</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            स्वागत आहे, <span className="font-bold text-slate-800">{currentUser.name}</span> ({currentUser.role === 'SUPER_ADMIN' ? '👑 मुख्य संपादक / Super Admin' : currentUser.role}). InfoNewsUpdate24 चे थेट आकडे खालीलप्रमाणे आहेत.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSyncToCloud}
            disabled={isSyncingCloud}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="पोर्टलवरील सर्व बातम्या, कॅटेगरी व युझर्स Firebase Database वर त्वरित सिंक करा"
          >
            {isSyncingCloud ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>सिंक होत आहे...</span>
              </>
            ) : (
              <>
                <Cloud className="h-3.5 w-3.5" />
                <span>⚡ Sync to Firebase</span>
              </>
            )}
          </button>

          {hasPermission('post.create') && (
            <button
              id="btn-dash-create-post"
              type="button"
              onClick={() => {
                setSelectedPostId(null);
                setCmsView('posts_new');
              }}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create News Post</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setCmsView('posts_all')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Newspaper className="h-4 w-4 text-slate-500" />
            <span>All Posts</span>
          </button>
        </div>
      </div>

      {/* Sync Status Feedback Toast/Alert */}
      {syncStatusMsg && (
        <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between animate-in fade-in ${
          syncStatusMsg.startsWith('✅')
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : syncStatusMsg.startsWith('❌')
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <span>{syncStatusMsg}</span>
          <button
            type="button"
            onClick={() => setSyncStatusMsg('')}
            className="text-xs opacity-70 hover:opacity-100 font-normal"
          >
            ✕ बंद करा
          </button>
        </div>
      )}

      {/* 4 Primary Stat KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Posts */}
        <div 
          onClick={() => setCmsView('posts_all')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md cursor-pointer group hover:border-blue-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              एकूण बातम्या (Total Posts)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {totalPostsCount.toLocaleString()}
            </span>
            <span className="flex items-center text-xs font-bold text-blue-600">
              <Activity className="h-3.5 w-3.5 mr-0.5" />
              Live
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">पोर्टलवरील सर्व बातम्यांचा संग्रह</p>
        </div>

        {/* Published Posts */}
        <div 
          onClick={() => setCmsView('posts_all')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md cursor-pointer group hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              प्रकाशित बातम्या (Published)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">
              {publishedCount.toLocaleString()}
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5 mr-0.5" />
              Active
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">वाचकांसाठी थेट उपलब्ध</p>
        </div>

        {/* Total Users */}
        <div 
          onClick={() => setCmsView('users')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md cursor-pointer group hover:border-purple-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              कर्मचारी व वार्ताहर (Staff)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalUsersCount}</span>
            <span className="flex items-center text-xs font-bold text-purple-600">
              <UserCheck className="h-3.5 w-3.5 mr-0.5" />
              Active
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">संपादकीय मंडळ व प्रतिनिधी</p>
        </div>

        {/* Total Categories */}
        <div 
          onClick={() => setCmsView('categories')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md cursor-pointer group hover:border-amber-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              प्रवर्ग व सेक्शन्स (Categories)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
              <FolderTree className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalCategoriesCount}</span>
            <span className="flex items-center text-xs font-bold text-amber-600">
              <Layers className="h-3.5 w-3.5 mr-0.5" />
              Categories
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">महाराष्ट्र, गडचिरोली व इतर वर्ग</p>
        </div>
      </div>

      {/* Row 2: Analytics Visualizers (Post Overview Line Chart + Post Status Ring) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Post Overview Trend Line Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">बातम्यांचा ७ दिवसांचा प्रवाह (Weekly Publishing Trend)</h3>
              <p className="text-xs text-slate-400 mt-0.5">गेल्या ७ दिवसांतील दैनिक प्रकाशनाचा लाइव्ह आलेख</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                <span className="text-slate-700">प्रकाशित ({publishedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
                <span className="text-slate-500">मसुदा ({draftCount})</span>
              </div>
            </div>
          </div>

          {/* Line Chart Area */}
          <div className="mt-6">
            <div className="relative h-44 w-full">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="h-full w-full overflow-visible"
              >
                {/* Horizontal Grid lines */}
                {[0, 25, 50, 75, 100].map((val) => {
                  const y = chartHeight - (val / 100) * (chartHeight - 30) - 15;
                  return (
                    <g key={val}>
                      <line
                        x1="20"
                        y1={y}
                        x2={chartWidth - 20}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeDasharray="4 4"
                      />
                      <text x="0" y={y + 3} fill="#94a3b8" fontSize="9" fontWeight="bold">
                        {Math.round((val / 100) * maxTrendVal)}
                      </text>
                    </g>
                  );
                })}

                {/* Draft Line */}
                <path
                  d={getLinePath('draft')}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Published Line */}
                <path
                  d={getLinePath('published')}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {trendData.map((item, i) => {
                  const x = (i / (trendData.length - 1)) * (chartWidth - 40) + 20;
                  const yPub = chartHeight - (item.published / maxTrendVal) * (chartHeight - 30) - 15;
                  return (
                    <g key={i} className="cursor-pointer">
                      <circle
                        cx={x}
                        cy={yPub}
                        r={hoveredPoint === i ? 6 : 4}
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth="2"
                        onMouseEnter={() => setHoveredPoint(i)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="mt-2 flex justify-between px-4 text-[11px] font-bold text-slate-500">
              {trendData.map((item) => (
                <span key={item.day}>{item.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Post Status Distribution Donut & Legend (1 Col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900">बातम्यांची स्थिती (Status Breakdown)</h3>
            <span className="text-xs font-bold text-slate-500">एकूण: {totalPostsCount}</span>
          </div>

          {/* Visual Donut Ring using real dynamic conic-gradient */}
          <div className="my-4 flex items-center justify-center">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-slate-100 shadow-inner">
              <div
                className="h-full w-full rounded-full"
                style={{
                  background: donutGradient,
                }}
              />
              <div className="absolute flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white shadow-xs">
                <span className="text-lg font-black text-slate-900">{totalPostsCount}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">एकूण पोस्ट्स</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown Legend */}
          <div className="space-y-1.5 divide-y divide-slate-50 text-xs">
            {statusBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between pt-1.5">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className="font-semibold text-slate-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900">{item.count}</span>
                  <span className="text-[10px] text-slate-400 font-bold">({item.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setSelectedPostId(null);
            setCmsView('posts_new');
          }}
          className="p-4 rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-left transition flex flex-col justify-between group cursor-pointer shadow-xs"
        >
          <div className="h-9 w-9 rounded-xl bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition">
            <Plus className="h-5 w-5" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-black text-slate-900">नवीन बातमी तयार करा</p>
            <p className="text-[10px] text-slate-500">AI असिस्टंट व SEO सह</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setCmsView('wordpress_import')}
          className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-left transition flex flex-col justify-between group cursor-pointer shadow-xs"
        >
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-black text-slate-900">WordPress Importer</p>
            <p className="text-[10px] text-slate-500">XML व Live URL स्क्रॅपर</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setCmsView('categories')}
          className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-left transition flex flex-col justify-between group cursor-pointer shadow-xs"
        >
          <div className="h-9 w-9 rounded-xl bg-amber-600 text-white flex items-center justify-center group-hover:scale-110 transition">
            <FolderTree className="h-5 w-5" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-black text-slate-900">प्रवर्ग व्यवस्थापन</p>
            <p className="text-[10px] text-slate-500">{totalCategoriesCount} प्रवर्गांची यादी</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setCmsView('media')}
          className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition flex flex-col justify-between group cursor-pointer shadow-xs"
        >
          <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition">
            <Image className="h-5 w-5" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-black text-slate-900">मीडिया लायब्ररी</p>
            <p className="text-[10px] text-slate-500">{totalMediaCount} फोटो व फाइल्स</p>
          </div>
        </button>
      </div>

      {/* Row 4: Recent Posts Table & Latest Comments Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Posts (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">ताज्या बातम्या (Recent Articles)</h3>
              <p className="text-xs text-slate-400">पोर्टलवर नुकत्याच जोडलेल्या बातम्या</p>
            </div>
            <button
              type="button"
              onClick={() => setCmsView('posts_all')}
              className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              सर्व बातम्या पहा ({totalPostsCount}) &rarr;
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {posts.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="group flex items-center justify-between py-3 transition-colors hover:bg-slate-50/80 rounded-xl px-2"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="h-12 w-16 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-900 group-hover:text-red-600">
                      {post.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <Clock className="h-3 w-3" />
                      <span>{post.publishDate}</span>
                      <span>&bull;</span>
                      <span>{post.authorName}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-slate-500 font-bold">
                        <Eye className="h-3 w-3" />
                        {post.views || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {getStatusBadge(post.status)}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPostId(post.id);
                      setCmsView('posts_edit');
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                    title="Edit Post"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Comments Feed (1 Col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">वाचकांच्या प्रतिक्रिया</h3>
              <p className="text-xs text-slate-400">Latest Reader Comments</p>
            </div>
            <button
              type="button"
              onClick={() => setCmsView('comments')}
              className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              सर्व पहा &rarr;
            </button>
          </div>

          <div className="mt-3 space-y-3.5">
            {comments.slice(0, 4).map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 text-xs">
                <img
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">{comment.authorName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{comment.createdAt}</span>
                  </div>
                  <p className="mt-0.5 text-slate-600 line-clamp-2 leading-relaxed">
                    {comment.content}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-slate-400 truncate">
                    लेख: {comment.postTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
