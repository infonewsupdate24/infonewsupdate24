import React, { useState, useRef } from 'react';
import {
  Check,
  CheckCircle,
  Crop,
  FolderOpen,
  Image as ImageIcon,
  Plus,
  Search,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MediaItem } from '../../types';
import { ImageCropperModal } from './ImageCropperModal';
import { optimizeImageFile } from '../../utils/imageOptimizer';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (media: MediaItem) => void;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
}) => {
  const { media, uploadMedia } = useApp();
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const imageMedia = media.filter((m: MediaItem) => m.type === 'image' || !m.type);
  const filteredMedia = imageMedia.filter((m: MediaItem) =>
    searchQuery.trim()
      ? m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.altText && m.altText.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  const selectedItem = media.find((m: MediaItem) => m.id === selectedMediaId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimized = await optimizeImageFile(file, 1600, 0.85);
      const created = uploadMedia({
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: optimized.dataUrl,
        type: 'image',
        mimeType: optimized.mimeType,
        sizeBytes: optimized.sizeBytes,
        dimensions: optimized.width && optimized.height ? { width: optimized.width, height: optimized.height } : undefined,
        altText: file.name.replace(/\.[^/.]+$/, ''),
        credit: 'InfoNewsUpdate24',
        uploadedBy: 'संपादकीय मंडळ',
      });
      setSelectedMediaId(created.id);
      setActiveTab('library');
    } catch (err) {
      console.error('Failed to optimize and upload file in picker:', err);
    }
  };

  const handleUrlUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return;

    const created = uploadMedia({
      name: uploadAlt.trim() || 'Online Image',
      url: uploadUrl.trim(),
      type: 'image',
      mimeType: 'image/jpeg',
      sizeBytes: 150000,
      altText: uploadAlt.trim() || 'Online Image',
      credit: 'InfoNewsUpdate24',
      uploadedBy: 'संपादकीय मंडळ',
    });
    setSelectedMediaId(created.id);
    setUploadUrl('');
    setUploadAlt('');
    setActiveTab('library');
  };

  const handleConfirmSelect = () => {
    if (selectedItem) {
      onSelectImage(selectedItem);
      onClose();
    }
  };

  return (
    <>
      <div
        id="media-picker-modal"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      >
        <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  मीडिया लायब्ररी (Select Featured Image)
                </h3>
                <p className="text-xs text-slate-500">
                  16:9 कव्हर फोटो निवडा, नवीन अपलोड करा किंवा थेट क्रॉप करा.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Controls */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/70 px-6 pt-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                  activeTab === 'library'
                    ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                <span>लायब्ररी मधील फोटो ({imageMedia.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                  activeTab === 'upload'
                    ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>नवीन फोटो अपलोड</span>
              </button>
            </div>

            {activeTab === 'library' && (
              <div className="relative w-56 pb-2">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="फोटो शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1 min-h-[350px]">
            {activeTab === 'library' ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredMedia.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-xs text-slate-400 space-y-2">
                    <ImageIcon className="mx-auto h-10 w-10 text-slate-300" />
                    <p>कोणताही फोटो सापडला नाही. 'नवीन फोटो अपलोड' टॅबमधून फोटो जोडा.</p>
                  </div>
                ) : (
                  filteredMedia.map((item: MediaItem) => {
                    const isSelected = selectedMediaId === item.id;
                    const isWebP = item.mimeType === 'image/webp';
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedMediaId(item.id)}
                        className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all aspect-video flex flex-col justify-end ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-600/30 scale-[1.02] shadow-md'
                            : 'border-slate-200 hover:border-blue-400 bg-slate-100'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.altText || item.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />

                        {isWebP && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[8px] font-black z-10 shadow-xs">
                            WebP
                          </span>
                        )}

                        {isSelected && (
                          <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-md z-10">
                            <Check className="h-4 w-4" />
                          </div>
                        )}

                        <div className="relative bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-[10px] text-white">
                          <p className="font-bold truncate">{item.name}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-6 py-6 text-xs">
                {/* File upload input */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer space-y-2"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="font-bold text-slate-800">कॉम्प्युटरवरून फोटो निवडा (Upload File)</p>
                  <p className="text-[11px] text-slate-400">PNG, JPG, WEBP फाईल्स (Max 5MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <hr className="flex-1 border-slate-200" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase">किंवा</span>
                  <hr className="flex-1 border-slate-200" />
                </div>

                {/* URL input */}
                <form onSubmit={handleUrlUpload} className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">ऑनलाईन फोटो URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={uploadUrl}
                      onChange={(e) => setUploadUrl(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">फोटोचे नाव / Alt मजकूर</label>
                    <input
                      type="text"
                      placeholder="उदा. मुंबई मंत्रालय इमारत"
                      value={uploadAlt}
                      onChange={(e) => setUploadAlt(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
                  >
                    URL जोडा व सेव्ह करा
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                {selectedItem ? (
                  <span className="text-blue-700 font-bold">
                    निवडलेला फोटो: {selectedItem.name}
                  </span>
                ) : (
                  'कोणताही एक फोटो निवडा'
                )}
              </span>

              {selectedItem && (
                <button
                  type="button"
                  onClick={() => {
                    setCropTarget(selectedItem);
                    setIsCropperOpen(true);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200"
                >
                  <Crop className="h-3 w-3" />
                  <span>16:9 / 1:1 क्रॉप करा</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                रद्द करा
              </button>
              <button
                type="button"
                disabled={!selectedItem}
                onClick={handleConfirmSelect}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-40"
              >
                <Check className="h-4 w-4" />
                <span>हा फोटो बातमीसाठी वापरा</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cropper Modal for MediaPicker */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        mediaItem={cropTarget}
        onClose={() => {
          setIsCropperOpen(false);
          setCropTarget(null);
        }}
        onSaveCroppedImage={(croppedMedia) => {
          const newUploaded = uploadMedia(croppedMedia);
          setSelectedMediaId(newUploaded.id);
        }}
      />
    </>
  );
};
