import type { Unsubscribe } from 'firebase/firestore';
import { FirestoreNewsService } from './FirestoreNewsService';

export type HomepageSectionId =
  | 'HERO_SHOWCASE'
  | 'WEB_STORIES'
  | 'LIVE_BLOG'
  | 'MAIN_EDITORIAL_GRID'
  | 'LATEST_NEWS_FEED'
  | 'MAHARASHTRA_MAGAZINE_GRID'
  | 'DAILY_PANCHANG'
  | 'LIVE_WEATHER'
  | 'KRISHI_MANDI_RATES'
  | 'PHOTO_FEATURE_GALLERY'
  | 'GOVT_SCHEMES'
  | 'DAILY_DIGEST'
  | 'SOCIAL_MEDIA_REELS'
  | 'NEWSLETTER_SUBSCRIPTION';

export interface HomepageSectionConfig {
  id: HomepageSectionId;
  nameMr: string;
  nameEn: string;
  icon: string;
  order: number;
  isVisible: boolean;
  description: string;
  badge?: string;
  customTitleMr?: string;
  postCount?: number;
  displayStyle?: 'GRID' | 'LIST' | 'CAROUSEL';
  deviceVisibility?: 'ALL' | 'DESKTOP_ONLY' | 'MOBILE_ONLY';
}

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: HomepageSectionId[];
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'BREAKING_ELECTION_MODE',
    name: '🔴 निवडणूक व ब्रेकिंग न्यूज मोड (Breaking News Blitz)',
    description: 'थेट लाईव्ह ब्लॉग, ब्रेकिंग मथळा व ताज्या घडामोडी सर्वात वर.',
    icon: '🔴',
    color: 'from-red-600 to-red-800 text-white',
    order: [
      'LIVE_BLOG',
      'HERO_SHOWCASE',
      'WEB_STORIES',
      'MAIN_EDITORIAL_GRID',
      'LATEST_NEWS_FEED',
      'MAHARASHTRA_MAGAZINE_GRID',
      'DAILY_PANCHANG',
      'LIVE_WEATHER',
      'KRISHI_MANDI_RATES',
      'PHOTO_FEATURE_GALLERY',
      'GOVT_SCHEMES',
      'DAILY_DIGEST',
      'SOCIAL_MEDIA_REELS',
      'NEWSLETTER_SUBSCRIPTION',
    ],
  },
  {
    id: 'CLASSIC_NEWSPAPER_MODE',
    name: '📰 पारंपरिक वृत्तपत्र मॅगझिन (Classic Daily)',
    description: 'मुख्य बातमी, ८:४ संपादकीय कट्टा, ३-कॉलम विशेष व पंचांग.',
    icon: '📰',
    color: 'from-slate-800 to-slate-950 text-white',
    order: [
      'HERO_SHOWCASE',
      'MAIN_EDITORIAL_GRID',
      'LATEST_NEWS_FEED',
      'MAHARASHTRA_MAGAZINE_GRID',
      'DAILY_PANCHANG',
      'WEB_STORIES',
      'LIVE_WEATHER',
      'KRISHI_MANDI_RATES',
      'PHOTO_FEATURE_GALLERY',
      'GOVT_SCHEMES',
      'DAILY_DIGEST',
      'LIVE_BLOG',
      'SOCIAL_MEDIA_REELS',
      'NEWSLETTER_SUBSCRIPTION',
    ],
  },
  {
    id: 'VIRAL_DISCOVER_MODE',
    name: '✨ व्हायरल डिस्कव्हर व रील्स (Viral Mobile)',
    description: 'गुगल वेब स्टोरीज, सोशल रील्स व व्हिडिओ कट्टा अग्रक्रमाने.',
    icon: '✨',
    color: 'from-purple-600 to-pink-700 text-white',
    order: [
      'WEB_STORIES',
      'SOCIAL_MEDIA_REELS',
      'HERO_SHOWCASE',
      'LATEST_NEWS_FEED',
      'MAIN_EDITORIAL_GRID',
      'MAHARASHTRA_MAGAZINE_GRID',
      'PHOTO_FEATURE_GALLERY',
      'DAILY_DIGEST',
      'LIVE_BLOG',
      'DAILY_PANCHANG',
      'LIVE_WEATHER',
      'KRISHI_MANDI_RATES',
      'GOVT_SCHEMES',
      'NEWSLETTER_SUBSCRIPTION',
    ],
  },
  {
    id: 'RURAL_KRISHI_MODE',
    name: '🌾 कृषी, शेतकरी व जिल्हा फोकस (Rural Mandi)',
    description: 'बाजारभाव, हवामान अंदाज, तालुका स्पॉटलाईट व शासकीय योजना.',
    icon: '🌾',
    color: 'from-emerald-700 to-green-900 text-white',
    order: [
      'HERO_SHOWCASE',
      'KRISHI_MANDI_RATES',
      'LIVE_WEATHER',
      'MAIN_EDITORIAL_GRID',
      'GOVT_SCHEMES',
      'DAILY_PANCHANG',
      'LATEST_NEWS_FEED',
      'MAHARASHTRA_MAGAZINE_GRID',
      'DAILY_DIGEST',
      'WEB_STORIES',
      'PHOTO_FEATURE_GALLERY',
      'LIVE_BLOG',
      'SOCIAL_MEDIA_REELS',
      'NEWSLETTER_SUBSCRIPTION',
    ],
  },
];

const STORAGE_KEY_HOMEPAGE_LAYOUT = 'infonews_homepage_layout_sections_v5_latest_news_standalone';
const HOMEPAGE_LAYOUT_SETTING_ID = 'homepage_layout';

interface HomepageLayoutSettingDoc {
  sections?: HomepageSectionConfig[];
}

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  {
    id: 'HERO_SHOWCASE',
    nameMr: 'मुख्य हिरो मथळा विभाग',
    nameEn: 'Hero Breaking Showcase (Lead + 4 Stacked)',
    icon: '🔥',
    order: 1,
    isVisible: true,
    description: 'दिवसाची १ सर्वात मोठी लीड बातमी व ४ ट्रेंडिंग बातम्यांचे मुख्य शोकेस.',
    badge: 'Core Headline',
  },
  {
    id: 'WEB_STORIES',
    nameMr: 'गुगल वेब स्टोरीज (Visual Tap Stories)',
    nameEn: 'Google Web Stories 9:16 Carousel',
    icon: '✨',
    order: 2,
    isVisible: true,
    description: '९:१६ आकाराच्या व्हिज्युअल टॅप स्टोरीजची हलकी व आकर्षक पट्टी.',
    badge: 'Mobile First',
  },
  {
    id: 'LIVE_BLOG',
    nameMr: '🔴 थेट लाईव्ह ब्लॉग व टाइमलाइन',
    nameEn: 'Minute-by-Minute Live Blog Timeline',
    icon: '🔴',
    order: 3,
    isVisible: true,
    description: 'निवडणूक निकाल, बजेट व घडामोडींचे दर मिनिटाचे थेट वार्तापत्र.',
    badge: 'Real-Time',
  },
  {
    id: 'MAIN_EDITORIAL_GRID',
    nameMr: '८:४ मुख्य वृत्त प्रवाह व साइडबार',
    nameEn: 'Core News Feed & Sidebar (Spotlight, Filter, Trending, Poll, Crime)',
    icon: '📰',
    order: 4,
    isVisible: true,
    description: '१२ तालुके स्पॉटलाईट, हायपरलोकल जिल्हा फिल्टर व परिपूर्ण साइडबार कट्टा.',
    badge: 'Editorial Core',
  },
  {
    id: 'LATEST_NEWS_FEED',
    nameMr: '📰 ताज्या मराठी बातम्या (पूर्ण रुंदी स्वतंत्र विभाग)',
    nameEn: 'Latest News Feed Full Width (Dynamic Tabs, 4-Col Grid, List Switcher)',
    icon: '⚡',
    order: 5,
    isVisible: true,
    description: 'सर्व कॅटेगरीजच्या ताज्या बातम्यांची पूर्ण रुंदी ग्रिड/लिस्ट मांडणी, सॉर्टिंग व १-क्लिक शेअर.',
    badge: 'Full Width 12-Col',
  },
  {
    id: 'MAHARASHTRA_MAGAZINE_GRID',
    nameMr: '🎭 ३-कॉलम विशेष कट्टा (मनोरंजन, क्रीडा व तंत्रज्ञान)',
    nameEn: '3-Column Special Magazine Grid (Entertainment, Sports & Tech)',
    icon: '🎭',
    order: 6,
    isVisible: true,
    description: 'बॉलीवूड गॉसिप, क्रिकेट/क्रीडांगण व सायबर/तंत्रज्ञान क्षेत्रातील खास घडामोडी.',
    badge: 'Magazine Desk',
  },
  {
    id: 'DAILY_PANCHANG',
    nameMr: '☀️ दैनिक मराठी पंचांग, राशीभविष्य व दिनविशेष (पूर्ण रुंदी)',
    nameEn: 'Daily Vedic Marathi Panchang & Horoscope (Full Width)',
    icon: '☀️',
    order: 7,
    isVisible: true,
    description: 'सूर्योदय-सूर्यास्त, तिथी, नक्षत्र, अभिजित मुहूर्त, राहुकाळ व १२ राशीभविष्य.',
    badge: 'Panchang Full',
  },
  {
    id: 'LIVE_WEATHER',
    nameMr: '⛅ गडचिरोली व १२ तालुके थेट हवामान आणि पाऊस रडार (पूर्ण रुंदी)',
    nameEn: 'Gadchiroli & 12 Talukas Live Weather Radar (Full Width)',
    icon: '⛅',
    order: 8,
    isVisible: true,
    description: '१२ तालुक्यांचे तापमान, आर्द्रता, पाऊस शक्यता, वाऱ्याचा वेग व IMD ऑरेंज अलर्ट.',
    badge: 'Weather Radar',
  },
  {
    id: 'KRISHI_MANDI_RATES',
    nameMr: '🌾 कृषी उत्पन्न बाजारभाव व सराफ दर (पूर्ण रुंदी)',
    nameEn: 'APMC Krishi Mandi & Commodity Gold-Silver Rates (Full Width)',
    icon: '🌾',
    order: 9,
    isVisible: true,
    description: 'कांदा, सोयाबीन, कापूस, तूर, टोमॅटो व २४ कॅरेट सोने-चांदीचे थेट दर.',
    badge: 'APMC Market',
  },
  {
    id: 'PHOTO_FEATURE_GALLERY',
    nameMr: '📸 विशेष ग्राउंड फोटो गॅलरी व व्हिज्युअल वार्ता',
    nameEn: 'Photojournalism Feature Gallery & Ground Lens',
    icon: '📷',
    order: 10,
    isVisible: true,
    description: 'गडचिरोली व महाराष्ट्रातील प्रभावी क्षणचित्रे व छायाचित्र वृत्त मालिका.',
    badge: 'Photo Feature',
  },
  {
    id: 'GOVT_SCHEMES',
    nameMr: '🏛️ महाराष्ट्र शासकीय योजना, GR व भरती केंद्र (पूर्ण रुंदी)',
    nameEn: 'Maharashtra Govt Schemes, GRs & Job Alerts (Full Width 4-Cols)',
    icon: '🏛️',
    order: 11,
    isVisible: true,
    description: 'लाडकी बहीण, नमो शेतकरी, पोलीस भरती व सर्व अधिकृत शासन निर्णय (GRs).',
    badge: 'Govt Schemes',
  },
  {
    id: 'DAILY_DIGEST',
    nameMr: '📻 आजचे दैनिक बातमीपत्र (Daily WhatsApp Bulletin - पूर्ण रुंदी)',
    nameEn: 'Daily WhatsApp Bulletin Podcast Digest (Full Width)',
    icon: '📻',
    order: 12,
    isVisible: true,
    description: 'दिवसभरातील टॉप ५ महत्त्वाच्या घडामोडींचे १-क्लिक व्हॉट्सॲप ऑडिओ बुलेटिन.',
    badge: 'WhatsApp Digest',
  },
  {
    id: 'SOCIAL_MEDIA_REELS',
    nameMr: '🎥 सोशल मीडिया, रील्स व व्हिडिओ न्यूज सेक्शन',
    nameEn: 'Social Media Hub, Reels & Video News Bulletins',
    icon: '🎬',
    order: 13,
    isVisible: true,
    description: 'Instagram Reels, Facebook Videos, YouTube व Twitter चे थेट मल्टीमीडिया हब.',
    badge: 'Video Hub',
  },
  {
    id: 'NEWSLETTER_SUBSCRIPTION',
    nameMr: '📰 दैनिक प्रभात वृत्तपत्र व व्हॉट्सॲप न्यूजलेटर बॉक्स',
    nameEn: 'Daily Morning Newspaper & WhatsApp Newsletter Box',
    icon: '📧',
    order: 14,
    isVisible: true,
    description: 'सकाळी ८ वाजता डिजिटल वृत्तपत्र मिळवण्यासाठी वाचक नोंदणी बॉक्स.',
    badge: 'Subscribers',
  },
];

export class HomepageLayoutService {
  private static normalizeSections(sections: HomepageSectionConfig[]): HomepageSectionConfig[] {
    const configured = Array.isArray(sections) ? sections.map((section) => ({ ...section })) : [];
    const existingIds = new Set(configured.map((section) => section.id));

    DEFAULT_HOMEPAGE_SECTIONS.forEach((defaultSection) => {
      if (!existingIds.has(defaultSection.id)) {
        configured.push({ ...defaultSection, order: configured.length + 1 });
      }
    });

    return configured
      .sort((a, b) => a.order - b.order)
      .map((section, index) => ({ ...section, order: index + 1 }));
  }

  static setLocalSections(sections: HomepageSectionConfig[]): HomepageSectionConfig[] {
    const ordered = this.normalizeSections(sections);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_HOMEPAGE_LAYOUT, JSON.stringify(ordered));
        window.dispatchEvent(new CustomEvent('infonews:homepage-layout-updated'));
      } catch {}
    }
    return ordered;
  }

  static getSections(): HomepageSectionConfig[] {
    if (typeof window === 'undefined') return this.normalizeSections(DEFAULT_HOMEPAGE_SECTIONS);
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HOMEPAGE_LAYOUT);
      if (stored) {
        return this.normalizeSections(JSON.parse(stored));
      }
    } catch {}
    return this.normalizeSections(DEFAULT_HOMEPAGE_SECTIONS);
  }

  static saveSections(sections: HomepageSectionConfig[]): void {
    if (typeof window === 'undefined') return;
    try {
      this.setLocalSections(sections);
    } catch {}
  }

  static async loadSavedSections(): Promise<HomepageSectionConfig[] | null> {
    const saved = await FirestoreNewsService.getSettingDoc<HomepageLayoutSettingDoc>(
      HOMEPAGE_LAYOUT_SETTING_ID
    );
    return Array.isArray(saved?.sections) ? this.normalizeSections(saved.sections) : null;
  }

  static async saveSectionsToFirestore(
    sections: HomepageSectionConfig[]
  ): Promise<HomepageSectionConfig[]> {
    const ordered = this.normalizeSections(sections);
    await FirestoreNewsService.saveSettingDoc(HOMEPAGE_LAYOUT_SETTING_ID, { sections: ordered });
    this.setLocalSections(ordered);
    return ordered;
  }

  static subscribeSavedSections(
    onUpdate: (sections: HomepageSectionConfig[]) => void
  ): Unsubscribe {
    return FirestoreNewsService.subscribeSettingDoc<HomepageLayoutSettingDoc>(
      HOMEPAGE_LAYOUT_SETTING_ID,
      (saved) => {
        if (Array.isArray(saved.sections)) {
          onUpdate(this.setLocalSections(saved.sections));
        }
      }
    );
  }

  static applyPreset(presetId: string): HomepageSectionConfig[] {
    const preset = LAYOUT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return this.getSections();

    const currentSections = this.getSections();
    const sectionMap = new Map(currentSections.map((s) => [s.id, s]));

    const reordered: HomepageSectionConfig[] = [];
    preset.order.forEach((id, idx) => {
      const s = sectionMap.get(id);
      if (s) {
        reordered.push({ ...s, order: idx + 1, isVisible: true });
        sectionMap.delete(id);
      }
    });

    // Append any remaining
    sectionMap.forEach((s) => {
      reordered.push({ ...s, order: reordered.length + 1 });
    });

    this.saveSections(reordered);
    return reordered;
  }

  static updateSectionConfig(
    id: HomepageSectionId,
    updates: Partial<HomepageSectionConfig>
  ): HomepageSectionConfig[] {
    const list = this.getSections();
    const updated = list.map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.saveSections(updated);
    return updated;
  }

  static moveSectionUp(id: HomepageSectionId): void {
    const list = [...this.getSections()];
    const index = list.findIndex((s) => s.id === id);
    if (index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      this.saveSections(list);
    }
  }

  static moveSectionDown(id: HomepageSectionId): void {
    const list = [...this.getSections()];
    const index = list.findIndex((s) => s.id === id);
    if (index !== -1 && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      this.saveSections(list);
    }
  }

  static toggleVisibility(id: HomepageSectionId): void {
    const list = this.getSections();
    const target = list.find((s) => s.id === id);
    if (target) {
      target.isVisible = !target.isVisible;
      this.saveSections(list);
    }
  }

  static reorderSections(startIndex: number, endIndex: number): void {
    const list = [...this.getSections()];
    const [removed] = list.splice(startIndex, 1);
    list.splice(endIndex, 0, removed);
    this.saveSections(list);
  }

  static exportLayoutJson(): string {
    return JSON.stringify(this.getSections(), null, 2);
  }

  static importLayoutJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
        this.saveSections(parsed);
        return true;
      }
    } catch {}
    return false;
  }

  static resetToDefault(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY_HOMEPAGE_LAYOUT);
      window.dispatchEvent(new CustomEvent('infonews:homepage-layout-updated'));
    } catch {}
  }
}
