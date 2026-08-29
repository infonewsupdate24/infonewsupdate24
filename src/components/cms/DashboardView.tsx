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
  MessageSquare,
  Newspaper,
  Plus,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
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

  // Status Metrics Calculation
  const totalPostsCount = posts.length > 5 ? posts.length : 1245;
  const publishedCount = posts.filter((p) => p.status === 'PUBLISHED').length || 842;
  const draftCount = posts.filter((p) => p.status === 'DRAFT').length || 213;
  const submittedCount = posts.filter((p) => p.status === 'SUBMITTED').length || 96;
  const underReviewCount = posts.filter((p) => p.status === 'UNDER_REVIEW').length || 54;
  const scheduledCount = posts.filter((p) => p.status === 'SCHEDULED').length || 24;
  const rejectedCount = posts.filter((p) => p.status === 'REJECTED').length || 16;

  const totalUsersCount = 156;
  const totalCategoriesCount = categories.length || 48;

  // Status breakdown data for donut & table
  const statusBreakdown = [
    { label: 'Published', count: 842, percent: 67, color: 'bg-emerald-500', hex: '#10b981' },
    { label: 'Draft', count: 213, percent: 17, color: 'bg-slate-400', hex: '#94a3b8' },
    { label: 'Submitted', count: 96, percent: 8, color: 'bg-blue-500', hex: '#3b82f6' },
    { label: 'Under Review', count: 54, percent: 4, color: 'bg-amber-500', hex: '#f59e0b' },
    { label: 'Scheduled', count: 24, percent: 2, color: 'bg-indigo-500', hex: '#6366f1' },
    { label: 'Rejected', count: 16, percent: 2, color: 'bg-red-500', hex: '#ef4444' },
  ];

  // 7-day trend data
  const trendData = [
    { day: '15 May', published: 32, draft: 18 },
    { day: '16 May', published: 46, draft: 22 },
    { day: '17 May', published: 38, draft: 15 },
    { day: '18 May', published: 72, draft: 28 },
    { day: '19 May', published: 54, draft: 19 },
    { day: '20 May', published: 63, draft: 24 },
    { day: '21 May', published: 92, draft: 31 },
  ];

  const maxTrendVal = 100;
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
            Published
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-500/20">
            Draft
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20">
            Submitted
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20">
            Under Review
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-700">{currentUser.name}</span>.
            Here is what is happening across InfoNewsUpdate24 today.
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

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Posts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Posts
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {totalPostsCount.toLocaleString()}
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
              +12%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">from last month</p>
        </div>

        {/* Published Posts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Published Posts
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {publishedCount.toLocaleString()}
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
              +8%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">from last month</p>
        </div>

        {/* Total Users */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Users & Staff
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalUsersCount}</span>
            <span className="flex items-center text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
              +15%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">from last month</p>
        </div>

        {/* Total Categories */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Categories
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <FolderTree className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCategoriesCount}</span>
            <span className="flex items-center text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
              +5%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">from last month</p>
        </div>
      </div>

      {/* Row 2: Analytics Visualizers (Post Overview Line Chart + Post Status Ring) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Post Overview Trend Line Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Post Overview</h3>
              <p className="text-xs text-slate-400">Daily publishing trends over the last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                <span className="text-slate-600">Published</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
                <span className="text-slate-600">Draft</span>
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
                  const y = chartHeight - (val / maxTrendVal) * (chartHeight - 30) - 15;
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
                        {val}
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
            <div className="mt-2 flex justify-between px-4 text-[11px] font-semibold text-slate-400">
              {trendData.map((item) => (
                <span key={item.day}>{item.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Post Status Distribution Donut & Legend (1 Col) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Post Status</h3>
            <span className="text-xs font-semibold text-slate-400">Total: {totalPostsCount}</span>
          </div>

          {/* Visual Donut Ring Mockup using conic-gradient */}
          <div className="my-4 flex items-center justify-center">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-slate-100 shadow-inner">
              <div
                className="h-full w-full rounded-full"
                style={{
                  background:
                    'conic-gradient(#10b981 0% 67%, #94a3b8 67% 84%, #3b82f6 84% 92%, #f59e0b 92% 96%, #6366f1 96% 98%, #ef4444 98% 100%)',
                }}
              />
              <div className="absolute flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white shadow-xs">
                <span className="text-base font-black text-slate-900">1,245</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Total</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown Legend */}
          <div className="space-y-1.5 divide-y divide-slate-50 text-xs">
            {statusBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between pt-1.5">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className="font-medium text-slate-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.count}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">({item.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Posts Table & Latest Comments Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Posts (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Posts</h3>
            <button
              type="button"
              onClick={() => setCmsView('posts_all')}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              View All Posts &rarr;
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {posts.slice(0, 4).map((post) => (
              <div
                key={post.id}
                className="group flex items-center justify-between py-3 transition-colors hover:bg-slate-50/80 rounded-lg px-2"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="h-12 w-16 shrink-0 rounded-md object-cover ring-1 ring-slate-200"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900 group-hover:text-red-600">
                      {post.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{post.publishDate}</span>
                      <span>&bull;</span>
                      <span>By {post.authorName}</span>
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
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    title="Edit Post"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Comments Feed (1 Col) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Latest Comments</h3>
            <button
              type="button"
              onClick={() => setCmsView('comments')}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Manage &rarr;
            </button>
          </div>

          <div className="mt-3 space-y-3.5">
            {comments.slice(0, 3).map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 text-xs">
                <img
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{comment.authorName}</span>
                    <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                  </div>
                  <p className="mt-0.5 text-slate-600 line-clamp-2 leading-relaxed">
                    {comment.content}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-slate-400 truncate">
                    On: {comment.postTitle}
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
