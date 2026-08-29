import React, { useState, useRef, useEffect } from 'react';
import {
  Crop,
  X,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ShieldCheck,
  Layers,
  Image as ImageIcon,
  Download,
} from 'lucide-react';
import { MediaItem } from '../../types';

interface ImageCropperModalProps {
  mediaItem: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCroppedImage: (croppedMedia: {
    name: string;
    url: string;
    type: 'image';
    mimeType: string;
    sizeBytes: number;
    altText: string;
    caption: string;
    credit?: string;
    uploadedBy: string;
  }) => void;
}

type AspectRatioType = '16:9' | '1:1' | '4:3' | '9:16' | 'free';

const ASPECT_RATIOS: Array<{
  id: AspectRatioType;
  label: string;
  sub: string;
  ratio: number | null;
  badge: string;
}> = [
  { id: '16:9', label: '16:9 (Hero Image)', sub: 'मुख्य बातमी कव्हर व बॅनर', ratio: 16 / 9, badge: 'मानक बातमी' },
  { id: '1:1', label: '1:1 (Square)', sub: 'सोशल मीडिया व व्हॉट्सॲप', ratio: 1, badge: 'सोशल मीडिया' },
  { id: '4:3', label: '4:3 (Standard Feed)', sub: 'पोर्टल फीड व यादी', ratio: 4 / 3, badge: 'फीड' },
  { id: '9:16', label: '9:16 (Vertical Story)', sub: 'वेब स्टोरीज व रील्स', ratio: 9 / 16, badge: 'स्टोरी' },
  { id: 'free', label: 'Free Crop', sub: 'मूळ गुणोत्तर', ratio: null, badge: 'कस्टम' },
];

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  mediaItem,
  isOpen,
  onClose,
  onSaveCroppedImage,
}) => {
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioType>('16:9');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [addWatermark, setAddWatermark] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPanX(0);
      setPanY(0);
      setAddWatermark(true);
    }
  }, [isOpen, mediaItem]);

  if (!isOpen || !mediaItem || mediaItem.type !== 'image') return null;

  const currentRatioObj = ASPECT_RATIOS.find((r) => r.id === selectedRatio);

  const handleExportCropped = () => {
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = mediaItem.url;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      let targetWidth = 1200;
      let targetHeight = 675; // 16:9 default

      if (selectedRatio === '1:1') {
        targetWidth = 800;
        targetHeight = 800;
      } else if (selectedRatio === '4:3') {
        targetWidth = 800;
        targetHeight = 600;
      } else if (selectedRatio === '9:16') {
        targetWidth = 720;
        targetHeight = 1280;
      } else if (selectedRatio === 'free') {
        targetWidth = img.naturalWidth;
        targetHeight = img.naturalHeight;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Fill background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Save context for transform
      ctx.save();
      ctx.translate(targetWidth / 2 + panX, targetHeight / 2 + panY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Draw image centered
      const drawWidth = targetWidth;
      const drawHeight = (img.naturalHeight / img.naturalWidth) * drawWidth;
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      // Draw Branded Watermark Overlay if checked
      if (addWatermark) {
        const watermarkHeight = Math.max(32, Math.round(targetHeight * 0.065));
        const watermarkWidth = Math.max(180, Math.round(targetWidth * 0.28));
        const pad = Math.round(targetWidth * 0.025);

        const wx = targetWidth - watermarkWidth - pad;
        const wy = targetHeight - watermarkHeight - pad;

        // Gradient Badge
        const grad = ctx.createLinearGradient(wx, wy, wx + watermarkWidth, wy);
        grad.addColorStop(0, 'rgba(220, 38, 38, 0.95)'); // Red-600
        grad.addColorStop(1, 'rgba(153, 27, 27, 0.95)'); // Red-800

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(wx, wy, watermarkWidth, watermarkHeight, 8);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Watermark Text
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(watermarkHeight * 0.48)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('InfoNewsUpdate24', wx + watermarkWidth / 2, wy + watermarkHeight / 2);
      }

      // Export as WebP for optimal compression
      const croppedDataUrl = canvas.toDataURL('image/webp', 0.92);
      const approxSizeBytes = Math.round(croppedDataUrl.length * 0.75);

      const ratioTag = selectedRatio.replace(':', '-');
      const baseName = mediaItem.name.replace(/\.[^/.]+$/, '');
      const newFileName = `${baseName}-${ratioTag}-cropped.webp`;

      onSaveCroppedImage({
        name: newFileName,
        url: croppedDataUrl,
        type: 'image',
        mimeType: 'image/webp',
        sizeBytes: approxSizeBytes,
        altText: `${mediaItem.altText || baseName} (${selectedRatio} क्रॉप आवृत्ती)`,
        caption: mediaItem.caption || `Cropped ${selectedRatio} for news feed`,
        credit: mediaItem.credit || 'InfoNewsUpdate24',
        uploadedBy: mediaItem.uploadedBy,
      });

      setIsProcessing(false);
      onClose();
    };

    img.onerror = () => {
      setIsProcessing(false);
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
              <Crop className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>बातमी फोटो क्रॉपर व आकार टूल (News Photo Cropper)</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  WebP HD
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-md">
                {mediaItem.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 1. Aspect Ratio Presets */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-red-600" />
              <span>१. बातमीसाठी आवश्यक आकार (Aspect Ratio) निवडा:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {ASPECT_RATIOS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedRatio(item.id)}
                  className={`rounded-xl border p-2.5 text-left transition-all flex flex-col justify-between ${
                    selectedRatio === item.id
                      ? 'border-red-600 bg-red-50/70 ring-2 ring-red-400 font-black shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase text-red-700 block mb-0.5">
                      {item.badge}
                    </span>
                    <p className="text-xs font-black text-slate-900">{item.label}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Interactive Crop Preview Area */}
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 flex flex-col items-center justify-center min-h-[280px] max-h-[380px] overflow-hidden relative shadow-inner">
            {/* Visual Crop Frame Box */}
            <div
              className={`relative overflow-hidden border-2 border-red-500 shadow-2xl rounded-lg bg-black flex items-center justify-center transition-all ${
                selectedRatio === '16:9'
                  ? 'w-[440px] h-[248px]'
                  : selectedRatio === '1:1'
                  ? 'w-[260px] h-[260px]'
                  : selectedRatio === '4:3'
                  ? 'w-[360px] h-[270px]'
                  : selectedRatio === '9:16'
                  ? 'w-[160px] h-[284px]'
                  : 'w-[420px] h-[260px]'
              }`}
            >
              <img
                ref={imgRef}
                src={mediaItem.url}
                alt="Preview"
                style={{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.1s ease-out',
                }}
                className="max-h-none max-w-none select-none pointer-events-none object-cover"
              />

              {/* Live Simulated Watermark Stamp */}
              {addWatermark && (
                <div className="absolute bottom-2 right-2 rounded-md bg-gradient-to-r from-red-600 to-red-800 px-2 py-0.5 text-[9px] font-black text-white shadow-md border border-white/30 select-none">
                  InfoNewsUpdate24
                </div>
              )}
            </div>

            <span className="text-[10px] text-slate-400 mt-2 font-mono">
              आकारमान: {selectedRatio === '16:9' ? '1200 x 675 px' : selectedRatio === '1:1' ? '800 x 800 px' : selectedRatio === '4:3' ? '800 x 600 px' : selectedRatio === '9:16' ? '720 x 1280 px' : 'Original Size'}
            </span>
          </div>

          {/* 3. Controls & Watermark Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            {/* Zoom Slider */}
            <div>
              <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1">
                  <ZoomIn className="h-3.5 w-3.5 text-slate-500" />
                  झूम (Zoom):
                </span>
                <span className="font-mono text-slate-900">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Rotation Button */}
            <div className="flex items-center justify-between sm:justify-center gap-3">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 shadow-2xs"
              >
                <RotateCw className="h-3.5 w-3.5 text-red-600" />
                <span>९०° फिरवा (Rotate)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                  setPanX(0);
                  setPanY(0);
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
              >
                रीसेट (Reset)
              </button>
            </div>

            {/* Watermark Toggle */}
            <div className="flex items-center justify-end">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addWatermark}
                  onChange={(e) => setAddWatermark(e.target.checked)}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
                />
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-red-600" />
                  InfoNews24 लोगो / वॉटरमार्क लावा
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            रद्द करा (Cancel)
          </button>

          <button
            type="button"
            onClick={handleExportCropped}
            disabled={isProcessing}
            className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 px-5 py-2 text-xs font-black text-white shadow-md disabled:opacity-50 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>क्रॉप होत आहे...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>क्रॉप केलेला फोटो सेव्ह करा (Save Cropped WebP)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
