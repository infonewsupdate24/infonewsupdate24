import { AdUnit, Category, EPaperArticleClip, EPaperEdition, EPaperPage, Post } from '../types';
import { EPAPER_DISTRICTS, formatMarathiDate } from '../data/epaperSeedData';

export class EPaperSyncService {
  private static THEMATIC_IMAGES = [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
  ];

  /**
   * Cleans WordPress raw snippets, HTML tags, [&hellip;] entities and special characters.
   */
  public static cleanText(raw: string): string {
    if (!raw) return '';
    return raw
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\[&hellip;\]/g, '')
      .replace(/&hellip;/g, '...')
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#038;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/\[caption[^\]]*\][\s\S]*?\[\/caption\]/gi, '')
      .replace(/\[[^\]]+\]/g, '')
      .replace(/[*#_~`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Returns a guaranteed high-res image URL for any news article.
   */
  public static getValidImage(featuredImage: string | undefined, category: string = '', idx: number = 0): string {
    if (featuredImage && typeof featuredImage === 'string' && featuredImage.trim().startsWith('http')) {
      return featuredImage.trim();
    }
    const cat = (category || '').toLowerCase();
    if (cat.includes('गुन्हे') || cat.includes('crime') || cat.includes('पोलीस') || cat.includes('दारू') || cat.includes('कारवाई')) {
      return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80';
    }
    if (cat.includes('शेती') || cat.includes('कृषी') || cat.includes('agri') || cat.includes('बाजार') || cat.includes('कापूस') || cat.includes('सोयाबीन')) {
      return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80';
    }
    if (cat.includes('क्रीडा') || cat.includes('sport') || cat.includes('क्रिकेट') || cat.includes('सामना')) {
      return 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80';
    }
    if (cat.includes('शासन') || cat.includes('मंत्रिमंडळ') || cat.includes('राज्य') || cat.includes('राजकारण') || cat.includes('विकास') || cat.includes('योजना')) {
      return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80';
    }
    if (cat.includes('आरोग्य') || cat.includes('रुग्णालय') || cat.includes('डॉक्टर') || cat.includes('रक्त')) {
      return 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80';
    }
    return this.THEMATIC_IMAGES[idx % this.THEMATIC_IMAGES.length];
  }

  /**
   * Generates a complete 6-page Digital E-Paper Edition dynamically from published CMS Posts & Ads.
   */
  public static generateDynamicEdition(
    allPosts: Post[],
    districtCode: string,
    selectedDate: string,
    categories: Category[],
    ads: AdUnit[] = []
  ): EPaperEdition {
    const distInfo =
      EPAPER_DISTRICTS.find((d) => d.code === districtCode) || EPAPER_DISTRICTS[0];
    const distCleanName = distInfo.name
      .replace(' आवृत्ती', '')
      .replace('-ठाणे', '')
      .replace('-उत्तर महाराष्ट्र', '')
      .replace('-सांगली', '')
      .replace('-चंद्रपूर', '');

    // 1. Filter only published posts
    const publishedPosts = allPosts.filter(
      (p) => p.status === 'PUBLISHED' || !p.status
    );

    // 2. Separate posts by relevance
    const districtPosts = publishedPosts.filter((p) => {
      const loc = (p.location || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      const cont = (p.content || '').toLowerCase();
      const target = distCleanName.toLowerCase();
      return (
        loc.includes(target) ||
        title.includes(target) ||
        cont.includes(target) ||
        (districtCode === 'mumbai' && (loc.includes('मुंबई') || loc.includes('ठाणे'))) ||
        (districtCode === 'pune' && (loc.includes('पुणे') || loc.includes('पिंपरी'))) ||
        (districtCode === 'nagpur' && (loc.includes('नागपूर') || loc.includes('विदर्भ'))) ||
        (districtCode === 'nashik' && (loc.includes('नाशिक') || loc.includes('अहिल्यानगर'))) ||
        (districtCode === 'sambhajinagar' && (loc.includes('संभाजीनगर') || loc.includes('मराठवाडा') || loc.includes('औरंगाबाद'))) ||
        (districtCode === 'kolhapur' && (loc.includes('कोल्हापूर') || loc.includes('सांगली'))) ||
        (districtCode === 'gadchiroli' && (loc.includes('गडचिरोली') || loc.includes('चंद्रपूर') || loc.includes('एटापल्ली') || loc.includes('धानोरा') || loc.includes('अहेरी')))
      );
    });

    const breakingOrTopPosts = publishedPosts.filter(
      (p) => p.isBreaking || p.isTrending || p.isFeatured
    );

    const politicalOrStatePosts = publishedPosts.filter((p) => {
      const cat = (p.categoryId || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      return (
        cat.includes('state') ||
        cat.includes('politic') ||
        cat.includes('maha') ||
        title.includes('मंत्रिमंडळ') ||
        title.includes('शासन') ||
        title.includes('निवडणूक') ||
        title.includes('योजना')
      );
    });

    const editorialPosts = publishedPosts.filter((p) => {
      const cat = (p.categoryId || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      return (
        cat.includes('edit') ||
        cat.includes('opin') ||
        title.includes('अग्रलेख') ||
        title.includes('संपादकीय') ||
        title.includes('विचार')
      );
    });

    const businessKrishiPosts = publishedPosts.filter((p) => {
      const cat = (p.categoryId || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      return (
        cat.includes('busi') ||
        cat.includes('agri') ||
        cat.includes('krishi') ||
        cat.includes('market') ||
        title.includes('शेतक') ||
        title.includes('बाजार') ||
        title.includes('सोने') ||
        title.includes('अनुदान') ||
        title.includes('कांदा')
      );
    });

    const sportsWorldPosts = publishedPosts.filter((p) => {
      const cat = (p.categoryId || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      return (
        cat.includes('sport') ||
        cat.includes('world') ||
        title.includes('क्रिकेट') ||
        title.includes('सामना') ||
        title.includes('विश्व') ||
        title.includes('भारत')
      );
    });

    // Helper to convert Post to EPaperArticleClip with Guaranteed Clean Text and Active Image
    const mapPostToClip = (
      p: Post,
      pageNum: number,
      idx: number,
      categoryName: string
    ): EPaperArticleClip => {
      const cleanTitle = this.cleanText(p.title);
      const cleanFull = this.cleanText(p.content || '');
      const rawExcerpt = p.excerpt ? this.cleanText(p.excerpt) : '';
      const cleanSummary = rawExcerpt || (cleanFull.length > 250 ? cleanFull.slice(0, 250) + '...' : cleanFull);

      return {
        id: `dyn-art-${p.id}-${pageNum}-${idx}`,
        pageNumber: pageNum,
        title: cleanTitle,
        category: categoryName || 'विशेष बातमी',
        headline: cleanTitle,
        summary: cleanSummary,
        fullBody: cleanFull || cleanSummary,
        authorName: p.authorName || 'विशेष प्रतिनिधी',
        location: p.location || distCleanName,
        image: this.getValidImage(p.featuredImage, categoryName || p.categoryId, idx),
        bounds: {
          x: 5,
          y: idx === 0 ? 10 : 50,
          width: idx === 0 ? 100 : 50,
          height: idx === 0 ? 40 : 35,
        },
      };
    };

    // -------------------------------------------------------------
    // BUILD 6 DYNAMIC PAGES
    // -------------------------------------------------------------

    // Page 1: Front Page (Top breaking + latest district & state headlines)
    const p1Pool = [
      ...breakingOrTopPosts,
      ...districtPosts,
      ...publishedPosts,
    ];
    const p1Unique = Array.from(new Set(p1Pool)).slice(0, 5);
    const page1Articles: EPaperArticleClip[] = p1Unique.map((post, idx) =>
      mapPostToClip(post, 1, idx, idx === 0 ? '🔴 मुख्य मथळा (Lead Story)' : 'ठळक बातमी')
    );

    // Page 2: Maharashtra / State News
    const p2Pool = [
      ...politicalOrStatePosts,
      ...publishedPosts.filter((p) => !p1Unique.includes(p)),
    ];
    const p2Unique = Array.from(new Set(p2Pool)).slice(0, 4);
    const page2Articles: EPaperArticleClip[] = p2Unique.map((post, idx) =>
      mapPostToClip(post, 2, idx, 'महाराष्ट्र वार्ता')
    );

    // Page 3: District Special News (जिल्हा वृत्तांत)
    const p3Pool = [
      ...districtPosts,
      ...publishedPosts.filter((p) => !p1Unique.includes(p) && !p2Unique.includes(p)),
    ];
    const p3Unique = Array.from(new Set(p3Pool)).slice(0, 4);
    const page3Articles: EPaperArticleClip[] = p3Unique.map((post, idx) =>
      mapPostToClip(post, 3, idx, `${distCleanName} विशेष`)
    );

    // Page 4: Editorial & Analysis (संपादकीय व विचारपीठ)
    const p4Pool = [
      ...editorialPosts,
      ...publishedPosts.filter((p) => p.content.length > 400),
      ...publishedPosts,
    ];
    const p4Unique = Array.from(new Set(p4Pool)).slice(0, 3);
    const page4Articles: EPaperArticleClip[] = p4Unique.map((post, idx) =>
      mapPostToClip(post, 4, idx, 'अग्रलेख व स्तंभ')
    );

    // Page 5: Business & Agriculture (अर्थ व कृषी बाजारपेठ)
    const p5Pool = [
      ...businessKrishiPosts,
      ...publishedPosts.filter((p) => !p1Unique.includes(p)),
    ];
    const p5Unique = Array.from(new Set(p5Pool)).slice(0, 4);
    const page5Articles: EPaperArticleClip[] = p5Unique.map((post, idx) =>
      mapPostToClip(post, 5, idx, 'बाजारभाव व शेती')
    );

    // Page 6: Sports & National (क्रीडा व देश-विदेश)
    const p6Pool = [
      ...sportsWorldPosts,
      ...publishedPosts.slice().reverse(),
    ];
    const p6Unique = Array.from(new Set(p6Pool)).slice(0, 4);
    const page6Articles: EPaperArticleClip[] = p6Unique.map((post, idx) =>
      mapPostToClip(post, 6, idx, 'क्रीडा व राष्ट्रीय')
    );

    const pages: EPaperPage[] = [
      {
        id: `dyn-page-1-${districtCode}`,
        pageNumber: 1,
        title: 'मुख्य पान (Front Page)',
        pageType: 'main',
        imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80',
        articles: page1Articles.length > 0 ? page1Articles : this.getFallbackArticles(1, distCleanName),
      },
      {
        id: `dyn-page-2-${districtCode}`,
        pageNumber: 2,
        title: 'महाराष्ट्र वार्ता (State News)',
        pageType: 'maharashtra',
        imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&auto=format&fit=crop&q=80',
        articles: page2Articles.length > 0 ? page2Articles : this.getFallbackArticles(2, distCleanName),
      },
      {
        id: `dyn-page-3-${districtCode}`,
        pageNumber: 3,
        title: `${distCleanName} जिल्हा वृत्तांत (District News)`,
        pageType: 'district',
        imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=300&auto=format&fit=crop&q=80',
        articles: page3Articles.length > 0 ? page3Articles : this.getFallbackArticles(3, distCleanName),
      },
      {
        id: `dyn-page-4-${districtCode}`,
        pageNumber: 4,
        title: 'संपादकीय आणि विचारपीठ (Editorial & Columns)',
        pageType: 'editorial',
        imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=300&auto=format&fit=crop&q=80',
        articles: page4Articles.length > 0 ? page4Articles : this.getFallbackArticles(4, distCleanName),
      },
      {
        id: `dyn-page-5-${districtCode}`,
        pageNumber: 5,
        title: 'अर्थ व कृषी बाजारपेठ (Business & Krishi)',
        pageType: 'business',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&auto=format&fit=crop&q=80',
        articles: page5Articles.length > 0 ? page5Articles : this.getFallbackArticles(5, distCleanName),
      },
      {
        id: `dyn-page-6-${districtCode}`,
        pageNumber: 6,
        title: 'क्रीडा व देश-विदेश (Sports & World)',
        pageType: 'sports',
        imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
        articles: page6Articles.length > 0 ? page6Articles : this.getFallbackArticles(6, distCleanName),
      },
    ];

    return {
      id: `epaper-dyn-${districtCode}-${selectedDate}`,
      editionCode: districtCode,
      districtName: distInfo.name,
      date: selectedDate,
      formattedDateMarathi: formatMarathiDate(selectedDate),
      totalPages: 6,
      coverImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
      pages,
    };
  }

  private static getFallbackArticles(pageNum: number, distName: string): EPaperArticleClip[] {
    return [
      {
        id: `fallback-${pageNum}-1`,
        pageNumber: pageNum,
        title: `${distName} परिसरातील महत्त्वाच्या घडामोडी व विकासकामे`,
        category: 'ठळक बातमी',
        headline: `🔴 ${distName}: महत्त्वाच्या प्रकल्पांना प्रशासकीय मंजुरी; सविस्तर बातमी`,
        summary: 'परिसरातील विकासाला गती देण्यासाठी नवीन योजनांची युद्धपातळीवर अंमलबजावणी सुरू झाली आहे.',
        fullBody: 'स्थानिक पातळीवरील नागरी सुविधा आणि विकासाची कामे मार्गी लावण्यासाठी विशेष निधी मंजूर करण्यात आला असून कामाला गती दिली जात आहे.',
        authorName: 'विशेष प्रतिनिधी',
        location: distName,
        image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
        bounds: { x: 5, y: 10, width: 90, height: 75 },
      },
    ];
  }
}
