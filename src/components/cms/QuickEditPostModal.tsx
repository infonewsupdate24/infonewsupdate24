import React, { useState, useEffect } from 'react';
import {
  Check,
  Edit,
  Eye,
  Hash,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Tag,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Post, PostStatus, PostVisibility } from '../../types';
import { transliterateMarathiToSlug } from '../../services/SEOAutoOptimizer';

interface QuickEditPostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickEditPostModal: React.FC<QuickEditPostModalProps> = ({
  post,
  isOpen,
  onClose,
}) => {
  const { categories, tags, updatePost } = useApp();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<PostStatus>('DRAFT');
  const [visibility, setVisibility] = useState<PostVisibility>('PUBLIC');
  const [location, setLocation] = useState('मुंबई');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [postTags, setPostTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setSlug(post.slug || '');
      setCategoryId(post.categoryId || categories[0]?.id || '');
      setStatus(post.status || 'DRAFT');
      setVisibility(post.visibility || 'PUBLIC');
      setLocation(post.location || 'मुंबई');
      setIsBreaking(post.isBreaking || false);
      setIsTrending(post.isTrending || false);
      setPostTags(Array.isArray(post.tags) ? [...post.tags] : []);
      setFeedback('');
    }
  }, [post, categories]);

  if (!isOpen || !post) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug || slug === post.slug) {
      setSlug(transliterateMarathiToSlug(val));
    }
  };

  const handleRegenerateSlug = () => {
    setSlug(transliterateMarathiToSlug(title));
  };

  const handleAddTag = () => {
    const clean = newTagInput.trim();
    if (clean && !postTags.includes(clean)) {
      setPostTags([...postTags, clean]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPostTags(postTags.filter((t) => t !== tagToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updatePost(
      post.id,
      {
        title: title.trim(),
        slug: slug.trim() || post.slug,
        categoryId,
        status,
        visibility,
        location,
        isBreaking,
        isTrending,
        tags: postTags,
      },
      'Quick edited from posts list'
    );

    setFeedback('बदल यशस्वीरित्या सेव्ह केले!');
    setTimeout(() => {
      setFeedback('');
      onClose();
    }, 800);
  };

  return (
    <div
      id="quick-edit-post-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                जलद संपादन (Quick Edit Post)
              </h3>
              <p className="text-xs text-slate-500">
                मुख्य एडिटर न उघडता शीर्षक, कॅटेगरी, टॅग्ज आणि स्थिती त्वरित बदला.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {feedback && (
          <div className="rounded-lg bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800 border border-emerald-200 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="font-bold text-slate-700 mb-1 block">
              मथळा / शीर्षक (Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-900 font-semibold focus:border-red-600 focus:outline-hidden"
            />
          </div>

          {/* Slug & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 block">
                  स्लग (Slug / URL)
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  className="text-[10px] text-red-600 hover:text-red-700 font-bold flex items-center gap-0.5"
                  title="मथळ्यावरून स्लग ऑटो-जनरेट करा"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  <span>Auto-Generate</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-800 font-mono text-[11px] focus:border-red-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-red-600" />
                <span>स्थान / ब्युरो (Location)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="उदा. मुंबई, गडचिरोली, नागपूर"
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-800 focus:border-red-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">कॅटेगरी (Category)</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-slate-800 font-medium focus:outline-hidden"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">स्थिती (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-slate-800 font-medium focus:outline-hidden"
              >
                <option value="PUBLISHED">Published (प्रसिद्ध)</option>
                <option value="DRAFT">Draft (मसुदा)</option>
                <option value="UNDER_REVIEW">Under Review (तपासणीत)</option>
                <option value="SUBMITTED">Submitted (सादर)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">दृश्यमानता (Visibility)</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as PostVisibility)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-slate-800 font-medium focus:outline-hidden"
              >
                <option value="PUBLIC">Public (सार्वजनिक)</option>
                <option value="PRIVATE">Private (केवळ स्टाफ)</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="font-bold text-slate-700 mb-1 block flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-blue-600" />
              <span>टॅग्ज (Tags)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="टॅग जोडा..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="h-8 flex-1 rounded-md border border-slate-200 px-2.5 text-slate-800 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-md bg-slate-800 px-3 py-1 text-xs font-bold text-white hover:bg-slate-900"
              >
                + जोडा
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-6">
              {postTags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <span>⚡ ब्रेकिंग न्यूज टिकर (Breaking News)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span>🔥 ट्रेंडिंग बातमी (Trending)</span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              रद्द करा
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>अपडेट करा (Save Changes)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
