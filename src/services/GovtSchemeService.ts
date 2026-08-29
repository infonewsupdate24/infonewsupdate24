import { GovtSchemeOrJob, SchemeCategory } from '../types';
import { SEED_GOVT_SCHEMES } from '../data/govtSchemesSeedData';

const STORAGE_KEY = 'infonews_govt_schemes_v1';

export class GovtSchemeService {
  public static getSchemes(): GovtSchemeOrJob[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    this.saveSchemes(SEED_GOVT_SCHEMES);
    return SEED_GOVT_SCHEMES;
  }

  public static saveSchemes(schemes: GovtSchemeOrJob[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schemes));
      window.dispatchEvent(
        new CustomEvent('infonews:govt-schemes-updated', { detail: schemes })
      );
    } catch {}
  }

  public static getSchemeById(id: string): GovtSchemeOrJob | undefined {
    return this.getSchemes().find((s) => s.id === id);
  }

  public static getFeaturedSchemes(): GovtSchemeOrJob[] {
    return this.getSchemes().filter((s) => s.isFeatured);
  }

  public static createScheme(
    data: Omit<GovtSchemeOrJob, 'id' | 'viewsCount' | 'publishedDate'>
  ): GovtSchemeOrJob {
    const schemes = this.getSchemes();
    const newScheme: GovtSchemeOrJob = {
      ...data,
      id: `gov-${Date.now()}`,
      viewsCount: 1,
      publishedDate: new Date().toLocaleDateString('mr-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
    const updated = [newScheme, ...schemes];
    this.saveSchemes(updated);
    return newScheme;
  }

  public static updateScheme(
    id: string,
    updates: Partial<GovtSchemeOrJob>
  ): GovtSchemeOrJob[] {
    const schemes = this.getSchemes();
    const updated = schemes.map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.saveSchemes(updated);
    return updated;
  }

  public static deleteScheme(id: string): GovtSchemeOrJob[] {
    const schemes = this.getSchemes().filter((s) => s.id !== id);
    this.saveSchemes(schemes);
    return schemes;
  }

  public static incrementViews(id: string): void {
    const schemes = this.getSchemes();
    const updated = schemes.map((s) =>
      s.id === id ? { ...s, viewsCount: s.viewsCount + 1 } : s
    );
    this.saveSchemes(updated);
  }

  public static generateWhatsAppShareUrl(scheme: GovtSchemeOrJob): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infonewsupdate24.com';
    let text = `🏛️ *महाराष्ट्र शासन योजना व नोकरी भरती अपडेट*\n\n✨ *${scheme.title}*\n🏢 *विभाग:* ${scheme.department}\n💰 *लाभ / वेतन:* ${scheme.benefitsOrPayScale}\n⏰ *स्थिती:* ${scheme.lastDateOrStatus}\n\n📝 *पात्रता व कागदपत्रे तपशील:*\n`;
    scheme.eligibility.slice(0, 2).forEach((e) => {
      text += `• ${e}\n`;
    });
    text += `\n👉 सविस्तर माहिती, GR PDF डाऊनलोड व थेट अर्ज लिंकसाठी येथे क्लिक करा:\n🔗 ${origin}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }
}
