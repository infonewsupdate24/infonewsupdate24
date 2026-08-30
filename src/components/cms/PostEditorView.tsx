import {
  AlertCircle,
  ArrowLeft,
  Bold,
  CheckCircle,
  Eye,
  FileText,
  Heading1,
  Heading2,
  HelpCircle,
  History,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  Lock,
  MapPin,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Play,
  Plus,
  Quote,
  RefreshCw,
  Save,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
  Upload,
  UserCheck,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { canEditPost } from '../../utils/rbac';
import { useVoiceTyping } from '../../hooks/useVoiceTyping';
import { Post, PostSEO, PostStatus, PostVisibility } from '../../types';
import { SocialSharePreviewModal } from './SocialSharePreviewModal';
import { AINewsAssistantModal } from './AINewsAssistantModal';
import { BreakingNewsCardGeneratorModal } from './BreakingNewsCardGeneratorModal';
import { MediaPickerModal } from './MediaPickerModal';
import { RankMathSEOAnalyzer } from './RankMathSEOAnalyzer';
import { ArticleContentRenderer } from '../common/ArticleContentRenderer';
import {
  optimizeNewsPostWithRankMath,
  transliterateMarathiToSlug,
  checkGoogleNewsReadiness,
  checkGoogleDiscoverReadiness,
} from '../../services/SEOAutoOptimizer';
import { WebPushNotificationService } from '../../services/WebPushNotificationService';
import { optimizeImageFile } from '../../utils/imageOptimizer';

export const PostEditorView: React.FC = () => {
  const { posts, categories, tags, selectedPostId, setCmsView, createPost, updatePost, uploadMedia } = useApp();
  const { currentUser, hasPermission } = useAuth();
  const featuredImageFileRef = useRef<HTMLInputElement | null>(null);

  const existingPost = posts.find((p) => p.id === selectedPostId);

  // Form State
  const [title, setTitle] = useState(existingPost?.title || '');
  const [slug, setSlug] = useState(existingPost?.slug || '');
  const [content, setContent] = useState(existingPost?.content || '');
  const [excerpt, setExcerpt] = useState(existingPost?.excerpt || '');
  const [featuredImage, setFeaturedImage] = useState(
    existingPost?.featuredImage ||
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80'
  );
  const [featuredImageAlt, setFeaturedImageAlt] = useState(existingPost?.featuredImageAlt || '');
  const [featuredImageCaption, setFeaturedImageCaption] = useState(
    existingPost?.featuredImageCaption || ''
  );
  const [authorName, setAuthorName] = useState(
    existingPost?.authorName || 'InfoNewsUpdate24 विशेष प्रतिनिधी'
  );
  const [authorRole, setAuthorRole] = useState(
    existingPost?.authorRole || currentUser?.role || 'SUPER_ADMIN'
  );
  const [authorAvatar, setAuthorAvatar] = useState(
    existingPost?.authorAvatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );
  const [categoryId, setCategoryId] = useState(existingPost?.categoryId || categories[0]?.id || 'cat-1');
  const [subCategoryId, setSubCategoryId] = useState(existingPost?.subCategoryId || '');
  const [postTags, setPostTags] = useState<string[]>(existingPost?.tags || ['Maharashtra', 'News']);
  const [newTagInput, setNewTagInput] = useState('');
  const [location, setLocation] = useState(existingPost?.location || 'गडचिरोली');
  const [status, setStatus] = useState<PostStatus>(existingPost?.status || 'DRAFT');
  const [visibility, setVisibility] = useState<PostVisibility>(existingPost?.visibility || 'PUBLIC');
  const [isBreaking, setIsBreaking] = useState(existingPost?.isBreaking || false);
  const [isTrending, setIsTrending] = useState(existingPost?.isTrending || false);
  const [isVideoNews, setIsVideoNews] = useState(existingPost?.isVideoNews || false);
  const [sendPushAlert, setSendPushAlert] = useState(existingPost?.isBreaking || false);
  const [videoUrl, setVideoUrl] = useState(existingPost?.videoUrl || '');
  const [editorialNote, setEditorialNote] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<'write' | 'preview'>('write');
  const [isSocialPreviewOpen, setIsSocialPreviewOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isGraphicCardOpen, setIsGraphicCardOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(existingPost?.scheduleDate || '');
  const [attachmentUrl, setAttachmentUrl] = useState(existingPost?.attachmentUrl || '');
  const [attachmentName, setAttachmentName] = useState(existingPost?.attachmentName || '');
  const [isAutoOptimizing, setIsAutoOptimizing] = useState(false);
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(null);

  // 🔒 Published Post Security Guard: If post is PUBLISHED, only Super Admin & Admin can edit
  const isReadOnly = Boolean(existingPost && !canEditPost(currentUser, existingPost));

  // Auto-Save Draft every 25s (Only if user has edit permission)
  useEffect(() => {
    if (!title && !content) return;
    if (isReadOnly) return;
    const timer = setInterval(() => {
      try {
        const draftData = {
          title,
          slug,
          content,
          excerpt,
          featuredImage,
          categoryId,
          postTags,
          location,
          savedAt: new Date().toLocaleTimeString('mr-IN'),
        };
        localStorage.setItem(`infonews_autosave_${selectedPostId || 'new'}`, JSON.stringify(draftData));
        setLastAutoSavedTime(new Date().toLocaleTimeString('mr-IN'));
      } catch (e) {}
    }, 25000);
    return () => clearInterval(timer);
  }, [title, slug, content, excerpt, featuredImage, categoryId, postTags, location, selectedPostId]);

  // 1-Click Smart Non-Destructive Auto-Populate & Editorial SEO Assistant
  // Priority: 1. Manual Value -> 2. Existing Saved Value -> 3. Auto-Generated Value
  const handleAutoPopulateRankMath = () => {
    setIsAutoOptimizing(true);
    setTimeout(() => {
      const isPostPublished = status === 'PUBLISHED' || existingPost?.status === 'PUBLISHED';

      const result = optimizeNewsPostWithRankMath(title, content, categories, {
        preserveExistingContent: Boolean(content && content.trim().length > 25),
        preserveExistingTitle: Boolean(title && title.trim().length > 10),
        preserveExistingSlug: Boolean(slug && slug.trim().length > 3),
        existingFocusKeyword: focusKeyword,
        existingSeoTitle: seoTitle,
        existingMetaDescription: metaDescription,
        existingExcerpt: excerpt,
        existingSlug: slug,
        existingImageAlt: featuredImageAlt,
        existingTags: postTags,
        existingCategoryId: categoryId,
        isPublished: isPostPublished,
      });

      // ONLY populate fields that are empty or need non-destructive filling:
      if (!title.trim() && result.title) setTitle(result.title);
      if (!seoTitle.trim() && result.seoTitle) setSeoTitle(result.seoTitle);
      if (!focusKeyword.trim() && result.focusKeyword) setFocusKeyword(result.focusKeyword);
      if (!metaDescription.trim() && result.metaDescription) setMetaDescription(result.metaDescription);
      if (!excerpt.trim() && result.excerpt) setExcerpt(result.excerpt);
      if (!content.trim() && result.content) setContent(result.content);
      if (!featuredImageAlt.trim() && result.featuredImageAlt) setFeaturedImageAlt(result.featuredImageAlt);
      if (!categoryId && result.categoryId) setCategoryId(result.categoryId);
      if ((!postTags || postTags.length === 0) && result.tags) setPostTags(result.tags);
      if (!slug.trim() && result.slug && !isPostPublished) setSlug(result.slug);

      setIsAutoOptimizing(false);
      setSaveSuccessMsg(
        `✨ संपादकीय SEO सहाय्यक: आवश्यक SEO फील्ड्स भरली गेली (Focus Keyword: "${result.focusKeyword || focusKeyword}", मूळ बातमी व URL सुरक्षित).`
      );
      setTimeout(() => setSaveSuccessMsg(''), 6000);
    }, 400);
  };

  // Reporter Voice Typing State
  const [voiceLang, setVoiceLang] = useState<'mr-IN' | 'hi-IN' | 'en-IN'>('mr-IN');
  const [voiceTarget, setVoiceTarget] = useState<'title' | 'content' | 'excerpt' | null>(null);

  const { isListening, toggleListening, isSupported: isVoiceSupported } = useVoiceTyping({
    lang: voiceLang,
    onResult: (transcript) => {
      if (voiceTarget === 'title') {
        setTitle((prev) => (prev ? `${prev} ${transcript}` : transcript));
      } else if (voiceTarget === 'excerpt') {
        setExcerpt((prev) => (prev ? `${prev} ${transcript}` : transcript));
      } else if (voiceTarget === 'content') {
        setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    },
  });

  const handleStartVoice = (target: 'title' | 'content' | 'excerpt') => {
    if (isListening && voiceTarget === target) {
      toggleListening();
      setVoiceTarget(null);
    } else {
      setVoiceTarget(target);
      if (!isListening) toggleListening();
    }
  };

  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Helper to format text inside textarea
  const applyFormat = (prefix: string, suffix: string = '') => {
    if (!contentTextareaRef.current) return;
    const el = contentTextareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selectedText = text.substring(start, end) || 'text';
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 10);
  };

  // SEO State
  const [focusKeyword, setFocusKeyword] = useState(existingPost?.seo?.focusKeyword || '');
  const [seoTitle, setSeoTitle] = useState(existingPost?.seo?.seoTitle || '');
  const [metaDescription, setMetaDescription] = useState(existingPost?.seo?.metaDescription || '');
  const [isSlugLocked, setIsSlugLocked] = useState(Boolean(existingPost?.slug));

  // Auto-generate slug from Marathi title using phonetic transliteration
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isSlugLocked || !slug) {
      const generatedSlug = transliterateMarathiToSlug(val);
      setSlug(generatedSlug);
    }
    if (!seoTitle) setSeoTitle(val);
  };

  // 1-Click Regenerate permalink slug from title
  const handleRegenerateSlug = () => {
    const generatedSlug = transliterateMarathiToSlug(title);
    setSlug(generatedSlug);
    setIsSlugLocked(false);
  };

  // Deterministic SEO Score Calculator
  const calculateSeo = (): PostSEO => {
    const kw = focusKeyword.trim().toLowerCase();
    const t = (seoTitle || title).toLowerCase();
    const u = slug.toLowerCase();
    const d = metaDescription.toLowerCase();
    const c = content.toLowerCase();
    const firstPara = c.split('\n')[0] || '';

    const checks = {
      keywordInTitle: kw.length > 0 && t.includes(kw),
      keywordInUrl: kw.length > 0 && (u.includes(kw.replace(/\s+/g, '-')) || u.includes(kw)),
      keywordInDescription: kw.length > 0 && d.includes(kw),
      keywordInFirstParagraph: kw.length > 0 && firstPara.includes(kw),
      keywordInHeadings: kw.length > 0 && c.includes('##') && c.includes(kw),
      contentLengthOk: content.split(/\s+/).filter(Boolean).length >= 100,
      hasInternalLinks: content.includes('http') || content.includes('/category/'),
      hasExternalLinks: content.includes('https://'),
      hasImageAlt: (featuredImageAlt && featuredImageAlt.length > 3) ? true : false,
      readabilityOk: content.length > 150,
    };

    let score = 0;
    if (checks.keywordInTitle) score += 20;
    if (checks.keywordInUrl) score += 15;
    if (checks.keywordInDescription) score += 15;
    if (checks.keywordInFirstParagraph) score += 10;
    if (checks.keywordInHeadings) score += 10;
    if (checks.contentLengthOk) score += 10;
    if (checks.hasImageAlt) score += 10;
    if (checks.readabilityOk) score += 10;

    const newsReadinessResult = checkGoogleNewsReadiness({
      title,
      slug,
      authorName: currentUser.name,
      publishDate: existingPost?.publishDate || new Date().toISOString(),
      featuredImage,
      content,
    });

    const discoverReadinessResult = checkGoogleDiscoverReadiness({
      title,
      featuredImage,
      featuredImageAlt,
      content,
      excerpt,
      publishDate: existingPost?.publishDate || new Date().toISOString(),
    });

    return {
      focusKeyword,
      seoTitle: seoTitle || title,
      metaDescription,
      score: Math.min(100, score),
      checks,
      newsReadiness: newsReadinessResult.status,
      discoverReadiness: discoverReadinessResult.status,
    };
  };

  const seoData = calculateSeo();

  // Word count & Reading Time
  const words = content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const handleAddTag = () => {
    if (newTagInput.trim() && !postTags.includes(newTagInput.trim())) {
      setPostTags([...postTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPostTags(postTags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async (targetStatus?: PostStatus) => {
    if (isReadOnly) {
      alert('🔒 ही बातमी प्रकाशित झालेली असल्याने फक्त मुख्य ॲडमिनच यात बदल करू शकतात.');
      return;
    }
    const finalStatus = targetStatus || status;
    const postPayload = {
      title: title || 'Untitled News Article',
      slug: slug || `article-${Date.now()}`,
      content: content || 'Content in preparation.',
      excerpt: excerpt || content.slice(0, 140),
      featuredImage,
      featuredImageAlt,
      featuredImageCaption,
      categoryId,
      subCategoryId: subCategoryId || undefined,
      tags: postTags,
      authorId: existingPost ? existingPost.authorId : currentUser.id,
      authorName: authorName.trim() || 'InfoNewsUpdate24 विशेष प्रतिनिधी',
      authorAvatar: authorAvatar,
      authorRole: authorRole,
      status: finalStatus,
      visibility,
      publishDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      views: existingPost ? existingPost.views : 0,
      likes: existingPost ? existingPost.likes : 0,
      readingTimeMinutes: readingTime,
      location,
      isBreaking,
      isTrending,
      isFeatured: true,
      isVideoNews,
      videoUrl: isVideoNews ? videoUrl : undefined,
      scheduleDate: status === 'SCHEDULED' ? scheduleDate : undefined,
      attachmentUrl: attachmentUrl || undefined,
      attachmentName: attachmentName || undefined,
      seo: seoData,
    };

    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      if (existingPost) {
        await updatePost(existingPost.id, postPayload, editorialNote || `Status: ${finalStatus}`);
        setSaveSuccessMsg(`बातमी यशस्वीरीत्या क्लाउडवर अद्ययावत झाली (${finalStatus})`);
      } else {
        const created = await createPost(postPayload);
        setSaveSuccessMsg(`बातमी यशस्वीरीत्या क्लाउडवर प्रकाशित झाली! (ID: ${created.id})`);
      }

      if (sendPushAlert && finalStatus === 'PUBLISHED') {
        WebPushNotificationService.broadcastPush(
          title,
          excerpt || title,
          '/?mode=public',
          isBreaking ? 'BREAKING' : 'ALL',
          location,
          featuredImage
        );
      }

      setTimeout(() => {
        setSaveSuccessMsg('');
      }, 5000);
    } catch (err: any) {
      console.error('Failed to save/publish post to Firestore:', err);
      setSaveErrorMsg(
        err?.message || '❌ क्लाउड सेव्ह अयशस्वी झाले. बातमी प्रकाशित झाली नाही. कृपया तुमचे इंटरनेट कनेक्शन किंवा ॲडमिन लॉगिन तपासा.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="post-editor-container" className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCmsView('posts_all')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {existingPost ? 'Edit News Post' : 'Add New Post'}
            </h1>
            <p className="text-xs text-slate-500">
              WordPress-Style Block Editor with Real-time SEO Analyzer
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-Saved Indicator */}
          {lastAutoSavedTime && (
            <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md font-bold hidden sm:inline-block">
              🟢 मसुदा सेव्ह: {lastAutoSavedTime}
            </span>
          )}

          {/* AI News Writer Button */}
          <button
            type="button"
            onClick={() => setIsAIAssistantOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3.5 py-1.5 text-xs font-black text-white shadow-md hover:from-purple-700 hover:to-pink-700 transition-all active:scale-95 cursor-pointer"
            title="AI कडून मराठी बातमी लिहून घ्या"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>✨ AI बातमी सहाय्यक (Smart Writer)</span>
          </button>

          {/* 1-Click Rank Math Auto-Populate & Optimizer Button */}
          <button
            type="button"
            onClick={handleAutoPopulateRankMath}
            disabled={isAutoOptimizing}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:from-indigo-700 hover:to-blue-700 transition-all active:scale-95 cursor-pointer"
            title="मजकूर किंवा शीर्षकावरून संपूर्ण बातमी Rank Math नुसार आपोआप तयार करा"
          >
            <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
            <span>{isAutoOptimizing ? 'ऑप्टिमाइझ होत आहे...' : '⚡ SEO 95+'}</span>
          </button>

          {/* Breaking News Graphic Banner Generator Button */}
          <button
            type="button"
            onClick={() => setIsGraphicCardOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-600/30 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 shadow-2xs transition-colors"
            title="सोशल मीडियासाठी फोटो कार्ड तयार करा"
          >
            <ImageIcon className="h-3.5 w-3.5 text-red-600" />
            <span>📸 फोटो कार्ड</span>
          </button>

          {/* WhatsApp / Social Share Previewer Button */}
          <button
            type="button"
            onClick={() => setIsSocialPreviewOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 shadow-2xs transition-colors"
            title="सोशल मीडिया प्रिव्ह्यू पहा"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>सोशल शेअर</span>
          </button>

          {isReadOnly ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 px-3.5 py-1.5 text-xs font-bold text-amber-800 shadow-2xs">
              <Lock className="h-3.5 w-3.5 text-amber-700" />
              <span>🔒 प्रकाशित बातमी (फक्त वाचन मोड)</span>
            </span>
          ) : (
            <>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave('DRAFT')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </button>

              {hasPermission('post.submit') && status === 'DRAFT' && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('SUBMITTED')}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>{isSaving ? 'Submitting...' : 'Submit for Review'}</span>
                </button>
              )}

              {hasPermission('post.publish') && (
                <button
                  id="btn-publish-post-main"
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('PUBLISHED')}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {isSaving
                      ? 'क्लाउडवर सेव्ह होत आहे...'
                      : status === 'PUBLISHED'
                      ? 'Update & Publish'
                      : 'Publish Now'}
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 🔒 Read-Only Published Post Security Banner for Non-Admins */}
      {isReadOnly && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-xs animate-in fade-in">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-2">
              <span>🔒 प्रकाशित बातमी संपादन कुलूप (Published Post Lock Active)</span>
            </h4>
            <p className="text-xs text-amber-800 mt-0.5">
              ही बातमी आधीच प्रकाशित झालेली असल्याने वृत्तसंकेतस्थळ सुरक्षा नियमांनुसार फक्त <strong>Super Admin / मुख्य ॲडमिन</strong> च यात बदल किंवा डिलीट करू शकतात. आपण ही बातमी फक्त वाचू (View Only) शकता.
            </p>
          </div>
        </div>
      )}

      {saveSuccessMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-bold text-emerald-800 ring-1 ring-emerald-600/30 animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-bold text-red-800 ring-1 ring-red-600/30 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Main 2-Column Editor Layout (Main Content + Right Settings Panel) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Main Editor */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick 1-Click Editorial SEO Smart Banner */}
          <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-3.5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs shrink-0">
                <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>1-Click Editorial SEO Assistant (Fill Missing Fields)</span>
                  <span className="rounded-full bg-purple-600 text-white px-2 py-0.2 text-[9px] font-black uppercase">
                    PRO
                  </span>
                </h4>
                <p className="text-[11px] text-slate-600">
                  फक्त अपूर्ण किंवा रिकामी SEO फील्ड्स (Focus Keyword, SEO Title, Meta Description, Image Alt) आपोआप भरेल. मूळ मजकूर व प्रकाशित URL सुरक्षित राहतील.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoPopulateRankMath}
              disabled={isAutoOptimizing}
              className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{isAutoOptimizing ? 'ऑप्टिमाइझ होत आहे...' : 'Fill Missing SEO'}</span>
            </button>
          </div>

          {/* Post Title */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Article Title (मराठी / English)
                </label>
                {/* Voice Typing Quick Button for Title */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={voiceLang}
                    onChange={(e) => setVoiceLang(e.target.value as any)}
                    className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 focus:outline-hidden"
                  >
                    <option value="mr-IN">🇮🇳 मराठी</option>
                    <option value="hi-IN">🇮🇳 हिंदी</option>
                    <option value="en-IN">🌐 English</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleStartVoice('title')}
                    className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                      isListening && voiceTarget === 'title'
                        ? 'bg-red-600 text-white animate-pulse shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600'
                    }`}
                    title="शीर्षक बोलून लिहा (Voice Type Title)"
                  >
                    {isListening && voiceTarget === 'title' ? (
                      <>
                        <Mic className="h-3 w-3 animate-bounce text-white" />
                        <span>ऐकत आहे... (Listening)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-3 w-3 text-red-500" />
                        <span>बोलून लिहा</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <input
                id="input-post-title"
                type="text"
                disabled={isReadOnly}
                placeholder="उदा. मुंबई-पुणे एक्सप्रेसवेवर नवीन लेन खुली; प्रवाशांना मोठा दिलासा..."
                value={title}
                onChange={handleTitleChange}
                className="w-full text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 focus:border-red-600 focus:outline-hidden placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
              />

              {/* Title Character Count & Google CTR Meter */}
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">शीर्षक लांबी:</span>
                  <span
                    className={`font-bold font-mono ${
                      title.length >= 50 && title.length <= 65
                        ? 'text-emerald-600'
                        : title.length > 65
                        ? 'text-amber-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {title.length} अक्षरे
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {title.length >= 50 && title.length <= 65
                      ? '✅ Google SEO साठी परिपूर्ण लांबी (50-65 chars)'
                      : title.length > 65
                      ? '⚠️ थोडे मोठे (Google सर्चमध्ये कापू शकते)'
                      : '💡 अधिक माहितीपूर्ण मथळा लिहा (किमान 50 अक्षरे)'}
                  </span>
                </div>

                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all ${
                      title.length >= 50 && title.length <= 65
                        ? 'bg-emerald-500'
                        : title.length > 65
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, (title.length / 65) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Permalink / Slug Auto-Populate row */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                🔗 पर्मालिंक (Permalink):
              </span>
              <span className="text-slate-400 font-mono text-[11px]">https://infonewsupdate24.com/</span>
              <input
                type="text"
                disabled={isReadOnly}
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugLocked(true);
                }}
                placeholder="auto-generated-marathi-slug"
                className="flex-1 min-w-[200px] rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 font-mono focus:border-red-500 focus:ring-1 focus:ring-red-200 outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  title="मथळ्यावरून पर्मालिंक पुन्हा ऑटो-जनरेट करा (Auto-populate from Title)"
                  className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 hover:text-red-600 transition-colors shadow-2xs cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3 text-red-600" />
                  <span>Auto-Generate</span>
                </button>
              )}
            </div>
          </div>

          {/* Rich Content Editor Box */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            {/* Editor vs Preview Mode Switcher */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/70 px-3 py-1.5 text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveEditorTab('write')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-bold transition-all ${
                    activeEditorTab === 'write'
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 text-red-600" />
                  <span>Write / Markdown</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorTab('preview')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-bold transition-all ${
                    activeEditorTab === 'preview'
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5 text-blue-600" />
                  <span>Live Reader Preview</span>
                </button>
              </div>

              <span className="text-[11px] font-medium text-slate-400">
                {activeEditorTab === 'write' ? 'WYSIWYG Markdown' : 'Portal View Mode'}
              </span>
            </div>

            {activeEditorTab === 'write' ? (
              <>
                {/* Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                  <button
                    type="button"
                    onClick={() => applyFormat('**', '**')}
                    className="flex h-7 w-7 items-center justify-center rounded font-bold text-slate-700 hover:bg-slate-200 active:bg-slate-300"
                    title="Bold (**text**)"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('*', '*')}
                    className="flex h-7 w-7 items-center justify-center rounded italic text-slate-700 hover:bg-slate-200 active:bg-slate-300"
                    title="Italic (*text*)"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('\n## ', '\n')}
                    className="rounded px-2 py-1 font-bold text-slate-700 hover:bg-slate-200 active:bg-slate-300 text-[11px]"
                    title="Heading 2 (## Headline)"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('\n### ', '\n')}
                    className="rounded px-2 py-1 font-bold text-slate-700 hover:bg-slate-200 active:bg-slate-300 text-[11px]"
                    title="Heading 3 (### Sub-headline)"
                  >
                    H3
                  </button>
                  <span className="h-4 w-px bg-slate-300 mx-1"></span>
                  <button
                    type="button"
                    onClick={() => applyFormat('\n- ', '')}
                    className="flex items-center gap-1 rounded px-2 py-1 text-slate-700 hover:bg-slate-200 active:bg-slate-300 text-[11px]"
                    title="Bullet List (- item)"
                  >
                    <List className="h-3.5 w-3.5" />
                    <span>List</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('\n> ', '\n')}
                    className="flex items-center gap-1 rounded px-2 py-1 text-slate-700 hover:bg-slate-200 active:bg-slate-300 text-[11px]"
                    title="Quote (> quote)"
                  >
                    <Quote className="h-3.5 w-3.5" />
                    <span>Quote</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('[', '](https://)')}
                    className="flex items-center gap-1 rounded px-2 py-1 text-slate-700 hover:bg-slate-200 active:bg-slate-300 text-[11px]"
                    title="Link [title](url)"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>Link</span>
                  </button>

                  <div className="ml-auto flex items-center gap-2">
                    {/* Voice Typing in Content Toolbar */}
                    <button
                      type="button"
                      onClick={() => handleStartVoice('content')}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
                        isListening && voiceTarget === 'content'
                          ? 'bg-red-600 text-white animate-pulse shadow-xs'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-red-200'
                      }`}
                      title="वार्ताहरांसाठी बोलून बातमी लिहा (Voice Dictation)"
                    >
                      {isListening && voiceTarget === 'content' ? (
                        <>
                          <Mic className="h-3.5 w-3.5 animate-bounce text-white" />
                          <span>मराठीत बोलत रहा...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-3.5 w-3.5 text-red-600" />
                          <span>बोलून लिहा (व्हॉईस टायपिंग)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setContent((prev) => prev + '\n\n![News Illustration](https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000)');
                      }}
                      className="flex items-center gap-1 rounded bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-300"
                    >
                      <ImageIcon className="h-3 w-3" />
                      <span>Add Media</span>
                    </button>
                  </div>
                </div>

                {/* Content Textarea */}
                <textarea
                  ref={contentTextareaRef}
                  id="input-post-content"
                  rows={12}
                  disabled={isReadOnly}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write or paste your news story in Marathi or English..."
                  className="w-full p-4 text-sm text-slate-800 font-sans leading-relaxed focus:outline-hidden resize-y disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                />

                {/* Rank Math Enhanced Live Metrics Bar */}
                <div className="flex flex-wrap items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold text-slate-600 gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>
                      शब्द (Words): <strong className="text-slate-900">{words}</strong>
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span>
                      अक्षरे (Chars): <strong className="text-slate-900">{content.length}</strong>
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span>
                      परिच्छेद: <strong className="text-slate-900">{content.split(/\n+/).filter(Boolean).length}</strong>
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span>
                      उपशीर्षके (H2/H3): <strong className="text-slate-900">{(content.match(/^#{2,3}\s/gm) || []).length}</strong>
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span>
                      वाचन वेळ: <strong className="text-slate-900">{readingTime} min</strong>
                    </span>
                  </div>

                  {focusKeyword && (
                    <div className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-[10px] shadow-2xs">
                      <span className="text-slate-500 font-bold">कीवर्ड पुनरावृत्ती:</span>
                      <strong className="text-red-600 font-black">
                        {(content.match(new RegExp(focusKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length}x
                      </strong>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* LIVE READER PREVIEW */
              <div className="p-6 bg-slate-50/40 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-red-600 px-2.5 py-0.5 text-xs font-black text-white uppercase tracking-wider">
                    {categories.find((c) => c.id === categoryId)?.name || 'महाराष्ट्र'}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    <MapPin className="h-3 w-3 text-red-600" />
                    <span>{location || 'मुंबई'} ब्युरो</span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    <span>पडताळणीकृत बातमी</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium ml-auto">
                    {readingTime} मिनिटे वाचन वेळ
                  </span>
                </div>

                <h1 className="text-2xl font-black text-slate-900 leading-snug">
                  {title || 'Untitled Article Preview'}
                </h1>

                {excerpt && (
                  <p className="text-sm font-medium text-slate-600 border-l-4 border-red-600 pl-3 italic">
                    {excerpt}
                  </p>
                )}

                {featuredImage && (
                  <div className="rounded-xl overflow-hidden shadow-xs ring-1 ring-slate-200">
                    <img
                      src={featuredImage}
                      alt={featuredImageAlt || title}
                      className="w-full max-h-72 object-cover"
                    />
                    {featuredImageCaption && (
                      <p className="p-2 text-center text-xs text-slate-500 bg-white border-t border-slate-100">
                        {featuredImageCaption}
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                  {content ? (
                    <ArticleContentRenderer content={content} showInArticleAd={false} />
                  ) : (
                    <p className="text-slate-400 text-xs italic">कोणताही मजकूर अद्याप लिहिलेला नाही.</p>
                  )}
                </div>

                {/* Author Card in Preview */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-red-500/20"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{currentUser.name}</h5>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                      {currentUser.role.replace('_', ' ')} &bull; {location} Bureau
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
              Excerpt (Summary for News Cards)
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary that appears on news feed cards and search previews..."
              className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 focus:border-red-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
            />
          </div>

          {/* Rank Math SEO Suite 2.5 PRO Analyzer */}
          <RankMathSEOAnalyzer
            title={title}
            setTitle={setTitle}
            slug={slug}
            setSlug={setSlug}
            content={content}
            setContent={setContent}
            excerpt={excerpt}
            setExcerpt={setExcerpt}
            featuredImage={featuredImage}
            featuredImageAlt={featuredImageAlt}
            setFeaturedImageAlt={setFeaturedImageAlt}
            focusKeyword={focusKeyword}
            setFocusKeyword={setFocusKeyword}
            seoTitle={seoTitle}
            setSeoTitle={setSeoTitle}
            metaDescription={metaDescription}
            setMetaDescription={setMetaDescription}
            categoryName={categories.find((c) => c.id === categoryId)?.name || 'महाराष्ट्र'}
            authorName={currentUser.name}
            publishDate={existingPost?.publishDate}
            isPublished={status === 'PUBLISHED' || existingPost?.status === 'PUBLISHED'}
            onAutoPopulate={handleAutoPopulateRankMath}
          />
        </div>

        {/* Right 1 Col: Publishing Meta & Taxonomy Panel */}
        <div className="space-y-5">
          {/* Publish Box (WordPress Style) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Publish & Workflow
            </h3>

            {/* Status Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Workflow Status:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-800 focus:outline-hidden"
              >
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted for Review</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="NEEDS_CORRECTION">Needs Correction</option>
                <option value="APPROVED">Approved</option>
                <option value="SCHEDULED">Scheduled (भविष्यातील तारीख/वेळ)</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
                <option value="REJECTED">Rejected</option>
              </select>

              {status === 'SCHEDULED' && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-blue-50 border border-blue-200 space-y-1">
                  <label className="text-[11px] font-bold text-blue-900 block">
                    प्रकाशन तारीख व वेळ (Schedule Date & Time):
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="h-8 w-full rounded-md border border-blue-300 bg-white px-2 text-xs font-semibold text-blue-900 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-blue-600">
                    या वेळेला बातमी आपोआप सर्व वाचकांसाठी प्रकाशित होईल.
                  </p>
                </div>
              )}
            </div>

            {/* Visibility Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Visibility:
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as PostVisibility)}
                className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-800 focus:outline-hidden"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private (Staff only)</option>
                <option value="PASSWORD_PROTECTED">Password Protected</option>
              </select>
            </div>

            {/* Editorial Note */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Workflow Log / Note:
              </label>
              <input
                type="text"
                placeholder="e.g. Verified with IMD alert"
                value={editorialNote}
                onChange={(e) => setEditorialNote(e.target.value)}
                className="h-8 w-full rounded-md border border-slate-200 px-2.5 text-xs text-slate-800 focus:border-red-500 focus:outline-hidden"
              />
            </div>

            {/* Feature Flags */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>Set as Breaking News Ticker</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                <input
                  type="checkbox"
                  checked={sendPushAlert}
                  onChange={(e) => setSendPushAlert(e.target.checked)}
                  className="rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <span>🔔 पुश नोटिफिकेशन पाठवा (Web Push Alert)</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>Highlight in Trending List</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isVideoNews}
                  onChange={(e) => setIsVideoNews(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Attach Video / Reel</span>
              </label>
            </div>

            {isVideoNews && (
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Video / Stream URL:
                </label>
                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="h-8 w-full rounded-md border border-slate-200 px-2.5 text-xs text-slate-800 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Author / Reporter Modification Card (लेखक व बातमीदार Byline) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-red-600" />
                <span>लेखक व वार्ताहर (Author & Reporter)</span>
              </h3>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                वार्ताहर / लेखकाचे नाव (Author Name):
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="उदा. InfoNewsUpdate24 विशेष प्रतिनिधी"
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            {/* Quick Author Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 block">
                त्वरित निवड (Quick Presets):
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setAuthorName('InfoNewsUpdate24 विशेष प्रतिनिधी')}
                  className="rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-700 border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  📰 InfoNews24 विशेष प्रतिनिधी
                </button>
                <button
                  type="button"
                  onClick={() => setAuthorName('Komal Daulatrao Dahagaonkar')}
                  className="rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-700 border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  ✍️ Komal D. Dahagaonkar
                </button>
                <button
                  type="button"
                  onClick={() => setAuthorName('गडचिरोली ब्युरो प्रतिनिधी')}
                  className="rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-700 border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  📍 गडचिरोली ब्युरो
                </button>
                <button
                  type="button"
                  onClick={() => setAuthorName('संपादकीय मंडळ, InfoNewsUpdate24')}
                  className="rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-700 border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  🏛️ संपादकीय मंडळ
                </button>
              </div>
            </div>

            {/* Location / Bureau */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                स्थान / बातमीदार ब्युरो (Location):
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="उदा. गडचिरोली, मुंबई, नागपूर, चामोर्शी, एटापल्ली"
                className="h-8 w-full rounded-md border border-slate-200 px-2.5 text-xs text-slate-800 focus:border-red-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Categories Hierarchy Box */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Categories
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex items-center gap-2 cursor-pointer ${
                    cat.parentId ? 'ml-4 text-slate-600' : 'font-semibold text-slate-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="categorySelection"
                    checked={categoryId === cat.id}
                    onChange={() => setCategoryId(cat.id)}
                    className="border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags Box */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tags
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new tag..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="h-8 flex-1 rounded-md border border-slate-200 px-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="h-8 rounded-md bg-slate-800 px-3 text-xs font-bold text-white hover:bg-slate-900"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {postTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Featured Image Box */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Featured Image
              </h3>
              <input
                type="file"
                ref={featuredImageFileRef}
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    try {
                      const optimized = await optimizeImageFile(file, 1600, 0.85);
                      setFeaturedImage(optimized.dataUrl);
                      if (!featuredImageAlt) {
                        setFeaturedImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
                      }
                      // Also automatically add to Media Library (Firebase Firestore synced)
                      uploadMedia({
                        name: file.name,
                        url: optimized.dataUrl,
                        type: 'image',
                        mimeType: optimized.mimeType,
                        sizeBytes: optimized.sizeBytes,
                        dimensions: optimized.width && optimized.height ? { width: optimized.width, height: optimized.height } : undefined,
                        altText: file.name.replace(/\.[^/.]+$/, ''),
                        caption: `Uploaded for: ${title || 'News Post'}`,
                        uploadedBy: currentUser.name,
                      });
                    } catch (err) {
                      console.error('Featured image upload error:', err);
                    }
                    e.target.value = '';
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Media Library</span>
                </button>

                <button
                  type="button"
                  onClick={() => featuredImageFileRef.current?.click()}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>अपलोड</span>
                </button>
              </div>
            </div>

            <div className="relative group rounded-lg overflow-hidden ring-1 ring-slate-200">
              <img
                src={featuredImage}
                alt={featuredImageAlt || 'Featured Image Preview'}
                className="h-36 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => featuredImageFileRef.current?.click()}
                className="absolute inset-0 bg-black/40 text-white font-bold text-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
              >
                <Upload className="w-5 h-5 mb-1" />
                नवीन फोटो अपलोड करा
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                Image URL / Base64:
              </label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="h-8 w-full rounded-md border border-slate-200 px-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                Alt Text (For SEO & Accessibility):
              </label>
              <input
                type="text"
                placeholder="Describe image for search engines..."
                value={featuredImageAlt}
                onChange={(e) => setFeaturedImageAlt(e.target.value)}
                className="h-8 w-full rounded-md border border-slate-200 px-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Location / Geography */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Location / Region
            </h3>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600 shrink-0" />
              <input
                type="text"
                placeholder="e.g. Mumbai, Gadchiroli, Nagpur"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-8 w-full rounded-md border border-slate-200 px-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Official Document / Govt GR Attachment Box */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>शासन निर्णय (GR) / PDF परिपत्रक</span>
            </h3>
            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  GR / दस्तऐवजाचे नाव:
                </label>
                <input
                  type="text"
                  placeholder="उदा. महसूल व वन विभाग शासन निर्णय..."
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  className="h-8 w-full rounded-md border border-slate-200 px-2.5 text-xs text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  PDF / दस्तऐवज URL:
                </label>
                <input
                  type="url"
                  placeholder="https://maharashtra.gov.in/gr/..."
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  className="h-8 w-full rounded-md border border-slate-200 px-2.5 text-xs text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Share Preview Modal */}
      <SocialSharePreviewModal
        post={
          existingPost || {
            id: 'preview-temp',
            title: title || 'बातमी शीर्षक प्रिव्ह्यू',
            slug: slug || 'sample-post',
            content: content || 'बातमीचा मजकूर...',
            excerpt: excerpt || content.substring(0, 140),
            featuredImage: featuredImage,
            categoryId: categoryId,
            tags: postTags,
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorAvatar: currentUser.avatar,
            authorRole: currentUser.role,
            status: status,
            publishDate: 'Today',
            views: 120,
            likes: 15,
            readingTimeMinutes: readingTime,
            location: location,
            seo: seoData,
          }
        }
        isOpen={isSocialPreviewOpen}
        onClose={() => setIsSocialPreviewOpen(false)}
      />

      {/* AI Marathi News Writer & Assistant Modal */}
      <AINewsAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        categories={categories}
        currentTitle={title}
        onApplyGeneratedContent={(gen) => {
          setTitle(gen.title);
          setContent(gen.content);
          setExcerpt(gen.excerpt);
          setSeoTitle(gen.seoTitle);
          setMetaDescription(gen.metaDescription);
          setFocusKeyword(gen.focusKeyword);
          setPostTags(gen.tags);
          if (gen.categoryId) setCategoryId(gen.categoryId);
          setSaveSuccessMsg('✨ AI ने तयार केलेली मराठी बातमी यशस्वीरित्या एडिटरमध्ये भरली!');
          setTimeout(() => setSaveSuccessMsg(''), 5000);
        }}
      />

      {/* 1-Click Breaking News Graphic Card Generator Modal */}
      <BreakingNewsCardGeneratorModal
        post={{
          title: title || 'बातमी मथळा',
          featuredImage: featuredImage,
          categoryId: categoryId,
          location: location,
        }}
        categoryName={categories.find((c) => c.id === categoryId)?.name || 'महाराष्ट्र'}
        isOpen={isGraphicCardOpen}
        onClose={() => setIsGraphicCardOpen(false)}
      />

      {/* Media Library Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectImage={(m) => {
          setFeaturedImage(m.url);
          if (m.altText) setFeaturedImageAlt(m.altText);
          setSaveSuccessMsg(`🖼️ फोटो "${m.name}" Featured Image म्हणून निवडला!`);
          setTimeout(() => setSaveSuccessMsg(''), 4000);
        }}
      />
    </div>
  );
};
