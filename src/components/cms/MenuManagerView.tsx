import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  ExternalLink,
  Eye,
  FileText,
  FolderTree,
  Globe,
  Layers,
  Link,
  Plus,
  PlusCircle,
  RotateCcw,
  Save,
  Search,
  Tag as TagIcon,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Category, Menu, MenuItem, MenuItemType } from '../../types';

export const MenuManagerView: React.FC = () => {
  const {
    menus,
    updateMenu,
    categories,
    pages,
    tags,
    resetToDefaultSeed,
  } = useApp() as any;

  // Selected menu ID (defaults to primary header menu)
  const [selectedMenuId, setSelectedMenuId] = useState<string>(
    menus[0]?.id || 'menu-header-main'
  );

  // Active working menu copy
  const activeMenu: Menu =
    menus.find((m: Menu) => m.id === selectedMenuId) ||
    menus[0] || {
      id: 'menu-header-main',
      name: 'Primary Header Navigation (मुख्य हेडर मेन्यू)',
      items: [],
    };

  // Local state for edits before save
  const [menuName, setMenuName] = useState<string>(activeMenu.name);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(activeMenu.items || []);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Synchronize when switching menus
  const handleSelectMenu = (menuId: string) => {
    setSelectedMenuId(menuId);
    const target = menus.find((m: Menu) => m.id === menuId);
    if (target) {
      setMenuName(target.name);
      setMenuItems(JSON.parse(JSON.stringify(target.items || [])));
      setExpandedItemId(null);
      setSaveSuccessMsg(null);
    }
  };

  // Accordion section states for left sidebar
  const [leftAccordion, setLeftAccordion] = useState<{
    categories: boolean;
    pages: boolean;
    customLink: boolean;
    tags: boolean;
  }>({
    categories: true,
    pages: false,
    customLink: false,
    tags: false,
  });

  // Category selection checkboxes
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState<string>('');

  // Page selection checkboxes
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);

  // Tag selection checkboxes
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Custom link inputs
  const [customLinkUrl, setCustomLinkUrl] = useState<string>('https://');
  const [customLinkText, setCustomLinkText] = useState<string>('');
  const [customLinkTarget, setCustomLinkTarget] = useState<'_self' | '_blank'>('_self');

  // Quick sub-item adder modal/inline state
  const [quickSubItemParentId, setQuickSubItemParentId] = useState<string | null>(null);
  const [quickSubItemLabel, setQuickSubItemLabel] = useState<string>('');
  const [quickSubItemUrl, setQuickSubItemUrl] = useState<string>('');

  // Save current menu
  const handleSaveMenu = () => {
    updateMenu(selectedMenuId, menuItems);
    setSaveSuccessMsg('मेन्यू आणि सबमेन्यू रचना यशस्वीरित्या सेव्ह झाली! मुख्य पृष्ठावर होव्हर सबमेन्यू लगेच सक्रिय झाले आहेत.');
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  // Helper: Flatten list or manipulate nested items
  const handleAddCategoriesToMenu = () => {
    if (selectedCategoryIds.length === 0) return;

    const newItems: MenuItem[] = selectedCategoryIds.map((catId, idx) => {
      const cat = categories.find((c: Category) => c.id === catId);
      // Check if this category has subcategories in data
      const childCats = categories.filter((c: Category) => c.parentId === catId);
      const subChildren: MenuItem[] = childCats.map((child: Category, cIdx: number) => ({
        id: `m-cat-${child.id}-${Date.now()}-${cIdx}`,
        label: child.name,
        type: 'CATEGORY',
        url: `/category/${child.slug}`,
        order: cIdx + 1,
        parentId: `m-cat-${catId}-${Date.now()}-${idx}`,
      }));

      return {
        id: `m-cat-${catId}-${Date.now()}-${idx}`,
        label: cat?.name || 'Category',
        type: 'CATEGORY',
        url: `/category/${cat?.slug || catId}`,
        order: menuItems.length + idx + 1,
        children: subChildren.length > 0 ? subChildren : undefined,
      };
    });

    setMenuItems((prev) => [...prev, ...newItems]);
    setSelectedCategoryIds([]);
  };

  const handleAddPagesToMenu = () => {
    if (selectedPageIds.length === 0) return;

    const newItems: MenuItem[] = selectedPageIds.map((pId, idx) => {
      const pg = pages.find((p: any) => p.id === pId);
      return {
        id: `m-page-${pId}-${Date.now()}-${idx}`,
        label: pg?.title || 'Page',
        type: 'PAGE',
        url: `/page/${pg?.slug || pId}`,
        order: menuItems.length + idx + 1,
      };
    });

    setMenuItems((prev) => [...prev, ...newItems]);
    setSelectedPageIds([]);
  };

  const handleAddCustomLink = () => {
    if (!customLinkText.trim()) return;

    const newItem: MenuItem = {
      id: `m-custom-${Date.now()}`,
      label: customLinkText.trim(),
      type: 'CUSTOM_LINK',
      url: customLinkUrl || '/',
      target: customLinkTarget,
      order: menuItems.length + 1,
    };

    setMenuItems((prev) => [...prev, newItem]);
    setCustomLinkText('');
    setCustomLinkUrl('https://');
  };

  const handleAddTagsToMenu = () => {
    if (selectedTagIds.length === 0) return;

    const newItems: MenuItem[] = selectedTagIds.map((tId, idx) => {
      const tg = tags.find((t: any) => t.id === tId);
      return {
        id: `m-tag-${tId}-${Date.now()}-${idx}`,
        label: `#${tg?.name || 'Tag'}`,
        type: 'TAG',
        url: `/tag/${tg?.slug || tId}`,
        order: menuItems.length + idx + 1,
      };
    });

    setMenuItems((prev) => [...prev, ...newItems]);
    setSelectedTagIds([]);
  };

  // Reordering top-level items
  const moveTopItem = (index: number, direction: 'UP' | 'DOWN') => {
    const updated = [...menuItems];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;

    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setMenuItems(updated);
  };

  // Reordering sub-items within a parent
  const moveSubItem = (
    parentIndex: number,
    childIndex: number,
    direction: 'UP' | 'DOWN'
  ) => {
    const updated = [...menuItems];
    const parent = updated[parentIndex];
    if (!parent || !parent.children) return;

    const children = [...parent.children];
    const targetChildIndex = direction === 'UP' ? childIndex - 1 : childIndex + 1;
    if (targetChildIndex < 0 || targetChildIndex >= children.length) return;

    const temp = children[childIndex];
    children[childIndex] = children[targetChildIndex];
    children[targetChildIndex] = temp;
    parent.children = children;
    setMenuItems(updated);
  };

  // Convert top-level item into a sub-item of the previous item (Indent)
  const indentAsSubmenu = (index: number) => {
    if (index === 0) return;
    const updated = [...menuItems];
    const itemToDemote = updated[index];
    const previousParent = updated[index - 1];

    if (!previousParent) return;

    // Add to previous parent's children
    const existingChildren = previousParent.children || [];
    previousParent.children = [
      ...existingChildren,
      { ...itemToDemote, parentId: previousParent.id },
    ];

    // Remove from top-level array
    updated.splice(index, 1);
    setMenuItems(updated);
  };

  // Promote a sub-item to top level (Outdent)
  const outdentToTopLevel = (parentIndex: number, childIndex: number) => {
    const updated = [...menuItems];
    const parent = updated[parentIndex];
    if (!parent || !parent.children) return;

    const [promotedChild] = parent.children.splice(childIndex, 1);
    if (!promotedChild) return;

    delete promotedChild.parentId;

    // Insert right below the parent at top level
    updated.splice(parentIndex + 1, 0, promotedChild);
    setMenuItems(updated);
  };

  // Delete a top-level item
  const deleteTopItem = (index: number) => {
    const updated = [...menuItems];
    updated.splice(index, 1);
    setMenuItems(updated);
  };

  // Delete a sub-item
  const deleteSubItem = (parentIndex: number, childIndex: number) => {
    const updated = [...menuItems];
    const parent = updated[parentIndex];
    if (!parent || !parent.children) return;

    parent.children.splice(childIndex, 1);
    setMenuItems(updated);
  };

  // Update item details
  const updateItemDetails = (
    parentIndex: number,
    childIndex: number | null,
    field: keyof MenuItem,
    value: any
  ) => {
    const updated = [...menuItems];
    if (childIndex === null) {
      updated[parentIndex] = { ...updated[parentIndex], [field]: value };
    } else {
      const parent = updated[parentIndex];
      if (parent && parent.children && parent.children[childIndex]) {
        parent.children[childIndex] = {
          ...parent.children[childIndex],
          [field]: value,
        };
      }
    }
    setMenuItems(updated);
  };

  // Add quick direct sub-item
  const handleAddQuickSubItem = (parentIndex: number) => {
    if (!quickSubItemLabel.trim()) return;

    const updated = [...menuItems];
    const parent = updated[parentIndex];
    if (!parent) return;

    const newSubItem: MenuItem = {
      id: `m-sub-${Date.now()}`,
      label: quickSubItemLabel.trim(),
      type: 'CUSTOM_LINK',
      url: quickSubItemUrl.trim() || `/category/${quickSubItemLabel.toLowerCase().replace(/\s+/g, '-')}`,
      order: (parent.children?.length || 0) + 1,
      parentId: parent.id,
    };

    parent.children = [...(parent.children || []), newSubItem];
    setMenuItems(updated);
    setQuickSubItemParentId(null);
    setQuickSubItemLabel('');
    setQuickSubItemUrl('');
  };

  const filteredCategories = categories.filter((cat: Category) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Menu Management & Submenu Builder (मेन्यू आणि सबमेन्यू)
              </h1>
              <p className="text-xs text-slate-500">
                WordPress-style navigation builder with full submenus & hover dropdowns on public home page.
              </p>
            </div>
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset menus to default factory configuration?')) {
                resetToDefaultSeed();
                window.location.reload();
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Menus</span>
          </button>

          <button
            type="button"
            onClick={handleSaveMenu}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-all active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>Save Menu (मेन्यू सेव्ह करा)</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 1. Menu Selector Bar */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <label className="font-bold text-slate-700 whitespace-nowrap">
            Select Menu to Edit (संपादित करण्यासाठी मेन्यू निवडा):
          </label>
          <select
            value={selectedMenuId}
            onChange={(e) => handleSelectMenu(e.target.value)}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 font-semibold text-slate-900 focus:border-red-500 focus:outline-hidden"
          >
            {menus.map((m: Menu) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.items?.length || 0} items)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span className="font-semibold">Active Menu Name:</span>
          <input
            type="text"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            className="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-bold text-slate-800 focus:border-red-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* 2. Interactive Live Dropdown Preview (Hover Test Box) */}
      <div className="rounded-2xl border-2 border-dashed border-red-200 bg-linear-to-r from-slate-900 to-slate-800 p-4 text-white shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-red-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-red-400">
              Live Home Page Navbar Preview (होव्हर करून सबमेन्यू तपासा)
            </h3>
          </div>
          <span className="text-[11px] text-slate-300">
            Hover mouse over items with submenus (उदा. Maharashtra, National, Business, Sports) to see instant dropdowns!
          </span>
        </div>

        {/* Live Preview Bar */}
        <div className="rounded-xl bg-[#0f172a] border border-slate-700/80 px-2 py-1.5 flex items-center gap-1 overflow-x-auto relative">
          {menuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            return (
              <div key={item.id} className="relative group shrink-0">
                <button
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wider ${
                    item.type === 'HOME'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-200 hover:bg-red-600 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {hasChildren && (
                    <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-white group-hover:rotate-180 transition-transform duration-200" />
                  )}
                </button>

                {/* Dropdown Menu on Hover */}
                {hasChildren && (
                  <div className="absolute left-0 top-full mt-1 w-56 rounded-xl border border-slate-700 bg-[#0f172a] shadow-2xl p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 -translate-y-1 transition-all duration-200 z-50">
                    <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 border-b border-slate-800 uppercase tracking-wider">
                      {item.label} Submenus ({item.children!.length})
                    </div>
                    <div className="py-1 space-y-0.5 max-h-60 overflow-y-auto">
                      {item.children!.map((child) => (
                        <a
                          key={child.id}
                          href={child.url}
                          onClick={(e) => e.preventDefault()}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <span>{child.label}</span>
                          <ChevronRight className="h-3 w-3 opacity-40" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Builder Grid (Left: Sources Accordion | Right: Menu Tree Structure) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Add Menu Items (Accordion) (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Add Menu Items (मेन्यू घटक जोडा)
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Select items below and click 'Add to Menu' to append them to the navigation structure.
            </p>
          </div>

          {/* A. CATEGORIES ACCORDION */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden text-xs">
            <button
              type="button"
              onClick={() =>
                setLeftAccordion((prev) => ({ ...prev, categories: !prev.categories }))
              }
              className="w-full flex items-center justify-between p-3.5 font-bold text-slate-800 bg-slate-50/70 hover:bg-slate-100 transition-colors border-b border-slate-200"
            >
              <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-red-600" />
                <span>Categories (बातम्यांचे विभाग व जिल्हे)</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform ${
                  leftAccordion.categories ? 'rotate-180' : ''
                }`}
              />
            </button>

            {leftAccordion.categories && (
              <div className="p-3.5 space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="h-8 w-full rounded border border-slate-200 px-2.5 pr-7 text-xs"
                  />
                  <Search className="absolute right-2 top-2 h-4 w-4 text-slate-400" />
                </div>

                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                  {filteredCategories.map((cat: Category) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    const isSubCategory = Boolean(cat.parentId);

                    return (
                      <label
                        key={cat.id}
                        className={`flex items-center gap-2 py-1 px-1.5 rounded cursor-pointer hover:bg-slate-50 transition-colors ${
                          isSubCategory ? 'ml-4 text-slate-600 font-normal' : 'font-semibold text-slate-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategoryIds((prev) => [...prev, cat.id]);
                            } else {
                              setSelectedCategoryIds((prev) =>
                                prev.filter((id) => id !== cat.id)
                              );
                            }
                          }}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="truncate">{cat.name}</span>
                        {isSubCategory && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded ml-auto shrink-0">
                            Sub-district
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCategoryIds.length === categories.length) {
                        setSelectedCategoryIds([]);
                      } else {
                        setSelectedCategoryIds(categories.map((c: Category) => c.id));
                      }
                    }}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    {selectedCategoryIds.length === categories.length ? 'Deselect All' : 'Select All'}
                  </button>

                  <button
                    type="button"
                    disabled={selectedCategoryIds.length === 0}
                    onClick={handleAddCategoriesToMenu}
                    className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white disabled:opacity-50 hover:bg-red-700"
                  >
                    Add to Menu ({selectedCategoryIds.length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* B. PAGES ACCORDION */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden text-xs">
            <button
              type="button"
              onClick={() =>
                setLeftAccordion((prev) => ({ ...prev, pages: !prev.pages }))
              }
              className="w-full flex items-center justify-between p-3.5 font-bold text-slate-800 bg-slate-50/70 hover:bg-slate-100 transition-colors border-b border-slate-200"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Pages (स्थिर पृष्ठे / Pages)</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform ${
                  leftAccordion.pages ? 'rotate-180' : ''
                }`}
              />
            </button>

            {leftAccordion.pages && (
              <div className="p-3.5 space-y-3">
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {pages.map((pg: any) => {
                    const isSelected = selectedPageIds.includes(pg.id);
                    return (
                      <label
                        key={pg.id}
                        className="flex items-center gap-2 py-1 px-1.5 rounded cursor-pointer hover:bg-slate-50 font-medium text-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPageIds((prev) => [...prev, pg.id]);
                            } else {
                              setSelectedPageIds((prev) =>
                                prev.filter((id) => id !== pg.id)
                              );
                            }
                          }}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <span>{pg.title}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={selectedPageIds.length === 0}
                    onClick={handleAddPagesToMenu}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white disabled:opacity-50 hover:bg-blue-700"
                  >
                    Add to Menu ({selectedPageIds.length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* C. CUSTOM LINKS ACCORDION */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden text-xs">
            <button
              type="button"
              onClick={() =>
                setLeftAccordion((prev) => ({ ...prev, customLink: !prev.customLink }))
              }
              className="w-full flex items-center justify-between p-3.5 font-bold text-slate-800 bg-slate-50/70 hover:bg-slate-100 transition-colors border-b border-slate-200"
            >
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-emerald-600" />
                <span>Custom Link (कस्टम लिंक / URL)</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform ${
                  leftAccordion.customLink ? 'rotate-180' : ''
                }`}
              />
            </button>

            {leftAccordion.customLink && (
              <div className="p-3.5 space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={customLinkUrl}
                    onChange={(e) => setCustomLinkUrl(e.target.value)}
                    placeholder="https://example.com or /live"
                    className="h-8 w-full rounded border border-slate-200 px-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Link Text (मेन्यू नाव)
                  </label>
                  <input
                    type="text"
                    value={customLinkText}
                    onChange={(e) => setCustomLinkText(e.target.value)}
                    placeholder="उदा. थेट प्रक्षेपण (Live TV)"
                    className="h-8 w-full rounded border border-slate-200 px-2.5 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk-target-blank"
                    checked={customLinkTarget === '_blank'}
                    onChange={(e) =>
                      setCustomLinkTarget(e.target.checked ? '_blank' : '_self')
                    }
                    className="rounded border-slate-300 text-red-600"
                  />
                  <label htmlFor="chk-target-blank" className="text-slate-600 cursor-pointer">
                    Open link in a new browser tab
                  </label>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={!customLinkText.trim()}
                    onClick={handleAddCustomLink}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white disabled:opacity-50 hover:bg-emerald-700"
                  >
                    Add Custom Link
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* D. TAGS / TOPICS ACCORDION */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden text-xs">
            <button
              type="button"
              onClick={() =>
                setLeftAccordion((prev) => ({ ...prev, tags: !prev.tags }))
              }
              className="w-full flex items-center justify-between p-3.5 font-bold text-slate-800 bg-slate-50/70 hover:bg-slate-100 transition-colors border-b border-slate-200"
            >
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-purple-600" />
                <span>Trending Tags / Topics</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform ${
                  leftAccordion.tags ? 'rotate-180' : ''
                }`}
              />
            </button>

            {leftAccordion.tags && (
              <div className="p-3.5 space-y-3">
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {tags.map((tg: any) => {
                    const isSelected = selectedTagIds.includes(tg.id);
                    return (
                      <label
                        key={tg.id}
                        className="flex items-center gap-2 py-1 px-1.5 rounded cursor-pointer hover:bg-slate-50 font-medium text-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTagIds((prev) => [...prev, tg.id]);
                            } else {
                              setSelectedTagIds((prev) =>
                                prev.filter((id) => id !== tg.id)
                              );
                            }
                          }}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <span>#{tg.name}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={selectedTagIds.length === 0}
                    onClick={handleAddTagsToMenu}
                    className="rounded-lg bg-purple-600 px-3 py-1.5 font-bold text-white disabled:opacity-50 hover:bg-purple-700"
                  >
                    Add Tags to Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Menu Structure & Hierarchy (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Menu Structure & Submenu Hierarchy (मेन्यू रचना व क्रम)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Organize top-level items and nest child submenus using the Up/Down and Submenu Indent controls.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                {menuItems.length} Top-level Items
              </span>
            </div>

            {/* Explanatory hint banner */}
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50/70 p-3 text-xs text-blue-800 border border-blue-200">
              <CornerDownRight className="h-4 w-4 text-blue-600 shrink-0" />
              <span>
                <strong>टीप (How Submenus Work):</strong> Top-level menu items with child submenus will show an automatic chevron arrow on the home page and smoothly reveal all nested submenus on mouse hover!
              </span>
            </div>

            {/* Menu Items Tree List */}
            <div className="mt-4 space-y-3">
              {menuItems.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400">
                  <Layers className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="font-semibold text-xs text-slate-600">This menu is currently empty.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select categories or pages from the left panel and click 'Add to Menu'.
                  </p>
                </div>
              ) : (
                menuItems.map((item, index) => {
                  const hasSubmenu = item.children && item.children.length > 0;
                  const isExpanded = expandedItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 transition-all hover:border-slate-300 shadow-xs"
                    >
                      {/* Top-level Menu Item Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-200 font-mono text-xs font-bold text-slate-700">
                            {index + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs truncate">
                                {item.label}
                              </span>
                              <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                {item.type}
                              </span>
                              {hasSubmenu && (
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 flex items-center gap-1">
                                  <CornerDownRight className="h-3 w-3" />
                                  {item.children!.length} Sub-items
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 truncate block">
                              {item.url}
                            </span>
                          </div>
                        </div>

                        {/* Top-level Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Reorder Up */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveTopItem(index, 'UP')}
                            title="Move Up"
                            className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>

                          {/* Reorder Down */}
                          <button
                            type="button"
                            disabled={index === menuItems.length - 1}
                            onClick={() => moveTopItem(index, 'DOWN')}
                            title="Move Down"
                            className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>

                          {/* Indent as Submenu (Make Child of Previous) */}
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => indentAsSubmenu(index)}
                              title="Make this item a Submenu under the item above (सबमेन्यू बनवा)"
                              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-200 hover:bg-red-600 hover:text-white text-[11px] font-bold text-slate-700 transition-colors"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Indent Submenu</span>
                            </button>
                          )}

                          {/* Add Submenu Directly */}
                          <button
                            type="button"
                            onClick={() =>
                              setQuickSubItemParentId(
                                quickSubItemParentId === item.id ? null : item.id
                              )
                            }
                            title="Add sub-item under this parent (+ सबमेन्यू जोडा)"
                            className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 px-2"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">+ Sub-item</span>
                          </button>

                          {/* Expand Edit Card */}
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedItemId(isExpanded ? null : item.id)
                            }
                            className="p-1 rounded hover:bg-slate-200 text-slate-600"
                            title="Edit details"
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => deleteTopItem(index)}
                            title="Remove from menu"
                            className="p-1 rounded hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Inline Quick Sub-item Adder Box */}
                      {quickSubItemParentId === item.id && (
                        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 space-y-2 text-xs">
                          <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                            <PlusCircle className="h-4 w-4 text-emerald-700" />
                            Add Submenu under &quot;{item.label}&quot; (नवीन सबमेन्यू जोडा):
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Submenu Label (उदा. गडचिरोली / शेअर बाजार)"
                              value={quickSubItemLabel}
                              onChange={(e) => setQuickSubItemLabel(e.target.value)}
                              className="h-8 rounded border border-emerald-300 bg-white px-2 text-xs font-medium"
                            />
                            <input
                              type="text"
                              placeholder="URL / Path (उदा. /category/gadchiroli)"
                              value={quickSubItemUrl}
                              onChange={(e) => setQuickSubItemUrl(e.target.value)}
                              className="h-8 rounded border border-emerald-300 bg-white px-2 text-xs font-mono"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setQuickSubItemParentId(null)}
                              className="px-2.5 py-1 text-slate-600 font-semibold hover:text-slate-900"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={!quickSubItemLabel.trim()}
                              onClick={() => handleAddQuickSubItem(index)}
                              className="rounded bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Add Submenu (जोडा)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Expandable Details Box */}
                      {isExpanded && (
                        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 space-y-3 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">
                                Navigation Label (मेन्यू नाव)
                              </label>
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) =>
                                  updateItemDetails(index, null, 'label', e.target.value)
                                }
                                className="h-8 w-full rounded border border-slate-200 px-2 text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">
                                Target URL (लिंक)
                              </label>
                              <input
                                type="text"
                                value={item.url}
                                onChange={(e) =>
                                  updateItemDetails(index, null, 'url', e.target.value)
                                }
                                className="h-8 w-full rounded border border-slate-200 px-2 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* NESTED SUBMENU ITEMS (Level 1) */}
                      {hasSubmenu && (
                        <div className="mt-3 pl-6 border-l-2 border-red-300 space-y-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Nested Submenus ({item.children!.length}):
                          </div>
                          {item.children!.map((child, cIdx) => (
                            <div
                              key={child.id}
                              className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-center justify-between gap-2 text-xs shadow-2xs hover:border-slate-300"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <CornerDownRight className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                <div>
                                  <span className="font-bold text-slate-800 text-xs">
                                    {child.label}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 ml-2">
                                    {child.url}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {/* Move Subitem Up */}
                                <button
                                  type="button"
                                  disabled={cIdx === 0}
                                  onClick={() => moveSubItem(index, cIdx, 'UP')}
                                  title="Move Up"
                                  className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>

                                {/* Move Subitem Down */}
                                <button
                                  type="button"
                                  disabled={cIdx === item.children!.length - 1}
                                  onClick={() => moveSubItem(index, cIdx, 'DOWN')}
                                  title="Move Down"
                                  className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>

                                {/* Promote to Top-level (Outdent) */}
                                <button
                                  type="button"
                                  onClick={() => outdentToTopLevel(index, cIdx)}
                                  title="Promote this sub-item to top-level menu (वरच्या पातळीवर आणा)"
                                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                                >
                                  <span>Outdent</span>
                                </button>

                                {/* Delete Sub-item */}
                                <button
                                  type="button"
                                  onClick={() => deleteSubItem(index, cIdx)}
                                  title="Delete sub-item"
                                  className="p-1 rounded hover:bg-red-50 text-red-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Menu Locations & Save Bar */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800">
                  Menu Display Location (मेन्यू प्रदर्शन स्थान):
                </h4>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-300 text-red-600"
                    />
                    <span>Primary Header Navigation (मुख्य हेडर मेन्यू पट्टी)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-red-600"
                    />
                    <span>Mobile Navigation (मोबाईल मेन्यू)</span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveMenu}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-all active:scale-95 shrink-0"
              >
                <Save className="h-4 w-4" />
                <span>Save Menu (मेन्यू सेव्ह करा)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
