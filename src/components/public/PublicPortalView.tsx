import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  ExternalLink,
  Facebook,
  FileText,
  Film,
  Flame,
  Globe,
  Headphones,
  Heart,
  Instagram,
  Layers,
  LayoutGrid,
  List,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Moon,
  Newspaper,
  Pause,
  Play,
  Printer,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Square,
  Sun,
  Tv,
  Twitter,
  Video,
  Volume2,
  X,
  Youtube,
} from 'lucide-react';
import React, { useEffect, useRef, useState, useMemo, Suspense, lazy } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Post, SocialMediaPost } from '../../types';
import { SocialSharePreviewModal } from '../cms/SocialSharePreviewModal';
import { SocialMediaCard } from '../common/SocialMediaCard';
import { SocialPlayerModal } from '../common/SocialPlayerModal';
import { BreakingNewsTicker } from '../common/BreakingNewsTicker';
import {
  AIVoiceService,
  GOOGLE_CONVERSATIONAL_VOICES,
  GoogleVoiceAnchor,
} from '../../services/AIVoiceService';
import { matchNewsPost } from '../../utils/searchUtils';
import {
  cleanExcerpt,
  cleanTextForTTS,
  formatNewsTitle,
  formatMarathiDate,
  getSafeImageUrl,
  DEFAULT_NEWS_FALLBACK_IMAGE,
} from '../../utils/contentFormatter';
import { ReaderPollWidget } from './ReaderPollWidget';
import { AIVoiceNewsPlayer } from './AIVoiceNewsPlayer';
import { AdSlotRenderer } from '../common/AdSlotRenderer';
import { ArticleContentRenderer } from '../common/ArticleContentRenderer';
import { WebPushPromptBanner } from './WebPushPromptBanner';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { PWAService } from '../../services/PWAService';
import { FirestoreNewsService } from '../../services/FirestoreNewsService';
import { KrishiMandiRatesWidget } from './KrishiMandiRatesWidget';
import { WhatsAppCommunityFloatingWidget } from './WhatsAppCommunityFloatingWidget';
import { InArticleWhatsAppBanner } from './InArticleWhatsAppBanner';
import { PublicDailyDigestCard } from './PublicDailyDigestCard';
import { LiveOpinionPollWidget } from './LiveOpinionPollWidget';
import { WebStoriesCarousel } from './WebStoriesCarousel';
import { LiveWeatherWidget } from './LiveWeatherWidget';
import { GovtSchemesFeedWidget } from './GovtSchemesFeedWidget';
import { DailyPanchangWidget } from './DailyPanchangWidget';
import { HyperlocalNewsFilterBar } from './HyperlocalNewsFilterBar';
import { GadchiroliTalukaSpotlight } from './GadchiroliTalukaSpotlight';
import { GADCHIROLI_SPOTLIGHT_STORIES } from '../../data/gadchiroliSpotlightData';
import { LiveBlogWidget } from './LiveBlogWidget';
import { NewsletterSubscriptionWidget } from './NewsletterSubscriptionWidget';
import {
  HomepageLayoutService,
  HomepageSectionConfig,
  HomepageSectionId,
} from '../../services/HomepageLayoutService';
import { HyperlocalNewsService } from '../../services/HyperlocalNewsService';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { ThemeService, ThemeMode } from '../../services/ThemeService';
import { Sparkles, Radio, Smartphone, CreditCard, Vote, CloudSun, PenTool, Landmark, Key, LogIn, Lock } from 'lucide-react';

// ⚡ On-Demand Lazy Loaded Views & Modals
const EPaperHubView = lazy(() =>
  import('./EPaperHubView').then((m) => ({ default: m.EPaperHubView }))
);
const PWAInstallModal = lazy(() =>
  import('./PWAInstallModal').then((m) => ({ default: m.PWAInstallModal }))
);
const MerchantAdBookingModal = lazy(() =>
  import('./MerchantAdBookingModal').then((m) => ({ default: m.MerchantAdBookingModal }))
);
const CitizenNewsSubmissionModal = lazy(() =>
  import('./CitizenNewsSubmissionModal').then((m) => ({ default: m.CitizenNewsSubmissionModal }))
);
const PortalLoginModal = lazy(() =>
  import('./PortalLoginModal').then((m) => ({ default: m.PortalLoginModal }))
);

export const PublicPortalView: React.FC = () => {
  const {
    posts,
    socialPosts,
    categories,
    ads,
    menus,
    pages,
    themeSettings,
    aiVoiceSettings,
    quickListenPost,
    setQuickListenPost,
    publicActiveCategorySlug,
    setPublicActiveCategorySlug,
    publicActivePostSlug,
    setPublicActivePostSlug,
    publicActivePageSlug,
    setPublicActivePageSlug,
    publicSearchQuery,
    setPublicSearchQuery,
    setPortalMode,
    addComment,
    comments,
    siteSettings,
  } = useApp();

  // Anti-Copy & Right-Click Plagiarism Protection Hook
  useEffect(() => {
    if (!siteSettings?.antiCopyProtection) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setCopyToast('© InfoNewsUpdate24: मजकूर किंवा फोटो कॉपी करण्यास सक्त मनाई आहे.');
      setTimeout(() => setCopyToast(''), 3000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'p')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        setCopyToast('© InfoNewsUpdate24: मजकूर किंवा कोड कॉपी करण्यास सक्त मनाई आहे.');
        setTimeout(() => setCopyToast(''), 3000);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [siteSettings?.antiCopyProtection]);

  const activeAnchor =
    GOOGLE_CONVERSATIONAL_VOICES.find((v) => v.id === aiVoiceSettings?.anchorId) ||
    GOOGLE_CONVERSATIONAL_VOICES[0];

  const { currentUser, isLoggedIn, logout } = useAuth();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [latestNewsViewMode, setLatestNewsViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [latestNewsSort, setLatestNewsSort] = useState<'LATEST' | 'POPULAR' | 'BREAKING'>('LATEST');
  const [visibleLatestCount, setVisibleLatestCount] = useState<number>(8);
  const [articleSearch, setArticleSearch] = useState('');
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [activeVideoModalPost, setActiveVideoModalPost] = useState<Post | null>(null);
  const [activeSocialMediaPost, setActiveSocialMediaPost] = useState<SocialMediaPost | null>(null);
  const [socialHubTab, setSocialHubTab] = useState<
    'ALL' | 'REELS' | 'LOCAL_GADCHIROLI' | 'TRENDING' | 'INSTAGRAM' | 'YOUTUBE' | 'FACEBOOK' | 'TWITTER'
  >('ALL');
  const [copyToast, setCopyToast] = useState('');
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenuIds, setExpandedMobileMenuIds] = useState<string[]>([]);
  const [isEPaperViewOpen, setIsEPaperViewOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('mode') === 'epaper';
    }
    return false;
  });
  const [isAdBookingModalOpen, setIsAdBookingModalOpen] = useState(false);
  const [isCitizenNewsModalOpen, setIsCitizenNewsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedTalukaId, setSelectedTalukaId] = useState<string | null>(null);

  // Dark Mode / Theme State
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => ThemeService.getTheme());

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail?.theme) setCurrentTheme(e.detail.theme);
    };
    window.addEventListener('infonews:theme-changed', handleThemeChange);
    return () => window.removeEventListener('infonews:theme-changed', handleThemeChange);
  }, []);

  const toggleDarkMode = () => {
    const next = ThemeService.toggleTheme();
    setCurrentTheme(next);
  };

  // Dynamic Homepage Layout Builder State
  const [homepageSections, setHomepageSections] = useState<HomepageSectionConfig[]>(() =>
    HomepageLayoutService.getSections()
  );

  // Single Article Reader State (Font Resizer & Likes)
  const [articleFontSize, setArticleFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [likedPostIds, setLikedPostIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('infonews_liked_posts') || '[]');
    } catch {
      return [];
    }
  });

  const handleToggleLike = (postId: string) => {
    setLikedPostIds((prev) => {
      let updated: string[];
      if (prev.includes(postId)) {
        updated = prev.filter((id) => id !== postId);
      } else {
        updated = [...prev, postId];
      }
      try {
        localStorage.setItem('infonews_liked_posts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState(false);
  const [asyncFetchedPost, setAsyncFetchedPost] = useState<Post | null>(null);
  const [isFetchingDirectPost, setIsFetchingDirectPost] = useState(false);

  // Published posts and pages only for public view (with fallback to all active posts)
  const publishedPosts = useMemo(
    () =>
      posts.filter(
        (p) => p.status === 'PUBLISHED' || !p.status || (p.status as string).toUpperCase() === 'PUBLISHED'
      ),
    [posts]
  );
  const publishedPages = useMemo(
    () => pages.filter((p) => p.status === 'PUBLISHED' || !p.status),
    [pages]
  );

  // Unified Route Navigators (Guarantees zero silent redirects & clean URLs)
  const navigateToPost = (slugOrPost: Post | string) => {
    const targetSlug = typeof slugOrPost === 'string' ? slugOrPost : slugOrPost.slug;
    if (!targetSlug) return;
    setPublicActivePostSlug(targetSlug.trim().toLowerCase());
    setPublicActiveCategorySlug(null);
    setPublicActivePageSlug(null);
    setIsEPaperViewOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (slug: string) => {
    if (!slug || slug === 'ALL' || slug === '/') {
      setPublicActiveCategorySlug(null);
      setActiveCategoryFilter('ALL');
    } else {
      const cleanSlug = slug.replace('/category/', '').trim().toLowerCase();
      setPublicActiveCategorySlug(cleanSlug);
      setActiveCategoryFilter(cleanSlug);
    }
    setPublicActivePostSlug(null);
    setPublicActivePageSlug(null);
    setIsEPaperViewOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPage = (slug: string) => {
    if (!slug) return;
    const cleanSlug = slug.replace('/page/', '').trim().toLowerCase();
    setPublicActivePageSlug(cleanSlug);
    setPublicActivePostSlug(null);
    setPublicActiveCategorySlug(null);
    setIsEPaperViewOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setPublicActivePostSlug(null);
    setPublicActiveCategorySlug(null);
    setPublicActivePageSlug(null);
    setActiveCategoryFilter('ALL');
    setIsEPaperViewOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedPost = useMemo(() => {
    if (!publicActivePostSlug) return null;
    const target = decodeURIComponent(publicActivePostSlug).trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    const cleanTargetNormalized = target.replace(/[^a-z0-9\u0900-\u097F]/gi, '');

    // 1. Direct slug or ID matching (case-insensitive)
    const matchPost = (p: Post) => {
      const pSlug = (p.slug || '').trim().toLowerCase().replace(/^\/+|\/+$/g, '');
      const pId = (p.id || '').trim().toLowerCase();
      const pSlugNormalized = pSlug.replace(/[^a-z0-9\u0900-\u097F]/gi, '');

      return (
        pSlug === target ||
        pId === target ||
        pId === `post-${target}` ||
        `post-${pId}` === target ||
        (cleanTargetNormalized.length >= 4 && pSlugNormalized === cleanTargetNormalized) ||
        (target.length > 6 && pSlug.includes(target)) ||
        (pSlug.length > 6 && target.includes(pSlug))
      );
    };

    const found = publishedPosts.find(matchPost) || posts.find(matchPost);
    if (found) return found;

    // 2. Check spotlight stories
    const spotlightMatch = GADCHIROLI_SPOTLIGHT_STORIES.find((s) => {
      const sSlug = (s.slug || '').trim().toLowerCase().replace(/^\/+|\/+$/g, '');
      const sId = (s.id || '').trim().toLowerCase();
      const sSlugNormalized = sSlug.replace(/[^a-z0-9\u0900-\u097F]/gi, '');
      return (
        sSlug === target ||
        sId === target ||
        (cleanTargetNormalized.length >= 4 && sSlugNormalized === cleanTargetNormalized)
      );
    });

    if (spotlightMatch) {
      return {
        id: spotlightMatch.id,
        title: spotlightMatch.title,
        slug: spotlightMatch.slug,
        content: spotlightMatch.fullBody,
        excerpt: spotlightMatch.excerpt,
        featuredImage: spotlightMatch.image,
        categoryId: 'cat-1-1',
        authorName: spotlightMatch.author,
        authorRole: 'REPORTER' as const,
        publishDate: '29 Aug 2026',
        status: 'PUBLISHED' as const,
        visibility: 'PUBLIC' as const,
        views: 2450,
        likes: 180,
        readingTimeMinutes: 3,
        isBreaking: false,
        isTrending: true,
        isFeatured: true,
        isVideoNews: false,
        tags: ['गडचिरोली', spotlightMatch.taluka],
        workflowHistory: [],
        createdAt: '2026-08-29T08:00:00Z',
        updatedAt: '2026-08-29T08:00:00Z',
      };
    }
    return null;
  }, [publicActivePostSlug, publishedPosts, posts]);

  const activeArticle = selectedPost || asyncFetchedPost;

  // Real-time direct Firestore fetch fallback for deep article links opened from cold cache
  useEffect(() => {
    if (!publicActivePostSlug) {
      setAsyncFetchedPost(null);
      setIsFetchingDirectPost(false);
      return;
    }

    if (selectedPost) {
      setAsyncFetchedPost(null);
      setIsFetchingDirectPost(false);
      return;
    }

    let isMounted = true;
    setIsFetchingDirectPost(true);

    FirestoreNewsService.getPostBySlugOrId(publicActivePostSlug)
      .then((cloudDoc) => {
        if (isMounted) {
          if (cloudDoc) {
            setAsyncFetchedPost(cloudDoc);
          }
          setIsFetchingDirectPost(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsFetchingDirectPost(false);
      });

    return () => {
      isMounted = false;
    };
  }, [publicActivePostSlug, selectedPost]);

  // Related / Recommended Stories for Single Article View
  const relatedPosts = useMemo(() => {
    if (!activeArticle) return [];
    return publishedPosts
      .filter((p) => p.id !== activeArticle.id)
      .filter(
        (p) =>
          p.categoryId === activeArticle.categoryId ||
          (Array.isArray(p.tags) &&
            Array.isArray(activeArticle.tags) &&
            p.tags.some((t) => activeArticle.tags.includes(t)))
      )
      .slice(0, 4);
  }, [activeArticle, publishedPosts]);

  const selectedPage = publicActivePageSlug
    ? (publishedPages.find((p) => (p.slug || '').toLowerCase() === publicActivePageSlug.toLowerCase()) ||
       pages.find((p) => (p.slug || '').toLowerCase() === publicActivePageSlug.toLowerCase()))
    : null;

  const breakingPost = publishedPosts.find((p) => p.isBreaking) || publishedPosts[0];
  const heroPosts = publishedPosts.slice(0, 5);
  const trendingPosts = publishedPosts.filter((p) => p.isTrending || p.views > 5000);

  // --- Universal Route & WordPress Legacy URL Resolver ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const resolveCurrentUrl = () => {
      const pathname = window.location.pathname.replace(/\/+$/, ''); // strip trailing slash
      const searchParams = new URLSearchParams(window.location.search);

      // 1. E-Paper Mode
      if (searchParams.get('mode') === 'epaper' || pathname === '/epaper') {
        setIsEPaperViewOpen(true);
        setPublicActivePostSlug(null);
        setPublicActiveCategorySlug(null);
        setPublicActivePageSlug(null);
        return;
      }

      // 2. Category Route (/category/slug or /category/slug/subslug or ?cat=xxx)
      if (pathname.startsWith('/category/')) {
        const catSlug = pathname.replace('/category/', '').split('/')[0];
        if (catSlug) {
          const cleanCatSlug = decodeURIComponent(catSlug).trim().toLowerCase();
          setPublicActiveCategorySlug(cleanCatSlug);
          setActiveCategoryFilter(cleanCatSlug);
          setPublicActivePostSlug(null);
          setPublicActivePageSlug(null);
          setIsEPaperViewOpen(false);
          return;
        }
      }

      // 3. Static Page Route (/page/slug)
      if (pathname.startsWith('/page/')) {
        const pageSlug = pathname.replace('/page/', '').split('/')[0];
        if (pageSlug) {
          const cleanPageSlug = decodeURIComponent(pageSlug).trim().toLowerCase();
          setPublicActivePageSlug(cleanPageSlug);
          setPublicActivePostSlug(null);
          setPublicActiveCategorySlug(null);
          setIsEPaperViewOpen(false);
          return;
        }
      }

      // 4. Single Article Route (/article/slug or WordPress /YYYY/MM/DD/slug or /slug)
      let postSlugCandidate = '';
      if (pathname.startsWith('/article/')) {
        postSlugCandidate = pathname.replace('/article/', '');
      } else if (pathname.match(/^\/\d{4}\/\d{2}\/(\d{2}\/)?([^\/]+)$/)) {
        // WordPress date permalink: /2024/05/20/post-slug/
        const parts = pathname.split('/').filter(Boolean);
        postSlugCandidate = parts[parts.length - 1];
      } else if (pathname.length > 1 && !pathname.includes('.') && !pathname.startsWith('/cms')) {
        // Direct slug format: /post-slug
        postSlugCandidate = pathname.replace(/^\//, '');
      }

      // 5. WordPress Query Param (?p=123 or ?post=xxx or ?article=xxx)
      const pParam = searchParams.get('p') || searchParams.get('post') || searchParams.get('article');
      if (pParam) {
        postSlugCandidate = pParam;
      }

      if (postSlugCandidate) {
        const cleanCandidate = decodeURIComponent(postSlugCandidate).trim().toLowerCase();
        if (cleanCandidate && cleanCandidate !== 'index.html') {
          setPublicActivePostSlug(cleanCandidate);
          setPublicActiveCategorySlug(null);
          setPublicActivePageSlug(null);
          setIsEPaperViewOpen(false);
          return;
        }
      }

      // 6. Home Root
      if (pathname === '' || pathname === '/') {
        setPublicActivePostSlug(null);
        setPublicActiveCategorySlug(null);
        setPublicActivePageSlug(null);
        setActiveCategoryFilter('ALL');
        setIsEPaperViewOpen(false);
      }
    };

    resolveCurrentUrl();

    const handlePopState = () => {
      resolveCurrentUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize browser address bar permalinks (pushState) and dynamic metadata whenever navigation state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setMetaTag = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        if (selector.startsWith('meta[name=')) {
          const name = selector.match(/meta\[name="([^"]+)"\]/)?.[1];
          if (name) {
            el = document.createElement('meta');
            el.setAttribute('name', name);
            document.head.appendChild(el);
          }
        } else if (selector.startsWith('meta[property=')) {
          const prop = selector.match(/meta\[property="([^"]+)"\]/)?.[1];
          if (prop) {
            el = document.createElement('meta');
            el.setAttribute('property', prop);
            document.head.appendChild(el);
          }
        } else if (selector.startsWith('link[rel=')) {
          el = document.createElement('link');
          el.setAttribute('rel', 'canonical');
          document.head.appendChild(el);
        }
      }
      if (el) {
        el.setAttribute(attr, value);
      }
    };

    if (publicActivePostSlug) {
      const targetPath = `/${publicActivePostSlug}/`;
      if (window.location.pathname !== targetPath && !window.location.pathname.includes(publicActivePostSlug)) {
        window.history.pushState({ postSlug: publicActivePostSlug }, '', targetPath);
      }
      if (selectedPost) {
        const metaTitle = selectedPost.seo?.seoTitle || selectedPost.title;
        const metaDesc = selectedPost.seo?.metaDescription || selectedPost.excerpt || selectedPost.title;
        const postUrl = `https://www.infonewsupdate24.com/${encodeURIComponent(selectedPost.slug)}/`;
        const postImg = selectedPost.featuredImage || 'https://www.infonewsupdate24.com/icon-512.svg';
        const postImgAlt = selectedPost.featuredImageAlt || selectedPost.title;

        document.title = `${metaTitle} | InfoNewsUpdate24`;
        setMetaTag('meta[name="description"]', 'content', metaDesc);
        setMetaTag('meta[property="og:title"]', 'content', metaTitle);
        setMetaTag('meta[property="og:description"]', 'content', metaDesc);
        setMetaTag('meta[property="og:url"]', 'content', postUrl);
        setMetaTag('meta[property="og:image"]', 'content', postImg);
        setMetaTag('meta[property="og:image:alt"]', 'content', postImgAlt);
        setMetaTag('meta[name="twitter:title"]', 'content', metaTitle);
        setMetaTag('meta[name="twitter:description"]', 'content', metaDesc);
        setMetaTag('meta[name="twitter:image"]', 'content', postImg);
        setMetaTag('link[rel="canonical"]', 'href', postUrl);
      }
    } else if (publicActiveCategorySlug) {
      const activeCat = categories.find((c) => c.slug === publicActiveCategorySlug || c.id === publicActiveCategorySlug);
      const targetPath = `/category/${publicActiveCategorySlug}/`;
      if (window.location.pathname !== targetPath && !window.location.pathname.includes(publicActiveCategorySlug)) {
        window.history.pushState({ categorySlug: publicActiveCategorySlug }, '', targetPath);
      }
      if (activeCat) {
        document.title = `${activeCat.name} | ताज्या मराठी बातम्या | InfoNewsUpdate24`;
        setMetaTag('link[rel="canonical"]', 'href', `https://www.infonewsupdate24.com/category/${publicActiveCategorySlug}/`);
      }
    } else if (publicActivePageSlug) {
      const activePage = pages.find((pg) => pg.slug === publicActivePageSlug);
      const targetPath = `/page/${publicActivePageSlug}/`;
      if (window.location.pathname !== targetPath && !window.location.pathname.includes(publicActivePageSlug)) {
        window.history.pushState({ pageSlug: publicActivePageSlug }, '', targetPath);
      }
      if (activePage) {
        document.title = `${activePage.title} | InfoNewsUpdate24`;
        setMetaTag('link[rel="canonical"]', 'href', `https://www.infonewsupdate24.com/page/${publicActivePageSlug}/`);
      }
    } else if (isEPaperViewOpen) {
      if (window.location.pathname !== '/epaper' && !window.location.search.includes('mode=epaper')) {
        window.history.pushState({ mode: 'epaper' }, '', '/epaper');
      }
      document.title = 'InfoNewsUpdate24 | डिजिटल ई-पेपर (E-Paper)';
      setMetaTag('link[rel="canonical"]', 'href', 'https://www.infonewsupdate24.com/epaper');
    } else {
      // ONLY push '/' when navigation state is explicitly in Home mode
      if (window.location.pathname !== '/' && window.location.pathname !== '' && !window.location.pathname.startsWith('/cms')) {
        window.history.pushState({}, '', '/');
      }
      document.title = 'InfoNewsUpdate24 | महाराष्ट्र व गडचिरोली ताज्या मराठी बातम्या | Breaking News Portal';

      // Restore default meta tags
      const defaultDesc = 'InfoNewsUpdate24 - गडचिरोली १२ तालुके, विदर्भ, महाराष्ट्र, राजकारण, कृषी उत्पन्न बाजारभाव, पंचांग, थेट हवामान आणि ताज्या घडामोडींचे अग्रगण्य डिजिटल न्यूज नेटवर्क.';
      const defaultTitle = 'InfoNewsUpdate24 | महाराष्ट्र व गडचिरोली ताज्या मराठी बातम्या | Breaking News Portal';
      const defaultUrl = 'https://www.infonewsupdate24.com/';
      const defaultImg = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&auto=format&fit=crop&q=80';

      setMetaTag('meta[name="description"]', 'content', defaultDesc);
      setMetaTag('meta[property="og:title"]', 'content', defaultTitle);
      setMetaTag('meta[property="og:description"]', 'content', defaultDesc);
      setMetaTag('meta[property="og:url"]', 'content', defaultUrl);
      setMetaTag('meta[property="og:image"]', 'content', defaultImg);
      setMetaTag('link[rel="canonical"]', 'href', defaultUrl);
    }
  }, [publicActivePostSlug, publicActiveCategorySlug, publicActivePageSlug, isEPaperViewOpen, selectedPost, categories, pages]);

  useEffect(() => {
    const handleLayoutUpdate = () => {
      setHomepageSections(HomepageLayoutService.getSections());
    };
    window.addEventListener('infonews:homepage-layout-updated', handleLayoutUpdate);
    return () =>
      window.removeEventListener('infonews:homepage-layout-updated', handleLayoutUpdate);
  }, []);

  // AI Voice State (Full Article Audio Speech Engine)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Live Header Clock
  const [headerLiveTime, setHeaderLiveTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setHeaderLiveTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getHeaderFormattedDate = () => {
    const daysMarathi = [
      'रविवार',
      'सोमवार',
      'मंगळवार',
      'बुधवार',
      'गुरुवार',
      'शुक्रवार',
      'शनिवार',
    ];
    const monthsMarathi = [
      'जानेवारी',
      'फेब्रुवारी',
      'मार्च',
      'एप्रिल',
      'मे',
      'जून',
      'जुलै',
      'ऑगस्ट',
      'सप्टेंबर',
      'ऑक्टोबर',
      'नोव्हेंबर',
      'डिसेंबर',
    ];
    const now = new Date();
    const dayName = daysMarathi[now.getDay()];
    const day = now.getDate();
    const month = monthsMarathi[now.getMonth()];
    const year = now.getFullYear();

    const format = themeSettings.headerDateFormat || 'marathi_with_time';

    if (format === 'english') {
      const enDate = now.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return themeSettings.showLiveClock ? `${enDate} | ${headerLiveTime}` : enDate;
    }

    if (format === 'marathi_with_tithi') {
      return `${dayName}, ${day} ${month} ${year} • भाद्रपद कृष्ण पक्ष`;
    }

    if (format === 'marathi_with_time') {
      return `${dayName}, ${day} ${month} ${year} | ${headerLiveTime || '०५:३० PM'}`;
    }

    return `${dayName}, ${day} ${month} ${year}`;
  };

  // Helper for menu item navigation
  const handleNavMenuItemClick = (item: any) => {
    setIsMobileMenuOpen(false);

    if (item.type === 'HOME' || item.url === '/') {
      navigateToHome();
      return;
    }

    if (item.type === 'PAGE' || item.url?.startsWith('/page/')) {
      const slug = item.url?.startsWith('/page/')
        ? item.url.replace('/page/', '')
        : item.slug || item.label.toLowerCase().replace(/\s+/g, '-');
      navigateToPage(slug);
      return;
    }

    if (item.type === 'CATEGORY' || item.url?.startsWith('/category/')) {
      const slug = item.url?.startsWith('/category/')
        ? item.url.replace('/category/', '')
        : item.slug || item.label.toLowerCase().replace(/\s+/g, '-');
      navigateToCategory(slug);
      return;
    }

    if (item.url?.startsWith('http')) {
      window.open(item.url, item.target || '_blank');
      return;
    }

    // Default fallback
    navigateToHome();
  };

  const primaryHeaderMenu = menus?.find((m) => m.id === 'menu-header-main') || menus?.[0];
  const navMenuItems = (primaryHeaderMenu?.items && primaryHeaderMenu.items.length > 0)
    ? primaryHeaderMenu.items
    : categories.filter((c) => !c.parentId).map((cat, idx) => ({
        id: cat.id,
        label: cat.name,
        type: 'CATEGORY' as const,
        url: `/category/${cat.slug}`,
        order: idx + 1,
        children: categories
          .filter((sub) => sub.parentId === cat.id)
          .map((sub, sIdx) => ({
            id: sub.id,
            label: sub.name,
            type: 'CATEGORY' as const,
            url: `/category/${sub.slug}`,
            order: sIdx + 1,
            parentId: cat.id,
          })),
      }));

  const getSubmenusForItem = (item: any) => {
    if (item.children && item.children.length > 0) {
      return item.children;
    }
    if (item.type === 'CATEGORY') {
      const catSlug = item.url?.startsWith('/category/')
        ? item.url.replace('/category/', '')
        : item.label.toLowerCase();
      const parentCat = categories.find(
        (c) => c.slug === catSlug || c.name.toLowerCase() === item.label.toLowerCase()
      );
      if (parentCat) {
        return categories
          .filter((c) => c.parentId === parentCat.id)
          .map((c, idx) => ({
            id: c.id,
            label: c.name,
            type: 'CATEGORY' as const,
            url: `/category/${c.slug}`,
            order: idx + 1,
          }));
      }
    }
    return [];
  };

  const isItemActive = (item: any, submenus: any[]) => {
    if (item.type === 'HOME' || item.url === '/') {
      return activeCategoryFilter === 'ALL' && !publicActivePostSlug;
    }
    const itemSlug = item.url?.replace('/category/', '');
    if (itemSlug && activeCategoryFilter === itemSlug) return true;
    return submenus.some((sub) => sub.url?.replace('/category/', '') === activeCategoryFilter);
  };

  // Filter posts by category, district, taluka, search & sort
  const filteredFeedPosts = publishedPosts
    .filter((p) => {
      if (activeCategoryFilter !== 'ALL') {
        const cat = categories.find((c) => c.slug === activeCategoryFilter || c.id === activeCategoryFilter);
        if (cat) {
          const childCatIds = (categories || []).filter((c) => c.parentId === cat.id).map((c) => c.id);
          const isMatch =
            p.categoryId === cat.id ||
            p.subCategoryId === cat.id ||
            childCatIds.includes(p.categoryId) ||
            (p.subCategoryId && childCatIds.includes(p.subCategoryId)) ||
            (Array.isArray(p.tags) && p.tags.some((t) => typeof t === 'string' && t.toLowerCase() === cat.slug.toLowerCase()));
          if (!isMatch) return false;
        } else {
          const isMatch =
            (Array.isArray(p.tags) && p.tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(activeCategoryFilter.toLowerCase()))) ||
            (typeof p.location === 'string' && p.location.toLowerCase().includes(activeCategoryFilter.toLowerCase()));
          if (!isMatch) return false;
        }
      }

      // Hyperlocal District & Gadchiroli Taluka Filter
      if (selectedDistrictId && selectedDistrictId !== 'ALL') {
        if (!HyperlocalNewsService.isPostMatchingLocation(p, selectedDistrictId, selectedTalukaId)) {
          return false;
        }
      }

      if (articleSearch && !matchNewsPost(p, articleSearch, categories)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (latestNewsSort === 'POPULAR') {
        return (b.views || 0) - (a.views || 0);
      }
      if (latestNewsSort === 'BREAKING') {
        if (a.isBreaking && !b.isBreaking) return -1;
        if (!a.isBreaking && b.isBreaking) return 1;
      }
      return 0;
    });

  // Top header banner ad
  const headerAd = ads.find((a) => a.position === 'HEADER' && a.status === 'ACTIVE');
  const sidebarAd = ads.find((a) => a.position === 'SIDEBAR_TOP' && a.status === 'ACTIVE');

  // AI Voice Article Reader Implementation
  const startVoiceReader = (post: Post) => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) {
        return;
      }

      window.speechSynthesis.cancel();

      // Prepare CLEAN article text: Title + Excerpt + Body content without rogue HTML or \n artifacts
      const cleanTitle = cleanTextForTTS(post.title);
      const cleanExp = cleanTextForTTS(cleanExcerpt(post.excerpt, post.content, 140));
      const cleanBody = cleanTextForTTS(post.content);
      const fullArticleNarrative = `${cleanTitle}। ठळक मुद्दे: ${cleanExp}। सविस्तर बातमी: ${cleanBody}`;

      const utterance = new SpeechSynthesisUtterance(fullArticleNarrative);
      utterance.lang = 'mr-IN'; // Marathi Indian voice
      utterance.rate = 0.92;

      // Fallback voice selection
      const voices = window.speechSynthesis.getVoices();
      const marathiVoice = voices.find((v) => v.lang.includes('mr') || v.lang.includes('hi'));
      if (marathiVoice) utterance.voice = marathiVoice;

      utterance.onstart = () => {
        setIsPlayingAudio(true);
        setIsAudioPaused(false);
      };

      utterance.onend = () => {
        setIsPlayingAudio(false);
        setIsAudioPaused(false);
        setAudioProgress(100);
      };

      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setIsAudioPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
    }
  };

  const togglePauseAudio = () => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      if (isAudioPaused) {
        window.speechSynthesis.resume();
        setIsAudioPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsAudioPaused(true);
      }
    } catch (err) {
      console.warn('Speech synthesis pause/resume error:', err);
    }
  };

  const stopAudio = () => {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (err) {
      console.warn('Speech synthesis cancel error:', err);
    }
    setIsPlayingAudio(false);
    setIsAudioPaused(false);
    setAudioProgress(0);
  };

  useEffect(() => {
    return () => {
      try {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // Safe cleanup
      }
    };
  }, []);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentText.trim() || !commentName.trim()) return;

    addComment({
      postId: selectedPost.id,
      postTitle: selectedPost.title,
      authorName: commentName,
      authorEmail: commentEmail || 'reader@example.com',
      authorAvatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      content: commentText,
      status: 'APPROVED',
    });

    setCommentText('');
    setCommentName('');
    setCommentEmail('');
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 4000);
  };

  // Section Renderer for Dynamic Drag & Drop Homepage Order
  const renderHomepageSection = (secId: HomepageSectionId) => {
    switch (secId) {
      case 'HERO_SHOWCASE':
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Main Feature Story (8 Cols) */}
            {heroPosts[0] && (
              <div
                className="group relative lg:col-span-8 rounded-2xl overflow-hidden shadow-md cursor-pointer bg-slate-900 flex flex-col justify-end min-h-[380px] sm:min-h-[440px]"
                onClick={() => navigateToPost(heroPosts[0].slug)}
              >
                <img
                  src={getSafeImageUrl(heroPosts[0].featuredImage)}
                  alt={heroPosts[0].title}
                  fetchPriority="high"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                  }}
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="relative p-6 sm:p-8 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-red-600 px-2.5 py-0.5 text-xs font-black text-white uppercase tracking-wider">
                      Breaking News
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {formatMarathiDate(heroPosts[0].publishDate || heroPosts[0].createdAt)} &bull; {heroPosts[0].readingTimeMinutes || 3} min read
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-3xl font-black text-white leading-tight group-hover:text-red-400 transition-colors">
                    {formatNewsTitle(heroPosts[0].title)}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                    {cleanExcerpt(heroPosts[0].excerpt, heroPosts[0].content, 180)}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToPost(heroPosts[0].slug);
                      }}
                      className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-md"
                    >
                      बातमी वाचा &rarr;
                    </button>
                    {aiVoiceSettings?.isEnabled !== false && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickListenPost(heroPosts[0]);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white transition-all cursor-pointer shadow-md"
                        title="पूर्ण बातमी ऐका (Play Full News)"
                      >
                        <Volume2 className="h-4 w-4 text-amber-300 animate-pulse" />
                        <span>पूर्ण बातमी ऐका</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4 Stacked Secondary Headlines (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-3.5">
              {heroPosts.slice(1, 5).map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigateToPost(post.slug)}
                  className="group flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:shadow-md transition-all cursor-pointer"
                >
                  <img
                    src={getSafeImageUrl(post.featuredImage)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width="96"
                    height="80"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                    }}
                    className="h-20 w-24 shrink-0 rounded-lg object-cover ring-1 border border-slate-200 bg-slate-100"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-red-600 line-clamp-2 leading-snug">
                      {formatNewsTitle(post.title)}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatMarathiDate(post.publishDate || post.createdAt)}
                      </span>
                      {aiVoiceSettings?.showSpeakerOnCards !== false && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickListenPost(post);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="पूर्ण बातमी ऐका (Play Full News)"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'WEB_STORIES':
        return <WebStoriesCarousel />;

      case 'LIVE_BLOG':
        return <LiveBlogWidget />;

      case 'MAIN_EDITORIAL_GRID':
        return (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* Left 8 Cols: Spotlight + Hyperlocal Filter + Latest News Grid */}
            <div className="lg:col-span-8 space-y-6">
              {/* 4.1. GADCHIROLI 12 TALUKAS LIVE SPOTLIGHT STRIP */}
              <GadchiroliTalukaSpotlight
                posts={publishedPosts}
                onSelectPost={(slug) => navigateToPost(slug)}
                onSelectTalukaFilter={(talukaId) => {
                  setSelectedDistrictId('gadchiroli');
                  setSelectedTalukaId(talukaId);
                }}
                onQuickListen={(post) => setQuickListenPost(post)}
              />

              {/* 4.2. HYPERLOCAL DISTRICT & GADCHIROLI TALUKA NEWS FILTER */}
              <HyperlocalNewsFilterBar
                posts={publishedPosts}
                selectedDistrictId={selectedDistrictId}
                selectedTalukaId={selectedTalukaId}
                onSelectDistrict={(distId) => {
                  setSelectedDistrictId(distId);
                  setSelectedTalukaId(null);
                }}
                onSelectTaluka={(talukaId) => {
                  setSelectedTalukaId(talukaId);
                }}
                onResetFilter={() => {
                  setSelectedDistrictId(null);
                  setSelectedTalukaId(null);
                }}
              />

              {/* Mid-Feed In-Between Banner / Billboard Ad Slot */}
              <AdSlotRenderer position="HOME_MIDDLE" />

              {/* 4.3. 2-COL FEATURE SPOTLIGHT STORIES IN EDITORIAL GRID */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 font-serif flex items-center gap-2">
                    <Flame className="h-4 w-4 text-red-600" />
                    <span>विशेष ग्राउंड रिपोर्ट व जिल्हा वार्ता (Feature Stories)</span>
                  </h3>
                  <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                    ग्राउंड रिपोर्ट
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {publishedPosts.slice(0, 4).map((post) => (
                    <div
                      key={`feat-${post.id}`}
                      onClick={() => navigateToPost(post.slug)}
                      className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-lg hover:border-red-300 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                          <img
                            src={getSafeImageUrl(post.featuredImage)}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                            }}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2.5 left-2.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 shadow-xs">
                            {categories.find((c) => c.id === post.categoryId)?.name || 'विशेष'}
                          </span>
                        </div>

                        <div className="p-4 space-y-1.5">
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-red-600 line-clamp-2 leading-snug font-serif">
                            {formatNewsTitle(post.title)}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {cleanExcerpt(post.excerpt, post.content, 120)}
                          </p>
                        </div>
                      </div>

                      <div className="px-4 pb-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-50 pt-2">
                        <span>{formatMarathiDate(post.publishDate || post.createdAt)}</span>
                        <div className="flex items-center gap-2">
                          {aiVoiceSettings?.showSpeakerOnCards !== false && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickListenPost(post);
                              }}
                              className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-2 py-0.5 rounded-md transition-all cursor-pointer"
                              title="पूर्ण बातमी ऐका"
                            >
                              <Volume2 className="h-3 w-3" />
                              <span>ऐका</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Sidebar Widgets (Trending + Mandi + Weather + Panchang + Opinion Poll) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Trending News */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Flame className="h-4 w-4 text-red-600" />
                  <h3 className="text-sm font-black text-slate-900 font-serif">ट्रेंडिंग बातम्या (Trending News)</h3>
                </div>

                <div className="space-y-3">
                  {trendingPosts.slice(0, 4).map((post, idx) => (
                    <div
                      key={post.id}
                      onClick={() => navigateToPost(post.slug)}
                      className="group flex items-start gap-3 cursor-pointer"
                    >
                      <span className="text-lg font-black text-slate-300 group-hover:text-red-600">
                        0{idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-red-600 line-clamp-2">
                          {formatNewsTitle(post.title)}
                        </p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatMarathiDate(post.publishDate || post.createdAt)}
                          </span>
                          {aiVoiceSettings?.showSpeakerOnCards !== false && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickListenPost(post);
                              }}
                              className="p-0.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="पूर्ण बातमी ऐका"
                            >
                              <Volume2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Reader Opinion Poll in Sidebar */}
              <LiveOpinionPollWidget />

                {/* 🎯 संपादकीय शिफारस व क्राईम डायरी (Editor's Choice & Crime Desk) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <h3 className="text-sm font-black text-slate-900 font-serif">
                        संपादक पसंती व क्राईम डायरी
                      </h3>
                    </div>
                    <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      Special
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {publishedPosts.slice(4, 7).map((post) => (
                      <div
                        key={`ed-pick-${post.id}`}
                        onClick={() => navigateToPost(post.slug)}
                        className="group flex gap-3 cursor-pointer items-start"
                      >
                        <img
                          src={getSafeImageUrl(post.featuredImage)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          width="80"
                          height="64"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                          }}
                          className="h-16 w-20 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-red-600 uppercase">
                            {categories.find((c) => c.id === post.categoryId)?.name || 'विशेष वृत्त'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 line-clamp-2 leading-snug">
                            {formatNewsTitle(post.title)}
                          </h4>
                          <span className="text-[10px] text-slate-400 mt-1">
                            {formatMarathiDate(post.publishDate || post.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ⚡ ५ मिनिटांत ५ वेगवान घडामोडी (Fast 5 Flash Updates) */}
                <div className="rounded-2xl border border-red-200 bg-linear-to-br from-red-50/70 to-amber-50/40 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-red-200 pb-2">
                    <span className="flex items-center gap-1.5 text-xs font-black text-red-950 font-serif">
                      <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
                      <span>⚡ ५ मिनिटांत ५ सुपरफास्ट बातम्या</span>
                    </span>
                    <span className="text-[10px] text-red-700 font-bold bg-white px-2 py-0.5 rounded border border-red-200">
                      Flash 5
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {publishedPosts.slice(7, 12).map((fp, fIdx) => (
                      <div
                        key={`flash-${fp.id}`}
                        onClick={() => navigateToPost(fp.slug)}
                        className="group flex items-baseline gap-2 cursor-pointer hover:bg-white/80 p-1.5 rounded-lg transition-colors"
                      >
                        <span className="text-red-600 font-black font-mono text-xs shrink-0">
                          0{fIdx + 1}.
                        </span>
                        <p className="text-[11px] font-bold text-slate-800 group-hover:text-red-600 line-clamp-1 leading-snug">
                          {formatNewsTitle(fp.title)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar Top Display Ad Slot */}
                <AdSlotRenderer position="SIDEBAR_TOP" />

                {/* Sidebar Bottom Sticky Ad Slot */}
                <AdSlotRenderer position="SIDEBAR_BOTTOM" />
              </div>
            </div>
          );

      case 'LATEST_NEWS_FEED':
        return (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Header & Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-red-600 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-red-600 animate-ping" />
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 font-serif flex items-center gap-2">
                  <span>ताज्या मराठी बातम्या (Latest News Feed)</span>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {filteredFeedPosts.length} बातम्या
                  </span>
                </h3>
              </div>

              {/* View Mode & Sorting Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Sort Filter */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setLatestNewsSort('LATEST')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      latestNewsSort === 'LATEST'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="सर्वात नवीन बातम्या"
                  >
                    ⏱️ नवीनतम
                  </button>
                  <button
                    type="button"
                    onClick={() => setLatestNewsSort('POPULAR')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      latestNewsSort === 'POPULAR'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="सर्वाधिक वाचलेल्या बातम्या"
                  >
                    🔥 लोकप्रिय
                  </button>
                  <button
                    type="button"
                    onClick={() => setLatestNewsSort('BREAKING')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      latestNewsSort === 'BREAKING'
                        ? 'bg-white text-red-600 shadow-xs'
                        : 'text-slate-600 hover:text-red-600'
                    }`}
                    title="फक्त ब्रेकिंग बातम्या"
                  >
                    ⚡ ब्रेकिंग
                  </button>
                </div>

                {/* Grid vs List View Switcher */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setLatestNewsViewMode('GRID')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      latestNewsViewMode === 'GRID'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="४-कॉलम ग्रिड व्ह्यू (Grid View)"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLatestNewsViewMode('LIST')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      latestNewsViewMode === 'LIST'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="क्लासिक वृत्तपत्र लिस्ट व्ह्यू (List View)"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Category Filter Pills (Full Width) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => {
                  navigateToCategory('ALL');
                  setVisibleLatestCount(8);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategoryFilter === 'ALL' || !publicActiveCategorySlug
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-red-50 hover:border-red-200'
                }`}
              >
                सर्व बातम्या (All)
              </button>

              {categories
                .filter((c) => !c.parentId)
                .map((cat) => {
                  const isActive =
                    activeCategoryFilter === cat.slug ||
                    activeCategoryFilter === cat.id ||
                    publicActiveCategorySlug === cat.slug ||
                    publicActiveCategorySlug === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        navigateToCategory(cat.slug || cat.id);
                        setVisibleLatestCount(8);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-red-50 hover:border-red-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
            </div>

            {/* Search feedback banner */}
            {articleSearch && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xs border border-slate-800 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-xs">
                    शोध निकाल: <strong className="text-red-400 font-bold">"{articleSearch}"</strong> &bull;{' '}
                    <span className="text-slate-300 font-semibold">{filteredFeedPosts.length} बातम्या</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setArticleSearch('')}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-red-600 px-2.5 py-1 rounded transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  <span>रद्द करा</span>
                </button>
              </div>
            )}

            {/* News Feed: Mode A (4-COLUMN FULL-WIDTH GRID) vs Mode B (FULL-WIDTH LIST) */}
            {filteredFeedPosts.length > 0 ? (
              <>
                {latestNewsViewMode === 'GRID' ? (
                  /* 4-COLUMN EXPANSIVE FULL-WIDTH GRID (No sidebar squeezing!) */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 items-start">
                    {filteredFeedPosts.slice(0, visibleLatestCount).map((post) => (
                      <div
                        key={post.id}
                        onClick={() => navigateToPost(post.slug)}
                        className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-xl hover:border-red-300 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                            <img
                              src={getSafeImageUrl(post.featuredImage)}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                              }}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Category Badge */}
                            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                              <span className="rounded-md bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2 py-0.5 shadow-sm">
                                {categories.find((c) => c.id === post.categoryId)?.name || 'ताज्या बातम्या'}
                              </span>
                              {post.isBreaking && (
                                <span className="rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 shadow-sm animate-pulse">
                                  ⚡ Breaking
                                </span>
                              )}
                            </div>

                            {post.isVideoNews && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-xl border-2 border-white">
                                  <Play className="h-4 w-4 fill-white ml-0.5" />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="p-4 space-y-2">
                            <h4 className="text-sm font-black text-slate-900 group-hover:text-red-600 line-clamp-2 leading-snug font-serif">
                              {formatNewsTitle(post.title)}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {cleanExcerpt(post.excerpt, post.content, 110)}
                            </p>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="px-4 pb-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-slate-500">{formatMarathiDate(post.publishDate || post.createdAt)}</span>
                            {post.readingTimeMinutes && (
                              <span className="hidden xl:inline">&bull; ⏱️ {post.readingTimeMinutes} मि.</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Direct WhatsApp Share Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const text = `*${post.title}*\n\n📰 InfoNewsUpdate24 बातमी वाचा:\nhttps://www.infonewsupdate24.com/news/${post.slug}`;
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                              }}
                              className="p-1 rounded-md text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                              title="WhatsApp वर बातमी शेअर करा"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </button>

                            {/* AI Voice Listen */}
                            {aiVoiceSettings?.showSpeakerOnCards !== false && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuickListenPost(post);
                                }}
                                className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-1.5 py-0.5 rounded-md transition-all cursor-pointer shadow-2xs"
                                title="पूर्ण बातमी ऐका (Play News)"
                              >
                                <Volume2 className="h-3 w-3" />
                                <span>ऐका</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* FULL-WIDTH CLASSIC BROADSHEET 1-COLUMN LIST VIEW */
                  <div className="space-y-3.5">
                    {filteredFeedPosts.slice(0, visibleLatestCount).map((post) => (
                      <div
                        key={post.id}
                        onClick={() => navigateToPost(post.slug)}
                        className="group flex flex-col sm:flex-row gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-xl hover:border-red-300 transition-all duration-300 cursor-pointer"
                      >
                        <div className="relative h-44 sm:h-32 sm:w-56 shrink-0 rounded-xl overflow-hidden bg-slate-100">
                          <img
                            src={getSafeImageUrl(post.featuredImage)}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                            }}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {post.isVideoNews && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-md">
                                <Play className="h-4 w-4 fill-white ml-0.5" />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-red-50 text-red-700 text-[10px] font-black uppercase px-2 py-0.5">
                                {categories.find((c) => c.id === post.categoryId)?.name || 'ताज्या बातम्या'}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {formatMarathiDate(post.publishDate || post.createdAt)} &bull; ⏱️ {post.readingTimeMinutes || 2} मि. वाचन
                              </span>
                            </div>
                            <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-red-600 line-clamp-2 leading-snug font-serif">
                              {formatNewsTitle(post.title)}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                              {cleanExcerpt(post.excerpt, post.content, 180)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                            <span className="font-medium text-slate-500">
                              वार्ताहर: {post.authorName || 'InfoNews Desk'}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const text = `*${post.title}*\n\n📰 InfoNewsUpdate24 बातमी वाचा:\nhttps://www.infonewsupdate24.com/news/${post.slug}`;
                                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="p-1 rounded-md text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                                title="WhatsApp वर शेअर करा"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                              </button>

                              {aiVoiceSettings?.showSpeakerOnCards !== false && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuickListenPost(post);
                                  }}
                                  className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-2 py-0.5 rounded-md transition-all cursor-pointer"
                                  title="पूर्ण बातमी ऐका"
                                >
                                  <Volume2 className="h-3 w-3" />
                                  <span>ऐका</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* LOAD MORE STORIES BUTTON */}
                {filteredFeedPosts.length > visibleLatestCount && (
                  <div className="text-center pt-3">
                    <button
                      type="button"
                      onClick={() => setVisibleLatestCount((prev) => prev + 8)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-red-600 text-slate-800 hover:text-white border-2 border-slate-200 hover:border-red-600 px-7 py-3.5 text-xs font-bold transition-all duration-200 shadow-xs hover:shadow-lg cursor-pointer"
                    >
                      <span>आणखी ताज्या बातम्या लोड करा (Load More Stories ⬇️)</span>
                      <span className="rounded-full bg-red-100 group-hover:bg-white/20 text-red-700 px-2 py-0.5 text-[10px] font-mono">
                        + {filteredFeedPosts.length - visibleLatestCount} बातम्या
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-xs">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Search className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    कोणतीही बातमी सापडली नाही / No news articles found
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    {articleSearch
                      ? `"${articleSearch}" या शोधशब्दासाठी कोणतीही बातमी उपलब्ध नाही.`
                      : 'या विभागात सध्या कोणतीही बातमी उपलब्ध नाही.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'MAHARASHTRA_MAGAZINE_GRID':
        return (
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-900 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white text-xs font-black shadow-xs">
                    🎭
                  </span>
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 font-serif">
                    मनोरंजन, क्रीडांगण व तंत्रज्ञान कट्टा (Special Magazine Desk)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  सिनेमा-बॉलीवूड, क्रिकेट-आयपीएल व सायबर-टेक विश्वातील खास बातमी संग्रह
                </p>
              </div>

              <span className="rounded-full bg-slate-900 text-amber-400 px-3 py-1 text-[11px] font-black uppercase self-start sm:self-auto shadow-xs">
                Magazine Hub
              </span>
            </div>

            {/* 3 Columns for Entertainment, Sports & Tech */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Col 1: Entertainment & Cinema */}
              <div className="rounded-2xl border border-pink-200/80 bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b-2 border-pink-500 pb-2">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span className="text-pink-600">🎬</span>
                    <span>मनोरंजन व सिनेमा (Entertainment)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded">
                    बॉलीवूड
                  </span>
                </div>

                {publishedPosts[0] && (
                  <div
                    onClick={() => navigateToPost(publishedPosts[0].slug)}
                    className="group space-y-2.5 cursor-pointer"
                  >
                    <div className="relative h-40 w-full rounded-xl overflow-hidden">
                      <img
                        src={getSafeImageUrl(publishedPosts[0].featuredImage)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                        }}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 left-2 rounded bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5">
                        {publishedPosts[0].publishDate}
                      </span>
                    </div>
                    <h5 className="text-xs font-black text-slate-900 group-hover:text-pink-600 line-clamp-2 leading-snug font-serif">
                      {formatNewsTitle(publishedPosts[0].title)}
                    </h5>
                  </div>
                )}

                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  {publishedPosts.slice(1, 3).map((p) => (
                    <div
                      key={`ent-sub-${p.id}`}
                      onClick={() => navigateToPost(p.slug)}
                      className="group flex items-start gap-2.5 cursor-pointer"
                    >
                      <span className="text-pink-600 font-bold text-xs mt-0.5">&bull;</span>
                      <p className="text-[11px] font-bold text-slate-700 group-hover:text-pink-600 line-clamp-2 leading-snug">
                        {formatNewsTitle(p.title)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 2: Sports & Cricket */}
              <div className="rounded-2xl border border-emerald-200/80 bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b-2 border-emerald-500 pb-2">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span className="text-emerald-600">🏏</span>
                    <span>क्रीडांगण व क्रिकेट (Sports Hub)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    IPL & Sports
                  </span>
                </div>

                {publishedPosts[1] && (
                  <div
                    onClick={() => navigateToPost(publishedPosts[1].slug)}
                    className="group space-y-2.5 cursor-pointer"
                  >
                    <div className="relative h-40 w-full rounded-xl overflow-hidden">
                      <img
                        src={getSafeImageUrl(publishedPosts[1].featuredImage)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                        }}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 left-2 rounded bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5">
                        {publishedPosts[1].publishDate}
                      </span>
                    </div>
                    <h5 className="text-xs font-black text-slate-900 group-hover:text-emerald-600 line-clamp-2 leading-snug font-serif">
                      {formatNewsTitle(publishedPosts[1].title)}
                    </h5>
                  </div>
                )}

                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  {publishedPosts.slice(3, 5).map((p) => (
                    <div
                      key={`spt-sub-${p.id}`}
                      onClick={() => navigateToPost(p.slug)}
                      className="group flex items-start gap-2.5 cursor-pointer"
                    >
                      <span className="text-emerald-600 font-bold text-xs mt-0.5">&bull;</span>
                      <p className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-600 line-clamp-2 leading-snug">
                        {formatNewsTitle(p.title)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 3: Tech & Automobile */}
              <div className="rounded-2xl border border-sky-200/80 bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b-2 border-sky-500 pb-2">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span className="text-sky-600">💡</span>
                    <span>तंत्रज्ञान व ऑटोमोबाईल (Tech & Auto)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                    Gadgets & EV
                  </span>
                </div>

                {publishedPosts[2] && (
                  <div
                    onClick={() => navigateToPost(publishedPosts[2].slug)}
                    className="group space-y-2.5 cursor-pointer"
                  >
                    <div className="relative h-40 w-full rounded-xl overflow-hidden">
                      <img
                        src={getSafeImageUrl(publishedPosts[2].featuredImage)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                        }}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 left-2 rounded bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5">
                        {publishedPosts[2].publishDate}
                      </span>
                    </div>
                    <h5 className="text-xs font-black text-slate-900 group-hover:text-sky-600 line-clamp-2 leading-snug font-serif">
                      {formatNewsTitle(publishedPosts[2].title)}
                    </h5>
                  </div>
                )}

                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  {publishedPosts.slice(5, 7).map((p) => (
                    <div
                      key={`tch-sub-${p.id}`}
                      onClick={() => navigateToPost(p.slug)}
                      className="group flex items-start gap-2.5 cursor-pointer"
                    >
                      <span className="text-sky-600 font-bold text-xs mt-0.5">&bull;</span>
                      <p className="text-[11px] font-bold text-slate-700 group-hover:text-sky-600 line-clamp-2 leading-snug">
                        {formatNewsTitle(p.title)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'PHOTO_FEATURE_GALLERY':
        return (
          <div className="rounded-3xl border border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-zinc-900 text-white p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-tr from-amber-500 to-red-600 text-slate-950 font-black shadow-md">
                    📸
                  </span>
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white font-serif">
                    विशेष ग्राउंड फोटो गॅलरी (Photojournalism of the Day)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  गडचिरोली जिल्हा व महाराष्ट्रातील प्रभावी छायाचित्रे व व्हिज्युअल क्षणचित्रे
                </p>
              </div>

              <span className="rounded-full bg-red-600 text-white px-3 py-1 text-[11px] font-black uppercase self-start sm:self-auto shadow-md">
                Lens & Ground
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'हेमलकसा लोकबिरादरी व निसर्ग सौंदर्य',
                  loc: 'भामरागड',
                  img: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop&q=80',
                  by: 'छायाचित्रकार: राहुल मेश्राम',
                },
                {
                  title: 'प्राणहिता व गोदावरी नदीसंगम जलप्रकल्प',
                  loc: 'सिरोंचा',
                  img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
                  by: 'छायाचित्रकार: प्रशांत आत्राम',
                },
                {
                  title: 'धान कापणी व शेती कामे जोरात सुरू',
                  loc: 'चामोर्शी',
                  img: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
                  by: 'छायाचित्रकार: महेश गायकवाड',
                },
                {
                  title: 'गडचिरोली लोहप्रकल्प व औद्योगिक विकास',
                  loc: 'गडचिरोली शहर',
                  img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
                  by: 'छायाचित्रकार: संजय कोरे',
                },
              ].map((pic, pIdx) => (
                <div
                  key={`photo-${pIdx}`}
                  className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md cursor-pointer flex flex-col justify-end min-h-[220px]"
                >
                  <img
                    src={pic.img}
                    alt={pic.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                  <div className="relative p-3.5 space-y-1.5">
                    <span className="rounded bg-amber-500/90 text-slate-950 text-[10px] font-black px-2 py-0.5 inline-block">
                      📍 {pic.loc}
                    </span>
                    <h5 className="text-xs font-bold text-white group-hover:text-amber-300 line-clamp-2 leading-snug font-serif">
                      {pic.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 block">
                      {pic.by}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'DAILY_PANCHANG':
        return (
          <div className="w-full">
            <DailyPanchangWidget />
          </div>
        );

      case 'LIVE_WEATHER':
        return (
          <div className="w-full">
            <LiveWeatherWidget />
          </div>
        );

      case 'KRISHI_MANDI_RATES':
        return (
          <div className="w-full">
            <KrishiMandiRatesWidget />
          </div>
        );

      case 'GOVT_SCHEMES':
        return (
          <div className="w-full">
            <GovtSchemesFeedWidget />
          </div>
        );

      case 'DAILY_DIGEST':
        return (
          <div className="w-full">
            <PublicDailyDigestCard />
          </div>
        );

      case 'SOCIAL_MEDIA_REELS': {
        const filteredSocial = (socialPosts || []).filter((post) => {
          if (post.status !== 'PUBLISHED') return false;
          if (socialHubTab === 'ALL') return true;
          if (socialHubTab === 'REELS') return post.mediaType === 'REEL' || post.mediaType === 'SHORT' || post.isFeaturedReel;
          if (socialHubTab === 'LOCAL_GADCHIROLI') {
            const loc = (post.location || '').toLowerCase();
            const cat = (post.category || '').toLowerCase();
            const tit = (post.title || '').toLowerCase();
            return (
              loc.includes('gadchiroli') ||
              loc.includes('गडचिरोली') ||
              cat.includes('गडचिरोली') ||
              tit.includes('गडचिरोली') ||
              loc.includes('चामोर्शी') ||
              loc.includes('अहेरी')
            );
          }
          if (socialHubTab === 'TRENDING') return post.isFeaturedReel || (post.views || 0) >= 1000;
          if (socialHubTab === 'INSTAGRAM') return post.platform === 'INSTAGRAM';
          if (socialHubTab === 'YOUTUBE') return post.platform === 'YOUTUBE';
          if (socialHubTab === 'FACEBOOK') return post.platform === 'FACEBOOK';
          if (socialHubTab === 'TWITTER') return post.platform === 'TWITTER';
          return true;
        });

        const verticalReels = filteredSocial.filter(
          (p) => p.mediaType === 'REEL' || p.mediaType === 'SHORT' || p.isFeaturedReel
        );
        const landscapeVideos = filteredSocial.filter(
          (p) => p.mediaType !== 'REEL' && p.mediaType !== 'SHORT' && !p.isFeaturedReel
        );

        return (
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white p-6 sm:p-8 space-y-7 shadow-2xl">
            {/* Header with neon icon, title & count */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-600 to-amber-500 shadow-lg ring-2 ring-pink-500/30">
                  <Film className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white font-serif">
                      सोशल मीडिया, रील्स व व्हिडिओ हब
                    </h3>
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase text-white animate-pulse">
                      HD Media
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Instagram Reels (9:16), YouTube Shorts, Facebook Watch व स्थानिक ग्राउंड वार्ता
                  </p>
                </div>
              </div>

              {/* Enhanced Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold shadow-inner">
                {[
                  { key: 'ALL', label: 'सर्व (All)' },
                  { key: 'REELS', label: '📱 ९:१६ रील्स' },
                  { key: 'LOCAL_GADCHIROLI', label: '📍 गडचिरोली स्थानिक' },
                  { key: 'TRENDING', label: '🔥 ट्रेंडिंग' },
                  { key: 'INSTAGRAM', label: '📸 Instagram' },
                  { key: 'YOUTUBE', label: '▶ YouTube' },
                  { key: 'FACEBOOK', label: '📘 Facebook' },
                  { key: 'TWITTER', label: '𝕏 Twitter' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSocialHubTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      socialHubTab === tab.key
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md font-black'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredSocial.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <Film className="mx-auto h-10 w-10 text-slate-600" />
                <p className="text-sm font-bold text-slate-300">कोणतीही सोशल रील किंवा व्हिडिओ पोस्ट उपलब्ध नाही</p>
                <p className="text-xs text-slate-500">CMS पॅनेलमधून नवीन Instagram किंवा YouTube लिंक्स जोडा.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* TIER 1: 9:16 VERTICAL REELS SHOWCASE TRAY */}
                {verticalReels.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-pink-500 animate-ping" />
                        <h4 className="text-sm sm:text-base font-black text-white font-serif flex items-center gap-1.5">
                          <span>📱 सुपरफास्ट ९:१६ रील्स कट्टा</span>
                          <span className="text-[11px] font-normal text-slate-400">({verticalReels.length} रील्स उपलब्ध)</span>
                        </h4>
                      </div>
                      <span className="text-xs text-pink-400 font-bold hidden sm:inline">
                        क्लिक करून थेट ९:१६ मध्ये प्ले करा &rarr;
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start">
                      {verticalReels.map((post) => (
                        <SocialMediaCard
                          key={post.id}
                          post={post}
                          onPlay={(p) => setActiveSocialMediaPost(p)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* TIER 2: 16:9 LANDSCAPE VIDEO REPORTS & THEATER GRID */}
                {landscapeVideos.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm sm:text-base font-black text-white font-serif flex items-center gap-2">
                        <span>🎬 विशेष व्हिडिओ रिपोर्ट्स व ग्राउंड वार्ता (16:9)</span>
                        <span className="text-[11px] font-normal text-slate-400">({landscapeVideos.length} व्हिडिओ)</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                      {landscapeVideos.map((post) => (
                        <SocialMediaCard
                          key={post.id}
                          post={post}
                          onPlay={(p) => setActiveSocialMediaPost(p)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      case 'NEWSLETTER_SUBSCRIPTION':
        return <NewsletterSubscriptionWidget />;

      default:
        return null;
    }
  };

  // If in Digital E-Paper Hub Mode
  if (isEPaperViewOpen) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mb-3" />
            <p className="text-sm font-semibold text-slate-300">ई-पेपर डिजिटल आवृत्ती उघडत आहे...</p>
          </div>
        }
      >
        <EPaperHubView onBackToPortal={() => setIsEPaperViewOpen(false)} />
      </Suspense>
    );
  }

  return (
    <div id="public-portal-root" className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* 1. TOP UTILITY BAR (Date, Breaking News, Social Links, CMS Switcher) */}
      <div className="bg-[#1e293b] text-slate-200 text-xs py-1.5 px-3 sm:px-8 border-b border-slate-800 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Header Date & Live Clock */}
            {themeSettings.showHeaderDate && (
              <span className="font-semibold text-slate-300 flex items-center gap-1 shrink-0 text-[10px] sm:text-xs">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500" />
                <span>{getHeaderFormattedDate()}</span>
              </span>
            )}

            {/* Breaking News Ticker Bar */}
            {themeSettings.showBreakingNews && breakingPost && (
              <div className="hidden lg:flex items-center gap-2 overflow-hidden max-w-sm">
                <span
                  className="rounded px-1.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shrink-0 shadow-xs"
                  style={{ backgroundColor: themeSettings.breakingNewsBadgeColor || '#dc2626' }}
                >
                  {themeSettings.breakingNewsLabel || 'Breaking'}
                </span>
                <span
                  onClick={() => navigateToPost(breakingPost.slug)}
                  className="truncate text-slate-300 hover:text-white cursor-pointer text-xs font-medium"
                >
                  {breakingPost.title}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Header Social Icons (Hidden on Mobile & Tablet, shown on Desktop) */}
            {themeSettings.showHeaderSocialIcons && (
              <div className="hidden xl:flex items-center gap-2 text-slate-400">
                {themeSettings.enabledSocialPlatforms?.facebook && themeSettings.socialLinks?.facebook && (
                  <a
                    href={themeSettings.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors p-0.5"
                    title="Facebook"
                  >
                    <Facebook className="h-3.5 w-3.5" />
                  </a>
                )}
                {themeSettings.enabledSocialPlatforms?.twitter && themeSettings.socialLinks?.twitter && (
                  <a
                    href={themeSettings.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sky-400 transition-colors p-0.5"
                    title="Twitter / X"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                  </a>
                )}
                {themeSettings.enabledSocialPlatforms?.instagram && themeSettings.socialLinks?.instagram && (
                  <a
                    href={themeSettings.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-400 transition-colors p-0.5"
                    title="Instagram"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                  </a>
                )}
                {themeSettings.enabledSocialPlatforms?.youtube && themeSettings.socialLinks?.youtube && (
                  <a
                    href={themeSettings.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-500 transition-colors p-0.5"
                    title="YouTube"
                  >
                    <Youtube className="h-3.5 w-3.5" />
                  </a>
                )}
                {themeSettings.enabledSocialPlatforms?.whatsapp && themeSettings.socialLinks?.whatsapp && (
                  <a
                    href={themeSettings.socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors p-0.5"
                    title="WhatsApp Channel"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* PWA Mobile App Install Quick Button */}
            <button
              type="button"
              onClick={() => PWAService.promptInstall(() => setIsPWAInstallModalOpen(true))}
              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-black text-white shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
              title="मोफत मोबाईल ॲप इन्स्टॉल करा"
            >
              <Smartphone className="h-3 w-3 animate-pulse" />
              <span className="hidden xs:inline">📲 ॲप इन्स्टॉल</span>
              <span className="xs:hidden">📲 ॲप</span>
            </button>

            {/* E-Paper Quick Switch (Hidden on small mobile) */}
            <button
              type="button"
              onClick={() => setIsEPaperViewOpen(true)}
              className="hidden sm:flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-black text-slate-950 shadow-xs hover:bg-amber-400 transition-colors cursor-pointer shrink-0"
            >
              <Newspaper className="h-3 w-3" />
              <span>ई-पेपर</span>
            </button>

            {/* Dark / Light Mode Switcher (Hidden on small mobile) */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`hidden md:flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition-all cursor-pointer shadow-xs shrink-0 ${
                currentTheme === 'dark'
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 ring-1 ring-amber-300'
                  : 'bg-slate-700/80 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-600'
              }`}
              title={currentTheme === 'dark' ? 'डे मोड (Light Mode)' : 'नाईट मोड (Dark Mode)'}
            >
              {currentTheme === 'dark' ? (
                <>
                  <Sun className="h-3 w-3 text-amber-950" />
                  <span>डे मोड</span>
                </>
              ) : (
                <>
                  <Moon className="h-3 w-3 text-amber-300" />
                  <span>नाईट मोड</span>
                </>
              )}
            </button>

            {/* Multi-Language Switcher (TopBar) */}
            <LanguageSwitcher variant="topbar" />

            {/* Quick Switch to CMS Admin Panel (Staff only) */}
            {isLoggedIn && currentUser && currentUser.role !== 'USER' && currentUser.id !== 'guest-reader' && (
              <button
                id="btn-switch-to-cms"
                type="button"
                onClick={() => setPortalMode('CMS')}
                className="hidden sm:flex items-center gap-1 rounded-lg bg-red-600/90 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-white shadow-xs hover:bg-red-600 transition-colors cursor-pointer shrink-0"
              >
                <Layers className="h-3 w-3" />
                <span>CMS</span>
              </button>
            )}

            {/* User Account / Login Button */}
            {isLoggedIn && currentUser && currentUser.id !== 'guest-reader' ? (
              <div className="relative group shrink-0">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-white shadow-xs transition cursor-pointer"
                  title="वापरकर्ता प्रोफाइल व मेन्यू"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    loading="lazy"
                    decoding="async"
                    width="14"
                    height="14"
                    className="w-3.5 h-3.5 rounded-full object-cover border border-slate-400 shrink-0"
                  />
                  <span className="truncate max-w-[45px] xs:max-w-[70px]">{currentUser.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Secure Session Dropdown */}
                <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block w-52 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in">
                  <div className="px-2.5 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email || currentUser.phone || 'नोंदणीकृत वापरकर्ता'}</p>
                    <span className="inline-block mt-1 text-[9px] font-black bg-red-600/90 text-white px-2 py-0.5 rounded">
                      {currentUser.role === 'USER' ? 'वाचक सदस्य' : currentUser.role}
                    </span>
                  </div>
                  {currentUser.role !== 'USER' && (
                    <button
                      type="button"
                      onClick={() => setPortalMode('CMS')}
                      className="w-full text-left px-2 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2 mt-1 cursor-pointer font-semibold"
                    >
                      <Layers className="w-3.5 h-3.5 text-red-400" />
                      <span>CMS डॅशबोर्ड उघडा</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setPortalMode('PUBLIC');
                    }}
                    className="w-full text-left px-2 py-2 text-xs text-red-400 hover:bg-red-950/40 rounded-lg flex items-center gap-2 mt-1 cursor-pointer font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>लॉगआउट (Sign Out)</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="btn-portal-login"
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-white shadow-xs transition cursor-pointer shrink-0"
                title="संपादकीय मंडळ किंवा वाचक म्हणून लॉगिन करा"
              >
                <LogIn className="h-3 w-3 text-yellow-300" />
                <span>लॉगिन</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN PORTAL HEADER (Logo, Leaderboard Banner Ad, Live TV Button) */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setPublicActivePostSlug(null);
              setPublicActiveCategorySlug(null);
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white font-black shadow-md text-xl">
              24
            </div>
            <div>
              <div className="flex items-center text-2xl font-black tracking-tight text-slate-900 uppercase">
                <span>info</span>
                <span className="text-red-600">News</span>
                <span className="ml-1 text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded font-black">
                  UPDATE24
                </span>
              </div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {themeSettings.siteTagline}
              </p>
            </div>
          </div>

          {/* Header Ad or Live TV & E-Paper Action */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:block max-w-md">
              <AdSlotRenderer position="HEADER" className="my-0 border-0 shadow-none" />
            </div>

            {/* Send News / Citizen Journalism Button */}
            <button
              type="button"
              onClick={() => setIsCitizenNewsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-3.5 py-2.5 text-xs font-bold text-red-700 shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="तुमच्या परिसरातील बातमी थेट संपादकांना पाठवा"
            >
              <PenTool className="h-3.5 w-3.5 text-red-600" />
              <span className="hidden sm:inline">बातमी पाठवा</span>
            </button>

            {/* Book Ad Button */}
            <button
              type="button"
              onClick={() => setIsAdBookingModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="स्थानिक व्यापारी जाहिरात द्या"
            >
              <CreditCard className="h-4 w-4 text-red-600" />
              <span className="hidden sm:inline">जाहिरात द्या</span>
            </button>

            {/* Today's E-Paper Button */}
            <button
              type="button"
              onClick={() => setIsEPaperViewOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-amber-200 transition-transform active:scale-95 uppercase tracking-wider cursor-pointer"
            >
              <Newspaper className="h-4 w-4" />
              <span>आजचा ई-पेपर</span>
            </button>

            {themeSettings.showLiveTvButton && (
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-red-700 transition-transform active:scale-95 uppercase tracking-wider animate-pulse cursor-pointer"
              >
                <Tv className="h-4 w-4" />
                <span>Live TV</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. DYNAMIC INFONEWSUPDATE24 NAVIGATION BAR WITH HOVER SUBMENUS */}
      <nav className="bg-[#0f172a] text-white sticky top-0 z-40 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Desktop Navigation Items with Hover Submenus */}
          <div className="hidden md:flex items-center text-xs font-bold">
            {navMenuItems.map((item) => {
              const submenus = getSubmenusForItem(item);
              const hasSubmenus = submenus.length > 0;
              const active = isItemActive(item, submenus);

              return (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => handleNavMenuItemClick(item)}
                    className={`flex items-center gap-1.5 px-3.5 py-3.5 uppercase tracking-wider text-xs font-bold transition-all ${
                      active
                        ? 'bg-red-600 text-white'
                        : 'text-slate-200 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {hasSubmenus && (
                      <ChevronDown className="h-3 w-3 opacity-70 group-hover:rotate-180 group-hover:opacity-100 transition-transform duration-200" />
                    )}
                  </button>

                  {/* Desktop Dropdown Menu on Hover */}
                  {hasSubmenus && (
                    <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 -translate-y-1 transition-all duration-200 ease-out z-50 min-w-[230px] pointer-events-none group-hover:pointer-events-auto">
                      <div className="rounded-xl border border-slate-700/90 bg-[#0f172a] shadow-2xl p-1.5 backdrop-blur-md ring-1 ring-black/40">
                        <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800/80 flex items-center justify-between">
                          <span>{item.label} उप-विभाग</span>
                          <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-mono">
                            {submenus.length}
                          </span>
                        </div>
                        <div className="py-1 space-y-0.5 max-h-72 overflow-y-auto">
                          {submenus.map((sub: any) => {
                            const isSubActive =
                              sub.url?.replace('/category/', '') === activeCategoryFilter;
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavMenuItemClick(sub);
                                }}
                                className={`flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left group/sub ${
                                  isSubActive
                                    ? 'bg-red-600 text-white font-bold'
                                    : 'text-slate-200 hover:bg-red-600 hover:text-white'
                                }`}
                              >
                                <span>{sub.label}</span>
                                <ChevronRight
                                  className={`h-3 w-3 transition-transform ${
                                    isSubActive
                                      ? 'text-white'
                                      : 'opacity-40 group-hover/sub:opacity-100 group-hover/sub:translate-x-0.5'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Direct Digital E-Paper Nav Tab */}
            <button
              type="button"
              onClick={() => setIsEPaperViewOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-3.5 uppercase tracking-wider text-xs font-black text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer bg-slate-950/40"
            >
              <Newspaper className="h-3.5 w-3.5 text-amber-400" />
              <span>ई-पेपर (E-Paper)</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex md:hidden items-center py-2 gap-2">
            <button
              type="button"
              onClick={() => setIsEPaperViewOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-black text-slate-950 shadow-xs"
            >
              <Newspaper className="h-3.5 w-3.5" />
              <span>ई-पेपर</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-red-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span>{isMobileMenuOpen ? 'Close' : 'मेन्यू'}</span>
            </button>

            {activeCategoryFilter !== 'ALL' && (
              <span className="rounded bg-red-600/90 px-2 py-1 text-[11px] font-bold text-white uppercase">
                {activeCategoryFilter}
              </span>
            )}
          </div>

          {/* Search Input Box & Dark Mode Button */}
          <div className="flex items-center gap-2 my-1.5">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 ring-1 ring-slate-700 transition-all cursor-pointer"
              title={currentTheme === 'dark' ? 'डे मोड (Light Mode) चालू करा' : 'नाईट मोड (Dark Mode) चालू करा'}
            >
              {currentTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-300" />
              )}
            </button>

            <div className="relative">
              <input
                type="text"
                placeholder="Search news / बातम्या शोधा..."
                value={articleSearch}
                onChange={(e) => {
                  setArticleSearch(e.target.value);
                  if (e.target.value && publicActivePostSlug) {
                    setPublicActivePostSlug(null);
                  }
                }}
                className="h-8 w-32 sm:w-48 lg:w-60 rounded-full bg-slate-800 px-3.5 pr-8 text-xs text-white placeholder:text-slate-400 focus:w-64 focus:outline-hidden ring-1 ring-slate-700 transition-all"
              />
              {articleSearch ? (
                <button
                  type="button"
                  onClick={() => setArticleSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#0f172a] p-3 space-y-3 text-xs max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            {/* Mobile User Profile or Login Quick Card */}
            {isLoggedIn && currentUser && currentUser.id !== 'guest-reader' ? (
              <div className="p-3 bg-slate-800/90 border border-slate-700 rounded-2xl flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    loading="lazy"
                    decoding="async"
                    width="36"
                    height="36"
                    className="w-9 h-9 rounded-full object-cover border-2 border-red-500 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <span className="inline-block text-[9px] font-black bg-red-600/90 text-white px-2 py-0.5 rounded-full mt-0.5">
                      {currentUser.role === 'USER' ? 'वाचक सदस्य' : currentUser.role}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {currentUser.role !== 'USER' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setPortalMode('CMS');
                      }}
                      className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg shadow-xs hover:bg-red-500 cursor-pointer"
                    >
                      CMS
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setPortalMode('PUBLIC');
                    }}
                    className="p-1.5 bg-slate-700 hover:bg-red-950/60 text-red-400 rounded-lg cursor-pointer"
                    title="लॉगआउट"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer transition-all active:scale-95"
              >
                <LogIn className="h-4 w-4 text-yellow-300 animate-pulse" />
                <span>लॉगिन करा (Sign In / Login)</span>
              </button>
            )}

            {/* Mobile Quick Action Buttons (E-Paper, Night Mode, Install App) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsEPaperViewOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-[11px] hover:bg-amber-500/30 cursor-pointer"
              >
                <Newspaper className="h-3.5 w-3.5 text-amber-400" />
                <span>ई-पेपर</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  PWAService.promptInstall(() => {
                    setIsMobileMenuOpen(false);
                    setIsPWAInstallModalOpen(true);
                  });
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-[11px] hover:bg-red-500/30 cursor-pointer"
              >
                <Smartphone className="h-3.5 w-3.5 text-red-400" />
                <span>ॲप इन्स्टॉल</span>
              </button>

              <button
                type="button"
                onClick={toggleDarkMode}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[11px] hover:bg-slate-700 cursor-pointer"
              >
                {currentTheme === 'dark' ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span>डे मोड</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-amber-300" />
                    <span>नाईट मोड</span>
                  </>
                )}
              </button>
            </div>

            {/* Menu Items List */}
            <div className="space-y-1 pt-1">
              {navMenuItems.map((item) => {
                const submenus = getSubmenusForItem(item);
                const hasSubmenus = submenus.length > 0;
                const isExpanded = expandedMobileMenuIds.includes(item.id);
                const active = isItemActive(item, submenus);

                return (
                  <div key={item.id} className="rounded-lg bg-slate-800/40 overflow-hidden">
                    <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleNavMenuItemClick(item)}
                      className={`flex-1 text-left px-3.5 py-2.5 font-bold uppercase tracking-wider transition-colors ${
                        active ? 'text-red-500 font-black' : 'text-slate-200 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                    {hasSubmenus && (
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedMobileMenuIds((prev) =>
                            prev.includes(item.id)
                              ? prev.filter((id) => id !== item.id)
                              : [...prev, item.id]
                          );
                        }}
                        className="px-3 py-2.5 text-slate-400 hover:text-white"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isExpanded ? 'rotate-180 text-red-400' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Mobile Submenu Accordion */}
                  {hasSubmenus && isExpanded && (
                    <div className="pl-6 pr-2 py-1.5 bg-slate-900/90 border-t border-slate-800 space-y-1">
                      {submenus.map((sub: any) => {
                        const isSubActive =
                          sub.url?.replace('/category/', '') === activeCategoryFilter;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleNavMenuItemClick(sub)}
                            className={`flex w-full items-center justify-between py-2 px-2 rounded text-xs transition-colors text-left ${
                              isSubActive
                                ? 'bg-red-600 text-white font-bold'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            <span>{sub.label}</span>
                            <ChevronRight className="h-3 w-3 opacity-50" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            </div>

            {/* Mobile Language Switcher */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/80 rounded-xl mt-3">
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                🌐 भाषा निवडा (Select Language)
              </span>
              <LanguageSwitcher variant="mobile" />
            </div>
          </div>
        )}
      </nav>

      {/* 3.1. SUB-MENU SCROLLING BREAKING NEWS TICKER */}
      <BreakingNewsTicker
        onSelectPost={(post) => navigateToPost(post)}
        onSelectCategory={(catSlug) => navigateToCategory(catSlug)}
      />

      {/* Below Header Ad Slot Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlotRenderer position="BELOW_HEADER" />
      </div>

      {/* 4. MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* VIEW A: STATIC PAGE READER VIEW (ABOUT, PRIVACY, POLICY, CONTACT, ETC.) */}
        {selectedPage ? (
          <div className="space-y-6 max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
            {/* Top Navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <button
                type="button"
                onClick={() => setPublicActivePageSlug(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to News Headlines (मुख्य पान)</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Globe className="h-3.5 w-3.5 text-red-600" />
                <span>infonewsupdate24.com/page/{selectedPage.slug}</span>
              </div>
            </div>

            {/* Featured Image if present */}
            {selectedPage.featuredImage && (
              <div className="rounded-2xl overflow-hidden max-h-[360px] border border-slate-100 shadow-xs">
                <img
                  src={getSafeImageUrl(selectedPage.featuredImage)}
                  alt={selectedPage.title}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Page Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-red-50 text-red-700 px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase border border-red-200">
                  {selectedPage.template === 'policy' ? '📜 Policy & Legal' : selectedPage.template === 'contact' ? '📞 Bureau Contact' : '📑 Official Page'}
                </span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedPage.authorName || 'InfoNewsUpdate24 Editorial Board'}
                </span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs text-slate-500">
                  Last Updated:{' '}
                  {new Date(selectedPage.updatedAt || selectedPage.createdAt).toLocaleDateString('mr-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
                {formatNewsTitle(selectedPage.title)}
              </h1>

              {selectedPage.excerpt && (
                <p className="text-sm sm:text-base text-slate-600 font-medium italic border-l-4 border-red-500 pl-4 py-1 bg-slate-50 rounded-r-lg">
                  {selectedPage.excerpt}
                </p>
              )}
            </div>

            {/* Main Content Rendered with Full Markdown Support */}
            <div className="pt-4 border-t border-slate-100">
              <ArticleContentRenderer content={selectedPage.content} />
            </div>

            {/* Interactive Contact & Bureau Form for Contact Template */}
            {(selectedPage.template === 'contact' || selectedPage.slug === 'contact-us') && (
              <div className="mt-8 pt-8 border-t border-slate-200 space-y-6">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                      ✉️
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        नागरिक व पत्रकार थेट संपर्क फॉर्म (Submit Feedback / News Tip)
                      </h3>
                      <p className="text-xs text-slate-600">
                        आपल्या परिसरातील बातमी, तक्रार किंवा जाहिरातीसाठी थेट संपादकीय मंडळाशी संपर्क साधा.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const name = (form.elements.namedItem('cname') as HTMLInputElement)?.value;
                      const phone = (form.elements.namedItem('cphone') as HTMLInputElement)?.value;
                      const msg = (form.elements.namedItem('cmsg') as HTMLTextAreaElement)?.value;
                      const text = encodeURIComponent(`*InfoNewsUpdate24 थेट संदेश*\n\nनाव: ${name}\nमोबाईल: ${phone}\nसंदेश: ${msg}`);
                      window.open(`https://wa.me/9187999333629?text=${text}`, '_blank');
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
                  >
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">आपले पूर्ण नाव <span className="text-red-500">*</span></label>
                      <input
                        name="cname"
                        type="text"
                        required
                        placeholder="उदा. राहुल देशमुख"
                        className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-slate-800 focus:border-red-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">व्हॉट्सॲप / मोबाईल नंबर <span className="text-red-500">*</span></label>
                      <input
                        name="cphone"
                        type="tel"
                        required
                        placeholder="+91 98XXXXXXXX"
                        className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-slate-800 focus:border-red-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">बातमीचा तपशील / संदेश <span className="text-red-500">*</span></label>
                      <textarea
                        name="cmsg"
                        required
                        rows={4}
                        placeholder="आपली बातमी, प्रतिक्रिया किंवा सूचना येथे सविस्तर लिहा..."
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-800 focus:border-red-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        ⚡ आपला संदेश थेट मुख्य संपादकीय व्हॉट्सॲप हेल्पलाईनवर पाठवला जाईल.
                      </span>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                      >
                        <span>व्हॉट्सॲपवर पाठवा</span>
                        <span>🚀</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : activeArticle ? (
          <div className="space-y-6 max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            {/* GOOGLE NEWS ARTICLE JSON-LD STRUCTURED DATA */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'NewsArticle',
                  mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': `https://www.infonewsupdate24.com/${encodeURIComponent(activeArticle.slug)}/`,
                  },
                  headline: activeArticle.seo?.seoTitle || activeArticle.title,
                  description: activeArticle.seo?.metaDescription || activeArticle.excerpt || activeArticle.title,
                  image: activeArticle.featuredImage
                    ? [activeArticle.featuredImage]
                    : ['https://www.infonewsupdate24.com/icon-512.svg'],
                  datePublished: (() => {
                    const d = new Date(activeArticle.publishDate || activeArticle.createdAt || Date.now());
                    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
                  })(),
                  dateModified: (() => {
                    const d = new Date(
                      activeArticle.updatedAt ||
                        activeArticle.publishedAt ||
                        activeArticle.publishDate ||
                        activeArticle.createdAt ||
                        Date.now()
                    );
                    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
                  })(),
                  author: {
                    '@type': 'Person',
                    name: activeArticle.authorName || 'InfoNewsUpdate24 विशेष प्रतिनिधी',
                  },
                  publisher: {
                    '@type': 'NewsMediaOrganization',
                    name: 'InfoNewsUpdate24',
                    url: 'https://www.infonewsupdate24.com/',
                    logo: {
                      '@type': 'ImageObject',
                      url: 'https://www.infonewsupdate24.com/icon-512.svg',
                      width: 512,
                      height: 512,
                    },
                  },
                  articleSection:
                    categories.find((c) => c.id === activeArticle.categoryId)?.name || 'महाराष्ट्र',
                }),
              }}
            />

            {/* Back Button */}
            <button
              type="button"
              onClick={navigateToHome}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>← मुख्य बातम्यांवर परत जा</span>
            </button>

            {/* Article Meta Header */}
            <div className="space-y-3">
              {/* Google Verified Fact-Check & Category Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-red-600 px-3 py-1 text-xs font-black text-white uppercase tracking-wider shadow-2xs">
                  {categories.find((c) => c.id === activeArticle.categoryId)?.name || 'महाराष्ट्र'}
                </span>

                {activeArticle.location && (
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                    <MapPin className="h-3 w-3 text-red-600" />
                    <span>{activeArticle.location} ब्युरो</span>
                  </span>
                )}

                {/* Google Verified Fact Check Badge */}
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>पडताळणीकृत बातमी (Fact-Checked)</span>
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-3.5xl font-black text-slate-950 leading-tight tracking-tight">
                {formatNewsTitle(activeArticle.title)}
              </h1>

              {/* Author & Publication Details (Google E-E-A-T Transparency) */}
              <div className="flex flex-wrap items-center justify-between border-y border-slate-200 py-3.5 text-xs text-slate-600 gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activeArticle.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={activeArticle.authorName}
                    loading="lazy"
                    decoding="async"
                    width="40"
                    height="40"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-red-500/30"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {activeArticle.authorName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      विशेष प्रतिनिधी &bull; {formatMarathiDate(activeArticle.publishDate || activeArticle.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>{activeArticle.readingTimeMinutes || 2} मिनिटे वाचन वेळ</span>
                  </span>
                </div>
              </div>

              {/* High-CTR One-Click Social Share Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* WhatsApp Big Direct Button */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `🔴 *${activeArticle.title}*\n\n${activeArticle.excerpt || ''}\n\n👉 संपूर्ण बातमी सविस्तर वाचा:\nhttps://www.infonewsupdate24.com/news/${activeArticle.slug}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-emerald-700 transition-transform active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp वर शेअर करा</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      typeof window !== 'undefined' ? window.location.href : ''
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
                  >
                    <Facebook className="h-3.5 w-3.5" />
                    <span>Facebook</span>
                  </a>

                  {/* X (Twitter) */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      activeArticle.title
                    )}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    <span>X</span>
                  </a>

                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        setCopyToast('लिंक कॉपी झाली!');
                        setTimeout(() => setCopyToast(''), 3000);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    {copyToast ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">{copyToast}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>लिंक कॉपी</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Reader Preferences Bar: Font Size Resizer + Likes + Print */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-xs">
                {/* Text Size Resizer */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500">फॉन्ट आकार:</span>
                  <div className="flex items-center rounded-lg bg-white border border-slate-200 p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setArticleFontSize('normal')}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                        articleFontSize === 'normal'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title="सामान्य फॉन्ट (Normal Size)"
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleFontSize('large')}
                      className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
                        articleFontSize === 'large'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title="मोठा फॉन्ट (Large Size)"
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleFontSize('xlarge')}
                      className={`px-2.5 py-0.5 rounded text-sm font-black transition-all ${
                        articleFontSize === 'xlarge'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title="अतिशय मोठा फॉन्ट (Extra Large Size)"
                    >
                      A+
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Live Like / Reactions Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleLike(activeArticle.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      likedPostIds.includes(activeArticle.id)
                        ? 'bg-red-50 text-red-600 border border-red-200 shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        likedPostIds.includes(activeArticle.id)
                          ? 'fill-red-600 text-red-600 animate-bounce'
                          : 'text-slate-500'
                      }`}
                    />
                    <span>
                      {likedPostIds.includes(activeArticle.id) ? 'आवडली!' : 'उपयुक्त'} (
                      {(activeArticle.likes || 0) + (likedPostIds.includes(activeArticle.id) ? 1 : 0)})
                    </span>
                  </button>

                  {/* Print Article Button */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer"
                    title="बातमी प्रिंट करा / PDF सेव्ह करा"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-600" />
                    <span>प्रिंट</span>
                  </button>
                </div>
              </div>
            </div>

            {/* GOOGLE CONVERSATIONAL VOICES AI NEWS READER (Mandatory Section 17 & 21 Compliance) */}
            <AIVoiceNewsPlayer post={activeArticle} />

            {/* Top In-Article Ad Slot */}
            <AdSlotRenderer position="ARTICLE_TOP" />

            {/* Featured Image */}
            <div className="space-y-1.5">
              <img
                src={getSafeImageUrl(activeArticle.featuredImage)}
                alt={activeArticle.featuredImageAlt || activeArticle.title}
                fetchPriority="high"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                }}
                className="w-full rounded-xl object-cover max-h-96 shadow-sm"
              />
              {activeArticle.featuredImageCaption && (
                <p className="text-center text-[11px] text-slate-500 italic">
                  {activeArticle.featuredImageCaption}
                </p>
              )}
            </div>

            {/* Excerpt Callout */}
            <div className="rounded-xl border-l-4 border-red-600 bg-slate-50 p-4 text-sm font-semibold text-slate-800 leading-relaxed font-sans">
              {cleanExcerpt(activeArticle.excerpt, activeArticle.content, 260)}
            </div>

            {/* Full Body Markdown Content with Structured Headings & Dynamic Font Size */}
            <div
              className={`transition-all ${
                articleFontSize === 'xlarge'
                  ? 'text-lg leading-loose'
                  : articleFontSize === 'large'
                  ? 'text-base leading-relaxed'
                  : 'text-sm leading-normal'
              }`}
            >
              <ArticleContentRenderer content={activeArticle.content} />
            </div>

            {/* Official GR / Document PDF Attachment Download Card */}
            {activeArticle.attachmentUrl && (
              <div className="my-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5">
                          अधिकृत शासन निर्णय / GR
                        </span>
                        <span className="text-[11px] text-blue-700 font-bold">PDF Attachment</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {activeArticle.attachmentName || 'अधिकृत शासन निर्णय / परिपत्रक'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        वाचकांच्या माहितीसाठी अधिकृत शासकीय आदेश व नियमावली उपलब्ध.
                      </p>
                    </div>
                  </div>

                  <a
                    href={activeArticle.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-transform active:scale-95 shrink-0"
                  >
                    <Download className="h-4 w-4" />
                    <span>PDF डाऊनलोड करा</span>
                  </a>
                </div>
              </div>
            )}

            {/* In-Article WhatsApp Channel Follow Banner */}
            <InArticleWhatsAppBanner />

            {/* Bottom In-Article Ad Slot */}
            <AdSlotRenderer position="ARTICLE_BOTTOM" />

            {/* Tags (Clickable Search Links) */}
            {Array.isArray(activeArticle.tags) && activeArticle.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500">संबंधित विषय (टॅग्ज):</span>
                {activeArticle.tags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => {
                      setArticleSearch(tag);
                      navigateToHome();
                    }}
                    className="rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Related / Recommended Stories Section */}
            {relatedPosts.length > 0 && (
              <div className="pt-8 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                    <span className="h-5 w-1.5 bg-red-600 rounded-full" />
                    <span>याच विषयावरील इतर महत्त्वाच्या बातम्या</span>
                  </h3>
                  <span className="text-xs font-bold text-red-600">वाचा पुढील बातम्या &rarr;</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {relatedPosts.map((rPost) => (
                    <div
                      key={rPost.id}
                      onClick={() => navigateToPost(rPost.slug)}
                      className="group cursor-pointer rounded-xl bg-white border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                        <img
                          src={getSafeImageUrl(rPost.featuredImage)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                          }}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5">
                          {rPost.publishDate}
                        </span>
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 line-clamp-2 leading-snug">
                          {formatNewsTitle(rPost.title)}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="pt-8 border-t border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">
                  वाचकांच्या प्रतिक्रिया (Reader Comments)
                </h3>
              </div>

              {/* Leave a Comment Form */}
              <form onSubmit={handlePostComment} className="space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800">तुमचे मत / प्रतिक्रिया नोंदवा</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    placeholder="तुमचे नाव *"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    required
                    className="h-8 rounded-md border border-slate-200 bg-white px-2.5"
                  />
                  <input
                    type="email"
                    placeholder="तुमचा ईमेल (पर्यायी)"
                    value={commentEmail}
                    onChange={(e) => setCommentEmail(e.target.value)}
                    className="h-8 rounded-md border border-slate-200 bg-white px-2.5"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="बातमीवर आपले विचार येथे मांडा..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 cursor-pointer shadow-2xs"
                >
                  प्रतिक्रिया पाठवा
                </button>
                {commentSuccess && (
                  <span className="ml-3 text-xs font-bold text-emerald-600">
                    धन्यवाद! तुमची प्रतिक्रिया यशस्वीरित्या नोंदवली गेली आहे.
                  </span>
                )}
              </form>

              {/* List Comments for this post */}
              <div className="space-y-3 pt-2">
                {comments
                  .filter((c) => c.postId === activeArticle.id && c.status === 'APPROVED')
                  .map((com) => (
                    <div key={com.id} className="flex gap-3 text-xs p-3 rounded-lg bg-white border border-slate-100">
                      <img
                        src={getSafeImageUrl(com.authorAvatar)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        width="32"
                        height="32"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                        }}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{com.authorName}</span>
                          <span className="text-slate-400">{com.createdAt}</span>
                        </div>
                        <p className="text-slate-700 mt-1">{com.content}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : isFetchingDirectPost ? (
          /* LOADING SPINNER WHILE FETCHING DIRECT CLOUD POST */
          <div className="max-w-3xl mx-auto bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4 my-8">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-r-transparent"></div>
            <p className="text-sm font-bold text-slate-800 font-serif">ताज्या बातम्या क्लाऊडवरून लोड होत आहेत...</p>
            <p className="text-xs text-slate-500 font-mono">Fetching live article from Firestore...</p>
          </div>
        ) : publicActivePostSlug ? (
          /* VIEW C: ARTICLE 404 OR LOADING STATE - NEVER SILENTLY REDIRECT TO HOME */
          <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-6 my-6">
            <div className="h-16 w-16 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-xs">
              📰
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase">
                त्रुटी ४०४ (Article Not Found)
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                आपण शोधत असलेली बातमी लोड होत आहे किंवा उपलब्ध नाही
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                बातमीची लिंक <code className="bg-slate-100 px-2 py-0.5 rounded text-red-600 font-mono text-xs">/{publicActivePostSlug}/</code> अद्ययावत केली जात आहे किंवा ती हटवली असू शकते.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={navigateToHome}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>मुख्य ताज्या बातम्यांवर परत जा</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW D: HOMEPAGE / CATEGORY FEED VIEW */
          <div className="space-y-8">
            {/* Top Homepage Banner Ad */}
            <AdSlotRenderer position="HOME_TOP" />

            {/* DYNAMIC HOMEPAGE SECTIONS IN DRAGGABLE CMS ORDER */}
            {homepageSections
              .filter((s) => s.isVisible)
              .map((sec) => (
                <React.Fragment key={sec.id}>
                  {renderHomepageSection(sec.id)}
                </React.Fragment>
              ))}
          </div>
        )}
      </main>

      {/* STANDARD MULTI-PLATFORM SOCIAL PLAYER MODAL (Aspect-Ratio Aware with Next/Prev Switching) */}
      {(() => {
        const activeSocialList = (socialPosts || []).filter((p) => {
          if (p.status !== 'PUBLISHED') return false;
          if (socialHubTab === 'ALL') return true;
          if (socialHubTab === 'REELS') return p.mediaType === 'REEL' || p.mediaType === 'SHORT' || p.isFeaturedReel;
          if (socialHubTab === 'LOCAL_GADCHIROLI') {
            const loc = (p.location || '').toLowerCase();
            const cat = (p.category || '').toLowerCase();
            const tit = (p.title || '').toLowerCase();
            return (
              loc.includes('gadchiroli') ||
              loc.includes('गडचिरोली') ||
              cat.includes('गडचिरोली') ||
              tit.includes('गडचिरोली')
            );
          }
          if (socialHubTab === 'TRENDING') return p.isFeaturedReel || (p.views || 0) >= 1000;
          if (socialHubTab === 'INSTAGRAM') return p.platform === 'INSTAGRAM';
          if (socialHubTab === 'YOUTUBE') return p.platform === 'YOUTUBE';
          if (socialHubTab === 'FACEBOOK') return p.platform === 'FACEBOOK';
          if (socialHubTab === 'TWITTER') return p.platform === 'TWITTER';
          return true;
        });

        const activeIdx = activeSocialMediaPost
          ? activeSocialList.findIndex((p) => p.id === activeSocialMediaPost.id)
          : -1;

        const onNext =
          activeSocialList.length > 1
            ? () => {
                const nextIdx = (activeIdx + 1) % activeSocialList.length;
                setActiveSocialMediaPost(activeSocialList[nextIdx]);
              }
            : undefined;

        const onPrev =
          activeSocialList.length > 1
            ? () => {
                const prevIdx = (activeIdx - 1 + activeSocialList.length) % activeSocialList.length;
                setActiveSocialMediaPost(activeSocialList[prevIdx]);
              }
            : undefined;

        return (
          <SocialPlayerModal
            post={activeSocialMediaPost}
            onClose={() => setActiveSocialMediaPost(null)}
            onNext={onNext}
            onPrev={onPrev}
            currentIndex={activeIdx !== -1 ? activeIdx : undefined}
            totalCount={activeSocialList.length}
          />
        );
      })()}

      {/* VIDEO PLAYER MODAL FOR STANDARD POSTS */}
      {activeVideoModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-2xl bg-slate-950 border border-slate-800 text-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Video Report
                </span>
                <span className="text-xs text-slate-400 font-medium truncate max-w-md">
                  {activeVideoModalPost.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoModalPost(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Video Playback Stage */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src={getSafeImageUrl(activeVideoModalPost.featuredImage)}
                alt=""
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_NEWS_FALLBACK_IMAGE;
                }}
                className="absolute inset-0 h-full w-full object-cover opacity-40 blur-xs"
              />
              <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl animate-pulse">
                  <Play className="h-8 w-8 fill-white ml-1" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white max-w-lg">
                    {activeVideoModalPost.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Bureau: {activeVideoModalPost.location} &bull; Reporter: {activeVideoModalPost.authorName}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Description */}
            <div className="p-4 sm:p-6 bg-slate-900/90 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeVideoModalPost.excerpt}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                <span>Published on {activeVideoModalPost.publishDate}</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveVideoModalPost(null);
                    navigateToPost(activeVideoModalPost.slug);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  <span>Read Full Article & Comments</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PUBLIC PORTAL FOOTER */}
      <footer className="mt-16 bg-[#0f172a] text-slate-300 py-12 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white font-black shadow-md text-lg shrink-0">
                24
              </div>
              <div className="flex items-center text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                <span>INFO</span>
                <span className="text-red-500 ml-1">NEWS</span>
                <span className="ml-1.5 text-xs bg-red-600 text-white px-2 py-0.5 rounded font-black tracking-wider shadow-xs">
                  UPDATE24
                </span>
              </div>
            </div>
            <p className="mt-3 text-slate-400 leading-relaxed">
              InfoNewsUpdate24 delivers verified news coverage across Maharashtra, India, and the globe.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Categories</h4>
            <ul className="space-y-1.5 text-slate-400">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => navigateToCategory(cat.slug || cat.id)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Quick Links & Pages</h4>
            <ul className="space-y-1.5 text-slate-400">
              {pages.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => navigateToPage(p.slug)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {p.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">बातमीदार व कर्मचारी</h4>
            <p className="text-slate-400 leading-relaxed mb-3 text-xs">
              संपादकीय मंडळ, जिल्हा वार्ताहर व उपसंपादक अधिकृत क्रेडेंशियल्सद्वारे न्यूज CMS पॅनलमध्ये प्रवेश करू शकतात.
            </p>
            {isLoggedIn && currentUser && currentUser.role !== 'USER' ? (
              <button
                type="button"
                onClick={() => setPortalMode('CMS')}
                className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 shadow-xs text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Go to CMS Dashboard ({currentUser.role}) &rarr;</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 font-bold text-white shadow-xs text-xs cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-yellow-400" />
                <span>कर्मचारी / बातमीदार लॉगिन &rarr;</span>
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} InfoNewsUpdate24. All rights reserved.</span>
          <span>Digital News Publishing Engine &bull; InfoNewsUpdate24 Enterprise Architecture</span>
        </div>
      </footer>

      {/* WhatsApp / Social Card Modal */}
      {selectedPost && (
        <SocialSharePreviewModal
          post={selectedPost}
          isOpen={isSocialModalOpen}
          onClose={() => setIsSocialModalOpen(false)}
        />
      )}

      {/* Floating Global Audio Player when Quick Listen is activated anywhere */}
      {quickListenPost && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-xl w-[calc(100vw-32px)] shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setQuickListenPost(null);
              }}
              className="absolute -top-3 -right-3 z-50 h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors cursor-pointer ring-2 ring-white"
              title="Close Player"
            >
              <X className="h-4 w-4" />
            </button>
            <AIVoiceNewsPlayer
              post={quickListenPost}
              autoPlay={true}
              onClose={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setQuickListenPost(null);
              }}
              isFloating={true}
            />
          </div>
        </div>
      )}

      {/* 5. MOBILE STICKY FLOATING BOTTOM AD (320x50 Anchor Bar) */}
      <AdSlotRenderer position="MOBILE_STICKY" />

      {/* 6. WEB PUSH NOTIFICATION PROMPT & BREAKING ALERT BANNER */}
      <WebPushPromptBanner />

      {/* 7. PWA MOBILE APP INSTALLER PROMPT */}
      <PWAInstallPrompt />

      {/* 7.1 PWA MOBILE APP INSTALL GUIDE MODAL */}
      <Suspense fallback={null}>
        {isPWAInstallModalOpen && (
          <PWAInstallModal
            isOpen={isPWAInstallModalOpen}
            onClose={() => setIsPWAInstallModalOpen(false)}
          />
        )}
      </Suspense>

      {/* 8. WHATSAPP COMMUNITY FLOATING HUB & MULTI-DISTRICT MODAL */}
      <WhatsAppCommunityFloatingWidget />

      {/* 9. MERCHANT SELF-SERVICE UPI AD BOOKING MODAL */}
      <Suspense fallback={null}>
        {isAdBookingModalOpen && (
          <MerchantAdBookingModal
            isOpen={isAdBookingModalOpen}
            onClose={() => setIsAdBookingModalOpen(false)}
          />
        )}
      </Suspense>

      {/* 10. CITIZEN JOURNALISM & READER NEWS SUBMISSION MODAL */}
      <Suspense fallback={null}>
        {isCitizenNewsModalOpen && (
          <CitizenNewsSubmissionModal
            isOpen={isCitizenNewsModalOpen}
            onClose={() => setIsCitizenNewsModalOpen(false)}
          />
        )}
      </Suspense>

      {/* 11. PORTAL & NEWSROOM LOGIN MODAL */}
      <Suspense fallback={null}>
        {isLoginModalOpen && (
          <PortalLoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
};
