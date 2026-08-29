import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle,
  ChevronRight,
  CloudDownload,
  Copy,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Filter,
  Flame,
  FolderTree,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Loader2,
  Newspaper,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  UploadCloud,
  Zap,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  LiveWebsiteScraperService,
  ScrapedArticle,
} from '../../services/LiveWebsiteScraperService';
import {
  WordPressImporterService,
  WordPressImportResult,
} from '../../services/WordPressImporterService';
import { Post, StaticPage } from '../../types';

// Sample Built-in WordPress WXR XML dataset for instant 1-click test import
const SAMPLE_MARATHI_WP_WXR_XML = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/"
>
<channel>
  <title>महाराष्ट्र लाईव्ह न्यूज नेटवर्क</title>
  <link>https://maharashtralivenews.com</link>
  <description>महाराष्ट्रातील अग्रगण्य डिजिटल वृत्तसंकेतस्थळ</description>
  <wp:wxr_version>1.2</wp:wxr_version>
  
  <wp:category>
    <wp:term_id>101</wp:term_id>
    <wp:category_nicename>maharashtra</wp:category_nicename>
    <wp:cat_name><![CDATA[महाराष्ट्र घडामोडी]]></wp:cat_name>
  </wp:category>
  <wp:category>
    <wp:term_id>102</wp:term_id>
    <wp:category_nicename>politics</wp:category_nicename>
    <wp:cat_name><![CDATA[महाराष्ट्र राजकारण]]></wp:cat_name>
  </wp:category>
  <wp:category>
    <wp:term_id>103</wp:term_id>
    <wp:category_nicename>technology</wp:category_nicename>
    <wp:cat_name><![CDATA[तंत्रज्ञान विशेष]]></wp:cat_name>
  </wp:category>

  <!-- Post 1 -->
  <item>
    <title><![CDATA[मुंबई-गोवा महामार्गाचे चौपदरीकरण अंतिम टप्प्यात; गणेशोत्सवापूर्वी सर्व मार्गिका वाहतुकीसाठी खुल्या होणार]]></title>
    <link>https://maharashtralivenews.com/mumbai-goa-highway-four-lane-complete/</link>
    <pubDate>Fri, 28 Aug 2026 09:30:00 +0000</pubDate>
    <dc:creator><![CDATA[संजय पवार (विशेष प्रतिनिधी)]]></dc:creator>
    <wp:post_id>5001</wp:post_id>
    <wp:post_date><![CDATA[2026-08-28 15:00:00]]></wp:post_date>
    <wp:post_name><![CDATA[mumbai-goa-highway-four-lane-complete]]></wp:post_name>
    <wp:status><![CDATA[publish]]></wp:status>
    <wp:post_type><![CDATA[post]]></wp:post_type>
    <category domain="category" nicename="maharashtra"><![CDATA[महाराष्ट्र]]></category>
    <category domain="post_tag" nicename="highway"><![CDATA[महामार्ग]]></category>
    <category domain="post_tag" nicename="kokan"><![CDATA[कोकण]]></category>
    <content:encoded><![CDATA[
      <p><strong>रत्नागिरी:</strong> कोकणवासीयांचे अनेक वर्षांचे स्वप्न असणाऱ्या मुंबई-गोवा राष्ट्रीय महामार्गाच्या (NH-66) चौपदरीकरणाचे काम ९५ टक्क्यांपेक्षा जास्त पूर्ण झाले असून येत्या गणेशोत्सवापूर्वी सर्व मार्गिका वाहतुकीसाठी खुल्या केल्या जाणार आहेत.</p>
      <p>सार्वजनिक बांधकाम मंत्री आणि राष्ट्रीय महामार्ग प्राधिकरणाच्या वरिष्ठ अधिकाऱ्यांनी काल संपूर्ण मार्गाची संयुक्त पाहणी केली. कशेडी घाट बोगद्यातील उर्वरित तांत्रिक कामे पूर्ण झाली असून प्रवासाचा वेळ आता ३ तासांनी कमी होणार आहे.</p>
      <p>महामार्गावर ठिकठिकाणी आपत्कालीन मदत केंद्रे, सीएनजी आणि ईव्ही चार्जिंग स्टेशन्सची उभारणी करण्यात आली आहे.</p>
    ]]></content:encoded>
    <excerpt:encoded><![CDATA[मुंबई-गोवा राष्ट्रीय महामार्गाचे चौपदरीकरण ९५% पूर्ण; गणेशोत्सवापूर्वी सर्व मार्गिका सुरू होणार.]]></excerpt:encoded>
    <wp:postmeta>
      <wp:meta_key><![CDATA[_thumbnail_id]]></wp:meta_key>
      <wp:meta_value><![CDATA[6001]]></wp:meta_value>
    </wp:postmeta>
  </item>

  <!-- Post 2 -->
  <item>
    <title><![CDATA[पुण्यातील हिंजवडी आयटी पार्कमध्ये नवीन हाय-स्पीड मेट्रो कॉरिडॉरला मंजुरी; १ लाख आयटीयन्सना मोठा फायदा]]></title>
    <link>https://maharashtralivenews.com/pune-hinjawadi-metro-corridor-approved/</link>
    <pubDate>Fri, 28 Aug 2026 08:15:00 +0000</pubDate>
    <dc:creator><![CDATA[अमित कुलकर्णी]]></dc:creator>
    <wp:post_id>5002</wp:post_id>
    <wp:post_date><![CDATA[2026-08-28 13:45:00]]></wp:post_date>
    <wp:post_name><![CDATA[pune-hinjawadi-metro-corridor-approved]]></wp:post_name>
    <wp:status><![CDATA[publish]]></wp:status>
    <wp:post_type><![CDATA[post]]></wp:post_type>
    <category domain="category" nicename="technology"><![CDATA[तंत्रज्ञान व गॅजेट्स]]></category>
    <category domain="post_tag" nicename="pune"><![CDATA[पुणे]]></category>
    <category domain="post_tag" nicename="metro"><![CDATA[मेट्रो]]></category>
    <content:encoded><![CDATA[
      <p><strong>पुणे:</strong> पुणे आणि पिंपरी-चिंचवड परिसरातील वाहतूक कोंडीवर कायमस्वरूपी मात करण्यासाठी हिंजवडी ते शिवाजीनगर मेट्रो मार्गाला फेज-३ अंतर्गत वाकड आणि चाकण एमआयडीसीशी जोडण्याचा महत्त्वाकांक्षी प्रस्ताव मंजूर करण्यात आला आहे.</p>
      <p>या मेट्रो कॉरिडॉरमुळे दररोज प्रवास करणाऱ्या १ लाखांहून अधिक आयटी आणि ऑटोमोबाईल कर्मचाऱ्यांना प्रदूषणमुक्त आणि वेगवान प्रवासाचा पर्याय उपलब्ध होणार आहे.</p>
    ]]></content:encoded>
    <excerpt:encoded><![CDATA[हिंजवडी ते शिवाजीनगर मेट्रो कॉरिडॉरचा विस्तार; वाकड आणि चाकणशी थेट कनेक्टिव्हिटी मिळणार.]]></excerpt:encoded>
    <wp:postmeta>
      <wp:meta_key><![CDATA[_thumbnail_id]]></wp:meta_key>
      <wp:meta_value><![CDATA[6002]]></wp:meta_value>
    </wp:postmeta>
  </item>

  <!-- Post 3 -->
  <item>
    <title><![CDATA[राज्यातील अंगणवाडी सेविकांच्या मानधनात १०,००० रुपयांची वाढ; महिला व बालविकास खात्याचा शासन निर्णय जारी]]></title>
    <link>https://maharashtralivenews.com/maharashtra-anganwadi-honorarium-hike-gr/</link>
    <pubDate>Fri, 28 Aug 2026 07:00:00 +0000</pubDate>
    <dc:creator><![CDATA[स्वाती जोशी]]></dc:creator>
    <wp:post_id>5003</wp:post_id>
    <wp:post_date><![CDATA[2026-08-28 12:30:00]]></wp:post_date>
    <wp:post_name><![CDATA[maharashtra-anganwadi-honorarium-hike-gr]]></wp:post_name>
    <wp:status><![CDATA[publish]]></wp:status>
    <wp:post_type><![CDATA[post]]></wp:post_type>
    <category domain="category" nicename="politics"><![CDATA[राजकारण]]></category>
    <category domain="post_tag" nicename="anganwadi"><![CDATA[अंगणवाडी]]></category>
    <content:encoded><![CDATA[
      <p><strong>मुंबई:</strong> राज्यातील २ लाखांहून अधिक अंगणवाडी सेविका आणि मदतनीसांच्या प्रदीर्घ लढ्याला मोठे यश आले असून राज्य सरकारने त्यांच्या मासिक मानधनात भरीव वाढ करण्याचा शासन निर्णय (GR) आज जारी केला आहे.</p>
      <p>या निर्णयानुसार अंगणवाडी सेविकांना आता प्रतिमहा १८,५०० रुपये तर मदतनीसांना १२,००० रुपये मानधन दिले जाणार आहे. तसेच त्यांना पेन्शन आणि वैद्यकीय विम्याचे संरक्षणही लागू करण्यात आले आहे.</p>
    ]]></content:encoded>
    <excerpt:encoded><![CDATA[राज्यातील २ लाख अंगणवाडी सेविकांच्या मानधनात वाढ; शासनाचा अधिकृत जीआर जारी.]]></excerpt:encoded>
    <wp:postmeta>
      <wp:meta_key><![CDATA[_thumbnail_id]]></wp:meta_key>
      <wp:meta_value><![CDATA[6003]]></wp:meta_value>
    </wp:postmeta>
  </item>

  <!-- Page 1 -->
  <item>
    <title><![CDATA[आमच्याबद्दल (About Us) - महाराष्ट्र लाईव्ह नेटवर्क]]></title>
    <link>https://maharashtralivenews.com/about-us/</link>
    <pubDate>Thu, 01 Jan 2026 00:00:00 +0000</pubDate>
    <dc:creator><![CDATA[मुख्य संपादक]]></dc:creator>
    <wp:post_id>7001</wp:post_id>
    <wp:post_date><![CDATA[2026-01-01 10:00:00]]></wp:post_date>
    <wp:post_name><![CDATA[about-us]]></wp:post_name>
    <wp:status><![CDATA[publish]]></wp:status>
    <wp:post_type><![CDATA[page]]></wp:post_type>
    <content:encoded><![CDATA[
      <h2>महाराष्ट्र लाईव्ह नेटवर्क - निष्पक्ष, निर्भीड आणि विश्वासार्ह पत्रकारिता</h2>
      <p>आम्ही महाराष्ट्रातील सर्व ३६ जिल्ह्यांमध्ये विखुरलेल्या आमच्या पत्रकार चमूच्या माध्यमातून ताज्या बातम्या, सखोल विश्लेषण आणि ग्राउंड रिपोर्टिंग वाचकांपर्यंत पोहोचवतो.</p>
      <p>आमचे ध्येय सत्य, पारदर्शकता आणि जनतेचे प्रश्न प्रशासनासमोर मांडणे हे आहे.</p>
    ]]></content:encoded>
  </item>

  <!-- Page 2 -->
  <item>
    <title><![CDATA[जाहिरात व संपर्क धोरण (Advertising & Contact)]]></title>
    <link>https://maharashtralivenews.com/contact-ads/</link>
    <pubDate>Thu, 01 Jan 2026 00:00:00 +0000</pubDate>
    <dc:creator><![CDATA[प्रशासन]]></dc:creator>
    <wp:post_id>7002</wp:post_id>
    <wp:post_date><![CDATA[2026-01-01 10:00:00]]></wp:post_date>
    <wp:post_name><![CDATA[contact-ads]]></wp:post_name>
    <wp:status><![CDATA[publish]]></wp:status>
    <wp:post_type><![CDATA[page]]></wp:post_type>
    <content:encoded><![CDATA[
      <h2>जाहिरातींसाठी संपर्क साधा</h2>
      <p>आमच्या पोर्टलवर दरमहा ५० लाखांपेक्षा जास्त वाचक भेट देतात. आपल्या व्यवसायाची, उत्पादनांची आणि सेवांची जाहिरात करण्यासाठी आजच संपर्क साधा.</p>
      <p>ईमेल: ads@infonewsupdate24.com | दूरध्वनी: +91 98765 43210</p>
    ]]></content:encoded>
  </item>

  <!-- Attachments -->
  <item>
    <title><![CDATA[Mumbai Goa Highway Construction]]></title>
    <wp:post_id>6001</wp:post_id>
    <wp:post_type><![CDATA[attachment]]></wp:post_type>
    <wp:attachment_url><![CDATA[https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80]]></wp:attachment_url>
  </item>
  <item>
    <title><![CDATA[Pune Metro High Speed Train]]></title>
    <wp:post_id>6002</wp:post_id>
    <wp:post_type><![CDATA[attachment]]></wp:post_type>
    <wp:attachment_url><![CDATA[https://images.unsplash.com/photo-1517976487507-5b3b4a45097c?w=1000&auto=format&fit=crop&q=80]]></wp:attachment_url>
  </item>
  <item>
    <title><![CDATA[Anganwadi Workers Rally]]></title>
    <wp:post_id>6003</wp:post_id>
    <wp:post_type><![CDATA[attachment]]></wp:post_type>
    <wp:attachment_url><![CDATA[https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&auto=format&fit=crop&q=80]]></wp:attachment_url>
  </item>
</channel>
</rss>`;

export const WordPressAndUrlImporterView: React.FC = () => {
  const {
    posts,
    pages,
    categories,
    createPost,
    createPage,
    addCategory,
    addActivityLog,
    addNotification,
    setCmsView,
    setPortalMode,
    exportDataJson,
    importDataJson,
    resetToDefaultSeed,
  } = useApp();

  const { currentUser } = useAuth();

  // Active Main Tab: 'url_scraper' | 'wp_backup' | 'system_backup'
  const [activeTab, setActiveTab] = useState<'url_scraper' | 'wp_backup' | 'system_backup'>('url_scraper');

  // --- URL Scraper States ---
  const [targetUrl, setTargetUrl] = useState('');
  const [scrapeArticleCount, setScrapeArticleCount] = useState<number>(10);
  const [scrapeCategoryOverride, setScrapeCategoryOverride] = useState<string>('cat-1');
  const [scrapeStatusOverride, setScrapeStatusOverride] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [scrapedResults, setScrapedResults] = useState<ScrapedArticle[]>([]);
  const [selectedScrapedIds, setSelectedScrapedIds] = useState<Set<string>>(new Set());
  const [urlImportMsg, setUrlImportMsg] = useState<{ type: 'success' | 'error'; text: string; count?: number } | null>(null);

  // --- WordPress / Hostinger Backup States ---
  const [wpRawContent, setWpRawContent] = useState('');
  const [wpFileName, setWpFileName] = useState('');
  const [wpParsedResult, setWpParsedResult] = useState<WordPressImportResult | null>(null);
  const [wpStatusOverride, setWpStatusOverride] = useState<'KEEP_ORIGINAL' | 'FORCE_PUBLISHED' | 'FORCE_DRAFT'>('FORCE_PUBLISHED');
  const [wpAutoCreateCategories, setWpAutoCreateCategories] = useState(true);
  const [wpImportSuccessMsg, setWpImportSuccessMsg] = useState<{ type: 'success' | 'error'; text: string; details?: any } | null>(null);
  const [isProcessingWp, setIsProcessingWp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonBackupFileRef = useRef<HTMLInputElement | null>(null);

  // Quick Preset URLs
  const POPULAR_PRESETS = [
    { name: 'महाराष्ट्र टाइम्स', domain: 'maharashtratimes.com', categoryId: 'cat-1', color: 'bg-red-50 text-red-700 border-red-200' },
    { name: 'लोकसत्ता न्यूज', domain: 'loksatta.com', categoryId: 'cat-2', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'सकाळ न्यूज नेटवर्क', domain: 'esakal.com', categoryId: 'cat-1', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'TV9 मराठी लाईव्ह', domain: 'tv9marathi.com', categoryId: 'cat-1', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'पुढारी विशेष', domain: 'pudhari.news', categoryId: 'cat-1', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'TechCrunch (Tech Blog)', domain: 'techcrunch.com', categoryId: 'cat-8', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  ];

  // --- Handlers: URL Scraper ---
  const handleStartScrape = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim()) return;

    setIsScraping(true);
    setScrapeProgress(15);
    setUrlImportMsg(null);
    setScrapedResults([]);

    const interval = setInterval(() => {
      setScrapeProgress((prev) => (prev < 90 ? prev + 18 : prev));
    }, 200);

    try {
      const res = await LiveWebsiteScraperService.scrapeWebsiteUrl(targetUrl.trim(), {
        maxArticles: scrapeArticleCount,
        targetCategoryOverride: scrapeCategoryOverride,
        statusOverride: scrapeStatusOverride,
        authorName: currentUser?.name || 'वेबसाइट स्क्रॅपर ब्युरो',
      });

      clearInterval(interval);
      setScrapeProgress(100);
      setIsScraping(false);

      if (res.success && res.articles.length > 0) {
        setScrapedResults(res.articles);
        setSelectedScrapedIds(new Set(res.articles.map((a) => a.id)));
        setUrlImportMsg({
          type: 'success',
          text: res.message,
        });
      } else {
        setUrlImportMsg({
          type: 'error',
          text: res.message || 'या वेबसाइटवरून बातम्या शोधण्यात अयशस्वी. कृपया URL तपासा.',
        });
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsScraping(false);
      setUrlImportMsg({
        type: 'error',
        text: 'स्क्रॅपिंग दरम्यान त्रुटी: ' + err.message,
      });
    }
  };

  const handleImportSelectedArticles = () => {
    if (selectedScrapedIds.size === 0) return;

    const toImport = scrapedResults.filter((art) => selectedScrapedIds.has(art.id));
    const newPosts = LiveWebsiteScraperService.convertToPosts(toImport, {
      targetCategoryOverride: scrapeCategoryOverride,
      statusOverride: scrapeStatusOverride,
      authorName: currentUser?.name || 'InfoNews संपादक',
    });

    // Insert into AppContext posts
    newPosts.forEach((post) => {
      createPost(post);
    });

    addActivityLog({
      userId: currentUser?.id || 'user-admin',
      userName: currentUser?.name || 'Administrator',
      userRole: currentUser?.role || 'SUPER_ADMIN',
      action: 'Website URL Import',
      details: `'${targetUrl}' वेबसाइटवरून ${newPosts.length} बातम्या थेट पोर्टल व CMS मध्ये समाविष्ट केल्या.`,
    });

    addNotification({
      title: '🎉 बातम्या यशस्वीरित्या इम्पोर्ट झाल्या!',
      message: `'${targetUrl}' वरून ${newPosts.length} बातम्या CMS आणि लाईव्ह पोर्टलवर प्रकाशित झाल्या आहेत.`,
      type: 'PUBLISH',
    });

    setUrlImportMsg({
      type: 'success',
      text: `अभिनंदन! ${newPosts.length} बातम्या यशस्वीरित्या पोर्टल व CMS मध्ये इम्पोर्ट झाल्या आहेत!`,
      count: newPosts.length,
    });

    setScrapedResults([]);
    setSelectedScrapedIds(new Set());
  };

  // --- Handlers: WordPress / Hostinger Backup ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setWpFileName(file.name);
    setIsProcessingWp(true);
    setWpImportSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setWpRawContent(content);
        const result = WordPressImporterService.parseFile(content, file.name, {
          statusOverride: wpStatusOverride,
        });
        setWpParsedResult(result);
        setIsProcessingWp(false);
      }
    };
    reader.onerror = () => {
      setIsProcessingWp(false);
      setWpImportSuccessMsg({
        type: 'error',
        text: 'फाइल वाचण्यात त्रुटी आली. कृपया फाइल तपासा.',
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadSampleWpXml = () => {
    setWpFileName('WordPress-Marathi-News-Export.xml');
    setWpRawContent(SAMPLE_MARATHI_WP_WXR_XML);
    setIsProcessingWp(true);
    setTimeout(() => {
      const result = WordPressImporterService.parseWxrXml(SAMPLE_MARATHI_WP_WXR_XML, {
        statusOverride: wpStatusOverride,
      });
      setWpParsedResult(result);
      setIsProcessingWp(false);
    }, 300);
  };

  const handleExecuteWpImport = () => {
    if (!wpParsedResult || (!wpParsedResult.posts.length && !wpParsedResult.pages.length)) return;

    let importedPostsCount = 0;
    let importedPagesCount = 0;
    let importedCatsCount = 0;

    // 1. Auto-create missing categories if enabled
    if (wpAutoCreateCategories && wpParsedResult.categories.length > 0) {
      wpParsedResult.categories.forEach((cat) => {
        const exists = categories.some((c) => c.slug === cat.slug || c.name.toLowerCase() === cat.name.toLowerCase());
        if (!exists) {
          addCategory({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || 'WordPress मधून इम्पोर्ट केलेला प्रवर्ग',
            displayOrder: categories.length + 1,
            status: 'ACTIVE',
          });
          importedCatsCount++;
        }
      });
    }

    // 2. Import Posts
    wpParsedResult.posts.forEach((p) => {
      createPost({
        ...p,
        status: wpStatusOverride === 'FORCE_PUBLISHED' ? 'PUBLISHED' : (wpStatusOverride === 'FORCE_DRAFT' ? 'DRAFT' : p.status),
      });
      importedPostsCount++;
    });

    // 3. Import Pages
    wpParsedResult.pages.forEach((pg) => {
      createPage({
        title: pg.title,
        slug: pg.slug,
        content: pg.content,
        excerpt: pg.excerpt,
        featuredImage: pg.featuredImage,
        status: pg.status || 'PUBLISHED',
        template: pg.template || 'default',
      });
      importedPagesCount++;
    });

    addActivityLog({
      userId: currentUser?.id || 'user-admin',
      userName: currentUser?.name || 'Administrator',
      userRole: currentUser?.role || 'SUPER_ADMIN',
      action: 'WordPress / Hostinger Backup Restore',
      details: `${wpFileName || 'WordPress Export'} मधून ${importedPostsCount} बातम्या आणि ${importedPagesCount} पेजेस इम्पोर्ट केले.`,
    });

    addNotification({
      title: '📁 WordPress बॅकअप यशस्वीरित्या इम्पोर्ट झाला!',
      message: `${importedPostsCount} बातम्या व ${importedPagesCount} पेजेस यशस्वीरित्या CMS मध्ये पुनर्संचयित झाले आहेत.`,
      type: 'PUBLISH',
    });

    setWpImportSuccessMsg({
      type: 'success',
      text: `WordPress / Hostinger बॅकअप डेटा यशस्वीरित्या पोर्टलमध्ये समाविष्ट झाला! (${importedPostsCount} बातम्या, ${importedPagesCount} पेजेस, ${importedCatsCount} नवीन कॅटेगरीज जोडल्या)`,
      details: {
        posts: importedPostsCount,
        pages: importedPagesCount,
        categories: importedCatsCount,
      },
    });

    // Reset preview
    setWpParsedResult(null);
    setWpRawContent('');
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Top Banner & Title */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-red-600/10 px-2.5 py-0.5 text-[11px] font-bold text-red-700 border border-red-200/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-red-600" />
              <span>Universal Importer v3.0</span>
            </span>
            <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
              Universal XML / JSON / Live URL
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Globe className="h-6 w-6 text-red-600" />
            <span>InfoNewsUpdate24 डेटा मायग्रेशन व लाइव्ह वेबसाइट इम्पोर्टर</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            कोणत्याही वेबसाइटचे URL टाकून थेट ताज्या बातम्या आणा किंवा WXR XML, SQL Dump किंवा JSON बॅकअप अपलोड करून सर्व पोस्ट्स आणि पेजेस पोर्टलवर एका क्लिकवर लाईव्ह करा.
          </p>
        </div>

        {/* Quick View Portal / Posts Switch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPortalMode('PUBLIC')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>लाईव्ह पब्लिक पोर्टल पहा</span>
          </button>
          <button
            type="button"
            onClick={() => setCmsView('posts_all')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition"
          >
            <Newspaper className="w-4 h-4 text-red-600" />
            <span>सर्व बातम्या (Posts: {posts.length})</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-xs gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('url_scraper')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition ${
            activeTab === 'url_scraper'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>१. थेट वेबसाइट URL वरून बातम्या आणा (Live URL Scraper)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wp_backup')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition ${
            activeTab === 'wp_backup'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <CloudDownload className="w-4 h-4" />
          <span>२. युनिव्हर्सल XML / SQL / JSON डेटा बॅकअप इम्पोर्ट</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system_backup')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition ${
            activeTab === 'system_backup'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>३. फुल सिस्टम बॅकअप व रिस्टोअर (JSON Backup & Reset)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE WEBSITE URL SCRAPER                                           */}
      {/* ========================================================================= */}
      {activeTab === 'url_scraper' && (
        <div className="space-y-6">
          {/* Main URL Input Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  थेट वेबसाइट URL वरून बातम्या इम्पोर्ट करा (Instant Live Scraper)
                </h3>
                <p className="text-xs text-slate-500">
                  कोणत्याही WordPress, वृत्तपत्र किंवा न्यूज पोर्टलची URL टाका. सिस्टीम आपोआप त्या साइटवरील ताज्या बातम्या, फोटो व कन्टेन्ट स्कॅन करून आणेल.
                </p>
              </div>
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleStartScrape} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  वेबसाइट URL टाका (Enter Website URL) <span className="text-red-600">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <LinkIcon className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="उदा. https://maharashtratimes.com किंवा https://loksatta.com किंवा https://myblog.com"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-red-600 focus:ring-2 focus:ring-red-600/20 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isScraping || !targetUrl.trim()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
                  >
                    {isScraping ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>स्कॅनिंग सुरू आहे ({scrapeProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>बातम्या शोधा व स्कॅन करा</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>झटपट चाचणीसाठी लोकप्रिय न्यूज पोर्टल्स (1-Click Sample News Presets):</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_PRESETS.map((preset) => (
                    <button
                      key={preset.domain}
                      type="button"
                      onClick={() => {
                        setTargetUrl(`https://${preset.domain}`);
                        setScrapeCategoryOverride(preset.categoryId);
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition hover:scale-102 ${preset.color}`}
                    >
                      <span>{preset.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">({preset.domain})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Extraction Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">बातम्यांची संख्या (Max Count)</label>
                  <select
                    value={scrapeArticleCount}
                    onChange={(e) => setScrapeArticleCount(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-hidden"
                  >
                    <option value={5}>५ बातम्या (Quick 5)</option>
                    <option value={10}>१० बातम्या (Recommended 10)</option>
                    <option value={15}>१५ बातम्या (15 Articles)</option>
                    <option value={20}>२० बातम्या (20 Articles)</option>
                    <option value={50}>५० बातम्या (50 Bulk)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">प्रवर्ग / श्रेणी (Assign Category)</label>
                  <select
                    value={scrapeCategoryOverride}
                    onChange={(e) => setScrapeCategoryOverride(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">पोस्ट स्थिती (Publish Status)</label>
                  <select
                    value={scrapeStatusOverride}
                    onChange={(e) => setScrapeStatusOverride(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-hidden"
                  >
                    <option value="PUBLISHED">PUBLISHED (थेट पोर्टलवर लाईव्ह प्रकाशित करा)</option>
                    <option value="DRAFT">DRAFT (रिव्ह्यूसाठी मसुदा ठेवा)</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Alert / Notification */}
          {urlImportMsg && (
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-4 text-xs font-semibold ${
                urlImportMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {urlImportMsg.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-sm">{urlImportMsg.text}</p>
                  {urlImportMsg.count && (
                    <p className="text-xs text-emerald-700 mt-0.5 font-normal">
                      या सर्व बातम्या आता पब्लिक पोर्टलवर व CMS पोस्ट्समध्ये उपलब्ध झाल्या आहेत.
                    </p>
                  )}
                </div>
              </div>

              {urlImportMsg.type === 'success' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPortalMode('PUBLIC')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>पोर्टलवर पहा</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCmsView('posts_all')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold text-xs hover:bg-emerald-100"
                  >
                    <span>CMS पोस्ट्स</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Discovered Articles Preview Table */}
          {scrapedResults.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>शोधलेल्या बातम्या ({scrapedResults.length} Articles Found)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    इम्पोर्ट करण्यासाठी आवश्यक बातम्या निवडा आणि खालील बटणावर क्लिक करा.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedScrapedIds.size === scrapedResults.length) {
                        setSelectedScrapedIds(new Set());
                      } else {
                        setSelectedScrapedIds(new Set(scrapedResults.map((a) => a.id)));
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700"
                  >
                    {selectedScrapedIds.size === scrapedResults.length ? 'सर्व अन-सिलेक्ट करा' : 'सर्व निवडा (Select All)'}
                  </button>

                  <button
                    type="button"
                    disabled={selectedScrapedIds.size === 0}
                    onClick={handleImportSelectedArticles}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>निवडलेल्या {selectedScrapedIds.size} बातम्या पोर्टलवर समाविष्ट करा</span>
                  </button>
                </div>
              </div>

              {/* Table List */}
              <div className="divide-y divide-slate-100 overflow-x-auto">
                {scrapedResults.map((art) => {
                  const isSelected = selectedScrapedIds.has(art.id);
                  return (
                    <div
                      key={art.id}
                      className={`p-3.5 flex items-start gap-3.5 hover:bg-slate-50/80 rounded-xl transition ${
                        isSelected ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const updated = new Set(selectedScrapedIds);
                          if (e.target.checked) updated.add(art.id);
                          else updated.delete(art.id);
                          setSelectedScrapedIds(updated);
                        }}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                      />

                      <img
                        src={art.featuredImage}
                        alt={art.title}
                        className="w-24 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold">
                            {art.categoryName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {art.sourceDomain} &bull; {art.readingTimeMinutes} min read
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(art.publishDate).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed">
                          {art.title}
                        </h4>

                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {art.excerpt}
                        </p>
                      </div>

                      <a
                        href={art.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 shrink-0"
                        title="मूळ बातमी पहा (Original Link)"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  disabled={selectedScrapedIds.size === 0}
                  onClick={handleImportSelectedArticles}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>निवडलेल्या {selectedScrapedIds.size} बातम्या CMS आणि पोर्टलमध्ये समाविष्ट करा</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WORDPRESS / HOSTINGER BACKUP FILE IMPORTER                        */}
      {/* ========================================================================= */}
      {activeTab === 'wp_backup' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <CloudDownload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Hostinger / WordPress बॅकअप फाइल इम्पोर्ट (.xml / .sql / .json)
                </h3>
                <p className="text-xs text-slate-500">
                  WordPress डॅशबोर्डवरील <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">Tools -&gt; Export</code> मधून डाऊनलोड केलेली WXR XML फाइल किंवा Hostinger phpMyAdmin SQL बॅकअप अपलोड करा.
                </p>
              </div>
            </div>

            {/* Upload Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* File Upload Box */}
              <div className="md:col-span-2 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl p-6 text-center space-y-3 bg-slate-50/50 transition">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    WordPress किंवा Hostinger बॅकअप फाइल येथे ड्रॅग करा किंवा ब्राउझ करा
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    सपोर्टेड फॉरमॅट्स: WordPress WXR Export (.xml), Database Dump (.sql), JSON (.json), ZIP (.zip)
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xml,.sql,.json,.zip,text/xml,application/xml,application/json,application/sql"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
                  >
                    <Upload className="w-4 h-4" />
                    <span>फाइल निवडा (.xml / .sql / .json)</span>
                  </button>
                </div>
              </div>

              {/* Sample 1-Click Backup Test Files */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>चाचणीसाठी तयार सॅम्पल बॅकअप्स:</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    आपल्याकडे फाइल उपलब्ध नसल्यास, खालील बटणावर क्लिक करून थेट सॅम्पल बातमी बॅकअप लोड करा:
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleLoadSampleWpXml}
                    className="w-full text-left p-2.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-xs font-bold text-red-900 shadow-2xs transition flex items-center justify-between"
                  >
                    <div>
                      <p>📰 WordPress Marathi WXR XML</p>
                      <p className="text-[10px] text-slate-500 font-normal">३ बातम्या + २ पेजेस + मीडिया</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Import Settings Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">बातम्यांची स्थिती (Post Status)</label>
                <select
                  value={wpStatusOverride}
                  onChange={(e) => setWpStatusOverride(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-hidden"
                >
                  <option value="FORCE_PUBLISHED">PUBLISHED (सर्व बातम्या थेट पोर्टलवर प्रसिद्ध करा)</option>
                  <option value="FORCE_DRAFT">DRAFT (रिव्ह्यूसाठी ड्राफ्ट म्हणून साठवा)</option>
                  <option value="KEEP_ORIGINAL">मूळ WordPress मधील स्थिती ठेवा (Keep Original Status)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-5">
                <input
                  type="checkbox"
                  id="autoCreateCat"
                  checked={wpAutoCreateCategories}
                  onChange={(e) => setWpAutoCreateCategories(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="autoCreateCat" className="font-semibold text-slate-700 cursor-pointer text-xs">
                  नवीन प्रवर्गांची आपोआप निर्मिती करा (Auto-create missing categories)
                </label>
              </div>
            </div>
          </div>

          {/* Success Notification */}
          {wpImportSuccessMsg && (
            <div
              className={`flex items-start justify-between gap-3 rounded-2xl p-4 text-xs font-semibold ${
                wpImportSuccessMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">{wpImportSuccessMsg.text}</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    सर्व बातम्या आणि पेजेस आता लाइव्ह न्यूज पोर्टलवर आणि CMS मध्ये सक्रिय आहेत.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPortalMode('PUBLIC')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  लाईव्ह पोर्टल पहा
                </button>
                <button
                  type="button"
                  onClick={() => setCmsView('posts_all')}
                  className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-bold text-xs hover:bg-emerald-100"
                >
                  सर्व बातम्या तपासा
                </button>
              </div>
            </div>
          )}

          {/* Parsed Preview Table */}
          {wpParsedResult && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-600" />
                    <span>फाइल विश्लेषण: {wpFileName}</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="rounded-md bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[11px] font-bold">
                      {wpParsedResult.stats.postsCount} बातम्या (Posts)
                    </span>
                    <span className="rounded-md bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 text-[11px] font-bold">
                      {wpParsedResult.stats.pagesCount} पेजेस (Pages)
                    </span>
                    <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold">
                      {wpParsedResult.stats.categoriesCount} प्रवर्गे (Categories)
                    </span>
                    <span className="rounded-md bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[11px] font-bold">
                      {wpParsedResult.stats.mediaCount} मीडिया फाइल्स (Media)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteWpImport}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>🚀 हा सर्व डेटा पोर्टलमध्ये इम्पोर्ट करा (Execute Import)</span>
                </button>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {wpParsedResult.posts.map((post, idx) => (
                  <div key={post.id || idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                        {idx + 1}
                      </span>
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="h-10 w-14 object-cover rounded-md border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{post.title}</h4>
                        <p className="text-[11px] text-slate-400">
                          प्रवर्ग: {post.categoryId} &bull; लेखक: {post.authorName} &bull; तारीख:{' '}
                          {new Date(post.publishDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold shrink-0">
                      POST
                    </span>
                  </div>
                ))}

                {wpParsedResult.pages.map((pg, idx) => (
                  <div key={pg.id || idx} className="p-3 flex items-center justify-between gap-3 text-xs bg-purple-50/30">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700">
                        P
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-purple-950 truncate">{pg.title}</h4>
                        <p className="text-[11px] text-purple-600 font-mono">Slug: /{pg.slug}</p>
                      </div>
                    </div>

                    <span className="rounded-full bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 text-[10px] font-bold shrink-0">
                      STATIC PAGE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SYSTEM BACKUP EXPORT & RESTORE                                     */}
      {/* ========================================================================= */}
      {activeTab === 'system_backup' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  फुल सिस्टम बॅकअप व रिस्टोअर (Full Portal State Snapshot)
                </h3>
                <p className="text-xs text-slate-500">
                  वर्तमान पोर्टलवरील सर्व बातम्या, पेजेस, मेनू, थीम आणि मीडियाचा संपूर्ण JSON बॅकअप डाऊनलोड करा किंवा रिस्टोअर करा.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Export Button */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Download className="h-4 w-4 text-emerald-600" />
                    Export Full System Snapshot (.json)
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    पोर्टलचा संपूर्ण डेटाबेस एका क्लिकवर JSON फाइल म्हणून संगणकावर सेव्ह करा.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const jsonStr = exportDataJson();
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `infonewsupdate24-backup-${new Date().toISOString().slice(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Backup Snapshot (.json)</span>
                </button>
              </div>

              {/* Restore Button */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-blue-600" />
                    Restore Snapshot from JSON
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    पूर्वी डाऊनलोड केलेली JSON फाइल अपलोड करून संपूर्ण पोर्टल पूर्ववत करा.
                  </p>
                </div>

                <input
                  type="file"
                  ref={jsonBackupFileRef}
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      if (content) {
                        const res = importDataJson(content);
                        alert(res.message);
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }}
                />

                <button
                  type="button"
                  onClick={() => jsonBackupFileRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload & Restore (.json)</span>
                </button>
              </div>
            </div>

            {/* Factory Seed Reset */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-800">फॅक्टरी डेमो डेटा रीसेट करा (Reset Demo Data)</h5>
                <p className="text-[11px] text-slate-500">सर्व मूळ मराठी नमुना बातम्या आणि पेजेस पुन्हा लोड करा.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('सर्व बातम्या आणि बदल रीसेट करून मूळ डेमो डेटा लोड करायचा आहे का?')) {
                    resetToDefaultSeed();
                    alert('फॅक्टरी डेमो डेटा यशस्वीरित्या रिस्टोअर झाला!');
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Factory Seed</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
