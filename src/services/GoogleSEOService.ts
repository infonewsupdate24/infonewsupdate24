export interface GoogleSEOSettings {
  siteTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalBaseUrl: string;
  googleAnalyticsId: string;
  googleNewsPublicationName: string;
  googleNewsLanguage: string;
  bingWebmasterToken: string;
  isIndexEnabled: boolean;
  enableGoogleNewsSitemap: boolean;
  enableImageSitemap: boolean;
  ogImageDefault: string;
  twitterHandle: string;
  robotsTxtContent: string;
  autoPingGoogleOnPublish: boolean;
}

const STORAGE_KEY_SEO_SETTINGS = 'infonews_google_seo_settings_v1';

export const DEFAULT_GOOGLE_SEO_SETTINGS: GoogleSEOSettings = {
  siteTitle: 'InfoNewsUpdate24 | महाराष्ट्र व गडचिरोली ताज्या मराठी बातम्या',
  metaDescription:
    'InfoNewsUpdate24 - गडचिरोली १२ तालुके, विदर्भ, महाराष्ट्र, राजकारण, कृषी उत्पन्न बाजारभाव, पंचांग, थेट हवामान आणि ताज्या घडामोडींचे अग्रगण्य डिजिटल न्यूज नेटवर्क.',
  metaKeywords:
    'मराठी बातम्या, ताज्या बातम्या, गडचिरोली न्यूज, महाराष्ट्र घडामोडी, बाजारभाव, पंचांग, हवामान, Marathi News, InfoNewsUpdate24',
  canonicalBaseUrl: 'https://infonewsupdate24.com',
  googleAnalyticsId: 'G-INFONEWSUPDATE24XX',
  googleNewsPublicationName: 'InfoNewsUpdate24',
  googleNewsLanguage: 'mr',
  bingWebmasterToken: 'bing-webmaster-verification-infonewsupdate24',
  isIndexEnabled: true,
  enableGoogleNewsSitemap: true,
  enableImageSitemap: true,
  ogImageDefault: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&auto=format&fit=crop&q=80',
  twitterHandle: '@InfoNewsUpdate24',
  autoPingGoogleOnPublish: true,
  robotsTxtContent: `User-agent: *
Allow: /
Allow: /category/
Allow: /page/
Disallow: /admin
Disallow: /cms

User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /cms

User-agent: Googlebot-News
Allow: /
Disallow: /admin
Disallow: /cms

# XML Sitemaps
Sitemap: https://infonewsupdate24.com/sitemap.xml
Sitemap: https://infonewsupdate24.com/sitemap-news.xml`,
};

export class GoogleSEOService {
  static getSettings(): GoogleSEOSettings {
    if (typeof window === 'undefined') return DEFAULT_GOOGLE_SEO_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SEO_SETTINGS);
      if (stored) {
        return { ...DEFAULT_GOOGLE_SEO_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {}
    return DEFAULT_GOOGLE_SEO_SETTINGS;
  }

  static saveSettings(settings: GoogleSEOSettings): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_SEO_SETTINGS, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('infonews:seo-settings-updated', { detail: settings }));
    } catch {}
  }

  static generateStandardSitemapXML(posts: any[], pages: any[], categories: any[]): string {
    const settings = this.getSettings();
    const baseUrl = settings.canonicalBaseUrl.replace(/\/+$/, '');
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Homepage
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Categories
    categories.forEach((cat) => {
      xml += `  <url>\n    <loc>${baseUrl}/category/${cat.slug || cat.id}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });

    // Posts
    posts
      .filter((p) => p.status === 'PUBLISHED')
      .forEach((post) => {
        xml += `  <url>\n    <loc>${baseUrl}/post/${post.slug}</loc>\n    <lastmod>${post.updatedAt || now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n`;
        if (post.featuredImage) {
          xml += `    <image:image>\n      <image:loc>${post.featuredImage}</image:loc>\n      <image:title>${post.title.replace(/[<>&'"]/g, '')}</image:title>\n    </image:image>\n`;
        }
        xml += `  </url>\n`;
      });

    // Pages
    pages
      .filter((p) => p.status === 'PUBLISHED')
      .forEach((page) => {
        xml += `  <url>\n    <loc>${baseUrl}/page/${page.slug}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
      });

    xml += `</urlset>`;
    return xml;
  }

  static generateGoogleNewsSitemapXML(posts: any[]): string {
    const settings = this.getSettings();
    const baseUrl = settings.canonicalBaseUrl.replace(/\/+$/, '');
    const pubName = settings.googleNewsPublicationName || 'InfoNewsUpdate24';
    const lang = settings.googleNewsLanguage || 'mr';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

    // Last 48 hours published posts
    const newsPosts = posts.filter((p) => p.status === 'PUBLISHED').slice(0, 100);

    newsPosts.forEach((post) => {
      const pubDate = post.publishDate || new Date().toISOString();
      const safeTitle = (post.title || '').replace(/[<>&'"]/g, '');
      const keywords = (post.tags || []).join(', ') || 'महाराष्ट्र, मराठी बातम्या, ताज्या घडामोडी';

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/post/${post.slug}</loc>\n`;
      xml += `    <news:news>\n`;
      xml += `      <news:publication>\n`;
      xml += `        <news:name>${pubName}</news:name>\n`;
      xml += `        <news:language>${lang}</news:language>\n`;
      xml += `      </news:publication>\n`;
      xml += `      <news:publication_date>${pubDate}</news:publication_date>\n`;
      xml += `      <news:title>${safeTitle}</news:title>\n`;
      xml += `      <news:keywords>${keywords}</news:keywords>\n`;
      xml += `    </news:news>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  }

}
