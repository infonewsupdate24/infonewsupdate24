import {
  Calendar,
  Camera,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Flame,
  Globe,
  Hash,
  Lock,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Tag,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import type { Post, PostStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { canEditPost, canDeletePost } from '../../utils/rbac';
import { matchNewsPost } from '../../utils/searchUtils';
import {
  formatMarathiDate,
  getSafeImageUrl,
  DEFAULT_NEWS_FALLBACK_IMAGE,
} from '../../utils/contentFormatter';
import { QuickEditPostModal } from './QuickEditPostModal';
import { SocialSharePreviewModal } from './SocialSharePreviewModal';
import { BreakingNewsCardGeneratorModal } from './BreakingNewsCardGeneratorModal';

export const PostsListView: React.FC = () => {
  const {
    posts,
    categories,
    tags,
    setCmsView,
    setSelectedPostId,
    deletePost,
    duplicatePost,
    updatePost,
    changePostStatus,
    syncAllSeedPosts,
  } = useApp();
  const { currentUser, hasPermission } = useAuth();

  // Filters & Tabs state
  const [activeTab, setActiveTab] = useState<'ALL' | PostStatus | 'TRASH'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Selection & Bulk Actions
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<string>('');

  // Modals state
  const [quickEditPost, setQuickEditPost] = useState<Post | null>(null);
  const [socialSharePost, setSocialSharePost] = useState<Post | null>(null);
  const [graphicCardPost, setGraphicCardPost] = useState<Post | null>(null);

  // Unique Authors List
  const uniqueAuthors = useMemo(() => {
    const authors = new Set<string>();
    posts.forEach((p) => {
      if (p.authorName) authors.add(p.authorName);
    });
    return Array.from(authors);
  }, [posts]);

  // Tab counts
  const publishedCount = posts.filter((p) => p.status === 'PUBLISHED').length;
  const draftCount = posts.filter((p) => p.status === 'DRAFT').length;
  const submittedCount = posts.filter((p) => p.status === 'SUBMITTED').length;
  const underReviewCount = posts.filter((p) => p.status === 'UNDER_REVIEW').length;
  const totalCount = posts.length;

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Tab filter
      if (activeTab !== 'ALL' && activeTab !== 'TRASH' && post.status !== activeTab) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && post.categoryId !== selectedCategory) {
        return false;
      }
      // Tag filter
      if (selectedTag !== 'ALL') {
        if (!Array.isArray(post.tags) || !post.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) {
          return false;
        }
      }
      // Author filter
      if (selectedAuthor !== 'ALL' && post.authorName !== selectedAuthor) {
        return false;
      }
      // Search filter
      if (searchQuery && !matchNewsPost(post, searchQuery, categories)) {
        return false;
      }
      return true;
    });
  }, [posts, activeTab, selectedCategory, selectedTag, selectedAuthor, searchQuery, categories]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedPostIds.length === paginatedPosts.length && paginatedPosts.length > 0) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(paginatedPosts.map((p) => p.id));
    }
  };

  const toggleSelectPost = (id: string) => {
    if (selectedPostIds.includes(id)) {
      setSelectedPostIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedPostIds((prev) => [...prev, id]);
    }
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  const handleApplyBulk = async () => {
    if (!bulkAction || selectedPostIds.length === 0) return;
    try {
      if (bulkAction === 'delete') {
        for (const id of selectedPostIds) {
          await deletePost(id);
        }
        showToast(`${selectedPostIds.length} बातम्या क्लाउडवरून हटवल्या.`);
        setSelectedPostIds([]);
      } else if (bulkAction === 'publish') {
        for (const id of selectedPostIds) {
          await updatePost(id, { status: 'PUBLISHED' }, 'Bulk published');
        }
        showToast(`${selectedPostIds.length} बातम्या प्रसिद्ध (Published) केल्या.`);
        setSelectedPostIds([]);
      } else if (bulkAction === 'draft') {
        for (const id of selectedPostIds) {
          await updatePost(id, { status: 'DRAFT' }, 'Bulk moved to draft');
        }
        showToast(`${selectedPostIds.length} बातम्या मसुद्यामध्ये (Draft) हलवल्या.`);
        setSelectedPostIds([]);
      }
    } catch (err: any) {
      showToast('❌ प्रक्रिया अयशस्वी: ' + (err?.message || 'त्रुटी आली'));
    }
  };

  const handleDuplicate = (post: Post) => {
    if (duplicatePost) {
      const cloned = duplicatePost(post.id);
      if (cloned) {
        showToast(`बातमीची प्रत तयार झाली: "${cloned.title}"`);
      }
    }
  };

  const handleToggleBreaking = async (post: Post) => {
    try {
      await updatePost(post.id, { isBreaking: !post.isBreaking }, 'Toggled breaking status from list');
      showToast(
        !post.isBreaking
          ? 'बातमी ब्रेकिंग न्यूज टिकरमध्ये जोडली!'
          : 'बातमी ब्रेकिंग न्यूज टिकरमधून काढली.'
      );
    } catch (err: any) {
      showToast('❌ अद्ययावत अयशस्वी: ' + (err?.message || 'त्रुटी आली'));
    }
  };

  const handleToggleTrending = async (post: Post) => {
    try {
      await updatePost(post.id, { isTrending: !post.isTrending }, 'Toggled trending status from list');
      showToast(
        !post.isTrending
          ? 'बातमी ट्रेंडिंग विभागात जोडली!'
          : 'बातमी ट्रेंडिंग विभागातून काढली.'
      );
    } catch (err: any) {
      showToast('❌ अद्ययावत अयशस्वी: ' + (err?.message || 'त्रुटी आली'));
    }
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
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

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : 'General';
  };

  return (
    <div id="posts-list-view" className="space-y-4">
      {/* Header with Title & Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>बातम्या व्यवस्थापक (Posts Management)</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-extrabold text-slate-700">
                {totalCount} बातम्या
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              सर्व प्रकाशित व मसुदा बातम्या, पेजिनेशन, जलद संपादन व सोशल शेअरिंग.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('post.create') && (
            <>
              <button
                id="btn-posts-add-new"
                type="button"
                onClick={() => {
                  setSelectedPostId(null);
                  setCmsView('posts_new');
                }}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>नवीन बातमी लिहा</span>
              </button>

              <button
                id="btn-posts-import-wp"
                type="button"
                onClick={() => setCmsView('importer')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-bold shadow-2xs transition"
              >
                <Globe className="h-3.5 w-3.5 text-blue-600" />
                <span>WP / URL Importer</span>
              </button>

              <button
                id="btn-posts-sync-all"
                type="button"
                onClick={() => {
                  syncAllSeedPosts();
                  setFeedbackToast('✅ सर्व १२७ बातम्या व मूळ फोटो यशस्वीरीत्या सिंक झाले!');
                  setTimeout(() => setFeedbackToast(''), 4000);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-2 text-xs font-bold shadow-2xs transition"
                title="सर्व १२७ बातम्या आणि मूळ फोटो त्वरित सिंक करा"
              >
                <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
                <span>१२७ बातम्या सिंक करा</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 ring-1 ring-emerald-600/30 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-medium text-slate-500 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab('ALL');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'ALL'
              ? 'bg-slate-900 font-bold text-white shadow-xs'
              : 'hover:text-slate-900 bg-slate-100'
          }`}
        >
          सर्व बातम्या <span className="opacity-80">({totalCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('PUBLISHED');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'PUBLISHED'
              ? 'bg-emerald-600 font-bold text-white shadow-xs'
              : 'hover:text-slate-900 bg-emerald-50 text-emerald-700'
          }`}
        >
          Published <span className="opacity-80">({publishedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('DRAFT');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'DRAFT'
              ? 'bg-slate-800 font-bold text-white shadow-xs'
              : 'hover:text-slate-900 bg-slate-100'
          }`}
        >
          Draft <span className="opacity-80">({draftCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('UNDER_REVIEW');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'UNDER_REVIEW'
              ? 'bg-amber-600 font-bold text-white shadow-xs'
              : 'hover:text-slate-900 bg-amber-50 text-amber-700'
          }`}
        >
          Under Review <span className="opacity-80">({underReviewCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('SUBMITTED');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'SUBMITTED'
              ? 'bg-blue-600 font-bold text-white shadow-xs'
              : 'hover:text-slate-900 bg-blue-50 text-blue-700'
          }`}
        >
          Submitted <span className="opacity-80">({submittedCount})</span>
        </button>
      </div>

      {/* Advanced Action Bar (Bulk actions + Category + Tag + Author + Search) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Bulk Actions */}
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="h-8.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="">Bulk actions</option>
            {hasPermission('post.publish') && <option value="publish">प्रसिद्ध करा (Publish)</option>}
            <option value="draft">मसुद्यात हलवा (Draft)</option>
            {hasPermission('post.delete') && <option value="delete">कचऱ्यात हलवा (Delete)</option>}
          </select>
          <button
            type="button"
            onClick={handleApplyBulk}
            disabled={selectedPostIds.length === 0 || !bulkAction}
            className="h-8.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            लागू करा
          </button>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">सर्व कॅटेगरी (All)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => {
              setSelectedTag(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">सर्व टॅग्ज (All Tags)</option>
            {tags.map((t) => (
              <option key={t.id} value={t.name}>
                #{t.name}
              </option>
            ))}
          </select>

          {/* Author Filter */}
          <select
            value={selectedAuthor}
            onChange={(e) => {
              setSelectedAuthor(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">सर्व लेखक (All Authors)</option>
            {uniqueAuthors.map((author) => (
              <option key={author} value={author}>
                ✍️ {author}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="बातमी शोधा..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8.5 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-red-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50/90 font-bold uppercase tracking-wider text-slate-500 text-[11px]">
            <tr>
              <th className="w-8 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    paginatedPosts.length > 0 && selectedPostIds.length === paginatedPosts.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded-sm border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3">बातमी मथळा (Title)</th>
              <th className="px-4 py-3">कॅटेगरी</th>
              <th className="px-4 py-3">लेखक / रिपोर्टर</th>
              <th className="px-4 py-3">स्थिती (Status)</th>
              <th className="px-4 py-3">SEO स्कोअर</th>
              <th className="px-4 py-3">तारीख / व्ह्यूज</th>
              <th className="px-4 py-3 text-right">कृती (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedPosts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                  कोणतीही बातमी सापडली नाही.
                </td>
              </tr>
            ) : (
              paginatedPosts.map((post) => {
                const isChecked = selectedPostIds.includes(post.id);
                return (
                  <tr
                    key={post.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isChecked ? 'bg-red-50/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectPost(post.id)}
                        className="rounded-sm border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                    </td>

                    {/* Title + Thumbnail + Flags */}
                    <td className="px-4 py-3 max-w-sm">
                      <div className="flex items-start gap-3">
                        <img
                          src={getSafeImageUrl(post.featuredImage)}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                          }}
                          className="h-11 w-16 shrink-0 rounded-lg object-cover ring-1 border border-slate-200 bg-slate-100 shadow-2xs mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-bold text-slate-900 leading-snug hover:text-red-600 cursor-pointer line-clamp-2"
                            onClick={() => {
                              setSelectedPostId(post.id);
                              setCmsView('posts_edit');
                            }}
                            title="पूर्ण बातमी एडिटरमध्ये उघडा"
                          >
                            {post.title}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {/* 1-Click Breaking toggle badge */}
                            <button
                              type="button"
                              onClick={() => handleToggleBreaking(post)}
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-all ${
                                post.isBreaking
                                  ? 'bg-red-600 text-white shadow-2xs animate-pulse'
                                  : 'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-700'
                              }`}
                              title="ब्रेकिंग न्यूज टॉगल करा"
                            >
                              ⚡ Breaking
                            </button>

                            {/* 1-Click Trending toggle badge */}
                            <button
                              type="button"
                              onClick={() => handleToggleTrending(post)}
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-all ${
                                post.isTrending
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-700'
                              }`}
                              title="ट्रेंडिंग बातमी टॉगल करा"
                            >
                              🔥 Trending
                            </button>

                            <span className="text-[11px] text-slate-400">
                              📍 {post.location || 'महाराष्ट्र'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 font-medium text-slate-600">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-bold text-slate-700 text-[11px] border border-slate-200">
                        {getCategoryName(post.categoryId)}
                      </span>
                    </td>

                    {/* Author & Tags */}
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{post.authorName}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(post.tags) && post.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.2 text-[9px] font-semibold text-blue-700"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">{getStatusBadge(post.status)}</td>

                    {/* SEO Score */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-black font-mono text-xs ${
                            (post.seo?.score ?? 92) >= 80
                              ? 'text-emerald-600'
                              : (post.seo?.score ?? 92) >= 50
                              ? 'text-amber-600'
                              : 'text-red-600'
                          }`}
                        >
                          {post.seo?.score ?? 92}/100
                        </span>
                      </div>
                    </td>

                    {/* Date & Views */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      <p className="font-semibold text-slate-800">{formatMarathiDate(post.publishDate || post.createdAt)}</p>
                      <p className="text-[10px] text-slate-400 font-mono">👁️ {post.views} Views</p>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {canEditPost(currentUser, post) ? (
                          <>
                            {/* Quick Edit button */}
                            <button
                              type="button"
                              onClick={() => setQuickEditPost(post)}
                              className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="जलद संपादन (Quick Edit)"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            {/* Full Edit button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPostId(post.id);
                                setCmsView('posts_edit');
                              }}
                              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                              title="पूर्ण एडिटर उघडा (Full Editor)"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Locked Post Indicator & View Only for Non-Admins */}
                            <span
                              className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700 shadow-2xs"
                              title="🔒 प्रकाशित बातमी सुरक्षित आहे (केवळ ॲडमिन संपादन करू शकतात)"
                            >
                              <Lock className="h-3 w-3 text-amber-600" />
                              <span>Locked</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPostId(post.id);
                                setCmsView('posts_edit');
                              }}
                              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                              title="बातमी पहा (View Only Mode)"
                            >
                              <Eye className="h-4 w-4 text-slate-600" />
                            </button>
                          </>
                        )}

                        {/* Clone / Duplicate (Only if user has post.create permission) */}
                        {hasPermission('post.create') && (
                          <button
                            type="button"
                            onClick={() => handleDuplicate(post)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer"
                            title="बातमीची प्रत बनवा (Duplicate Post)"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        )}

                        {/* WhatsApp / Social Share */}
                        <button
                          type="button"
                          onClick={() => setSocialSharePost(post)}
                          className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="सोशल मीडिया व WhatsApp शेअर"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>

                        {/* Graphic Card Banner Download */}
                        <button
                          type="button"
                          onClick={() => setGraphicCardPost(post)}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="ब्रेकिंग न्यूज फोटो कार्ड तयार करा"
                        >
                          <Camera className="h-4 w-4" />
                        </button>

                        {/* Delete (Strictly locked to canDeletePost) */}
                        {canDeletePost(currentUser, post) && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`"${post.title}" ही बातमी हटवायची आहे का?`)) {
                                try {
                                  await deletePost(post.id);
                                  showToast('बातमी क्लाउडवरून यशस्वीरीत्या हटवली गेली.');
                                } catch (err: any) {
                                  showToast('❌ बातमी हटवणे अयशस्वी: ' + (err?.message || 'त्रुटी आली'));
                                }
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                            title="हटवा (Delete Post)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>प्रति पान बातम्या:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 font-bold text-slate-800 focus:outline-hidden"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-slate-400">
            (एकूण {filteredPosts.length} पैकी {Math.min(startIndex + 1, filteredPosts.length)}-
            {Math.min(startIndex + itemsPerPage, filteredPosts.length)} दाखवत आहे)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={validCurrentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-bold hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>मागील (Prev)</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 1)
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="px-1 text-slate-400">...</span>
                )}
                <button
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`h-8 w-8 rounded-lg font-bold transition-all ${
                    validCurrentPage === p
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            ))}

          <button
            type="button"
            disabled={validCurrentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-bold hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <span>पुढील (Next)</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Edit Modal */}
      <QuickEditPostModal
        post={quickEditPost}
        isOpen={Boolean(quickEditPost)}
        onClose={() => setQuickEditPost(null)}
      />

      {/* Social Share Preview Modal */}
      {socialSharePost && (
        <SocialSharePreviewModal
          post={socialSharePost}
          isOpen={Boolean(socialSharePost)}
          onClose={() => setSocialSharePost(null)}
        />
      )}

      {/* Breaking News Graphic Banner Generator Modal */}
      {graphicCardPost && (
        <BreakingNewsCardGeneratorModal
          post={graphicCardPost}
          categoryName={getCategoryName(graphicCardPost.categoryId)}
          isOpen={Boolean(graphicCardPost)}
          onClose={() => setGraphicCardPost(null)}
        />
      )}
    </div>
  );
};
