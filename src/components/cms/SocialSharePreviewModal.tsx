import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  MessageCircle,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { Post } from '../../types';

interface SocialSharePreviewModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialSharePreviewModal: React.FC<SocialSharePreviewModalProps> = ({
  post,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'facebook' | 'twitter'>('whatsapp');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/#post-${post.slug}` : `https://infonewsupdate24.com/news/${post.slug}`;
  const excerptClean = post.excerpt || post.content.substring(0, 140) + '...';

  // WhatsApp formatted rich message
  const whatsappMessage = `*🔥 बातमी अपडेट | InfoNewsUpdate24*\n\n📌 *${post.title}*\n\n📖 _${excerptClean}_\n\n👉 *संपूर्ण बातमी सविस्तर वाचण्यासाठी खालील लिंकवर क्लिक करा:*\n🔗 ${currentUrl}\n\n🌐 ताज्या घडामोडींसाठी फॉलो करा: *InfoNewsUpdate24*`;

  const handleCopyCaption = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(whatsappMessage);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 3000);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleDirectWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      id="social-share-preview-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                सोशल मीडिया शेअर प्रिव्ह्यू (Social Share Previewer)
              </h3>
              <p className="text-xs text-slate-500">
                WhatsApp, Facebook आणि X वर बातमी कशी दिसेल याचा लाईव्ह कार्ड प्रिव्ह्यू
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'whatsapp'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span>WhatsApp Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('facebook')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'facebook'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="h-4 w-4 text-blue-600" />
            <span>Facebook Feed</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('twitter')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'twitter'
                ? 'border-slate-900 text-slate-900 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4 text-slate-900" />
            <span>X (Twitter) Card</span>
          </button>
        </div>

        {/* Preview Content Container */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* 1. WHATSAPP PREVIEW */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#0b141a] p-4 text-slate-100 shadow-inner">
                {/* Chat Bubble */}
                <div className="max-w-md ml-auto rounded-2xl rounded-tr-none bg-[#005c4b] p-3 text-white shadow-md space-y-2">
                  {/* Embedded Rich Card */}
                  <div className="overflow-hidden rounded-xl bg-[#025143] border border-[#006e5a]">
                    <img
                      src={post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'}
                      alt={post.title}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-3 bg-[#033b31]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        INFONEWSUPDATE24.COM
                      </span>
                      <h4 className="text-sm font-bold text-white leading-tight mt-0.5 line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-[11px] text-emerald-100 line-clamp-2 mt-1">
                        {excerptClean}
                      </p>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="text-xs leading-relaxed space-y-1.5 pt-1">
                    <p className="font-bold text-amber-300">🔥 बातमी अपडेट | InfoNewsUpdate24</p>
                    <p className="font-semibold">{post.title}</p>
                    <p className="text-[11px] text-emerald-100">{excerptClean}</p>
                    <p className="text-[11px] text-emerald-200">
                      👉 संपूर्ण बातमीसाठी: <span className="underline text-blue-200">{currentUrl}</span>
                    </p>
                  </div>

                  <div className="flex justify-end text-[9px] text-emerald-200/80 font-mono">
                    <span>10:45 AM &#10003;&#10003;</span>
                  </div>
                </div>
              </div>

              {/* Ready-to-use Caption Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    मराठी व्हॉट्सअ‍ॅप कॅप्शन (Formatted Caption)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors"
                  >
                    {copiedCaption ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedCaption ? 'कॉपी झाले!' : 'कॅप्शन कॉपी करा'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={whatsappMessage}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* 2. FACEBOOK PREVIEW */}
          {activeTab === 'facebook' && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-sm">
                  24
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">InfoNewsUpdate 24</h4>
                  <span className="text-[10px] text-slate-500">Just now &bull; 🌐 Public</span>
                </div>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed">{post.title}</p>
              {/* Facebook Card */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  src={post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'}
                  alt={post.title}
                  className="h-56 w-full object-cover"
                />
                <div className="p-3 bg-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    INFONEWSUPDATE24.COM
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-2 mt-0.5">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{excerptClean}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. TWITTER / X PREVIEW */}
          {activeTab === 'twitter' && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
                  IN
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900">InfoNewsUpdate24</span>
                    <span className="text-[10px] text-slate-500">@InfoNewsUpdate24 &bull; 1m</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-900 font-medium leading-relaxed">
                {post.title} #{post.category.replace(/\s+/g, '')} #MaharashtraNews
              </p>
              {/* Large Image Summary Card */}
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <img
                  src={post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'}
                  alt={post.title}
                  className="h-52 w-full object-cover"
                />
                <div className="p-3 bg-slate-50">
                  <span className="text-[10px] text-slate-500">infonewsupdate24.com</span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{post.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{excerptClean}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'बातमीची लिंक कॉपी करा'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDirectWhatsAppShare}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              <span>व्हॉट्सअ‍ॅपवर थेट पाठवा (Send to WhatsApp)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
