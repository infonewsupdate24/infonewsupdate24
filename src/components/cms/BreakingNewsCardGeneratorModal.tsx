import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Check,
  Copy,
  Download,
  Flame,
  Image as ImageIcon,
  Layers,
  MapPin,
  RefreshCw,
  Share2,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { Post } from '../../types';

interface BreakingNewsCardGeneratorModalProps {
  post: Post | { title: string; featuredImage?: string; categoryId?: string; location?: string; publishDate?: string };
  categoryName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BreakingNewsCardGeneratorModal: React.FC<BreakingNewsCardGeneratorModalProps> = ({
  post,
  categoryName = 'महाराष्ट्र',
  isOpen,
  onClose,
}) => {
  const [headline, setHeadline] = useState(post.title || 'मोठी बातमी! ताज्या घडामोडींचे महत्त्वाचे अपडेट्स');
  const [imageUrl, setImageUrl] = useState(
    post.featuredImage ||
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80'
  );
  const [location, setLocation] = useState(post.location || 'मुंबई');
  const [themeStyle, setThemeStyle] = useState<'red_breaking' | 'gold_special' | 'blue_express'>(
    'red_breaking'
  );
  const [badgeText, setBadgeText] = useState('🔴 BREAKING NEWS');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (post) {
      setHeadline(post.title || '');
      if (post.featuredImage) setImageUrl(post.featuredImage);
      if (post.location) setLocation(post.location);
    }
  }, [post]);

  // Draw the breaking news card on canvas
  const drawCardToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 675; // 16:9 ratio
    canvas.width = width;
    canvas.height = height;

    // 1. Draw background image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      // Draw image to fill
      ctx.drawImage(img, 0, 0, width, height);

      // Dark gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      if (themeStyle === 'red_breaking') {
        gradient.addColorStop(0, 'rgba(0,0,0,0.3)');
        gradient.addColorStop(0.5, 'rgba(20,0,0,0.6)');
        gradient.addColorStop(1, 'rgba(15,2,2,0.95)');
      } else if (themeStyle === 'gold_special') {
        gradient.addColorStop(0, 'rgba(0,0,0,0.3)');
        gradient.addColorStop(0.5, 'rgba(25,15,0,0.6)');
        gradient.addColorStop(1, 'rgba(20,10,0,0.95)');
      } else {
        gradient.addColorStop(0, 'rgba(0,0,0,0.3)');
        gradient.addColorStop(0.5, 'rgba(2,15,30,0.6)');
        gradient.addColorStop(1, 'rgba(2,8,20,0.95)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Top Banner bar: Logo & Channel Branding
      ctx.fillStyle = themeStyle === 'red_breaking' ? '#dc2626' : themeStyle === 'gold_special' ? '#d97706' : '#2563eb';
      ctx.fillRect(0, 0, width, 55);

      // Channel title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('INFONEWS UPDATE 24', 40, 38);

      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('महाराष्ट्र | देश | विदेश', width - 260, 38);

      // Red Breaking Badge
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(40, height - 260, 240, 42);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px sans-serif';
      ctx.fillText(badgeText.toUpperCase(), 55, height - 232);

      // Category & Location Tag
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(290, height - 260, 260, 42);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`📍 ${location} | ${categoryName}`, 305, height - 232);

      // Main Marathi Headline (multi-line text wrap)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const words = headline.split(' ');
      let line = '';
      let y = height - 165;
      const lineHeight = 56;
      const maxLineWidth = width - 80;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxLineWidth && n > 0) {
          ctx.fillText(line, 40, y);
          line = words[n] + ' ';
          y += lineHeight;
          if (y > height - 45) break; // prevent overflow
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 40, y);

      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Bottom Bar
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, height - 40, width, 40);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`दिनांक: ${new Date().toLocaleDateString('mr-IN')} | www.infonewsupdate24.com`, 40, height - 15);

      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('Follow on WhatsApp & Telegram: @infonews24', width - 420, height - 15);
    };

    img.onerror = () => {
      // Fallback if image blocked
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(headline, 50, height / 2);
    };
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(drawCardToCanvas, 150);
    }
  }, [isOpen, headline, imageUrl, location, themeStyle, badgeText]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDownloading(true);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `infonews24-card-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob((blob) => {
        if (blob && navigator.clipboard && (window as any).ClipboardItem) {
          navigator.clipboard.write([
            new (window as any).ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 3000);
        }
      });
    } catch (e) {
      // Fallback
    }
  };

  return (
    <div
      id="breaking-card-generator-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-100 bg-red-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>सोशल मीडिया ब्रेकिंग न्यूज कार्ड जनरेटर (Photo Banner)</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700 uppercase">
                  1-Click Graphic Banner
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                WhatsApp Status, Instagram, Facebook साठी व्यावसायिक मराठी न्यूज कार्ड तयार करा व डाऊनलोड करा.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Live Canvas Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-red-600" />
                <span>लाईव्ह ग्राफिक्स प्रिव्ह्यू (16:9 HD Resolution):</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">1200 x 675 PX</span>
            </div>

            <div className="rounded-2xl border-2 border-slate-300 bg-slate-950 p-2 shadow-inner overflow-hidden flex justify-center">
              <canvas
                ref={canvasRef}
                className="max-h-72 w-auto max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>
          </div>

          {/* Edit Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">
                कार्डवरील मथळा (Headline on Card)
              </label>
              <textarea
                rows={2}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 font-bold focus:border-red-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">
                बॅनर बॅकग्राउंड फोटो URL (Image URL)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-800 text-[11px] font-mono focus:border-red-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">
                बॅज मजकूर (Badge Text)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="h-8.5 w-full rounded-lg border border-slate-200 px-3 text-slate-800 font-bold text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">
                स्थान / शहर (Location)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-8.5 w-full rounded-lg border border-slate-200 px-3 text-slate-800 text-xs focus:border-red-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Theme Style selector */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-700 block">रंग थीम / पॅलेट निवडा:</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setThemeStyle('red_breaking')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all ${
                  themeStyle === 'red_breaking'
                    ? 'bg-red-600 text-white border-red-700 shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                🔴 Breaking Red (लाल ब्रेकिंग)
              </button>

              <button
                type="button"
                onClick={() => setThemeStyle('gold_special')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all ${
                  themeStyle === 'gold_special'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                ⭐ Golden Special (विशेष वृत्त)
              </button>

              <button
                type="button"
                onClick={() => setThemeStyle('blue_express')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all ${
                  themeStyle === 'blue_express'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                🔷 Express Blue (एक्सप्रेस निळा)
              </button>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3 gap-2">
          {copiedToast ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>इमेज क्लिपबोर्डवर कॉपी झाली!</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">PNG फॉरमॅटमध्ये थेट सेव्ह करा</span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCard}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <Copy className="h-4 w-4" />
              <span>फोटो कॉपी करा</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>कार्ड डाऊनलोड करा (Download PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
