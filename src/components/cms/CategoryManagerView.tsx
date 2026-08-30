import { FolderTree, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const CategoryManagerView: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useApp();
  const { hasPermission } = useAuth();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
    );
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await addCategory({
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
        parentId: parentId ? parentId : null,
        description,
        displayOrder: categories.length + 1,
        status: 'ACTIVE',
      });

      setName('');
      setSlug('');
      setParentId('');
      setDescription('');
      setFeedback({ type: 'success', message: 'Category added successfully.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to add category' });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteCategory(id);
      if (!res.success) {
        setFeedback({ type: 'error', message: res.message || 'Cannot delete category' });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'success', message: 'Category deleted successfully.' });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to delete category' });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div id="category-manager-view" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
        <p className="text-xs text-slate-500">
          Manage hierarchical state, district, and regional categories (e.g. Maharashtra &rarr; Gadchiroli &rarr; Etapalli).
        </p>
      </div>

      {feedback && (
        <div
          className={`rounded-lg p-3 text-xs font-bold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/30'
              : 'bg-red-50 text-red-800 ring-1 ring-red-600/30'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Col: Add New Category Form (WordPress Style) */}
        {hasPermission('category.manage') && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs h-fit">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 mb-4">
              Add New Category
            </h3>
            <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Gadchiroli"
                  value={name}
                  onChange={handleNameChange}
                  required
                  className="h-8 w-full rounded-md border border-slate-200 px-2.5 text-slate-800 focus:border-red-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400 mt-1">The name is how it appears on the site.</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Slug</label>
                <input
                  type="text"
                  placeholder="e.g. gadchiroli"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-8 w-full rounded-md border border-slate-200 px-2.5 text-slate-800 focus:border-red-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400 mt-1">The “slug” is the URL-friendly version of the name.</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Parent Category</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-slate-800 focus:outline-hidden"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.parentId ? `— ${c.name}` : c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Assign a parent to build a hierarchy (e.g. Maharashtra &rarr; Gadchiroli).</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-slate-200 p-2 text-slate-800 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Category</span>
              </button>
            </form>
          </div>
        )}

        {/* Right 2 Cols: Category Hierarchy Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 font-bold uppercase tracking-wider text-slate-600 text-xs flex justify-between items-center">
            <span>Category Hierarchy</span>
            <span className="text-[11px] text-slate-400 lowercase">{categories.length} categories</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {categories.map((cat) => {
              const parent = categories.find((c) => c.id === cat.parentId);
              const isSub = !!cat.parentId;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderTree
                      className={`h-4 w-4 shrink-0 ${isSub ? 'text-red-500 ml-4' : 'text-slate-500'}`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {isSub ? `— ${cat.name}` : cat.name}
                        </span>
                        {parent && (
                          <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                            under {parent.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">/{cat.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                      {cat.postCount || 0} posts
                    </span>
                    {hasPermission('category.manage') && (
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete Category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
