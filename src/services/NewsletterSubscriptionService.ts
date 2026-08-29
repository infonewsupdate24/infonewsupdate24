export interface NewsletterSubscriber {
  id: string;
  contact: string; // email address or phone number
  type: 'EMAIL' | 'WHATSAPP';
  district: string;
  subscribedAt: string;
  status: 'ACTIVE' | 'UNSUBSCRIBED';
}

export interface NewsletterSettings {
  isEnabled: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  morningSendTime: string;
  benefitPoints: string[];
  officialChannelUrl: string;
}

const STORAGE_KEY_SUBSCRIBERS = 'infonews_newsletter_subscribers_v1';
const STORAGE_KEY_SETTINGS = 'infonews_newsletter_settings_v1';

export const DEFAULT_NEWSLETTER_SETTINGS: NewsletterSettings = {
  isEnabled: true,
  sectionTitle: '📰 दैनिक प्रभात वृत्तपत्र व व्हॉट्सॲप न्यूजलेटर',
  sectionSubtitle: 'दररोज सकाळी ८ वाजता संपूर्ण दिवसाचे ठळक वृत्त, ई-पेपर कात्रणे व महत्त्वाचे शासकीय निर्णय थेट आपल्या इनबॉक्समध्ये!',
  morningSendTime: '०८:०० AM',
  benefitPoints: [
    '☕ सकाळी ८:०० वाजता ताज्या बातम्यांचा संक्षिप्त डिजिटल डायजेस्ट',
    '📄 आजचा ६ पानी ई-पेपर व विशेष कात्रणे थेट WhatsApp/Email वर',
    '🌾 कृषी बाजारभाव, हवामान अंदाज व चालू घडामोडी',
    '🔒 १००% मोफत, जाहिरातमुक्त व नो-स्पॅम हमी',
  ],
  officialChannelUrl: 'https://whatsapp.com/channel/infonewsupdate24',
};

export const SEED_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: 'sub-1',
    contact: 'rohit.deshmukh@gmail.com',
    type: 'EMAIL',
    district: 'गडचिरोली',
    subscribedAt: '२८ ऑगस्ट २०२६, ०९:१५ AM',
    status: 'ACTIVE',
  },
  {
    id: 'sub-2',
    contact: '+91 98221 44550',
    type: 'WHATSAPP',
    district: 'अहेरी',
    subscribedAt: '२८ ऑगस्ट २०२६, ११:३० AM',
    status: 'ACTIVE',
  },
  {
    id: 'sub-3',
    contact: 'shetkari.mitra@yahoo.com',
    type: 'EMAIL',
    district: 'आरमोरी',
    subscribedAt: '२९ ऑगस्ट २०२६, ०७:४५ AM',
    status: 'ACTIVE',
  },
  {
    id: 'sub-4',
    contact: '+91 94230 88991',
    type: 'WHATSAPP',
    district: 'देसाईगंज (वडसा)',
    subscribedAt: '२९ ऑगस्ट २०२६, १०:२० AM',
    status: 'ACTIVE',
  },
  {
    id: 'sub-5',
    contact: 'pune.reader@outlook.com',
    type: 'EMAIL',
    district: 'पुणे',
    subscribedAt: '२९ ऑगस्ट २०२६, ११:१० AM',
    status: 'ACTIVE',
  },
];

export class NewsletterSubscriptionService {
  static getSettings(): NewsletterSettings {
    if (typeof window === 'undefined') return DEFAULT_NEWSLETTER_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_NEWSLETTER_SETTINGS;
  }

  static saveSettings(settings: NewsletterSettings): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('infonews:newsletter-updated'));
    } catch {}
  }

  static getSubscribers(): NewsletterSubscriber[] {
    if (typeof window === 'undefined') return SEED_SUBSCRIBERS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SUBSCRIBERS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return SEED_SUBSCRIBERS;
  }

  static saveSubscribers(list: NewsletterSubscriber[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_SUBSCRIBERS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('infonews:newsletter-updated'));
    } catch {}
  }

  static subscribe(
    contact: string,
    type: 'EMAIL' | 'WHATSAPP',
    district = 'गडचिरोली'
  ): { success: boolean; message: string } {
    const list = this.getSubscribers();
    const clean = contact.trim().toLowerCase();

    // Check duplicate
    const existing = list.find(
      (s) => s.contact.trim().toLowerCase() === clean && s.status === 'ACTIVE'
    );
    if (existing) {
      return {
        success: true,
        message: 'आपण आधीच यशस्वीरीत्या सबस्क्राइब केले आहे!',
      };
    }

    const nowStr = new Date().toLocaleDateString('mr-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      contact: contact.trim(),
      type,
      district,
      subscribedAt: `${nowStr}, ${new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'ACTIVE',
    };

    list.unshift(newSub);
    this.saveSubscribers(list);

    return {
      success: true,
      message: '🎉 अभिनंदन! आपले दैनिक न्यूजलेटर सबस्क्रिप्शन यशस्वी झाले आहे.',
    };
  }

  static deleteSubscriber(id: string): void {
    const list = this.getSubscribers().filter((s) => s.id !== id);
    this.saveSubscribers(list);
  }

  static exportSubscribersCsv(): string {
    const list = this.getSubscribers();
    const header = 'ID,Contact,Type,District,Subscribed At,Status\n';
    const rows = list
      .map(
        (s) =>
          `"${s.id}","${s.contact}","${s.type}","${s.district}","${s.subscribedAt}","${s.status}"`
      )
      .join('\n');
    return header + rows;
  }
}
