import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Hash,
  Layers,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Tag as TagIcon,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Tag } from '../../types';

const TRENDING_SUGGESTIONS = [
  { name: 'महाराष्ट्र राजकारण', slug: 'maharashtra-politics' },
  { name: 'शेतकरी कर्जमाफी', slug: 'farmers-loan-waiver' },
  { name: 'मुख्यमंत्री माझी लाडकी बहीण योजना', slug: 'ladki-bahin-yojana' },
  { name: 'सोने-चांदी भाव', slug: 'gold-silver-rates' },
  { name: 'आयपीएल व क्रिकेट', slug: 'ipl-cricket-updates' },
  { name: 'गडचिरोली विशेष घडामोडी', slug: 'gadchiroli-spotlight' },
  { name: 'हवामान अंदाज व पाऊस', slug: 'weather-monsoon-forecast' },
  { name: 'शासकीय नोकरी व भरती', slug: 'govt-jobs-recruitment' },
  { name: 'आरोग्य व जीवनशैली', slug: 'health-lifestyle' },
  { name: 'शेअर बाजार व व्यापार', slug: 'stock-market-business' },
];

const BADGE_COLORS = [
  { label: 'Red (लाल)', value: 'bg-red-50 text-red-700 border-red-200' },
  { label: 'Blue (निळा)', value: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Emerald (हिरवा)', value: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'Amber (पिवळा)', value: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Purple (जांभळा)', value: 'bg-purple-50 text-purple-700 border-purple-200' },
  { label: 'Slate (ग्रे)', value: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export const TagManagerView: React.FC = () => {
  const { tags, posts, addTag, updateTag, deleteTag, bulkDeleteTags, setSelectedPostId, setCmsView } =
    useApp() as any;
  const { hasPermission } = useAuth();

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(BADGE_COLORS[0].value);

  // Table filtering & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'count_desc' | 'name_asc' | 'recent'>('count_desc');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Modals
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [viewingArticlesTag, setViewingArticlesTag] = useState<Tag | null>(null);

  const canManage = hasPermission ? hasPermission('tag.manage') : true;

  // Auto-slug generator from tag name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\u0900-\u097F-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(generatedSlug);
  };

  // Calculate live dynamic post counts for each tag
  const tagStats = useMemo(() => {
    const counts: Record<string, number> = {};

    posts.forEach((post: any) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((t: string) => {
          const clean = t.trim().toLowerCase();
          counts[clean] = (counts[clean] || 0) + 1;
        });
      }
    });

    return {
      getCountForTag: (tag: Tag) => {
        const byName = counts[tag.name.trim().toLowerCase()] || 0;
        const bySlug = counts[tag.slug.trim().toLowerCase()] || 0;
        return Math.max(byName, bySlug, tag.count || 0);
      },
    };
  }, [posts]);

  // Filtered & sorted tags
  const processedTags = useMemo(() => {
    let result = [...tags].map((t) => ({
      ...t,
      liveCount: tagStats.getCountForTag(t),
    }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'count_desc') {
      result.sort((a, b) => b.liveCount - a.liveCount);
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'mr'));
    }

    return result;
  }, [tags, searchQuery, sortBy, tagStats]);

  // Overall Statistics
  const totalTags = tags.length;
  const totalTaggedPosts = useMemo(() => {
    return posts.filter((p: any) => Array.isArray(p.tags) && p.tags.length > 0).length;
  }, [posts]);

  const mostUsedTag = useMemo(() => {
    if (processedTags.length === 0) return null;
    return [...processedTags].sort((a, b) => b.liveCount - a.liveCount)[0];
  }, [processedTags]);

  const unusedTagsCount = useMemo(() => {
    return processedTags.filter((t) => t.liveCount === 0).length;
  }, [processedTags]);

  // Create Tag
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalSlug =
      slug.trim() ||
      name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

    try {
      const created = await addTag(name.trim(), finalSlug, description.trim());
      if (created && updateTag && color) {
        await updateTag(created.id, { color });
      }

      setName('');
      setSlug('');
      setDescription('');
      setFeedback({ type: 'success', message: `टॅग "${name.trim()}" यशस्वीरित्या जोडला गेला.` });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `❌ त्रुटी: ${err?.message || 'टॅग जोडता आला नाही'}` });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Quick Add Trending Suggestion
  const handleQuickAdd = async (suggestion: { name: string; slug: string }) => {
    try {
      await addTag(suggestion.name, suggestion.slug);
      setFeedback({ type: 'success', message: `ट्रेंडिंग टॅग "${suggestion.name}" जोडला गेला.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `❌ त्रुटी: ${err?.message || 'टॅग जोडता आला नाही'}` });
    }
  };

  // Delete Single Tag
  const handleDelete = async (tag: Tag) => {
    if (window.confirm(`तुम्हाला "${tag.name}" हा टॅग नक्की हटवायचा आहे का?`)) {
      try {
        await deleteTag(tag.id);
        setSelectedTagIds((prev) => prev.filter((id) => id !== tag.id));
        setFeedback({ type: 'success', message: `टॅग "${tag.name}" हटवला गेला.` });
        setTimeout(() => setFeedback(null), 3000);
      } catch (err: any) {
        setFeedback({ type: 'error', message: `❌ त्रुटी: ${err?.message || 'टॅग हटवता आला नाही'}` });
      }
    }
  };

  // Bulk Delete Selected
  const handleBulkDelete = () => {
    if (selectedTagIds.length === 0) return;
    if (
      window.confirm(`तुम्ही निवडलेले एकूण ${selectedTagIds.length} टॅग्ज कायमचे हटवू इच्छिता का?`)
    ) {
      if (bulkDeleteTags) {
        bulkDeleteTags(selectedTagIds);
      } else {
        selectedTagIds.forEach((id) => deleteTag(id));
      }
      setSelectedTagIds([]);
      setFeedback({
        type: 'success',
        message: `${selectedTagIds.length} टॅग्ज यशस्वीरित्या हटवले गेले.`,
      });
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  // Save Edit Tag Modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;

    if (updateTag) {
      updateTag(editingTag.id, {
        name: editingTag.name.trim(),
        slug: editingTag.slug.trim(),
        description: editingTag.description?.trim() || '',
        color: editingTag.color || BADGE_COLORS[0].value,
      });
    }

    setFeedback({ type: 'success', message: `टॅग "${editingTag.name}" अपडेट केला गेला.` });
    setEditingTag(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Find posts for the inspection modal
  const articlesForSelectedTag = useMemo(() => {
    if (!viewingArticlesTag) return [];
    const tName = viewingArticlesTag.name.trim().toLowerCase();
    const tSlug = viewingArticlesTag.slug.trim().toLowerCase();

    return posts.filter((p: any) => {
      if (!Array.isArray(p.tags)) return false;
      return p.tags.some((t: string) => {
        const c = t.trim().toLowerCase();
        return c === tName || c === tSlug;
      });
    });
  }, [viewingArticlesTag, posts]);

  const handleToggleSelectAll = () => {
    if (selectedTagIds.length === processedTags.length) {
      setSelectedTagIds([]);
    } else {
      setSelectedTagIds(processedTags.map((t) => t.id));
    }
  };

  const handleToggleSelectTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div id="tag-manager-view" className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>टॅग्ज व्यवस्थापक (Tags Management)</span>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-extrabold text-red-700">
                  {totalTags} Tags
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                बातम्यांचे कीवर्ड्स, ट्रेंडिंग विषय आणि SEO टॅग्ज व्यवस्थापित करा.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCmsView('posts_new')}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>नवीन बातमी लिहा</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">एकूण टॅग्ज</span>
            <TagIcon className="h-4 w-4 text-red-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 font-mono">{totalTags}</p>
          <span className="text-[10px] text-slate-400">सक्रिय डेटाबेसमध्ये</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">टॅग केलेल्या बातम्या</span>
            <FileText className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 font-mono">{totalTaggedPosts}</p>
          <span className="text-[10px] text-slate-400">एकूण {posts.length} बातम्यांपैकी</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">सर्वाधिक वापरलेला</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-sm font-bold text-slate-900 truncate">
            {mostUsedTag ? `#${mostUsedTag.name}` : 'N/A'}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {mostUsedTag ? `${mostUsedTag.liveCount} बातम्यांमध्ये` : 'शून्य'}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">अवापरलेले टॅग्ज</span>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 font-mono">{unusedTagsCount}</p>
          <span className="text-[10px] text-slate-400">0 बातम्या असलेले</span>
        </div>
      </div>

      {/* Quick Trending Suggestions Bar */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span>लोकप्रिय ट्रेंडिंग टॅग सूचना (१-क्लिकने जोडा):</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {TRENDING_SUGGESTIONS.map((item) => {
            const alreadyExists = tags.some(
              (t: Tag) =>
                t.slug === item.slug || t.name.toLowerCase() === item.name.toLowerCase()
            );
            return (
              <button
                key={item.slug}
                type="button"
                disabled={alreadyExists}
                onClick={() => handleQuickAdd(item)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  alreadyExists
                    ? 'bg-amber-100/70 text-amber-800 cursor-default opacity-70 border border-amber-200'
                    : 'bg-white text-slate-700 hover:bg-amber-100 hover:text-amber-900 border border-amber-300 shadow-2xs hover:scale-[1.02]'
                }`}
                title={alreadyExists ? 'हा टॅग आधीच जोडलेला आहे' : 'हा टॅग जोडण्यासाठी क्लिक करा'}
              >
                <span>#{item.name}</span>
                {alreadyExists ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Plus className="h-3 w-3 text-amber-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-bold transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/30'
              : 'bg-red-50 text-red-800 ring-1 ring-red-600/30'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Add New Tag Form */}
        {canManage && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs h-fit space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-red-600" />
                <span>नवीन टॅग जोडा (Add New Tag)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                नवीन कीवर्ड टॅग तयार करून बातम्यांशी संलग्न करा.
              </p>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">
                  टॅग नाव (Tag Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="उदा. शेतकरी कर्जमाफी"
                  value={name}
                  onChange={handleNameChange}
                  required
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-800 focus:border-red-600 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  वेबसाईटवर वाचकांना हे नाव दिसेल.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">
                  स्लग (Slug / URL Key)
                </label>
                <input
                  type="text"
                  placeholder="उदा. shetkari-karjmafi"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-800 font-mono text-[11px] focus:border-red-600 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  URL साठी वापरला जाणारा युनिक आयडी (उदा. /tag/shetkari-karjmafi).
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">
                  वर्णन (Description / SEO Meta)
                </label>
                <textarea
                  rows={3}
                  placeholder="या टॅगबद्दल संक्षिप्त माहिती किंवा SEO सारांश..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-800 focus:border-red-600 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1.5 block">
                  रंग / बॅज स्टाईल (Badge Color)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {BADGE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`rounded-lg border px-2 py-1 text-[10px] font-semibold text-center transition-all ${
                        c.value
                      } ${color === c.value ? 'ring-2 ring-red-600 ring-offset-1 font-bold' : 'opacity-80'}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>टॅग जोडा (Save Tag)</span>
              </button>
            </form>
          </div>
        )}

        {/* Right Column: Tags Table & Actions */}
        <div className={`${canManage ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="टॅग किंवा स्लग शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8.5 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-red-600 focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 focus:outline-hidden"
                  >
                    <option value="count_desc">सर्वाधिक बातम्या प्रथम</option>
                    <option value="name_asc">नावानुसार (A-Z / अ-ज्ञ)</option>
                    <option value="recent">नुकतेच जोडलेले</option>
                  </select>
                </div>

                {selectedTagIds.length > 0 && canManage && (
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>निवडलेले हटवा ({selectedTagIds.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    {canManage && (
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={
                            processedTags.length > 0 &&
                            selectedTagIds.length === processedTags.length
                          }
                          onChange={handleToggleSelectAll}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3">टॅग नाव (Name)</th>
                    <th className="px-4 py-3">स्लग (Slug)</th>
                    <th className="px-4 py-3 text-center">एकूण बातम्या (Count)</th>
                    <th className="px-4 py-3 text-right">कृती (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedTags.length === 0 ? (
                    <tr>
                      <td
                        colSpan={canManage ? 5 : 4}
                        className="py-8 text-center text-xs text-slate-400"
                      >
                        {searchQuery
                          ? 'कोणताही जुळणारा टॅग सापडला नाही.'
                          : 'सध्या कोणताही टॅग उपलब्ध नाही. डाव्या बाजूने नवीन टॅग जोडा.'}
                      </td>
                    </tr>
                  ) : (
                    processedTags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      const badgeStyle = tag.color || BADGE_COLORS[0].value;

                      return (
                        <tr
                          key={tag.id}
                          className={`transition-colors hover:bg-slate-50/80 ${
                            isSelected ? 'bg-red-50/40' : ''
                          }`}
                        >
                          {canManage && (
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectTag(tag.id)}
                                className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                              />
                            </td>
                          )}

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold border ${badgeStyle}`}
                              >
                                <Hash className="h-3 w-3" />
                                <span>{tag.name}</span>
                              </span>
                            </div>
                            {tag.description && (
                              <p className="mt-1 text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                                {tag.description}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                            {tag.slug}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setViewingArticlesTag(tag)}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-mono font-bold transition-all hover:scale-105 ${
                                tag.liveCount > 0
                                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-600/20'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                              title={`${tag.liveCount} बातम्या पहा`}
                            >
                              <span>{tag.liveCount}</span>
                              <Eye className="h-3 w-3 text-blue-500" />
                            </button>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingTag(tag)}
                                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                title="एडिट करा"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              {canManage && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(tag)}
                                  className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                  title="हटवा"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-[11px] text-slate-500">
              <span>
                एकूण टॅग्ज दाखवत आहे: <strong className="text-slate-800">{processedTags.length}</strong>
              </span>
              <span>InfoNewsUpdate24 Tag Taxonomy System</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Tag Modal */}
      {editingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="h-4 w-4 text-red-600" />
                <span>टॅग संपादित करा (Edit Tag)</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingTag(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">टॅग नाव (Name)</label>
                <input
                  type="text"
                  required
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-800 focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">स्लग (Slug)</label>
                <input
                  type="text"
                  required
                  value={editingTag.slug}
                  onChange={(e) => setEditingTag({ ...editingTag, slug: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-800 font-mono text-[11px] focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">वर्णन (Description)</label>
                <textarea
                  rows={3}
                  value={editingTag.description || ''}
                  onChange={(e) =>
                    setEditingTag({ ...editingTag, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-800 focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1.5 block">रंग बॅज</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {BADGE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setEditingTag({ ...editingTag, color: c.value })}
                      className={`rounded-lg border px-2 py-1 text-[10px] font-semibold text-center transition-all ${
                        c.value
                      } ${
                        (editingTag.color || BADGE_COLORS[0].value) === c.value
                          ? 'ring-2 ring-red-600 ring-offset-1 font-bold'
                          : 'opacity-80'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTag(null)}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                >
                  बदल सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Articles with this Tag Modal */}
      {viewingArticlesTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    #{viewingArticlesTag.name} शी संबंधित बातम्या ({articlesForSelectedTag.length})
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">/{viewingArticlesTag.slug}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingArticlesTag(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              {articlesForSelectedTag.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  या टॅगशी जोडलेली कोणतीही बातमी सापडली नाही.
                </div>
              ) : (
                articlesForSelectedTag.map((article: any) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs hover:bg-white hover:border-red-200 transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {article.featuredImage ? (
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          className="h-10 w-14 rounded-md object-cover ring-1 ring-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded-md bg-slate-200 text-slate-400 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-slate-900 truncate">{article.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{article.authorName}</span>
                          <span>&bull;</span>
                          <span>{article.publishDate || article.createdAt}</span>
                          <span>&bull;</span>
                          <span
                            className={`font-semibold ${
                              article.status === 'PUBLISHED'
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {article.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPostId(article.id);
                        setCmsView('posts_edit');
                        setViewingArticlesTag(null);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700 shrink-0"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>एडिट करा</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewingArticlesTag(null)}
                className="rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
