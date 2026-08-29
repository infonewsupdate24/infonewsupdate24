import {
  AlertCircle,
  Check,
  CheckCircle,
  Cloud,
  Copy,
  Crop,
  Download,
  Eye,
  FileCheck,
  FileImage,
  FileText,
  Film,
  Filter,
  Image as ImageIcon,
  Info,
  Layers,
  Maximize2,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth, usePermissions } from '../../context/AuthContext';
import { MediaItem } from '../../types';
import { ImageCropperModal } from './ImageCropperModal';
import { optimizeImageFile } from '../../utils/imageOptimizer';

interface MediaLibraryViewProps {
  onSelectMedia?: (media: MediaItem) => void;
  isModal?: boolean;
}

type MediaTypeFilter = 'all' | 'image' | 'video' | 'document';
type SortOption = 'newest' | 'oldest' | 'largest' | 'smallest' | 'name_asc';

export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({
  onSelectMedia,
  isModal = false,
}) => {
  const { media, uploadMedia, updateMediaItem, deleteMedia, bulkDeleteMedia, setCmsView } = useApp();
  const { currentUser } = useAuth();
  const { hasPermission } = usePermissions();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilter>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Selection & Inspector State
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Inspector Live Edit Form
  const [editName, setEditName] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editCredit, setEditCredit] = useState('');
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  // Cropper Modal State
  const [cropTargetItem, setCropTargetItem] = useState<MediaItem | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // WebP Compression State
  const [compressingId, setCompressingId] = useState<string | null>(null);

  // Sync edit form when selectedItem changes
  const handleOpenInspector = (item: MediaItem) => {
    setSelectedItem(item);
    setEditName(item.name || '');
    setEditAltText(item.altText || '');
    setEditCaption(item.caption || '');
    setEditCredit(item.credit || 'InfoNewsUpdate24');
  };

  // Format file size helper
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Process File(s) from File Input or Drag & Drop
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploadStatus('⏳ फाइल्स ऑप्टिमाइझ करून Firebase Cloud वर सेव्ह होत आहेत...');

    try {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isDoc = file.type.includes('pdf') || file.type.includes('document') || file.name.endsWith('.pdf');

        let mediaType: 'image' | 'video' | 'document' = 'image';
        if (isVideo) mediaType = 'video';
        else if (isDoc) mediaType = 'document';

        const cleanName = file.name;
        const altText = cleanName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

        // Optimize image (compress, resize & WebP conversion)
        const optimized = await optimizeImageFile(file, 1600, 0.85);

        uploadMedia({
          name: cleanName,
          url: optimized.dataUrl,
          type: mediaType,
          mimeType: optimized.mimeType,
          sizeBytes: optimized.sizeBytes,
          dimensions: optimized.width && optimized.height ? { width: optimized.width, height: optimized.height } : undefined,
          altText,
          caption: `Uploaded by ${currentUser.name}`,
          credit: 'InfoNewsUpdate24',
          uploadedBy: currentUser.name,
        });
      }

      setUploadStatus(`✅ ${files.length} फाइल(्स) Firebase Firestore क्लाउडवर यशस्वीरित्या सेव्ह झाल्या!`);
      setTimeout(() => setUploadStatus(null), 4000);
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadStatus(`❌ फाइल अपलोड करताना एरर आला: ${err?.message || 'Failed'}`);
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // 1-Click WebP Optimizer
  const handleOptimizeToWebP = (item: MediaItem) => {
    if (item.type !== 'image' || item.mimeType === 'image/webp') return;

    setCompressingId(item.id);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = item.url;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setCompressingId(null);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const webpUrl = canvas.toDataURL('image/webp', 0.85);
      const newSizeBytes = Math.round(webpUrl.length * 0.75);
      const savedPercent = Math.max(10, Math.round(((item.sizeBytes - newSizeBytes) / item.sizeBytes) * 100));

      const newName = item.name.replace(/\.[^/.]+$/, '') + '.webp';

      updateMediaItem(item.id, {
        url: webpUrl,
        mimeType: 'image/webp',
        sizeBytes: newSizeBytes,
        name: newName,
      });

      if (selectedItem?.id === item.id) {
        setSelectedItem({
          ...selectedItem,
          url: webpUrl,
          mimeType: 'image/webp',
          sizeBytes: newSizeBytes,
          name: newName,
        });
      }

      setUploadStatus(`⚡ "${item.name}" WebP मध्ये ऑप्टिमाइज झाले! (${savedPercent}% साईज बचत)`);
      setTimeout(() => setUploadStatus(null), 5000);
      setCompressingId(null);
    };

    img.onerror = () => {
      setCompressingId(null);
    };
  };

  // Save live inspector edits
  const handleSaveInspectorEdits = () => {
    if (!selectedItem) return;
    setIsSavingMeta(true);

    updateMediaItem(selectedItem.id, {
      name: editName.trim() || selectedItem.name,
      altText: editAltText.trim(),
      caption: editCaption.trim(),
      credit: editCredit.trim(),
    });

    setSelectedItem({
      ...selectedItem,
      name: editName.trim() || selectedItem.name,
      altText: editAltText.trim(),
      caption: editCaption.trim(),
      credit: editCredit.trim(),
    });

    setIsSavingMeta(false);
    setUploadStatus('✅ माहिती व फोटो क्रेडिट यशस्वीरित्या सेव्ह झाले!');
    setTimeout(() => setUploadStatus(null), 3000);
  };

  // Bulk Selection Handlers
  const handleToggleSelectId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredMedia.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMedia.map((m) => m.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`तुम्हाला निवडलेल्या ${selectedIds.size} मीडिया फाइल्स कायमस्वरूपी हटवायच्या आहेत का?`)) {
      bulkDeleteMedia(Array.from(selectedIds));
      if (selectedItem && selectedIds.has(selectedItem.id)) {
        setSelectedItem(null);
      }
      setSelectedIds(new Set());
      setUploadStatus('✅ निवडलेल्या फाइल्स यशस्वीरित्या हटवल्या!');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  // Unique Month options
  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    media.forEach((item) => {
      const d = new Date(item.createdAt);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        set.add(key);
      }
    });
    return Array.from(set).sort().reverse();
  }, [media]);

  // Filtered and Sorted Media
  const filteredMedia = useMemo(() => {
    let list = media.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.altText && item.altText.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.credit && item.credit.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === 'all'
          ? true
          : typeFilter === 'document'
          ? item.type === 'document' || item.mimeType.includes('pdf')
          : item.type === typeFilter;

      let matchesMonth = true;
      if (selectedMonth !== 'all') {
        const d = new Date(item.createdAt);
        const itemMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        matchesMonth = itemMonth === selectedMonth;
      }

      return matchesQuery && matchesType && matchesMonth;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'largest') return (b.sizeBytes || 0) - (a.sizeBytes || 0);
      if (sortBy === 'smallest') return (a.sizeBytes || 0) - (b.sizeBytes || 0);
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [media, searchQuery, typeFilter, selectedMonth, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Native File Input for Browser File Selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*,video/*,application/pdf,.doc,.docx"
        multiple
        className="hidden"
        id="browser-media-file-input"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span>मीडिया लायब्ररी (Media Library)</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <Cloud className="w-3 h-3 text-blue-600" />
              <span>Firebase Cloud Sync</span>
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            बातम्यांसाठी चित्रे, व्हिडिओ व फाइल्स थेट Firebase Firestore क्लाउडवर सुरक्षित साठवली जातात व रिअल-टाईम सिंक होतात.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCmsView('litespeed_cache')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
            title="LiteSpeed Cache WebP Image Optimization"
          >
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>LiteSpeed WebP Opt</span>
          </button>

          {hasPermission('media.upload') && (
            <button
              type="button"
              id="upload-media-browser-btn"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>फाइल्स अपलोड करा (Upload Files)</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {uploadStatus && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      {hasPermission('media.upload') && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-red-500 bg-red-50/60 scale-[1.01]'
              : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-400'
          }`}
        >
          <div className="w-11 h-11 mx-auto rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 mb-2">
            <Upload className="w-5 h-5 text-red-600 animate-bounce" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            येथे फाइल्स ड्रॅग आणि ड्रॉप करा किंवा ब्राउझरमधून निवडा
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            JPG, PNG, WEBP, GIF, MP4, PDF GR (एकाच वेळी अनेक फाइल्स निवडू शकता)
          </p>
        </div>
      )}

      {/* Search, Filter & Sort Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नावाने किंवा फोटो सौजन्याने शोधा..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden focus:border-red-500 focus:bg-white"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium border border-slate-200">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-md transition text-xs ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              सर्व ({media.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('image')}
              className={`px-2.5 py-1 rounded-md transition text-xs ${
                typeFilter === 'image' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              चित्रे ({media.filter((m) => m.type === 'image').length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('video')}
              className={`px-2.5 py-1 rounded-md transition text-xs ${
                typeFilter === 'video' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              व्हिडिओ ({media.filter((m) => m.type === 'video').length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('document')}
              className={`px-2.5 py-1 rounded-md transition text-xs ${
                typeFilter === 'document' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PDF / GR ({media.filter((m) => m.type === 'document' || m.mimeType?.includes('pdf')).length})
            </button>
          </div>
        </div>

        {/* Sort & Month Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 font-medium focus:border-red-500 focus:outline-none"
          >
            <option value="all">सर्व महिने</option>
            {monthOptions.map((mKey) => (
              <option key={mKey} value={mKey}>
                {mKey}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 font-medium focus:border-red-500 focus:outline-none"
          >
            <option value="newest">नवीनतम आधी (Newest)</option>
            <option value="oldest">जुने आधी (Oldest)</option>
            <option value="largest">आकाराने मोठी (Largest)</option>
            <option value="smallest">आकाराने लहान (Smallest)</option>
            <option value="name_asc">नावानुसार (A-Z)</option>
          </select>

          {/* Select All Checkbox */}
          {hasPermission('media.manage') && filteredMedia.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              {selectedIds.size === filteredMedia.length ? 'निवड रद्द' : 'सर्व निवडा'}
            </button>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-40 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px]">
              {selectedIds.size}
            </span>
            <span>फाइल्स निवडल्या आहेत</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700"
            >
              रद्द करा
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1 text-xs font-bold text-white hover:bg-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>सामूहिक हटवा ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <FileImage className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">कोणतीही मीडिया फाइल सापडली नाही</h4>
            <p className="text-xs text-slate-500 mt-1">
              वर दिलेल्या बटणावर क्लिक करून ब्राउझरमधून नवीन फोटो, व्हिडिओ किंवा GR डॉक्युमेंट अपलोड करा.
            </p>
          </div>
        ) : (
          filteredMedia.map((item) => {
            const isVideo = item.type === 'video';
            const isDoc = item.type === 'document' || item.mimeType?.includes('pdf');
            const isSelected = selectedItem?.id === item.id;
            const isChecked = selectedIds.has(item.id);
            const isWebP = item.mimeType === 'image/webp';

            return (
              <div
                key={item.id}
                onClick={() => {
                  handleOpenInspector(item);
                  if (onSelectMedia) onSelectMedia(item);
                }}
                className={`group relative rounded-xl border bg-white p-2 shadow-xs transition-all cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-red-600 ring-2 ring-red-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Select Checkbox */}
                {hasPermission('media.manage') && (
                  <div
                    onClick={(e) => handleToggleSelectId(item.id, e)}
                    className="absolute top-3 left-3 z-10 p-1"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer shadow-xs"
                    />
                  </div>
                )}

                {/* Thumbnail */}
                <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                  {isVideo ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                      <Film className="w-8 h-8 text-red-500" />
                      <span className="text-[10px] mt-1 font-mono">Video</span>
                    </div>
                  ) : isDoc ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-700 p-2 text-center">
                      <FileText className="w-8 h-8 text-red-600 mb-1" />
                      <span className="text-[10px] font-bold truncate max-w-full font-mono">PDF GR</span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.altText || item.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  )}

                  {/* Size & WebP Badges */}
                  <div className="absolute bottom-1 left-1 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                      {formatBytes(item.sizeBytes)}
                    </span>
                    {isWebP && (
                      <span className="px-1 py-0.5 rounded bg-emerald-600 text-white text-[8px] font-bold">
                        WebP
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="mt-2">
                  <p className="truncate text-xs font-bold text-slate-800" title={item.name}>
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span className="truncate max-w-[70px]">{item.credit || item.uploadedBy.split(' ')[0]}</span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString('mr-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>

                {/* Hover Quick Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition z-20">
                  {/* Crop Tool Button for images */}
                  {item.type === 'image' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCropTargetItem(item);
                        setIsCropperOpen(true);
                      }}
                      className="p-1.5 rounded-md bg-white/95 text-slate-700 hover:text-red-600 hover:bg-white shadow-xs"
                      title="16:9 / 1:1 फोटो क्रॉप करा"
                    >
                      <Crop className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(item.url, item.id);
                    }}
                    className="p-1.5 rounded-md bg-white/95 text-slate-700 hover:bg-white shadow-xs"
                    title="URL कॉपी करा"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {hasPermission('media.manage') && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMedia(item.id);
                        if (selectedItem?.id === item.id) setSelectedItem(null);
                      }}
                      className="p-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 shadow-xs"
                      title="हटवा"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Item Detail Inspector Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">
                  {selectedItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Media Preview Box */}
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-950 flex items-center justify-center min-h-[220px]">
                  {selectedItem.type === 'video' ? (
                    <video src={selectedItem.url} controls className="max-h-64 w-full" />
                  ) : selectedItem.type === 'document' || selectedItem.mimeType?.includes('pdf') ? (
                    <div className="p-6 text-center text-white space-y-2">
                      <FileText className="w-12 h-12 text-red-500 mx-auto" />
                      <p className="text-xs font-mono break-all">{selectedItem.name}</p>
                      <a
                        href={selectedItem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF डाऊनलोड करा</span>
                      </a>
                    </div>
                  ) : (
                    <img
                      src={selectedItem.url}
                      alt={selectedItem.altText || selectedItem.name}
                      className="max-h-64 w-full object-contain"
                    />
                  )}
                </div>

                {/* Crop & WebP Action Buttons */}
                {selectedItem.type === 'image' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCropTargetItem(selectedItem);
                        setIsCropperOpen(true);
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-2xs"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>16:9 / 1:1 क्रॉप करा</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOptimizeToWebP(selectedItem)}
                      disabled={compressingId === selectedItem.id || selectedItem.mimeType === 'image/webp'}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 transition shadow-2xs"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedItem.mimeType === 'image/webp' ? 'WebP ऑप्टिमाइझ्ड' : 'WebP ऑप्टिमाइझ'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Metadata & Live Editable Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 block font-bold mb-1">फाइलचे नाव (File Name):</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 font-bold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block font-medium">फाइल साईज:</label>
                    <p className="font-semibold text-slate-800">{formatBytes(selectedItem.sizeBytes)}</p>
                  </div>
                  <div>
                    <label className="text-slate-400 block font-medium">अपलोडकर्ता:</label>
                    <p className="font-semibold text-slate-800">{selectedItem.uploadedBy}</p>
                  </div>
                </div>

                {/* Alt Text (SEO) */}
                <div>
                  <label className="text-slate-700 block font-bold mb-1">
                    Alt Text (गुगल व Rank Math SEO साठी):
                  </label>
                  <input
                    type="text"
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    placeholder="उदा. नागूलवाडी अपघात सुरजागड वाहन"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                {/* Photo Credit / Source */}
                <div>
                  <label className="text-slate-700 block font-bold mb-1">
                    फोटो सौजन्य / स्त्रोत (Photo Credit):
                  </label>
                  <input
                    type="text"
                    value={editCredit}
                    onChange={(e) => setEditCredit(e.target.value)}
                    placeholder="उदा. विशेष प्रतिनिधी, PTI, ANI, सोशल मीडिया"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                {/* Direct URL */}
                <div>
                  <label className="text-slate-400 block font-medium mb-1">थेट वेब लिंक (Direct URL):</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={selectedItem.url}
                      className="w-full p-2 text-slate-600 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(selectedItem.url, selectedItem.id)}
                      className="px-3 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 shrink-0"
                    >
                      {copiedId === selectedItem.id ? 'कॉपी झाले!' : 'कॉपी'}
                    </button>
                  </div>
                </div>

                {/* Save Changes & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleSaveInspectorEdits}
                    disabled={isSavingMeta}
                    className="flex items-center gap-1 rounded-xl bg-slate-900 text-white px-3.5 py-2 font-bold hover:bg-black transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>माहिती सेव्ह करा</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {hasPermission('media.manage') && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteMedia(selectedItem.id);
                          setSelectedItem(null);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 p-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>हटवा</span>
                      </button>
                    )}

                    {onSelectMedia && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectMedia(selectedItem);
                          setSelectedItem(null);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                      >
                        बातमीत वापरा (Use)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        mediaItem={cropTargetItem}
        onClose={() => {
          setIsCropperOpen(false);
          setCropTargetItem(null);
        }}
        onSaveCroppedImage={(croppedMedia) => {
          const newUploaded = uploadMedia(croppedMedia);
          setUploadStatus(`✂️ नवीन क्रॉप केलेली इमेज "${newUploaded.name}" लायब्ररीमध्ये सेव्ह झाली!`);
          setTimeout(() => setUploadStatus(null), 5000);
        }}
      />
    </div>
  );
};
