export interface LiveBlogUpdateItem {
  id: string;
  timestamp: string; // e.g. "१२:२५ PM"
  timeAgo: string; // e.g. "२ मिनिटांपूर्वी"
  title: string;
  content: string;
  image?: string;
  isPinned?: boolean;
  isBreaking?: boolean;
  author: string;
  badge?: string; // e.g. "मोठी बातमी", "अधिकृत निकाल", "प्रशासकीय निर्णय"
  likesCount?: number;
  tags?: string[];
  createdAtIso: string;
}

export interface LiveBlogEvent {
  id: string;
  title: string;
  slug: string;
  status: 'LIVE' | 'PAUSED' | 'CONCLUDED';
  startedAt: string;
  updatedAt: string;
  category: string;
  location: string;
  coverImage?: string;
  keyHighlights: string[];
  totalUpdatesCount: number;
  viewersCount: number;
  updates: LiveBlogUpdateItem[];
}

const STORAGE_KEY_LIVE_BLOG = 'infonews_live_blog_events_v1';

export const SEED_LIVE_BLOG: LiveBlogEvent = {
  id: 'live-blog-maha-elections-2026',
  title: 'महाराष्ट्र विधानसभा थेट घडामोडी व गडचिरोली जिल्हा मतमोजणी: मिनिट-टू-मिनिट थेट वार्तापत्र',
  slug: 'maharashtra-vidhan-sabha-live-updates-gadchiroli',
  status: 'LIVE',
  startedAt: '२९ ऑगस्ट २०२६, सकाळी ०८:००',
  updatedAt: 'आत्ताच अपडेट झाले',
  category: '🔴 थेट वार्ता विशेष',
  location: 'महाराष्ट्र व विदर्भ',
  coverImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&auto=format&fit=crop&q=80',
  totalUpdatesCount: 6,
  viewersCount: 14280,
  keyHighlights: [
    'गडचिरोली, अहेरी व आरमोरी विधानसभा मतदारसंघांत मतमोजणी केंद्रांवर कडेकोट सुरक्षा बंदोबस्त.',
    'पहिल्या फेरीत महायुती व महाविकास आघाडीमध्ये अनेक जागी अत्यंत चुरशीची लढत.',
    'जिल्हा प्रशासनाकडून दर १५ मिनिटांनी अधिकृत आकडेवारी जाहीर.',
    'धानोरा, सिरोंचा व वडसा परिसरातील निकालांवर राजकीय वर्तुळाचे विशेष लक्ष.',
  ],
  updates: [
    {
      id: 'update-6',
      timestamp: '१२:२६ PM',
      timeAgo: '२ मिनिटांपूर्वी',
      title: 'गडचिरोली मुख्यालय मतमोजणी: ३ऱ्या फेरीअखेर चुरशीची आघाडी',
      content: 'गडचिरोली विधानसभा मतदारसंघात तिसऱ्या फेरीच्या मतमोजणीअंती महायुतीचे उमेदवार २,१४० मतांनी आघाडीवर आहेत. टपाली मतपत्रिकांची मोजणी पूर्ण झाली असून ईव्हीएम मतांची मोजणी अत्यंत शांततेत सुरू आहे.',
      isPinned: true,
      isBreaking: true,
      author: 'विशेष प्रतिनिधी, गडचिरोली',
      badge: 'मोठी आघाडी',
      likesCount: 142,
      createdAtIso: new Date().toISOString(),
    },
    {
      id: 'update-5',
      timestamp: '१२:१५ PM',
      timeAgo: '१२ मिनिटांपूर्वी',
      title: 'अहेरी विधानसभा: दुर्गम भागातील ईव्हीएम मतपेट्यांची मोजणी सुरू',
      content: 'अहेरी तालुक्यातील भामरागड, आलापल्ली आणि सिरोंचा भागातील मतदान केंद्रांवरील ईव्हीएम मतमोजणीच्या दुसऱ्या फेरीला सुरुवात झाली आहे. निवडणूक निर्णय अधिकाऱ्यांनी संपूर्ण प्रक्रियेचे सीसीटीव्ही चित्रीकरण केले असल्याचे स्पष्ट केले.',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
      isPinned: false,
      isBreaking: false,
      author: 'अहेरी ब्युरो',
      badge: 'अधिकृत अपडेट',
      likesCount: 89,
      createdAtIso: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: 'update-4',
      timestamp: '११:५० AM',
      timeAgo: '३६ मिनिटांपूर्वी',
      title: 'आरमोरी मतदारसंघ: वडसा व कुरखेडा फेऱ्यांमध्ये चुरस वाढली',
      content: 'आरमोरी विधानसभा मतदारसंघात देसाईगंज वडसा आणि कुरखेडा परिसरातील फेऱ्यांमध्ये मतांचा फरक अत्यंत कमी राहिला असून अपक्ष उमेदवारांनी लक्षणीय मते घेतली आहेत.',
      isPinned: false,
      isBreaking: false,
      author: 'आरमोरी प्रतिनिधी',
      badge: 'स्थानिक कल',
      likesCount: 64,
      createdAtIso: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
    },
    {
      id: 'update-3',
      timestamp: '११:२० AM',
      timeAgo: '१ तासापूर्वी',
      title: 'जिल्हाधिकारी व पोलीस अधीक्षकांकडून मतमोजणी केंद्राची पाहणी',
      content: 'गडचिरोलीचे जिल्हाधिकारी व जिल्हा पोलीस अधीक्षकांनी मतमोजणी केंद्राला भेट देऊन सुरक्षा व्यवस्थेचा आढावा घेतला. निकालानंतर शहरात कोणत्याही प्रकारची अनधिकृत मिरवणूक काढण्यास बंदी घालण्यात आली आहे.',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
      isPinned: false,
      isBreaking: false,
      author: 'जिल्हा विशेष प्रतिनिधी',
      badge: 'प्रशासकीय बंदोबस्त',
      likesCount: 112,
      createdAtIso: new Date(Date.now() - 66 * 60 * 1000).toISOString(),
    },
    {
      id: 'update-2',
      timestamp: '१०:३० AM',
      timeAgo: '२ तासांपूर्वी',
      title: 'पोलीस बंदोबस्त: संपूर्ण जिल्ह्यात १४४ कलम लागू; शांततेचे आवाहन',
      content: 'मतमोजणीच्या पार्श्वभूमीवर गडचिरोली शहर, आरमोरी, अहेरी व वडसा येथे शीघ्र कृती दल (QRF) आणि राज्य राखीव पोलीस दलाच्या तुकड्या तैनात करण्यात आल्या आहेत.',
      isPinned: false,
      isBreaking: false,
      author: 'गुन्हे वार्ता ब्युरो',
      badge: 'कायदा व सुव्यवस्था',
      likesCount: 78,
      createdAtIso: new Date(Date.now() - 116 * 60 * 1000).toISOString(),
    },
    {
      id: 'update-1',
      timestamp: '०८:०० AM',
      timeAgo: '४ तासांपूर्वी',
      title: 'सकाळी ८:०० वाजता मतमोजणीला प्रारंभ; प्रथम टपाली मतपत्रिकांची मोजणी',
      content: 'जिल्ह्यातील सर्व केंद्रांवर सकाळी बरोबर ८ वाजता निवडणूक निरीक्षक व सर्व राजकीय पक्षांच्या प्रतिनिधींच्या उपस्थितीत स्ट्राँगरूम उघडून मतमोजणीला सुरुवात झाली.',
      isPinned: false,
      isBreaking: false,
      author: 'मुख्य संपादक',
      badge: 'सुरुवात',
      likesCount: 95,
      createdAtIso: new Date(Date.now() - 266 * 60 * 1000).toISOString(),
    },
  ],
};

export class LiveBlogService {
  static getLiveBlogs(): LiveBlogEvent[] {
    if (typeof window === 'undefined') return [SEED_LIVE_BLOG];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LIVE_BLOG);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [SEED_LIVE_BLOG];
  }

  static getActiveLiveBlog(): LiveBlogEvent | null {
    const blogs = this.getLiveBlogs();
    return blogs.find((b) => b.status === 'LIVE') || blogs[0] || null;
  }

  static saveLiveBlogs(blogs: LiveBlogEvent[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_LIVE_BLOG, JSON.stringify(blogs));
      window.dispatchEvent(new CustomEvent('infonews:live-blog-updated'));
    } catch {}
  }

  static addUpdateToActiveBlog(
    update: Omit<LiveBlogUpdateItem, 'id' | 'createdAtIso' | 'timeAgo'>
  ): void {
    const blogs = this.getLiveBlogs();
    const active = blogs.find((b) => b.status === 'LIVE') || blogs[0];
    if (!active) return;

    const newUpdate: LiveBlogUpdateItem = {
      id: `live-update-${Date.now()}`,
      timestamp: update.timestamp || new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      timeAgo: 'आत्ताच',
      title: update.title,
      content: update.content,
      image: update.image,
      isPinned: update.isPinned ?? false,
      isBreaking: update.isBreaking ?? false,
      author: update.author || 'InfoNews वार्ताहर',
      badge: update.badge || 'थेट अपडेट',
      likesCount: 0,
      createdAtIso: new Date().toISOString(),
    };

    active.updates.unshift(newUpdate);
    active.totalUpdatesCount = active.updates.length;
    active.updatedAt = 'आत्ताच अपडेट झाले';

    this.saveLiveBlogs(blogs);
  }

  static deleteUpdate(blogId: string, updateId: string): void {
    const blogs = this.getLiveBlogs();
    const blog = blogs.find((b) => b.id === blogId);
    if (blog) {
      blog.updates = blog.updates.filter((u) => u.id !== updateId);
      blog.totalUpdatesCount = blog.updates.length;
      this.saveLiveBlogs(blogs);
    }
  }

  static togglePinUpdate(blogId: string, updateId: string): void {
    const blogs = this.getLiveBlogs();
    const blog = blogs.find((b) => b.id === blogId);
    if (blog) {
      const up = blog.updates.find((u) => u.id === updateId);
      if (up) {
        up.isPinned = !up.isPinned;
        this.saveLiveBlogs(blogs);
      }
    }
  }

  static updateBlogDetails(blog: LiveBlogEvent): void {
    const blogs = this.getLiveBlogs();
    const idx = blogs.findIndex((b) => b.id === blog.id);
    if (idx !== -1) {
      blogs[idx] = blog;
    } else {
      blogs.unshift(blog);
    }
    this.saveLiveBlogs(blogs);
  }

  static resetToDefault(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY_LIVE_BLOG);
      window.dispatchEvent(new CustomEvent('infonews:live-blog-updated'));
    } catch {}
  }
}
