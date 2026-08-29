import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  Film,
  Video,
  Layers,
  MapPin,
  Clock,
  Heart,
  TrendingUp,
  X,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Tv,
  Upload,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SocialMediaPost, SocialPlatform, SocialMediaType } from '../../types';
import { SocialMediaCard } from '../common/SocialMediaCard';
import { SocialPlayerModal } from '../common/SocialPlayerModal';

// Helper function to auto-detect platform, media type, and build embed URL / real thumbnail
export function parseSocialMediaUrl(url: string): {
  platform: SocialPlatform;
  mediaType: SocialMediaType;
  embedUrl: string;
  thumbnailUrl: string;
  detected: boolean;
} {
  const cleanUrl = url.trim();

  // 1. YouTube Shorts (e.g. youtube.com/shorts/VIDEO_ID)
  const ytShortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
  if (ytShortsMatch && ytShortsMatch[1]) {
    const videoId = ytShortsMatch[1];
    return {
      platform: 'YOUTUBE',
      mediaType: 'SHORT',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      detected: true,
    };
  }

  // 2. YouTube Standard Video or youtu.be (e.g. youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID)
  const ytWatchMatch = cleanUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/i);
  if (ytWatchMatch && ytWatchMatch[1]) {
    const videoId = ytWatchMatch[1];
    return {
      platform: 'YOUTUBE',
      mediaType: 'VIDEO',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      detected: true,
    };
  }

  // 3. Instagram Reels (e.g. instagram.com/reel/SHORTCODE/)
  const igReelMatch = cleanUrl.match(/instagram\.com\/reel\/([a-zA-Z0-9_-]+)/i);
  if (igReelMatch && igReelMatch[1]) {
    const shortcode = igReelMatch[1];
    return {
      platform: 'INSTAGRAM',
      mediaType: 'REEL',
      embedUrl: `https://www.instagram.com/p/${shortcode}/embed`,
      thumbnailUrl: `https://www.instagram.com/p/${shortcode}/media/?size=l`,
      detected: true,
    };
  }

  // 4. Instagram Post (e.g. instagram.com/p/SHORTCODE/)
  const igPostMatch = cleanUrl.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/i);
  if (igPostMatch && igPostMatch[1]) {
    const shortcode = igPostMatch[1];
    return {
      platform: 'INSTAGRAM',
      mediaType: 'POST',
      embedUrl: `https://www.instagram.com/p/${shortcode}/embed`,
      thumbnailUrl: `https://www.instagram.com/p/${shortcode}/media/?size=l`,
      detected: true,
    };
  }

  // 5. Twitter / X Posts (e.g. twitter.com/username/status/TWEET_ID or x.com/username/status/TWEET_ID)
  const twitterMatch = cleanUrl.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/i);
  if (twitterMatch && twitterMatch[3]) {
    const tweetId = twitterMatch[3];
    return {
      platform: 'TWITTER',
      mediaType: 'POST',
      embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&auto=format&fit=crop&q=80',
      detected: true,
    };
  }

  // 6. Facebook Video / Reel / Watch (e.g. facebook.com/reel/ID or facebook.com/watch/?v=ID)
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) {
    const encodedUrl = encodeURIComponent(cleanUrl);
    const isReel = cleanUrl.includes('reel');
    return {
      platform: 'FACEBOOK',
      mediaType: isReel ? 'REEL' : 'VIDEO',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1609358905581-e5382c4482a0?w=800&auto=format&fit=crop&q=80',
      detected: true,
    };
  }

  return {
    platform: 'YOUTUBE',
    mediaType: 'VIDEO',
    embedUrl: cleanUrl,
    thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
    detected: false,
  };
}

export const SocialMediaManagerView: React.FC = () => {
  const {
    socialPosts,
    createSocialPost,
    updateSocialPost,
    deleteSocialPost,
    duplicateSocialPost,
    toggleSocialPostStatus,
    setPortalMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'YOUTUBE' | 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'REELS' | 'DRAFT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SocialMediaPost | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    platform: 'INSTAGRAM' as SocialPlatform,
    mediaType: 'REEL' as SocialMediaType,
    embedUrl: '',
    thumbnailUrl: '',
    caption: '',
    authorName: 'InfoNews Social Desk',
    authorHandle: '@infonews24_official',
    location: 'Maharashtra',
    category: 'Breaking & Viral',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
    likes: 5400,
    views: 45000,
    isFeaturedReel: true,
    duration: '00:50',
  });

  // Preview Player Modal
  const [activePreviewPost, setActivePreviewPost] = useState<SocialMediaPost | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filtered Items
  const filteredPosts = socialPosts.filter((post) => {
    // Search match
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.authorName && post.authorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.location && post.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.platform.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'YOUTUBE') return post.platform === 'YOUTUBE';
    if (activeTab === 'INSTAGRAM') return post.platform === 'INSTAGRAM';
    if (activeTab === 'FACEBOOK') return post.platform === 'FACEBOOK';
    if (activeTab === 'TWITTER') return post.platform === 'TWITTER';
    if (activeTab === 'REELS') return post.mediaType === 'REEL' || post.mediaType === 'SHORT' || post.isFeaturedReel;
    if (activeTab === 'DRAFT') return post.status === 'DRAFT';
    return true;
  });

  // Statistics Counts
  const stats = {
    total: socialPosts.length,
    youtube: socialPosts.filter((p) => p.platform === 'YOUTUBE').length,
    instagram: socialPosts.filter((p) => p.platform === 'INSTAGRAM').length,
    facebook: socialPosts.filter((p) => p.platform === 'FACEBOOK').length,
    twitter: socialPosts.filter((p) => p.platform === 'TWITTER').length,
    published: socialPosts.filter((p) => p.status === 'PUBLISHED').length,
    reels: socialPosts.filter((p) => p.mediaType === 'REEL' || p.mediaType === 'SHORT').length,
  };

  // Open Form for Adding New
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      url: '',
      platform: 'INSTAGRAM',
      mediaType: 'REEL',
      embedUrl: '',
      thumbnailUrl: '',
      caption: '',
      authorName: 'InfoNews Social Desk',
      authorHandle: '@infonews24_official',
      location: 'Maharashtra',
      category: 'District Ground Report',
      status: 'PUBLISHED',
      likes: Math.floor(Math.random() * 8000) + 1200,
      views: Math.floor(Math.random() * 50000) + 15000,
      isFeaturedReel: true,
      duration: '00:45',
    });
    setIsModalOpen(true);
  };

  // Open Form for Editing Existing
  const handleOpenEdit = (post: SocialMediaPost) => {
    setEditingItem(post);
    setFormData({
      title: post.title,
      url: post.url,
      platform: post.platform,
      mediaType: post.mediaType,
      embedUrl: post.embedUrl || '',
      thumbnailUrl: post.thumbnailUrl || '',
      caption: post.caption || '',
      authorName: post.authorName,
      authorHandle: post.authorHandle || '',
      location: post.location || 'Maharashtra',
      category: post.category || 'General',
      status: post.status,
      likes: post.likes || 0,
      views: post.views || 0,
      isFeaturedReel: !!post.isFeaturedReel,
      duration: post.duration || '01:00',
    });
    setIsModalOpen(true);
  };

  // Handle URL change with auto-parser
  const handleUrlChange = (newUrl: string) => {
    const parsed = parseSocialMediaUrl(newUrl);
    setFormData((prev) => ({
      ...prev,
      url: newUrl,
      platform: parsed.platform,
      mediaType: parsed.mediaType,
      embedUrl: parsed.embedUrl,
      thumbnailUrl: parsed.thumbnailUrl || prev.thumbnailUrl,
    }));
  };

  // Helper to re-fetch real thumbnail based on URL and chosen quality
  const handleFetchRealThumbnail = (quality?: 'maxres' | 'hq' | 'sd' | 'ig') => {
    if (!formData.url.trim()) return;
    const parsed = parseSocialMediaUrl(formData.url);

    // If YouTube
    const ytMatch = formData.url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/i);
    if (ytMatch && ytMatch[1]) {
      const vid = ytMatch[1];
      if (quality === 'hq') {
        setFormData((prev) => ({ ...prev, thumbnailUrl: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` }));
      } else if (quality === 'sd') {
        setFormData((prev) => ({ ...prev, thumbnailUrl: `https://i.ytimg.com/vi/${vid}/sddefault.jpg` }));
      } else {
        setFormData((prev) => ({ ...prev, thumbnailUrl: `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg` }));
      }
      return;
    }

    // If Instagram
    const igMatch = formData.url.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/i);
    if (igMatch && igMatch[1]) {
      const code = igMatch[1];
      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: `https://www.instagram.com/p/${code}/media/?size=l`,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      thumbnailUrl: parsed.thumbnailUrl,
    }));
  };

  // Direct Thumbnail Image File Upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setFormData((prev) => ({
          ...prev,
          thumbnailUrl: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Form Handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) {
      alert('कृपया बातमी/रीलचे शीर्षक आणि सोशल मीडिया लिंक प्रविष्ट करा.');
      return;
    }

    const parsed = parseSocialMediaUrl(formData.url);
    const finalThumbnail = formData.thumbnailUrl.trim() || parsed.thumbnailUrl;
    const finalEmbed = formData.embedUrl.trim() || parsed.embedUrl;

    if (editingItem) {
      updateSocialPost(editingItem.id, {
        title: formData.title,
        url: formData.url,
        platform: formData.platform,
        mediaType: formData.mediaType,
        embedUrl: finalEmbed,
        thumbnailUrl: finalThumbnail,
        caption: formData.caption,
        authorName: formData.authorName,
        authorHandle: formData.authorHandle,
        location: formData.location,
        category: formData.category,
        status: formData.status,
        likes: Number(formData.likes) || 0,
        views: Number(formData.views) || 0,
        isFeaturedReel: formData.isFeaturedReel,
        duration: formData.duration,
      });
      setStatusMessage('सोशल मीडिया पोस्ट यशस्वीरित्या अद्यतनित (Updated) केली.');
    } else {
      createSocialPost({
        title: formData.title,
        url: formData.url,
        platform: formData.platform,
        mediaType: formData.mediaType,
        embedUrl: finalEmbed,
        thumbnailUrl: finalThumbnail,
        caption: formData.caption,
        authorName: formData.authorName,
        authorHandle: formData.authorHandle,
        location: formData.location,
        category: formData.category,
        status: formData.status,
        likes: Number(formData.likes) || 0,
        views: Number(formData.views) || 0,
        isFeaturedReel: formData.isFeaturedReel,
        duration: formData.duration,
      });
      setStatusMessage('नवीन सोशल मीडिया बातमी/रील लाइव्ह पोर्टलवर जोडली गेली!');
    }

    setIsModalOpen(false);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const getPlatformBadge = (platform: SocialPlatform) => {
    switch (platform) {
      case 'INSTAGRAM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 text-white shadow-2xs">
            Instagram
          </span>
        );
      case 'YOUTUBE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-2xs">
            YouTube
          </span>
        );
      case 'FACEBOOK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-2xs">
            Facebook
          </span>
        );
      case 'TWITTER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white shadow-2xs">
            X (Twitter)
          </span>
        );
    }
  };

  const getTypeBadge = (type: SocialMediaType) => {
    switch (type) {
      case 'REEL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
            <Film className="h-3 w-3" />
            Reel
          </span>
        );
      case 'SHORT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
            <Play className="h-3 w-3 fill-red-800" />
            Short
          </span>
        );
      case 'VIDEO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
            <Video className="h-3 w-3" />
            Full Video
          </span>
        );
      case 'POST':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
            Post / Tweet
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>CMS Admin Panel</span>
            <span>/</span>
            <span className="text-slate-900">सोशल मीडिया व व्हिडिओ व्यवस्थापक</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Share2 className="h-6 w-6 text-red-600" />
            <span>सोशल मीडिया व व्हिडिओ/रील्स व्यवस्थापक</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Instagram Reels, YouTube Videos & Shorts, Facebook Watch आणि Twitter/X च्या बातम्या लिंक्स द्वारे थेट लाइव्ह पोर्टलवर प्रकाशित करा.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPortalMode('PUBLIC')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Live Portal पहा</span>
          </button>

          <button
            id="btn-add-social-post"
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>नवीन रील / व्हिडिओ लिंक जोडा</span>
          </button>
        </div>
      </div>

      {/* STATUS NOTIFICATION TOAST */}
      {statusMessage && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Total Embeds</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{stats.total}</div>
        </div>

        <div className="rounded-xl border border-pink-100 bg-gradient-to-br from-pink-50 to-purple-50 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-pink-700">
            <span className="text-[11px] font-semibold">Instagram Reels</span>
            <Film className="h-4 w-4 text-pink-600" />
          </div>
          <div className="text-xl font-black text-pink-900 mt-1">{stats.instagram}</div>
        </div>

        <div className="rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-[11px] font-semibold">YouTube Videos</span>
            <Play className="h-4 w-4 text-red-600 fill-red-600" />
          </div>
          <div className="text-xl font-black text-red-900 mt-1">{stats.youtube}</div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-[11px] font-semibold">Facebook Videos</span>
            <Video className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-900 mt-1">{stats.facebook}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-[11px] font-semibold">X (Twitter)</span>
            <Share2 className="h-4 w-4 text-slate-800" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{stats.twitter}</div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-semibold">Live Published</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-900 mt-1">{stats.published}</div>
        </div>
      </div>

      {/* 3. TOOLBAR (Search, Platform Tabs, Grid/Table Switcher) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'ALL', label: `सर्व (${stats.total})` },
            { key: 'REELS', label: `रील्स व शॉर्ट्स (${stats.reels})` },
            { key: 'INSTAGRAM', label: `Instagram (${stats.instagram})` },
            { key: 'YOUTUBE', label: `YouTube (${stats.youtube})` },
            { key: 'FACEBOOK', label: `Facebook (${stats.facebook})` },
            { key: 'TWITTER', label: `Twitter / X (${stats.twitter})` },
            { key: 'DRAFT', label: 'मसुदा (Drafts)' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Layout toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location, handle..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30"
            />
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-bold transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-bold transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <Filter className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. CONTENT LIST: GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const isReel = post.mediaType === 'REEL' || post.mediaType === 'SHORT';
              const isTwitter = post.platform === 'TWITTER';

              return (
                <div
                  key={post.id}
                  className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all ${
                    isReel ? 'sm:col-span-1' : isTwitter ? 'sm:col-span-2 lg:col-span-2' : 'sm:col-span-2 lg:col-span-2'
                  }`}
                >
                  {/* Format Card Component with standard aspect ratio */}
                  <div className="p-2">
                    <SocialMediaCard post={post} onPlay={(p) => setActivePreviewPost(p)} />
                  </div>

                  {/* Admin Controls Footer Bar */}
                  <div className="bg-slate-50 px-3.5 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSocialPostStatus(post.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          post.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {post.status === 'PUBLISHED' ? '● Published' : '○ Draft'}
                      </button>

                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {isReel ? '9:16 Vertical' : isTwitter ? '𝕏 Tweet Card' : '16:9 Landscape'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActivePreviewPost(post)}
                        className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-red-600 transition-colors"
                        title="Watch in Standard Size Player"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateSocialPost(post.id)}
                        className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(post)}
                        className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(post.id)}
                        className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <Share2 className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">कोणतीही सोशल मीडिया पोस्ट किंवा रील सापडली नाही</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                नवीन Instagram रील, YouTube व्हिडिओ किंवा Twitter पोस्टची लिंक जोडण्यासाठी वरील बटणावर क्लिक करा.
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>पहिली रील / व्हिडिओ जोडा</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Thumbnail</th>
                  <th className="p-3">Title & Location</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Engagements</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 w-16">
                      <div
                        className="relative h-12 w-16 rounded-md bg-slate-900 overflow-hidden cursor-pointer"
                        onClick={() => setActivePreviewPost(post)}
                      >
                        <img src={post.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play className="h-4 w-4 fill-white text-white" />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 max-w-xs">
                      <p className="font-bold text-slate-900 line-clamp-1">{post.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{post.location}</span>
                        <span>&bull;</span>
                        <span>{post.authorName}</span>
                      </div>
                    </td>
                    <td className="p-3">{getPlatformBadge(post.platform)}</td>
                    <td className="p-3">{getTypeBadge(post.mediaType)}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => toggleSocialPostStatus(post.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                          post.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {post.status}
                      </button>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {post.views?.toLocaleString('en-IN')} views
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(post)}
                          className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(post.id)}
                          className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-slate-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white text-slate-900 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
                  <Share2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? 'सोशल मीडिया बातमी/रील संपादन करा' : 'नवीन सोशल मीडिया पोस्ट किंवा रील जोडा'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Paste YouTube, Instagram, Facebook or Twitter/X Link for Live Embed
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* URL Input with Auto-detection Indicator */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  सोशल मीडिया लिंक / URL (Instagram, YouTube, Facebook, Twitter) *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://www.instagram.com/reel/C8qK9wBv2XZ/ किंवा https://youtu.be/..."
                    value={formData.url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                  {formData.url && parseSocialMediaUrl(formData.url).detected && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Auto Detected</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  टीप: कोणतीही Instagram Reel, YouTube Shorts किंवा Facebook व्हिडिओ लिंक पेस्ट करा, प्लॅटफॉर्म आपोआप डिटेक्ट होईल.
                </p>
              </div>

              {/* Title / Headline */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  शीर्षक / Headline (मराठी किंवा English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. मुंबईत मान्सूनचे आगमन, कोस्टल रोडवरील लाइव्ह दृश्य..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Platform & Media Type Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Platform (प्लॅटफॉर्म)</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as SocialPlatform })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  >
                    <option value="INSTAGRAM">Instagram (Reel / Post)</option>
                    <option value="YOUTUBE">YouTube (Video / Shorts)</option>
                    <option value="FACEBOOK">Facebook (Watch / Reel)</option>
                    <option value="TWITTER">X / Twitter (Post / Video)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Media Type (प्रकार)</label>
                  <select
                    value={formData.mediaType}
                    onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as SocialMediaType })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  >
                    <option value="REEL">Reel / Vertical Video</option>
                    <option value="SHORT">YouTube Short</option>
                    <option value="VIDEO">Standard Full Video</option>
                    <option value="POST">Social Post / Tweet</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail Image URL, Real Thumbnail Controls & Duration */}
              <div className="space-y-3 rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-red-600" />
                    <span>कव्हर / Real Thumbnail Image (मूळ फोटो / थंबनेल)</span>
                  </label>

                  {/* Real Thumbnail Fetch & Quality Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleFetchRealThumbnail('maxres')}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 font-bold text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Fetch highest resolution thumbnail directly from the link"
                    >
                      <RefreshCw className="h-3 w-3 text-red-600" />
                      <span>Auto-Fetch Real</span>
                    </button>

                    {formData.platform === 'YOUTUBE' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleFetchRealThumbnail('maxres')}
                          className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold"
                          title="YouTube HD MaxRes 1080p"
                        >
                          HD (1080p)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFetchRealThumbnail('hq')}
                          className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-700"
                          title="YouTube High Quality 480p"
                        >
                          HQ (480p)
                        </button>
                      </>
                    )}

                    {formData.platform === 'INSTAGRAM' && (
                      <button
                        type="button"
                        onClick={() => handleFetchRealThumbnail('ig')}
                        className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold"
                        title="Direct Instagram Cover"
                      >
                        IG Media Cover
                      </button>
                    )}

                    <label className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white font-bold cursor-pointer flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <input
                      type="url"
                      placeholder="उदा. https://i.ytimg.com/vi/... किंवा इमेज लिंक"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 bg-white focus:border-red-600 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">
                      टीप: YouTube व्हिडिओसाठी 1080p/HQ थंबनेल आपोआप लिंकवरून घेतले जातात.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="कालावधी e.g. 00:55 / 03:20"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 bg-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Real-Time Thumbnail Preview in Form */}
                {formData.thumbnailUrl && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                    <div
                      className={`relative overflow-hidden rounded-lg bg-black border border-slate-300 shadow-2xs shrink-0 ${
                        formData.mediaType === 'REEL' || formData.mediaType === 'SHORT'
                          ? 'h-24 w-[54px] aspect-[9/16]'
                          : 'h-16 w-28 aspect-video'
                      }`}
                    >
                      <img
                        src={formData.thumbnailUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // If maxres fails, try hqdefault
                          const target = e.currentTarget;
                          if (target.src.includes('maxresdefault.jpg')) {
                            target.src = target.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
                          }
                        }}
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 py-0.5 text-center text-[8px] font-bold text-white">
                        {formData.mediaType === 'REEL' || formData.mediaType === 'SHORT' ? '9:16' : '16:9'}
                      </div>
                    </div>

                    <div className="text-xs space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Real Thumbnail Active (थंबनेल तयार आहे)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-sm">
                        {formData.thumbnailUrl}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    स्थान / जिल्हा (Location / District)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Gadchiroli, Pune, Nagpur"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">वर्गवारी / Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Breaking, Ground Report, Politics, Wildlife"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Reporter / Author & Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    प्रतिनिधी / Source Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. InfoNews Bureau"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    हँडल (Social Handle)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @infonews24_official"
                    value={formData.authorHandle}
                    onChange={(e) => setFormData({ ...formData, authorHandle: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Caption / Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  तपशील / Caption (पर्यायी)
                </label>
                <textarea
                  rows={2}
                  placeholder="बातमीचा थोडक्यात सारांश किंवा हॅशटॅग्ज..."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              {/* Status & Featured Reel Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">प्रकाशन स्थिती (Status)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  >
                    <option value="PUBLISHED">Published (थेट पोर्टलवर दाखवा)</option>
                    <option value="DRAFT">Draft (मसुदा)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isFeaturedReel"
                    checked={formData.isFeaturedReel}
                    onChange={(e) => setFormData({ ...formData, isFeaturedReel: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="isFeaturedReel" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Top Story Reel / रील बुलेटिन मध्ये दाखवा
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  रद्द करा (Cancel)
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-all cursor-pointer"
                >
                  {editingItem ? 'बदल जतन करा (Update Post)' : 'लाइव्ह पोर्टलवर जोडा (Publish to Live Portal)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. INTERACTIVE PREVIEW / EMBED PLAYER MODAL (Standard Aspect Ratio Per Platform) */}
      <SocialPlayerModal
        post={activePreviewPost}
        onClose={() => setActivePreviewPost(null)}
      />

      {/* 7. DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">सोशल पोस्ट हटवायची आहे का?</h3>
                <p className="text-xs text-slate-500">ही क्रिया कायमस्वरूपी असेल.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              तुम्ही ही सोशल मीडिया पोस्ट/रील थेट न्यूज पोर्टलवरून काढून टाकू इच्छिता का?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSocialPost(deleteConfirmId);
                  setDeleteConfirmId(null);
                  setStatusMessage('सोशल पोस्ट यशस्वीरित्या हटवली.');
                }}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700"
              >
                होय, हटवा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
