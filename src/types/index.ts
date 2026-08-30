export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EDITOR'
  | 'SUB_EDITOR'
  | 'REPORTER'
  | 'VIDEO_REPORTER'
  | 'PHOTOGRAPHER'
  | 'USER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export type Permission =
  | 'post.create'
  | 'post.edit'
  | 'post.edit_own'
  | 'post.delete'
  | 'post.delete_own'
  | 'post.submit'
  | 'post.review'
  | 'post.approve'
  | 'post.publish'
  | 'category.manage'
  | 'tag.manage'
  | 'media.upload'
  | 'media.manage'
  | 'page.manage'
  | 'menu.manage'
  | 'user.manage'
  | 'role.manage'
  | 'appearance.manage'
  | 'theme.manage'
  | 'advertisement.manage'
  | 'seo.manage'
  | 'settings.manage'
  | 'comments.manage'
  | 'analytics.view'
  | 'logs.view';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  memberSince: string;
  password?: string;
  designation?: string;
  bio?: string;
  phone?: string;
  location?: string;
  socialTwitter?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialWhatsApp?: string;
  customPermissions?: Permission[];
}

export type PostStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NEEDS_CORRECTION'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'REJECTED';

export type PostVisibility = 'PUBLIC' | 'PRIVATE' | 'PASSWORD_PROTECTED';

export interface WorkflowHistoryEntry {
  id: string;
  fromStatus: PostStatus;
  toStatus: PostStatus;
  changedBy: string;
  changedByRole: UserRole;
  timestamp: string;
  note?: string;
}

export interface PostSEO {
  focusKeyword: string;
  seoTitle: string;
  metaDescription: string;
  score: number; // 0 - 100
  checks: {
    keywordInTitle: boolean;
    keywordInUrl: boolean;
    keywordInDescription: boolean;
    keywordInFirstParagraph: boolean;
    keywordInHeadings: boolean;
    contentLengthOk: boolean;
    hasInternalLinks: boolean;
    hasExternalLinks: boolean;
    hasImageAlt: boolean;
    readabilityOk: boolean;
  };
  newsReadiness?: 'READY' | 'NEEDS_IMPROVEMENT' | 'MISSING_ELEMENTS';
  discoverReadiness?: 'READY' | 'NEEDS_IMPROVEMENT' | 'MISSING_ELEMENTS';
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  featuredImageCaption?: string;
  featuredImageAlt?: string;
  categoryId: string;
  subCategoryId?: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  status: PostStatus;
  visibility: PostVisibility;
  publishDate: string;
  scheduleDate?: string;
  views: number;
  likes: number;
  readingTimeMinutes: number;
  location?: string; // e.g. "Mumbai", "Gadchiroli", "Nagpur"
  isBreaking?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  isVideoNews?: boolean;
  videoUrl?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  seo: PostSEO;
  workflowHistory: WorkflowHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  displayOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
  icon?: string;
  image?: string;
  postCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  count: number;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mimeType: string;
  sizeBytes: number;
  dimensions?: { width: number; height: number };
  altText: string;
  caption?: string;
  credit?: string;
  uploadedBy: string;
  createdAt: string;
}

export type MenuItemType = 'HOME' | 'PAGE' | 'CATEGORY' | 'TAG' | 'CUSTOM_LINK';

export interface MenuItem {
  id: string;
  label: string;
  type: MenuItemType;
  url: string;
  target?: '_self' | '_blank';
  order: number;
  parentId?: string | null;
  children?: MenuItem[];
  icon?: string;
}

export interface MenuLocation {
  id: 'HEADER' | 'MOBILE' | 'FOOTER' | 'TOP_BAR';
  name: string;
  menuId: string;
}

export interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  authorName?: string;
  authorRole?: string;
  status: 'PUBLISHED' | 'DRAFT' | 'TRASH';
  template?: 'default' | 'full_width' | 'contact' | 'policy';
  order?: number;
  seoTitle?: string;
  metaDescription?: string;
  views?: number;
  createdAt: string;
  updatedAt: string;
}

export type SocialPlatform = 'INSTAGRAM' | 'FACEBOOK' | 'YOUTUBE' | 'TWITTER';
export type SocialMediaType = 'REEL' | 'VIDEO' | 'POST' | 'SHORT';

export interface SocialMediaPost {
  id: string;
  title: string;
  platform: SocialPlatform;
  mediaType: SocialMediaType;
  url: string;
  embedUrl?: string;
  thumbnailUrl: string;
  caption?: string;
  authorName: string;
  authorHandle?: string;
  location?: string;
  category?: string;
  status: 'PUBLISHED' | 'DRAFT';
  likes?: number;
  views?: number;
  isFeaturedReel?: boolean;
  displayOrder?: number;
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  postTitle: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  status: 'APPROVED' | 'PENDING' | 'SPAM' | 'TRASH';
  createdAt: string;
}

export type AdType = 'ADSENSE' | 'BANNER' | 'HTML' | 'SCRIPT' | 'SPONSORED' | 'CUSTOM';

export type AdPosition =
  | 'HEADER'
  | 'BELOW_HEADER'
  | 'HOME_TOP'
  | 'HOME_MIDDLE'
  | 'CATEGORY_TOP'
  | 'ARTICLE_TOP'
  | 'ARTICLE_MIDDLE'
  | 'ARTICLE_BOTTOM'
  | 'SIDEBAR_TOP'
  | 'SIDEBAR_BOTTOM'
  | 'FOOTER'
  | 'MOBILE_STICKY'
  | 'EPAPER_HEADER'
  | 'EPAPER_PAGE_BOTTOM'
  | 'EPAPER_CLASSIFIED'
  | 'EPAPER_CLIP_SPONSOR';

export interface AdSenseGlobalSettings {
  isEnabled: boolean; // Master toggle for Google AdSense
  publisherId: string; // e.g. "ca-pub-9842109847120934"
  autoAdsEnabled: boolean; // Google Auto Ads script
  adBlockerNoticeEnabled: boolean; // Polite popup/banner for ad-blockers
  adsTxtContent: string; // Content of ads.txt verification file
  lazyLoadAds: boolean; // Optimize PageSpeed Core Web Vitals
  hideAdsForLoggedInUsers: boolean; // Don't show ads to logged-in CMS staff
  revenueCurrency: 'INR' | 'USD';
  estimatedCpmInr: number; // e.g. ₹55 CPM for Indian Marathi news publishers
}

export interface AdUnit {
  id: string;
  title: string;
  type: AdType;
  position: AdPosition;
  codeOrUrl: string;
  targetUrl?: string;
  status: 'ACTIVE' | 'PAUSED';
  priority: number;
  deviceTargeting: 'ALL' | 'DESKTOP' | 'MOBILE';
  impressions: number;
  clicks: number;
  startDate?: string;
  endDate?: string;
  // Enhanced properties
  adSenseSlotId?: string;
  adSizePreset?:
    | 'RESPONSIVE'
    | 'LEADERBOARD_728x90'
    | 'RECTANGLE_300x250'
    | 'HALF_PAGE_300x600'
    | 'BILLBOARD_970x250'
    | 'MOBILE_320x50'
    | 'CUSTOM';
  customWidth?: number;
  customHeight?: number;
  sponsorName?: string;
  sponsorBadge?: boolean;
  relAttributes?: string; // e.g. "sponsored nofollow"
  openInNewTab?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'REVIEW' | 'PUBLISH' | 'COMMENT' | 'SYSTEM' | 'CORRECTION';
  timestamp: string;
  isRead: boolean;
  targetUrl?: string;
  relatedPostId?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  location?: string;
}

export interface InternalModule {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  isEnabled: boolean;
  icon: string;
  config?: Record<string, unknown>;
}

export interface AIVoiceSettings {
  isEnabled: boolean; // Master enable/disable for AI voice reader on the public news portal
  anchorId: string; // Active Google Conversational Voice Anchor ID (nyla, elio, knox, jett, zeno, tova, kaci, lani, holt, lora, paz, tyra)
  speed: number; // Playback speed (0.75, 0.9, 1.0, 1.2, 1.4)
  lang: 'mr' | 'en'; // Primary reading language
  showSpeakerOnCards: boolean; // Show 🔊 quick listen button on all news cards in public portal
  allowUserToChangeAnchor: boolean; // Whether readers can choose a different voice or strictly use admin's choice
  autoIntroGreeting: boolean; // Whether to play intro bulletin greeting before the news content
  readFullArticleInSequence: boolean; // Read title, excerpt and full body sequentially
}

export interface BreakingTickerItem {
  id: string;
  text: string;
  url?: string;
  tag?: string; // e.g. "महत्त्वाचे", "लाईव्ह", "विशेष", "अपडेट", "अलर्ट"
  isPublished: boolean;
  priority?: number;
  createdAt?: string;
}

export interface BreakingTickerSettings {
  isEnabled: boolean; // Master toggle to show/hide scrolling ticker below menu
  title: string; // e.g. "🔴 ब्रेकिंग न्यूज", "⚡ ताज्या घडामोडी", "🚨 FLASH NEWS"
  source: 'AUTOMATIC_BREAKING' | 'CUSTOM_ITEMS' | 'ALL_RECENT' | 'CATEGORY_NEWS';
  selectedCategoryId?: string;

  // Visual styling
  badgeBgColor: string; // e.g. #dc2626 (Red), #991b1b, #1e293b, #d97706
  badgeTextColor: string; // e.g. #ffffff
  badgeIcon: 'flame' | 'radio' | 'zap' | 'bell' | 'alert' | 'sparkles';
  tickerBgColor: string; // e.g. '#0f172a' (Dark Navy), '#1e293b', '#ffffff', '#f8fafc', '#7f1d1d'
  tickerTextColor: string; // e.g. '#f8fafc', '#1e293b'

  // Motion & Behavior
  scrollSpeed: 'slow' | 'normal' | 'fast' | 'ultra_fast' | 'paused';
  pauseOnHover: boolean;
  separatorIcon: 'bullet' | 'zap' | 'flame' | 'star' | 'pipe';
  isSticky: boolean; // Sticky right below navigation bar
  showDateOrTimeBadge: boolean;

  // Custom flash news items managed by Admin
  customItems: BreakingTickerItem[];
}

export interface LiteSpeedImageItem {
  id: string;
  mediaId: string;
  fileName: string;
  originalUrl: string;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  webpUrl: string;
  savingsPercent: number;
  status: 'NOT_OPTIMIZED' | 'IN_QUEUE' | 'OPTIMIZED' | 'FAILED';
  format: string; // e.g. 'JPEG -> WebP', 'PNG -> WebP'
  optimizedAt?: string;
}

export interface LiteSpeedPurgeLog {
  id: string;
  type: 'ALL' | 'FRONT_PAGE' | 'CSS_JS' | 'OBJECT' | 'REST_API' | 'ERROR_PAGES' | 'CDN' | 'AUTO_POST';
  triggeredBy: string;
  timestamp: string;
  status: 'SUCCESS' | 'IN_PROGRESS';
  purgedItemsCount: number;
  note: string;
}

export interface LiteSpeedCacheSettings {
  isEnabled: boolean; // Master LiteSpeed Cache switch
  serverType: 'LiteSpeed Enterprise' | 'OpenLiteSpeed' | 'LiteSpeed Web ADC';
  serverVersion: string;
  quicCloudConnected: boolean;
  quicCloudNode: string;
  http3Enabled: boolean;
  objectCacheType: 'Redis' | 'Memcached' | 'Disabled';

  // Cache Rules & TTLs
  cacheLoggedInUsers: boolean;
  cacheCommenters: boolean;
  cacheRestApi: boolean;
  cacheMobile: boolean;
  publicTtlSeconds: number; // e.g. 604800 (7 days)
  frontPageTtlSeconds: number;
  feedTtlSeconds: number;
  purgeOnPostUpdate: boolean;
  autoPurgeRules: {
    frontPage: boolean;
    homeFeed: boolean;
    categories: boolean;
    tags: boolean;
    author: boolean;
    archive: boolean;
  };

  // Image Optimization Engine (QUIC.cloud & WebP)
  autoRequestCron: boolean;
  autoPullImages: boolean;
  generateWebP: boolean;
  replaceWebP: boolean; // Replaces images on public portal with WebP automatically
  losslessCompression: boolean;
  backupOriginals: boolean;
  lazyLoadImages: boolean;
  responsivePlaceholder: boolean;
  imageQuality: number; // 60-100 (Default 82)

  // Page Optimization (CSS / JS / HTML)
  cssMinify: boolean;
  cssCombine: boolean;
  ucssEnabled: boolean; // Generate Unique Critical CSS
  cssAsync: boolean;
  jsMinify: boolean;
  jsCombine: boolean;
  jsDefer: boolean;
  htmlMinify: boolean;
  dnsPrefetch: boolean;
  fontDisplaySwap: boolean;

  // Database Optimizer metrics
  dbStats: {
    revisionsCount: number;
    autoDraftsCount: number;
    trashedPostsCount: number;
    spamCommentsCount: number;
    transientsCount: number;
    databaseSizeMb: number;
  };

  // Crawler / Cache Warmer
  crawlerEnabled: boolean;
  crawlerIntervalMinutes: number;
  totalSitemapUrls: number;
  cachedUrlsCount: number;
  lastCrawlTime?: string;

  // Real-time Telemetry & Metrics
  stats: {
    cacheHitRatio: number; // e.g. 95.2%
    cachedRequests: number;
    uncachedRequests: number;
    avgTtfbMs: number; // Time to first byte (e.g. 24ms)
    totalBytesSavedMb: number;
    pageSpeedDesktop: number; // e.g. 99
    pageSpeedMobile: number; // e.g. 96
    totalPurgeCount: number;
  };
}

export interface ThemeSettings {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  headerLayout: 'standard' | 'centered' | 'compact';
  footerLayout: 'four-column' | 'three-column' | 'minimal';
  // Header Date Settings
  showHeaderDate: boolean;
  headerDateFormat: 'marathi' | 'english' | 'marathi_with_time' | 'marathi_with_tithi';
  showLiveClock: boolean;
  // Header Breaking News Settings
  showBreakingNews: boolean;
  breakingNewsLabel: string;
  breakingNewsBadgeColor: string;
  breakingNewsSpeed: 'slow' | 'normal' | 'fast';
  // Sub-Menu Breaking News Scrolling Ticker Settings
  breakingTicker: BreakingTickerSettings;
  // Header Social Icons Settings
  showHeaderSocialIcons: boolean;
  enabledSocialPlatforms: {
    facebook: boolean;
    twitter: boolean;
    instagram: boolean;
    youtube: boolean;
    telegram: boolean;
    whatsapp: boolean;
  };
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    telegram?: string;
    whatsapp?: string;
  };
  // Other Portal Settings
  showWeatherWidget: boolean;
  showLiveTvButton: boolean;
  liveTvEmbedUrl: string;
}

// -------------------------------------------------------------
// E-PAPER HUB & ARTICLE CLIPPER TYPES
// -------------------------------------------------------------

export interface EPaperArticleClip {
  id: string;
  title: string;
  category: string;
  pageNumber: number;
  headline: string;
  summary: string;
  fullBody?: string;
  authorName?: string;
  location?: string;
  image?: string;
  bounds?: {
    x: number; // percentage (0-100)
    y: number; // percentage (0-100)
    width: number; // percentage (0-100)
    height: number; // percentage (0-100)
  };
}

export interface EPaperPage {
  id: string;
  pageNumber: number;
  title: string;
  pageType: 'main' | 'maharashtra' | 'district' | 'editorial' | 'business' | 'sports';
  imageUrl: string;
  thumbnailUrl: string;
  articles: EPaperArticleClip[];
}

export interface EPaperEdition {
  id: string;
  editionCode: string; // e.g. 'pune', 'mumbai', 'nagpur', 'nashik', 'sambhajinagar', 'gadchiroli', 'kolhapur'
  districtName: string; // e.g. 'पुणे आवृत्ती', 'मुंबई आवृत्ती'
  date: string; // YYYY-MM-DD
  formattedDateMarathi: string; // 'शनिवार, २९ ऑगस्ट २०२६'
  totalPages: number;
  pdfUrl?: string;
  coverImage: string;
  pages: EPaperPage[];
}

export interface EPaperSettings {
  newspaperName: string;
  newspaperTagline: string;
  rniNumber: string;
  priceText: string;
  showFeaturedImages: boolean;
  showWeatherWidget: boolean;
  enableDropCap: boolean;
  autoSyncWithPosts: boolean;
  watermarkText: string;
  clipSponsorText: string;
  enableAudioOnClip: boolean;
  adContactNumber: string;
  topSolusAdText: string;
  bottomStripAdText: string;
  enabledDistricts: string[];
}

// -------------------------------------------------------------
// WEB PUSH ALERTS & BREAKING NOTIFICATIONS TYPES
// -------------------------------------------------------------

export interface WebPushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  url: string;
  targetTopic: 'ALL' | 'BREAKING' | 'POLITICS' | 'KRISHI' | 'DISTRICT';
  targetDistrict?: string;
  sentAt: string;
  totalSent: number;
  clicksCount: number;
  status: 'SENT' | 'SCHEDULED' | 'FAILED';
}

export interface WebPushSettings {
  isEnabled: boolean;
  autoPromptOnFirstVisit: boolean;
  promptDelaySeconds: number;
  promptTitleMarathi: string;
  promptSubtitleMarathi: string;
  allowSoundAlert: boolean;
  allowVibration: boolean;
  defaultIconUrl: string;
}

// -------------------------------------------------------------
// LIVE CRICKET & KRISHI MANDI RATES TYPES
// -------------------------------------------------------------

export interface CricketMatchScore {
  id: string;
  matchTitle: string;
  tournament: string;
  team1: { name: string; shortName: string; flag: string; score: string; overs: string };
  team2: { name: string; shortName: string; flag: string; score?: string; overs?: string };
  currentStatus: string;
  isLive: boolean;
  currentBatsmen: Array<{
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    isStriker: boolean;
  }>;
  currentBowler: {
    name: string;
    overs: string;
    maidens: number;
    runs: number;
    wickets: number;
  };
  recentBalls: string[];
  venue: string;
}

export interface APMCMandiRate {
  id: string;
  commodityName: string;
  category: 'VEGETABLES' | 'GRAINS' | 'OILSEEDS' | 'METALS';
  mandiName: string;
  minRate: number;
  maxRate: number;
  avgRate: number;
  unit: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  changeAmount: number;
  updatedAt: string;
}

// -------------------------------------------------------------
// WHATSAPP CHANNEL & COMMUNITY SUITE TYPES
// -------------------------------------------------------------

export interface DistrictWhatsAppGroup {
  id: string;
  districtName: string;
  inviteLink: string;
  memberCount: string;
  isActive: boolean;
}

export interface WhatsAppChannelSettings {
  isEnabled: boolean;
  officialChannelUrl: string;
  channelName: string;
  subscriberCountText: string;
  showFloatingButton: boolean;
  showInArticleBanner: boolean;
  inArticleBannerText: string;
  districtGroups: DistrictWhatsAppGroup[];
}

// -------------------------------------------------------------
// WHATSAPP BULLETIN & DAILY DIGEST TYPES
// -------------------------------------------------------------

export interface WhatsAppBulletinConfig {
  bulletinType: 'MORNING' | 'EVENING' | 'BREAKING';
  customGreeting?: string;
  includeEPaperLink: boolean;
  includeChannelLink: boolean;
  includeAdText: boolean;
  customAdText?: string;
  includeReadMoreLinks: boolean;
  selectedPostIds: string[];
}

// -------------------------------------------------------------
// MERCHANT SELF-SERVICE UPI AD BOOKING TYPES
// -------------------------------------------------------------

export type AdSlotPositionType =
  | 'HEADER'
  | 'ARTICLE_MID'
  | 'SIDEBAR'
  | 'MOBILE_STICKY'
  | 'EPAPER_SOLUS';

export interface AdPackagePricing {
  slot: AdSlotPositionType;
  title: string;
  dimensions: string;
  price7Days: number;
  price15Days: number;
  price30Days: number;
  description: string;
  badge: string;
}

export interface MerchantAdBooking {
  id: string;
  bookingNumber: string;
  businessName: string;
  contactPerson: string;
  mobileNumber: string;
  email?: string;
  slotPosition: AdSlotPositionType;
  durationDays: 7 | 15 | 30;
  amountPaid: number;
  bannerImageUrl: string;
  targetUrl: string;
  upiTransactionId: string;
  paymentScreenshotUrl?: string;
  status: 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  startDate?: string;
  endDate?: string;
  adminNote?: string;
}

// -------------------------------------------------------------
// GOOGLE WEB STORIES SUITE TYPES
// -------------------------------------------------------------

export interface WebStorySlide {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
  tag?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface WebStory {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  category: string;
  slides: WebStorySlide[];
  author: string;
  publishDate: string;
  viewsCount: number;
  isPublished: boolean;
  isFeatured: boolean;
}

// -------------------------------------------------------------
// LIVE MAHARASHTRA DISTRICT WEATHER & RAIN ALERTS TYPES
// -------------------------------------------------------------

export interface DistrictCoordinate {
  id: string;
  nameMr: string;
  nameEn: string;
  region: 'पश्चिम महाराष्ट्र' | 'कोकण' | 'मराठवाडा' | 'विदर्भ' | 'उत्तर महाराष्ट्र';
  lat: number;
  lon: number;
  type?: 'DISTRICT' | 'TALUKA';
  parentDistrictId?: string;
}

export interface DailyWeatherForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  rainProbability: number;
  weatherCode: number;
  conditionText: string;
}

export interface LiveDistrictWeather {
  districtId: string;
  districtName: string;
  region: string;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  conditionText: string;
  conditionIcon: 'SUN' | 'PARTLY_CLOUDY' | 'CLOUDY' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'THUNDERSTORM';
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  isRainAlert: boolean;
  alertSeverity?: 'YELLOW' | 'ORANGE' | 'RED' | 'GREEN';
  alertMessage?: string;
  dailyForecast: DailyWeatherForecast[];
  updatedAt: string;
  source: string;
}

// -------------------------------------------------------------
// CITIZEN JOURNALISM & READER NEWS REPORT TYPES
// -------------------------------------------------------------

export interface CitizenNewsReport {
  id: string;
  reportNumber: string;
  reporterName: string;
  reporterMobile: string;
  reporterEmail?: string;
  district: string;
  talukaVillage: string;
  category: string;
  headline: string;
  description: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'PUBLISHED' | 'REJECTED';
  submittedAt: string;
  adminNotes?: string;
  convertedPostId?: string;
}

// -------------------------------------------------------------
// MAHARASHTRA GOVT SCHEMES, GRS & SARKARI NAUKRI TYPES
// -------------------------------------------------------------

export type SchemeCategory =
  | 'WOMEN_CHILD' // महिला व बालविकास (लाडकी बहीण इ.)
  | 'FARMERS' // शेतकरी व कृषी योजना (नमो शेतकरी, पीक विमा)
  | 'EMPLOYMENT' // नोकरी व भरती (पोलीस, MPSC, तलाठी)
  | 'STUDENTS' // विद्यार्थी व स्कॉलरशिप (MahaDBT)
  | 'SOCIAL_WELFARE' // सामाजिक न्याय व पेन्शन
  | 'HEALTH'; // आरोग्य व विमा (महात्मा फुले जनआरोग्य)

export interface GovtSchemeOrJob {
  id: string;
  title: string;
  category: SchemeCategory;
  type: 'SCHEME' | 'JOB' | 'GR';
  department: string;
  grNumberOrAdvtNo?: string;
  summary: string;
  benefitsOrPayScale: string;
  eligibility: string[];
  documentsRequired: string[];
  lastDateOrStatus: string;
  officialApplyLink: string;
  grPdfDownloadUrl?: string;
  publishedDate: string;
  isFeatured: boolean;
  viewsCount: number;
}

// -------------------------------------------------------------
// MULTI-LANGUAGE TRANSLATION & I18N TYPES
// -------------------------------------------------------------

export type LanguageCode = 'mr' | 'en' | 'hi' | 'te' | 'gu' | 'kn';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  englishName: string;
  flagOrIcon: string;
  scriptLabel: string;
  voiceLang: string;
  direction?: 'ltr' | 'rtl';
}

// -------------------------------------------------------------
// DAILY MARATHI PANCHANG, DINVISHESH & HOROSCOPE TYPES
// -------------------------------------------------------------

export interface DailyPanchangData {
  dateFormatted: string;
  dayNameMr: string;
  shakaYear: string;
  samvatYear: string;
  samvatsarName: string;
  maasName: string;
  paksha: string;
  tithi: string;
  tithiDetails: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonPhase: string;
  rahuKaal: string;
  abhijitMuhurat: string;
  amritKaal: string;
  festivalOrSpecialDay?: string;
}

export interface DailyDinvishesh {
  dateFormatted: string;
  historicalEvents: string[];
  birthdays: string[];
  memorials: string[];
  quoteOfTheDay: {
    text: string;
    author: string;
  };
}

export interface DailyRashiForecast {
  id: string;
  nameMr: string;
  nameEn: string;
  symbol: string;
  element: string;
  luckyColor: string;
  luckyNumber: number;
  prediction: string;
  career: string;
  finance: string;
  health: string;
}

export interface SiteGlobalSettings {
  siteTitle: string;
  siteTagline: string;
  siteUrl: string;
  siteEmail: string;
  sitePhone: string;
  siteAddress: string;
  headerLogoUrl?: string;
  footerLogoUrl?: string;
  faviconUrl?: string;
  rniRegNumber?: string;
  grievanceOfficerName?: string;
  grievanceOfficerEmail?: string;
  grievanceOfficerPhone?: string;
  copyrightText?: string;
  googleAnalyticsId?: string;
  googleSearchConsoleMeta?: string;
  adsensePublisherId?: string;
  defaultSocialShareImage?: string;
  enableComments: boolean;
  requireCommentApproval: boolean;
  blacklistedWords: string;
  maintenanceMode: boolean;
  antiCopyProtection: boolean;
  autoRefreshIntervalMinutes: number;
  socialFacebook?: string;
  socialTwitter?: string;
  socialYouTube?: string;
  socialInstagram?: string;
  socialTelegram?: string;
  socialWhatsAppChannel?: string;
}
