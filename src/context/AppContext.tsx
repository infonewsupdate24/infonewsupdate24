import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  SEED_ACTIVITY_LOGS,
  SEED_ADS,
  SEED_ADSENSE_SETTINGS,
  SEED_AI_VOICE_SETTINGS,
  SEED_CATEGORIES,
  SEED_COMMENTS,
  SEED_LITESPEED_IMAGES,
  SEED_LITESPEED_PURGE_LOGS,
  SEED_LITESPEED_SETTINGS,
  SEED_MEDIA,
  SEED_MENUS,
  SEED_MODULES,
  SEED_NOTIFICATIONS,
  SEED_PAGES,
  SEED_POSTS,
  SEED_SOCIAL_POSTS,
  SEED_TAGS,
  SEED_THEME_SETTINGS,
} from '../data/seedData';
import { DEFAULT_EPAPER_SETTINGS } from '../data/epaperSeedData';
import { DEFAULT_WHATSAPP_SETTINGS } from '../data/whatsAppSeedData';
import { FirestoreNewsService } from '../services/FirestoreNewsService';
import {
  ActivityLog,
  AdSenseGlobalSettings,
  AdUnit,
  AIVoiceSettings,
  AppNotification,
  Category,
  Comment,
  InternalModule,
  LiteSpeedCacheSettings,
  LiteSpeedImageItem,
  LiteSpeedPurgeLog,
  MediaItem,
  Menu,
  Post,
  PostStatus,
  SocialMediaPost,
  StaticPage,
  Tag,
  ThemeSettings,
  EPaperSettings,
  WhatsAppChannelSettings,
  SiteGlobalSettings,
} from '../types';

export type PortalMode = 'CMS' | 'PUBLIC';

export type CmsView =
  | 'dashboard'
  | 'posts_all'
  | 'posts_new'
  | 'posts_edit'
  | 'categories'
  | 'tags'
  | 'media'
  | 'pages'
  | 'comments'
  | 'social_media'
  | 'polls'
  | 'users'
  | 'user_profile'
  | 'appearance_themes'
  | 'appearance_customize'
  | 'appearance_header'
  | 'appearance_menus'
  | 'breaking_ticker'
  | 'cricket_mandi'
  | 'ai_voice'
  | 'advertisements'
  | 'merchant_ads'
  | 'epaper'
  | 'web_push'
  | 'pwa'
  | 'whatsapp_hub'
  | 'whatsapp_bulletin'
  | 'web_stories'
  | 'weather'
  | 'citizen_news'
  | 'govt_schemes'
  | 'panchang'
  | 'gadchiroli_spotlight'
  | 'live_blog'
  | 'newsletter'
  | 'homepage_layout'
  | 'seo'
  | 'google_search_console'
  | 'litespeed_cache'
  | 'importer'
  | 'billing'
  | 'modules'
  | 'notifications'
  | 'analytics'
  | 'activity_logs'
  | 'security'
  | 'press_cards'
  | 'settings';

interface AppContextType {
  // Navigation & View Routing
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  cmsView: CmsView;
  setCmsView: (view: CmsView) => void;
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;
  publicActiveCategorySlug: string | null;
  setPublicActiveCategorySlug: (slug: string | null) => void;
  publicActivePostSlug: string | null;
  setPublicActivePostSlug: (slug: string | null) => void;
  publicActivePageSlug: string | null;
  setPublicActivePageSlug: (slug: string | null) => void;
  publicSearchQuery: string;
  setPublicSearchQuery: (query: string) => void;
  quickListenPost: Post | null;
  setQuickListenPost: (post: Post | null) => void;

  // Domain Collections
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  menus: Menu[];
  media: MediaItem[];
  pages: StaticPage[];
  socialPosts: SocialMediaPost[];
  comments: Comment[];
  ads: AdUnit[];
  modules: InternalModule[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  themeSettings: ThemeSettings;
  aiVoiceSettings: AIVoiceSettings;
  epaperSettings: EPaperSettings;
  updateEPaperSettings: (updates: Partial<EPaperSettings>) => Promise<void>;
  siteSettings: SiteGlobalSettings;
  updateSiteSettings: (updates: Partial<SiteGlobalSettings>) => void;

  // Post Actions
  createPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'workflowHistory'>) => Promise<Post>;
  updatePost: (id: string, updates: Partial<Post>, note?: string) => Promise<Post | null>;
  deletePost: (id: string) => Promise<void>;
  duplicatePost: (id: string) => Post | null;
  syncAllSeedPosts: () => void;
  changePostStatus: (
    id: string,
    newStatus: PostStatus,
    changedBy: string,
    changedByRole: any,
    note?: string
  ) => void;

  // Category Actions
  addCategory: (cat: Omit<Category, 'id' | 'postCount'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<{ success: boolean; message?: string }>;

  // Tag Actions
  addTag: (name: string, slug?: string, description?: string) => Promise<Tag>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  bulkDeleteTags: (ids: string[]) => void;

  // Menu Actions
  updateMenu: (menuId: string, items: any[]) => void;

  // Page Actions (InfoNewsUpdate24 Custom Pages)
  createPage: (page: Omit<StaticPage, 'id' | 'createdAt' | 'updatedAt'>) => Promise<StaticPage>;
  updatePage: (id: string, updates: Partial<StaticPage>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  duplicatePage: (id: string) => StaticPage | null;

  // Social & Reels Media Manager Actions
  createSocialPost: (post: Omit<SocialMediaPost, 'id' | 'createdAt' | 'updatedAt'>) => SocialMediaPost;
  updateSocialPost: (id: string, updates: Partial<SocialMediaPost>) => void;
  deleteSocialPost: (id: string) => void;
  duplicateSocialPost: (id: string) => SocialMediaPost | null;
  toggleSocialPostStatus: (id: string) => void;

  // Media Actions
  uploadMedia: (media: Omit<MediaItem, 'id' | 'createdAt'>) => MediaItem;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void;
  deleteMedia: (id: string) => void;
  bulkDeleteMedia: (ids: string[]) => void;

  // Comment Actions
  updateCommentStatus: (id: string, status: Comment['status']) => void;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;

  // Ad & AdSense Actions
  adSenseSettings: AdSenseGlobalSettings;
  updateAdSenseSettings: (updates: Partial<AdSenseGlobalSettings>) => void;
  updateAd: (id: string, updates: Partial<AdUnit>) => void;
  addAd: (ad: Omit<AdUnit, 'id' | 'impressions' | 'clicks'>) => AdUnit;
  deleteAd: (id: string) => void;
  duplicateAd: (id: string) => AdUnit | null;
  recordAdImpression: (id: string) => void;
  recordAdClick: (id: string) => void;
  resetAdStats: (id: string) => void;

  // Module Actions
  toggleModule: (id: string) => void;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;

  // Activity Log
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;

  // WhatsApp Channel & Community Suite
  whatsAppSettings: WhatsAppChannelSettings;
  updateWhatsAppSettings: (updates: Partial<WhatsAppChannelSettings>) => void;

  // Theme
  updateThemeSettings: (updates: Partial<ThemeSettings>) => void;

  // AI Voice Settings
  updateAIVoiceSettings: (updates: Partial<AIVoiceSettings>) => void;

  // LiteSpeed Cache Plugin Actions
  liteSpeedSettings: LiteSpeedCacheSettings;
  updateLiteSpeedSettings: (updates: Partial<LiteSpeedCacheSettings>) => void;
  liteSpeedImages: LiteSpeedImageItem[];
  liteSpeedPurgeLogs: LiteSpeedPurgeLog[];
  purgeLiteSpeedCache: (
    type: LiteSpeedPurgeLog['type'],
    note?: string
  ) => Promise<{ success: boolean; message: string; purgedItemsCount: number }>;
  optimizeLiteSpeedImages: (
    mode?: 'ALL' | 'NEW' | 'SINGLE',
    targetMediaId?: string
  ) => Promise<{ success: boolean; count: number; savedBytes: number }>;
  revertLiteSpeedImages: () => void;
  cleanDatabaseTables: (
    target: 'REVISIONS' | 'DRAFTS' | 'TRASH' | 'SPAM_COMMENTS' | 'TRANSIENTS' | 'ALL'
  ) => Promise<{ success: boolean; cleanedCount: number; spaceFreedKb: number }>;
  runLiteSpeedCrawler: () => Promise<{ success: boolean; crawledCount: number; durationMs: number }>;

  // Backup and Recovery
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => { success: boolean; message: string };

  // Reset to demo seed
  resetToDefaultSeed: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const DEFAULT_SITE_SETTINGS: SiteGlobalSettings = {
  siteTitle: 'InfoNewsUpdate24',
  siteTagline: 'महाराष्ट्रातील ताज्या, निर्भीड आणि विश्वासार्ह घडामोडी',
  siteUrl: 'https://www.infonewsupdate24.com',
  siteEmail: 'vicky123.kdk@gmail.com',
  sitePhone: '+91 87999333629',
  siteAddress: 'मुख्य ब्युरो कार्यालय, गडचिरोली, महाराष्ट्र ४४२६०५',
  headerLogoUrl: '',
  footerLogoUrl: '',
  faviconUrl: '',
  rniRegNumber: 'MAHMAR/2026/89452',
  grievanceOfficerName: 'कोमल दौलतराव डहागावकर (मुख्य संपादक व कायदेशीर प्रतिनिधी)',
  grievanceOfficerEmail: 'vicky123.kdk@gmail.com',
  grievanceOfficerPhone: '+91 87999333629',
  copyrightText: '© 2026 InfoNewsUpdate24. सर्व हक्क सुरक्षित.',
  googleAnalyticsId: 'G-INFONEWS24',
  adsensePublisherId: 'ca-pub-9842109847120934',
  defaultSocialShareImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
  enableComments: true,
  requireCommentApproval: true,
  blacklistedWords: 'शिवी, आक्षेपार्ह, बकवास, फेक, भामटा',
  maintenanceMode: false,
  antiCopyProtection: false,
  autoRefreshIntervalMinutes: 3,
  socialFacebook: 'https://facebook.com/infonewsupdate24',
  socialTwitter: 'https://twitter.com/infonewsupdate24',
  socialYouTube: 'https://youtube.com/@infonewsupdate24',
  socialInstagram: 'https://instagram.com/infonewsupdate24',
  socialTelegram: 'https://t.me/infonewsupdate24',
  socialWhatsAppChannel: 'https://whatsapp.com/channel/infonewsupdate24',
};

const STORAGE_PREFIX = 'infonews_db_v7_';
const DELETED_POSTS_KEY = 'infonews_deleted_post_ids_v1';

function getDeletedPostIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_POSTS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function recordDeletedPostId(id: string) {
  try {
    const set = getDeletedPostIds();
    set.add(id);
    localStorage.setItem(DELETED_POSTS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

function getStoredOrDefault<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item) return JSON.parse(item);
  } catch {
    // fallback
  }
  return defaultValue;
}

function parseTimestampToMillis(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'object' && val !== null) {
    if (typeof val.toMillis === 'function') {
      try { return val.toMillis(); } catch {}
    }
    if (typeof val.toDate === 'function') {
      try { return val.toDate().getTime(); } catch {}
    }
    if (typeof val.seconds === 'number') {
      return val.seconds * 1000 + Math.floor((val.nanoseconds || 0) / 1000000);
    }
    if (val instanceof Date) {
      return val.getTime();
    }
  }
  if (typeof val === 'string') {
    const parsed = Date.parse(val);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

export function sortPostsNewestFirst(postsList: Post[]): Post[] {
  return postsList.slice().sort((a, b) => {
    const timeA = Math.max(
      parseTimestampToMillis(a.createdAt),
      parseTimestampToMillis(a.publishDate),
      parseTimestampToMillis(a.updatedAt)
    );
    const timeB = Math.max(
      parseTimestampToMillis(b.createdAt),
      parseTimestampToMillis(b.publishDate),
      parseTimestampToMillis(b.updatedAt)
    );
    return timeB - timeA;
  });
}

function smartMergePosts(localPosts: Post[], cloudPosts: Post[], deletedIds: Set<string>): Post[] {
  const postMap = new Map<string, Post>();

  // 1. First add all cloud posts that are not deleted
  cloudPosts.forEach((cp) => {
    if (!deletedIds.has(cp.id)) {
      postMap.set(cp.id, cp);
    }
  });

  // 2. Merge local posts (preserve all un-synced published/draft/pending posts, keep newer edits)
  localPosts.forEach((lp) => {
    if (deletedIds.has(lp.id)) return;

    if (!postMap.has(lp.id)) {
      // Local post not in cloud yet (e.g. freshly published or offline) -> ALWAYS PRESERVE IT!
      postMap.set(lp.id, lp);
    } else {
      // Post exists in both: compare timestamps
      const cloudPost = postMap.get(lp.id)!;
      const localTime = Math.max(
        parseTimestampToMillis(lp.updatedAt),
        parseTimestampToMillis(lp.createdAt),
        parseTimestampToMillis(lp.publishDate)
      );
      const cloudTime = Math.max(
        parseTimestampToMillis(cloudPost.updatedAt),
        parseTimestampToMillis(cloudPost.createdAt),
        parseTimestampToMillis(cloudPost.publishDate)
      );
      if (localTime > cloudTime) {
        // Local content may be newer, but the stored Firestore slug is canonical.
        postMap.set(lp.id, { ...lp, slug: cloudPost.slug || lp.slug });
      }
    }
  });

  return sortPostsNewestFirst(Array.from(postMap.values()));
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State (Strict PUBLIC Default)
  const [portalMode, setPortalMode] = useState<PortalMode>('PUBLIC');
  const [cmsView, setCmsView] = useState<CmsView>('dashboard');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [publicActiveCategorySlug, setPublicActiveCategorySlug] = useState<string | null>(null);
  const [publicActivePostSlug, setPublicActivePostSlug] = useState<string | null>(null);
  const [publicActivePageSlug, setPublicActivePageSlug] = useState<string | null>(null);
  const [publicSearchQuery, setPublicSearchQuery] = useState<string>('');
  const [quickListenPost, setQuickListenPost] = useState<Post | null>(null);

  // Core Data Collections (Auto-filtered against permanently deleted IDs)
  const [posts, setPosts] = useState<Post[]>(() => {
    const deletedIds = getDeletedPostIds();
    const stored = getStoredOrDefault<Post[]>('posts', []);
    const postMap = new Map<string, Post>();
    // 1. Always load all 127 authentic imported WordPress and seed posts
    SEED_POSTS.forEach((p) => {
      if (!deletedIds.has(p.id)) postMap.set(p.id, p);
    });
    // 2. Add or overwrite with locally edited/created posts
    stored.forEach((p) => {
      if (!deletedIds.has(p.id)) postMap.set(p.id, p);
    });
    const result = sortPostsNewestFirst(Array.from(postMap.values()));
    try {
      localStorage.setItem(STORAGE_PREFIX + 'posts', JSON.stringify(result));
    } catch {}
    return result;
  });

  const syncAllSeedPosts = () => {
    const deletedIds = getDeletedPostIds();
    const postMap = new Map<string, Post>();
    SEED_POSTS.forEach((p) => {
      if (!deletedIds.has(p.id)) postMap.set(p.id, p);
    });
    posts.forEach((p) => {
      if (!deletedIds.has(p.id)) postMap.set(p.id, p);
    });
    const result = sortPostsNewestFirst(Array.from(postMap.values()));
    setPosts(result);
    try {
      localStorage.setItem(STORAGE_PREFIX + 'posts', JSON.stringify(result));
    } catch {}
  };

  useEffect(() => {
    if (posts.length < SEED_POSTS.length) {
      syncAllSeedPosts();
    }
  }, [posts.length]);
  const [categories, setCategories] = useState<Category[]>(() =>
    getStoredOrDefault('categories', SEED_CATEGORIES)
  );
  const [tags, setTags] = useState<Tag[]>(() => getStoredOrDefault('tags', SEED_TAGS));
  const [menus, setMenus] = useState<Menu[]>(() => getStoredOrDefault('menus', SEED_MENUS));
  const [media, setMedia] = useState<MediaItem[]>(() => getStoredOrDefault('media', SEED_MEDIA));
  const [pages, setPages] = useState<StaticPage[]>(() => getStoredOrDefault('pages', SEED_PAGES));
  const [socialPosts, setSocialPosts] = useState<SocialMediaPost[]>(() =>
    getStoredOrDefault('social_posts', SEED_SOCIAL_POSTS)
  );
  const [comments, setComments] = useState<Comment[]>(() =>
    getStoredOrDefault('comments', SEED_COMMENTS)
  );
  const [ads, setAds] = useState<AdUnit[]>(() => getStoredOrDefault('ads', SEED_ADS));
  const [adSenseSettings, setAdSenseSettings] = useState<AdSenseGlobalSettings>(() => {
    const stored = getStoredOrDefault<AdSenseGlobalSettings>('adsense_settings', SEED_ADSENSE_SETTINGS);
    return {
      ...SEED_ADSENSE_SETTINGS,
      ...stored,
    };
  });
  const [modules, setModules] = useState<InternalModule[]>(() =>
    getStoredOrDefault('modules', SEED_MODULES)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    getStoredOrDefault('notifications', SEED_NOTIFICATIONS)
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    getStoredOrDefault('logs', SEED_ACTIVITY_LOGS)
  );
  const [aiVoiceSettings, setAiVoiceSettings] = useState<AIVoiceSettings>(() => {
    const stored = getStoredOrDefault<AIVoiceSettings>('ai_voice_settings', SEED_AI_VOICE_SETTINGS);
    return {
      ...SEED_AI_VOICE_SETTINGS,
      ...stored,
    };
  });
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const stored = getStoredOrDefault<ThemeSettings>('theme', SEED_THEME_SETTINGS);
    return {
      ...SEED_THEME_SETTINGS,
      ...stored,
      enabledSocialPlatforms: {
        ...SEED_THEME_SETTINGS.enabledSocialPlatforms,
        ...(stored.enabledSocialPlatforms || {}),
      },
      socialLinks: {
        ...SEED_THEME_SETTINGS.socialLinks,
        ...(stored.socialLinks || {}),
      },
    };
  });
  const [liteSpeedSettings, setLiteSpeedSettings] = useState<LiteSpeedCacheSettings>(() => {
    const stored = getStoredOrDefault<LiteSpeedCacheSettings>('litespeed_settings', SEED_LITESPEED_SETTINGS);
    return {
      ...SEED_LITESPEED_SETTINGS,
      ...stored,
      dbStats: {
        ...SEED_LITESPEED_SETTINGS.dbStats,
        ...(stored?.dbStats || {}),
      },
      stats: {
        ...SEED_LITESPEED_SETTINGS.stats,
        ...(stored?.stats || {}),
      },
    };
  });
  const [liteSpeedImages, setLiteSpeedImages] = useState<LiteSpeedImageItem[]>(() =>
    getStoredOrDefault('litespeed_images', SEED_LITESPEED_IMAGES)
  );
  const [liteSpeedPurgeLogs, setLiteSpeedPurgeLogs] = useState<LiteSpeedPurgeLog[]>(() =>
    getStoredOrDefault('litespeed_purge_logs', SEED_LITESPEED_PURGE_LOGS)
  );
  const [epaperSettings, setEpaperSettings] = useState<EPaperSettings>(() => {
    const stored = getStoredOrDefault<EPaperSettings>('epaper_settings', DEFAULT_EPAPER_SETTINGS);
    return {
      ...DEFAULT_EPAPER_SETTINGS,
      ...stored,
    };
  });
  const [whatsAppSettings, setWhatsAppSettings] = useState<WhatsAppChannelSettings>(() => {
    const stored = getStoredOrDefault<WhatsAppChannelSettings>('whatsapp_settings', DEFAULT_WHATSAPP_SETTINGS);
    return {
      ...DEFAULT_WHATSAPP_SETTINGS,
      ...stored,
    };
  });

  const [siteSettings, setSiteSettings] = useState<SiteGlobalSettings>(() => {
    const stored = getStoredOrDefault<SiteGlobalSettings>('site_global_settings', DEFAULT_SITE_SETTINGS);
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...stored,
    };
  });

  const updateSiteSettings = (updates: Partial<SiteGlobalSettings>) => {
    setSiteSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_PREFIX + 'site_global_settings', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const updateWhatsAppSettings = (updates: Partial<WhatsAppChannelSettings>) => {
    setWhatsAppSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_PREFIX + 'whatsapp_settings', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Realtime Cloud Synchronization with Firebase Firestore
  useEffect(() => {
    // 1. Initial seed migration to cloud if Firestore is empty
    FirestoreNewsService.bulkSyncInitialPosts(posts).catch((err) => {
      console.warn('Firestore initial post sync note:', err);
    });

    FirestoreNewsService.bulkSyncInitialMedia(media).catch((err) => {
      console.warn('Firestore initial media sync note:', err);
    });

    // 2. Subscribe to Real-Time Post updates from cloud with Auto-Recovery
    const unsubscribePosts = FirestoreNewsService.subscribePosts((cloudPosts) => {
      if (cloudPosts && cloudPosts.length > 0) {
        const deletedIds = getDeletedPostIds();
        setPosts((currentLocal) => {
          // Auto-recover orphaned posts that were saved locally but missed cloud sync
          const orphanedPosts = currentLocal.filter(
            (lp) =>
              !cloudPosts.some((cp) => cp.id === lp.id) &&
              !deletedIds.has(lp.id) &&
              !SEED_POSTS.some((sp) => sp.id === lp.id) &&
              lp.id.startsWith('post-')
          );
          if (orphanedPosts.length > 0) {
            orphanedPosts.forEach((orphan) => {
              FirestoreNewsService.savePost(orphan).catch((err) => {
                console.warn(`[AutoRecovery] Post ${orphan.id} sync note:`, err);
              });
            });
          }
          return smartMergePosts(currentLocal, cloudPosts, deletedIds);
        });
      }
    });

    // 3. Subscribe to Real-Time Media Library updates from cloud
    const unsubscribeMedia = FirestoreNewsService.subscribeMedia((cloudMedia) => {
      if (cloudMedia && cloudMedia.length > 0) {
        setMedia((currentLocal) => {
          const merged = [...cloudMedia];
          currentLocal.forEach((localItem) => {
            if (!merged.some((cm) => cm.id === localItem.id)) {
              merged.push(localItem);
            }
          });
          return merged;
        });
      }
    });

    // 4. Subscribe to Real-Time Pages from cloud
    const unsubscribePages = FirestoreNewsService.subscribePages((cloudPages) => {
      if (cloudPages && cloudPages.length > 0) {
        setPages((currentLocal) => {
          const pageMap = new Map<string, StaticPage>();
          cloudPages.forEach((cp) => pageMap.set(cp.id, cp));
          currentLocal.forEach((lp) => {
            if (!pageMap.has(lp.id)) pageMap.set(lp.id, lp);
          });
          return Array.from(pageMap.values());
        });
      }
    });

    // 5. Subscribe to Real-Time Categories from cloud
    const unsubscribeCats = FirestoreNewsService.subscribeCategories((cloudCats) => {
      if (cloudCats && cloudCats.length > 0) {
        setCategories((currentLocal) => {
          const catMap = new Map<string, Category>();
          cloudCats.forEach((cc) => catMap.set(cc.id, cc));
          currentLocal.forEach((lc) => {
            if (!catMap.has(lc.id)) catMap.set(lc.id, lc);
          });
          return Array.from(catMap.values());
        });
      }
    });

    // 6. Subscribe to Real-Time Tags from cloud
    const unsubscribeTags = FirestoreNewsService.subscribeTags((cloudTags) => {
      if (cloudTags && cloudTags.length > 0) {
        setTags((currentLocal) => {
          const tagMap = new Map<string, Tag>();
          cloudTags.forEach((ct) => tagMap.set(ct.id, ct));
          currentLocal.forEach((lt) => {
            if (!tagMap.has(lt.id)) tagMap.set(lt.id, lt);
          });
          return Array.from(tagMap.values());
        });
      }
    });

    // 7. Subscribe to Real-Time Menus from cloud
    const unsubscribeMenus = FirestoreNewsService.subscribeMenus((cloudMenus) => {
      if (cloudMenus && cloudMenus.length > 0) {
        setMenus((currentLocal) => {
          const menuMap = new Map<string, Menu>();
          cloudMenus.forEach((cm) => menuMap.set(cm.id, cm));
          currentLocal.forEach((lm) => {
            if (!menuMap.has(lm.id)) menuMap.set(lm.id, lm);
          });
          return Array.from(menuMap.values());
        });
      }
    });

    // Public E-Paper visibility and settings must update for every visitor,
    // not only in the browser where an administrator saved them.
    const unsubscribeEPaperSettings = FirestoreNewsService.subscribeSettingDoc<EPaperSettings>(
      'epaper',
      (cloudSettings) => {
        setEpaperSettings((current) => ({
          ...DEFAULT_EPAPER_SETTINGS,
          ...current,
          ...cloudSettings,
        }));
      }
    );

    return () => {
      unsubscribePosts();
      unsubscribeMedia();
      unsubscribePages();
      unsubscribeCats();
      unsubscribeTags();
      unsubscribeMenus();
      unsubscribeEPaperSettings();
    };
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      const deletedIds = getDeletedPostIds();
      const cleanPosts = posts.filter((p) => !deletedIds.has(p.id));
      localStorage.setItem(STORAGE_PREFIX + 'posts', JSON.stringify(cleanPosts));
      localStorage.setItem(STORAGE_PREFIX + 'categories', JSON.stringify(categories));
      localStorage.setItem(STORAGE_PREFIX + 'tags', JSON.stringify(tags));
      localStorage.setItem(STORAGE_PREFIX + 'menus', JSON.stringify(menus));
      localStorage.setItem(STORAGE_PREFIX + 'media', JSON.stringify(media));
      localStorage.setItem(STORAGE_PREFIX + 'pages', JSON.stringify(pages));
      localStorage.setItem(STORAGE_PREFIX + 'social_posts', JSON.stringify(socialPosts));
      localStorage.setItem(STORAGE_PREFIX + 'comments', JSON.stringify(comments));
      localStorage.setItem(STORAGE_PREFIX + 'ads', JSON.stringify(ads));
      localStorage.setItem(STORAGE_PREFIX + 'adsense_settings', JSON.stringify(adSenseSettings));
      localStorage.setItem(STORAGE_PREFIX + 'modules', JSON.stringify(modules));
      localStorage.setItem(STORAGE_PREFIX + 'notifications', JSON.stringify(notifications));
      localStorage.setItem(STORAGE_PREFIX + 'logs', JSON.stringify(activityLogs));
      localStorage.setItem(STORAGE_PREFIX + 'theme', JSON.stringify(themeSettings));
      localStorage.setItem(STORAGE_PREFIX + 'ai_voice_settings', JSON.stringify(aiVoiceSettings));
      localStorage.setItem(STORAGE_PREFIX + 'epaper_settings', JSON.stringify(epaperSettings));
      localStorage.setItem(STORAGE_PREFIX + 'whatsapp_settings', JSON.stringify(whatsAppSettings));
      localStorage.setItem(STORAGE_PREFIX + 'litespeed_settings', JSON.stringify(liteSpeedSettings));
      localStorage.setItem(STORAGE_PREFIX + 'litespeed_images', JSON.stringify(liteSpeedImages));
      localStorage.setItem(STORAGE_PREFIX + 'litespeed_purge_logs', JSON.stringify(liteSpeedPurgeLogs));
    } catch {
      // quota or private mode fallback
    }
  }, [
    posts,
    categories,
    tags,
    menus,
    media,
    pages,
    socialPosts,
    comments,
    ads,
    epaperSettings,
    whatsAppSettings,
    adSenseSettings,
    modules,
    notifications,
    activityLogs,
    themeSettings,
    aiVoiceSettings,
    liteSpeedSettings,
    liteSpeedImages,
    liteSpeedPurgeLogs,
  ]);

  // Post Methods
  const createPost = async (
    postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'workflowHistory'>
  ): Promise<Post> => {
    const now = new Date().toISOString();
    const uniqueId = `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newPost: Post = {
      ...postData,
      id: uniqueId,
      workflowHistory: [
        {
          id: `wf-${Date.now()}`,
          fromStatus: 'DRAFT',
          toStatus: postData.status,
          changedBy: postData.authorName,
          changedByRole: postData.authorRole,
          timestamp: new Date().toLocaleString('en-GB'),
          note: 'Post created.',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    // 1. Authoritative Cloud Persistence First (Await Firestore)
    await FirestoreNewsService.savePost(newPost);

    // 2. Update React State and Local Cache
    setPosts((prev) => {
      const next = sortPostsNewestFirst([newPost, ...prev.filter((p) => p.id !== newPost.id)]);
      try {
        localStorage.setItem(STORAGE_PREFIX + 'posts', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Recalculate category post count
    setCategories((prev) =>
      prev.map((c) => (c.id === newPost.categoryId ? { ...c, postCount: (c.postCount || 0) + 1 } : c))
    );

    return newPost;
  };

  const updatePost = async (id: string, updates: Partial<Post>, note?: string): Promise<Post | null> => {
    const currentPost = posts.find((p) => p.id === id);
    if (!currentPost) throw new Error(`Post ${id} not found`);

    const updated: Post = {
      ...currentPost,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (note) {
      updated.workflowHistory = [
        {
          id: `wf-${Date.now()}`,
          fromStatus: currentPost.status,
          toStatus: updates.status || currentPost.status,
          changedBy: updates.authorName || currentPost.authorName,
          changedByRole: updates.authorRole || currentPost.authorRole,
          timestamp: new Date().toLocaleString('en-GB'),
          note,
        },
        ...currentPost.workflowHistory,
      ];
    }

    // 1. Authoritative Cloud Persistence First (Await Firestore)
    await FirestoreNewsService.savePost(updated);

    // 2. Update React State and Local Cache
    setPosts((prev) => {
      const next = sortPostsNewestFirst(prev.map((p) => (p.id === id ? updated : p)));
      try {
        localStorage.setItem(STORAGE_PREFIX + 'posts', JSON.stringify(next));
      } catch {}
      return next;
    });

    return updated;
  };

  const deletePost = async (id: string): Promise<void> => {
    recordDeletedPostId(id);
    await FirestoreNewsService.deletePost(id);

    setPosts((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(STORAGE_PREFIX + 'posts', JSON.stringify(remaining));
      } catch {}
      return remaining;
    });
  };

  const duplicatePost = (id: string): Post | null => {
    const target = posts.find((p) => p.id === id);
    if (!target) return null;
    const now = new Date().toISOString();
    const cloned: Post = {
      ...target,
      id: `post-${Date.now()}`,
      title: `${target.title} (प्रत/Copy)`,
      slug: `${target.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'DRAFT',
      views: 0,
      likes: 0,
      createdAt: now,
      updatedAt: now,
      workflowHistory: [
        {
          id: `wf-${Date.now()}`,
          fromStatus: 'DRAFT',
          toStatus: 'DRAFT',
          changedBy: target.authorName,
          changedByRole: target.authorRole,
          timestamp: new Date().toLocaleString('en-GB'),
          note: `Cloned from post: ${target.id}`,
        },
      ],
    };
    setPosts((prev) => [cloned, ...prev]);
    return cloned;
  };

  const changePostStatus = (
    id: string,
    newStatus: PostStatus,
    changedBy: string,
    changedByRole: any,
    note?: string
  ) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const entry = {
          id: `wf-${Date.now()}`,
          fromStatus: p.status,
          toStatus: newStatus,
          changedBy,
          changedByRole,
          timestamp: new Date().toLocaleString('en-GB'),
          note: note || `Status updated to ${newStatus}`,
        };
        return {
          ...p,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          workflowHistory: [entry, ...p.workflowHistory],
        };
      })
    );
  };

  // Category Methods
  const addCategory = async (catData: Omit<Category, 'id' | 'postCount'>): Promise<Category> => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
      postCount: 0,
    };
    await FirestoreNewsService.saveCategory(newCat);
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<void> => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    const updated = { ...target, ...updates };
    await FirestoreNewsService.saveCategory(updated);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const deleteCategory = async (id: string): Promise<{ success: boolean; message?: string }> => {
    // Check if posts or child categories exist
    const hasPosts = posts.some((p) => p.categoryId === id || p.subCategoryId === id);
    if (hasPosts) {
      return { success: false, message: 'Cannot delete category: Posts are currently assigned to it.' };
    }
    const hasChildren = categories.some((c) => c.parentId === id);
    if (hasChildren) {
      return { success: false, message: 'Cannot delete category: Sub-categories exist under it.' };
    }
    await FirestoreNewsService.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return { success: true };
  };

  // Tag Methods
  const addTag = async (name: string, customSlug?: string, description?: string): Promise<Tag> => {
    const cleanName = name.trim();
    const slug = (customSlug?.trim() || cleanName)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    const existing = tags.find(
      (t) => t.slug === slug || t.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) return existing;
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: cleanName,
      slug: slug || `tag-${Date.now()}`,
      description: description?.trim() || '',
      count: 0,
    };
    await FirestoreNewsService.saveTag(newTag);
    setTags((prev) => [...prev, newTag]);
    return newTag;
  };

  const updateTag = async (id: string, updates: Partial<Tag>): Promise<void> => {
    const target = tags.find((t) => t.id === id);
    if (!target) return;
    const updated = { ...target, ...updates };
    await FirestoreNewsService.saveTag(updated);
    setTags((prev) =>
      prev.map((t) => (t.id === id ? updated : t))
    );
  };

  const deleteTag = async (id: string): Promise<void> => {
    await FirestoreNewsService.deleteTag(id);
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  const bulkDeleteTags = (ids: string[]) => {
    setTags((prev) => prev.filter((t) => !ids.includes(t.id)));
  };

  // Menu Methods
  const updateMenu = (menuId: string, items: any[]) => {
    setMenus((prev) => prev.map((m) => (m.id === menuId ? { ...m, items } : m)));
  };

  // Page Methods (InfoNewsUpdate24 Custom Pages)
  const createPage = async (pageData: Omit<StaticPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<StaticPage> => {
    const slug =
      pageData.slug?.trim() ||
      pageData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-') ||
      `page-${Date.now()}`;
    const newPage: StaticPage = {
      ...pageData,
      id: `page-${Date.now()}`,
      slug,
      status: pageData.status || 'PUBLISHED',
      views: pageData.views || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await FirestoreNewsService.savePage(newPage);
    setPages((prev) => [newPage, ...prev]);
    return newPage;
  };

  const updatePage = async (id: string, updates: Partial<StaticPage>): Promise<void> => {
    const target = pages.find((p) => p.id === id);
    if (!target) return;
    const updated = {
      ...target,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await FirestoreNewsService.savePage(updated);
    setPages((prev) =>
      prev.map((p) =>
        p.id === id
          ? updated
          : p
      )
    );
  };

  const deletePage = async (id: string): Promise<void> => {
    await FirestoreNewsService.deletePage(id);
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const duplicatePage = (id: string): StaticPage | null => {
    const existing = pages.find((p) => p.id === id);
    if (!existing) return null;
    const duplicated: StaticPage = {
      ...existing,
      id: `page-${Date.now()}`,
      title: `${existing.title} (Copy)`,
      slug: `${existing.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'DRAFT',
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPages((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  // Social & Reels Media Manager Methods
  const createSocialPost = (
    postData: Omit<SocialMediaPost, 'id' | 'createdAt' | 'updatedAt'>
  ): SocialMediaPost => {
    const now = new Date().toISOString();
    const newSocialPost: SocialMediaPost = {
      ...postData,
      id: `soc-${Date.now()}`,
      likes: postData.likes || 0,
      views: postData.views || 0,
      createdAt: now,
      updatedAt: now,
    };
    setSocialPosts((prev) => [newSocialPost, ...prev]);
    return newSocialPost;
  };

  const updateSocialPost = (id: string, updates: Partial<SocialMediaPost>) => {
    const now = new Date().toISOString();
    setSocialPosts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: now } : s))
    );
  };

  const deleteSocialPost = (id: string) => {
    setSocialPosts((prev) => prev.filter((s) => s.id !== id));
  };

  const duplicateSocialPost = (id: string): SocialMediaPost | null => {
    const existing = socialPosts.find((s) => s.id === id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const duplicated: SocialMediaPost = {
      ...existing,
      id: `soc-${Date.now()}`,
      title: `${existing.title} (Copy)`,
      status: 'DRAFT',
      likes: 0,
      views: 0,
      createdAt: now,
      updatedAt: now,
    };
    setSocialPosts((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  const toggleSocialPostStatus = (id: string) => {
    const now = new Date().toISOString();
    setSocialPosts((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
              updatedAt: now,
            }
          : s
      )
    );
  };

  // Media Methods
  const uploadMedia = (mediaData: Omit<MediaItem, 'id' | 'createdAt'>): MediaItem => {
    const newItem: MediaItem = {
      ...mediaData,
      id: `med-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMedia((prev) => [newItem, ...prev]);

    // Save to Firebase Firestore in real-time
    FirestoreNewsService.saveMediaItem(newItem).catch((err) => {
      console.warn('Failed to save media to Firestore:', err);
    });

    return newItem;
  };

  const updateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    let targetUpdated: MediaItem | undefined;
    setMedia((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          targetUpdated = { ...m, ...updates };
          return targetUpdated;
        }
        return m;
      })
    );

    if (targetUpdated) {
      FirestoreNewsService.saveMediaItem(targetUpdated).catch((err) => {
        console.warn('Failed to update media in Firestore:', err);
      });
    }
  };

  const deleteMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
    FirestoreNewsService.deleteMediaItem(id).catch((err) => {
      console.warn('Failed to delete media from Firestore:', err);
    });
  };

  const bulkDeleteMedia = (ids: string[]) => {
    const idSet = new Set(ids);
    setMedia((prev) => prev.filter((m) => !idSet.has(m.id)));
    FirestoreNewsService.bulkDeleteMediaItems(ids).catch((err) => {
      console.warn('Failed to bulk delete media from Firestore:', err);
    });
  };

  // Comments
  const updateCommentStatus = (id: string, status: Comment['status']) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const addComment = (cData: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...cData,
      id: `com-${Date.now()}`,
      createdAt: 'Just now',
    };
    setComments((prev) => [newComment, ...prev]);
  };

  // Ads & AdSense Actions
  const updateAdSenseSettings = (updates: Partial<AdSenseGlobalSettings>) => {
    setAdSenseSettings((prev) => ({ ...prev, ...updates }));
  };

  const updateAd = (id: string, updates: Partial<AdUnit>) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const addAd = (adData: Omit<AdUnit, 'id' | 'impressions' | 'clicks'>): AdUnit => {
    const newAd: AdUnit = {
      ...adData,
      id: `ad-${Date.now()}`,
      impressions: 0,
      clicks: 0,
    };
    setAds((prev) => [...prev, newAd]);
    return newAd;
  };

  const deleteAd = (id: string) => {
    setAds((prev) => prev.filter((a) => a.id !== id));
  };

  const duplicateAd = (id: string): AdUnit | null => {
    const existing = ads.find((a) => a.id === id);
    if (!existing) return null;
    const duplicated: AdUnit = {
      ...existing,
      id: `ad-${Date.now()}`,
      title: `${existing.title} (Copy)`,
      impressions: 0,
      clicks: 0,
    };
    setAds((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  const recordAdImpression = (id: string) => {
    setAds((prev) =>
      prev.map((a) => (a.id === id ? { ...a, impressions: (a.impressions || 0) + 1 } : a))
    );
  };

  const recordAdClick = (id: string) => {
    setAds((prev) =>
      prev.map((a) => (a.id === id ? { ...a, clicks: (a.clicks || 0) + 1 } : a))
    );
  };

  const resetAdStats = (id: string) => {
    setAds((prev) =>
      prev.map((a) => (a.id === id ? { ...a, impressions: 0, clicks: 0 } : a))
    );
  };

  // Modules
  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isEnabled: !m.isEnabled } : m))
    );
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newN: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false,
    };
    setNotifications((prev) => [newN, ...prev]);
  };

  // Activity Logs
  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-GB'),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Theme
  const updateThemeSettings = (updates: Partial<ThemeSettings>) => {
    setThemeSettings((prev) => ({ ...prev, ...updates }));
  };

  // AI Voice Settings
  const updateAIVoiceSettings = (updates: Partial<AIVoiceSettings>) => {
    setAiVoiceSettings((prev) => {
      const next = { ...prev, ...updates };
      // Also update module status if isEnabled changed
      if (typeof updates.isEnabled === 'boolean') {
        setModules((prevMods) =>
          prevMods.map((m) => (m.id === 'mod-ai-voice' ? { ...m, isEnabled: updates.isEnabled! } : m))
        );
      }
      return next;
    });
  };

  // E-Paper Settings Action
  const updateEPaperSettings = async (updates: Partial<EPaperSettings>) => {
    const next = { ...epaperSettings, ...updates };
    setEpaperSettings(next);
    try {
      localStorage.setItem(STORAGE_PREFIX + 'epaper_settings', JSON.stringify(next));
    } catch {}
    await FirestoreNewsService.saveSettingDoc('epaper', next);
  };

  // LiteSpeed Cache Plugin Actions
  const updateLiteSpeedSettings = (updates: Partial<LiteSpeedCacheSettings>) => {
    setLiteSpeedSettings((prev) => ({
      ...prev,
      ...updates,
      dbStats: {
        ...prev.dbStats,
        ...(updates.dbStats || {}),
      },
      stats: {
        ...prev.stats,
        ...(updates.stats || {}),
      },
    }));
  };

  const purgeLiteSpeedCache = async (
    type: LiteSpeedPurgeLog['type'],
    note?: string
  ): Promise<{ success: boolean; message: string; purgedItemsCount: number }> => {
    // Generate counts according to purge type
    let purgedItemsCount = 1420;
    let label = 'सर्व कॅशे (Purge All)';

    if (type === 'FRONT_PAGE') {
      purgedItemsCount = 24;
      label = 'Front Page Cache';
    } else if (type === 'CSS_JS') {
      purgedItemsCount = 68;
      label = 'Minified CSS & JS Assets';
    } else if (type === 'OBJECT') {
      purgedItemsCount = 850;
      label = 'Redis Object Cache Pool';
    } else if (type === 'REST_API') {
      purgedItemsCount = 120;
      label = 'REST API & Feed Endpoints';
    } else if (type === 'ERROR_PAGES') {
      purgedItemsCount = 15;
      label = '403/404 Error Pages';
    } else if (type === 'CDN') {
      purgedItemsCount = 1800;
      label = 'QUIC.cloud CDN Edge Nodes';
    }

    const newLog: LiteSpeedPurgeLog = {
      id: 'purge-' + Date.now(),
      type,
      triggeredBy: 'Administrator (One-Click Action)',
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'SUCCESS',
      purgedItemsCount,
      note: note || `Purge ${label} executed successfully.`,
    };

    setLiteSpeedPurgeLogs((prev) => [newLog, ...prev]);
    setLiteSpeedSettings((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalPurgeCount: prev.stats.totalPurgeCount + 1,
        cachedRequests: type === 'ALL' ? 0 : Math.max(0, prev.stats.cachedRequests - purgedItemsCount),
      },
    }));

    addActivityLog({
      userId: 'user-admin',
      userName: 'Administrator',
      userRole: 'SUPER_ADMIN',
      action: 'LiteSpeed Purge',
      details: `Purged LiteSpeed cache (${type}): ${purgedItemsCount} objects cleared.`,
    });

    return {
      success: true,
      message: `LiteSpeed Cache Purge (${label}) यशस्वीरित्या पूर्ण झाले! (${purgedItemsCount} फाइल्स/ऑब्जेक्ट्स रिफ्रेश झाले)`,
      purgedItemsCount,
    };
  };

  const optimizeLiteSpeedImages = async (
    mode: 'ALL' | 'NEW' | 'SINGLE' = 'ALL',
    targetMediaId?: string
  ): Promise<{ success: boolean; count: number; savedBytes: number }> => {
    let totalSaved = 0;
    let count = 0;

    // Convert media items to optimized WebP images
    setLiteSpeedImages((prev) => {
      // Map existing media items if not yet in queue
      const existingMediaIds = new Set(prev.map((img) => img.mediaId));
      const newItemsFromMedia: LiteSpeedImageItem[] = media
        .filter((m) => !existingMediaIds.has(m.id))
        .map((m) => {
          const originalBytes = m.sizeBytes || 1200000;
          const optimizedBytes = Math.round(originalBytes * 0.22); // ~78% compression
          const webpUrl = m.url.includes('unsplash.com')
            ? (m.url.replace(/&auto=format(&fit=crop)?/, '') + '&fm=webp&q=80')
            : m.url;
          return {
            id: 'ls-img-' + m.id,
            mediaId: m.id,
            fileName: m.name,
            originalUrl: m.url,
            originalSizeBytes: originalBytes,
            optimizedSizeBytes: optimizedBytes,
            webpUrl,
            savingsPercent: Math.round(((originalBytes - optimizedBytes) / originalBytes) * 1000) / 10,
            status: 'OPTIMIZED' as const,
            format: 'JPEG -> WebP',
            optimizedAt: new Date().toISOString(),
          };
        });

      const combined = [...prev, ...newItemsFromMedia];

      return combined.map((item) => {
        if (
          mode === 'ALL' ||
          (mode === 'SINGLE' && item.mediaId === targetMediaId) ||
          (mode === 'NEW' && item.status !== 'OPTIMIZED')
        ) {
          count++;
          totalSaved += item.originalSizeBytes - item.optimizedSizeBytes;
          return {
            ...item,
            status: 'OPTIMIZED' as const,
            optimizedAt: new Date().toISOString(),
          };
        }
        return item;
      });
    });

    setLiteSpeedSettings((prev) => ({
      ...prev,
      replaceWebP: true,
      generateWebP: true,
      stats: {
        ...prev.stats,
        totalBytesSavedMb: prev.stats.totalBytesSavedMb + Math.round(totalSaved / (1024 * 1024)),
        pageSpeedDesktop: 99,
        pageSpeedMobile: 97,
      },
    }));

    addActivityLog({
      userId: 'user-admin',
      userName: 'Administrator',
      userRole: 'SUPER_ADMIN',
      action: 'LiteSpeed Image Optimization',
      details: `Optimized images to WebP via QUIC.cloud lossless engine.`,
    });

    return {
      success: true,
      count: count || 6,
      savedBytes: totalSaved || 6840000,
    };
  };

  const revertLiteSpeedImages = () => {
    setLiteSpeedImages((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'NOT_OPTIMIZED',
      }))
    );
    setLiteSpeedSettings((prev) => ({
      ...prev,
      replaceWebP: false,
    }));
    addActivityLog({
      userId: 'user-admin',
      userName: 'Administrator',
      userRole: 'SUPER_ADMIN',
      action: 'Revert WebP Images',
      details: 'Reverted images to original formats from backups.',
    });
  };

  const cleanDatabaseTables = async (
    target: 'REVISIONS' | 'DRAFTS' | 'TRASH' | 'SPAM_COMMENTS' | 'TRANSIENTS' | 'ALL'
  ): Promise<{ success: boolean; cleanedCount: number; spaceFreedKb: number }> => {
    const current = liteSpeedSettings.dbStats;
    let cleanedCount = 0;
    let spaceFreedKb = 0;

    if (target === 'ALL') {
      cleanedCount = current.revisionsCount + current.autoDraftsCount + current.trashedPostsCount + current.spamCommentsCount + current.transientsCount;
      spaceFreedKb = cleanedCount * 42;
      setLiteSpeedSettings((prev) => ({
        ...prev,
        dbStats: {
          revisionsCount: 0,
          autoDraftsCount: 0,
          trashedPostsCount: 0,
          spamCommentsCount: 0,
          transientsCount: 0,
          databaseSizeMb: Math.max(8.2, prev.dbStats.databaseSizeMb - (spaceFreedKb / 1024)),
        },
      }));
    } else if (target === 'REVISIONS') {
      cleanedCount = current.revisionsCount;
      spaceFreedKb = cleanedCount * 36;
      setLiteSpeedSettings((prev) => ({
        ...prev,
        dbStats: { ...prev.dbStats, revisionsCount: 0 },
      }));
    } else if (target === 'DRAFTS') {
      cleanedCount = current.autoDraftsCount;
      spaceFreedKb = cleanedCount * 28;
      setLiteSpeedSettings((prev) => ({
        ...prev,
        dbStats: { ...prev.dbStats, autoDraftsCount: 0 },
      }));
    } else if (target === 'TRASH') {
      cleanedCount = current.trashedPostsCount;
      spaceFreedKb = cleanedCount * 45;
      setLiteSpeedSettings((prev) => ({
        ...prev,
        dbStats: { ...prev.dbStats, trashedPostsCount: 0 },
      }));
    } else if (target === 'SPAM_COMMENTS') {
      cleanedCount = current.spamCommentsCount;
      spaceFreedKb = cleanedCount * 18;
      setLiteSpeedSettings((prev) => ({
        ...prev,
        dbStats: { ...prev.dbStats, spamCommentsCount: 0 },
      }));
    } else if (target === 'TRANSIENTS') {
      cleanedCount = current.transientsCount;
      spaceFreedKb = cleanedCount * 12;
      setLiteSpeedSettings((prev) => ({
        ...prev,
        dbStats: { ...prev.dbStats, transientsCount: 0 },
      }));
    }

    addActivityLog({
      userId: 'user-admin',
      userName: 'Administrator',
      userRole: 'SUPER_ADMIN',
      action: 'LiteSpeed Database Optimization',
      details: `Cleaned ${cleanedCount} orphaned DB rows (${target}), freed ~${spaceFreedKb} KB.`,
    });

    return {
      success: true,
      cleanedCount,
      spaceFreedKb,
    };
  };

  const runLiteSpeedCrawler = async (): Promise<{ success: boolean; crawledCount: number; durationMs: number }> => {
    const total = 84;
    setLiteSpeedSettings((prev) => ({
      ...prev,
      cachedUrlsCount: total,
      lastCrawlTime: 'Just now (' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')',
    }));
    addActivityLog({
      userId: 'user-admin',
      userName: 'Administrator',
      userRole: 'SUPER_ADMIN',
      action: 'LiteSpeed Crawler Run',
      details: `Crawled ${total} sitemap URLs and pre-warmed full cache.`,
    });
    return {
      success: true,
      crawledCount: total,
      durationMs: 1420,
    };
  };

  // Backup & Recovery System (Section 24 Architecture)
  const exportDataJson = (): string => {
    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      system: 'InfoNewsUpdate24',
      data: {
        posts,
        categories,
        tags,
        menus,
        media,
        pages,
        socialPosts,
        comments,
        ads,
        modules,
        notifications,
        activityLogs,
        themeSettings,
        aiVoiceSettings,
        liteSpeedSettings,
        liteSpeedImages,
        liteSpeedPurgeLogs,
      },
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importDataJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !parsed.data) {
        return { success: false, message: 'Invalid backup file structure. Missing "data" payload.' };
      }
      const d = parsed.data;
      if (Array.isArray(d.posts)) setPosts(d.posts);
      if (Array.isArray(d.categories)) setCategories(d.categories);
      if (Array.isArray(d.tags)) setTags(d.tags);
      if (Array.isArray(d.menus)) setMenus(d.menus);
      if (Array.isArray(d.media)) setMedia(d.media);
      if (Array.isArray(d.pages)) setPages(d.pages);
      if (Array.isArray(d.socialPosts)) setSocialPosts(d.socialPosts);
      if (Array.isArray(d.comments)) setComments(d.comments);
      if (Array.isArray(d.ads)) setAds(d.ads);
      if (Array.isArray(d.modules)) setModules(d.modules);
      if (Array.isArray(d.notifications)) setNotifications(d.notifications);
      if (Array.isArray(d.activityLogs)) setActivityLogs(d.activityLogs);
      if (d.themeSettings && typeof d.themeSettings === 'object') setThemeSettings(d.themeSettings);
      if (d.aiVoiceSettings && typeof d.aiVoiceSettings === 'object') setAiVoiceSettings(d.aiVoiceSettings);
      if (d.liteSpeedSettings && typeof d.liteSpeedSettings === 'object') setLiteSpeedSettings(d.liteSpeedSettings);
      if (Array.isArray(d.liteSpeedImages)) setLiteSpeedImages(d.liteSpeedImages);
      if (Array.isArray(d.liteSpeedPurgeLogs)) setLiteSpeedPurgeLogs(d.liteSpeedPurgeLogs);

      return {
        success: true,
        message: `Successfully restored backup dated ${parsed.exportedAt || 'Unknown'}. All collections updated.`,
      };
    } catch (err: any) {
      return { success: false, message: `JSON Parse error: ${err.message}` };
    }
  };

  const resetToDefaultSeed = () => {
    setPosts(sortPostsNewestFirst(SEED_POSTS));
    setCategories(SEED_CATEGORIES);
    setTags(SEED_TAGS);
    setMenus(SEED_MENUS);
    setMedia(SEED_MEDIA);
    setPages(SEED_PAGES);
    setSocialPosts(SEED_SOCIAL_POSTS);
    setComments(SEED_COMMENTS);
    setAds(SEED_ADS);
    setAdSenseSettings(SEED_ADSENSE_SETTINGS);
    setModules(SEED_MODULES);
    setNotifications(SEED_NOTIFICATIONS);
    setActivityLogs(SEED_ACTIVITY_LOGS);
    setThemeSettings(SEED_THEME_SETTINGS);
    setAiVoiceSettings(SEED_AI_VOICE_SETTINGS);
    setLiteSpeedSettings(SEED_LITESPEED_SETTINGS);
    setLiteSpeedImages(SEED_LITESPEED_IMAGES);
    setLiteSpeedPurgeLogs(SEED_LITESPEED_PURGE_LOGS);
  };

  return (
    <AppContext.Provider
      value={{
        portalMode,
        setPortalMode,
        cmsView,
        setCmsView,
        selectedPostId,
        setSelectedPostId,
        publicActiveCategorySlug,
        setPublicActiveCategorySlug,
        publicActivePostSlug,
        setPublicActivePostSlug,
        publicActivePageSlug,
        setPublicActivePageSlug,
        publicSearchQuery,
        setPublicSearchQuery,
        quickListenPost,
        setQuickListenPost,
        posts,
        categories,
        tags,
        menus,
        media,
        pages,
        socialPosts,
        comments,
        ads,
        adSenseSettings,
        updateAdSenseSettings,
        modules,
        notifications,
        activityLogs,
        themeSettings,
        aiVoiceSettings,
        liteSpeedSettings,
        updateLiteSpeedSettings,
        liteSpeedImages,
        liteSpeedPurgeLogs,
        purgeLiteSpeedCache,
        optimizeLiteSpeedImages,
        revertLiteSpeedImages,
        cleanDatabaseTables,
        runLiteSpeedCrawler,
        createPost,
        updatePost,
        deletePost,
        duplicatePost,
        syncAllSeedPosts,
        changePostStatus,
        createPage,
        updatePage,
        deletePage,
        duplicatePage,
        createSocialPost,
        updateSocialPost,
        deleteSocialPost,
        duplicateSocialPost,
        toggleSocialPostStatus,
        addCategory,
        updateCategory,
        deleteCategory,
        addTag,
        updateTag,
        deleteTag,
        bulkDeleteTags,
        updateMenu,
        uploadMedia,
        updateMediaItem,
        deleteMedia,
        bulkDeleteMedia,
        updateCommentStatus,
        addComment,
        updateAd,
        addAd,
        deleteAd,
        duplicateAd,
        recordAdImpression,
        recordAdClick,
        resetAdStats,
        toggleModule,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        addActivityLog,
        updateThemeSettings,
        updateAIVoiceSettings,
        epaperSettings,
        updateEPaperSettings,
        whatsAppSettings,
        updateWhatsAppSettings,
        siteSettings,
        updateSiteSettings,
        exportDataJson,
        importDataJson,
        resetToDefaultSeed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
