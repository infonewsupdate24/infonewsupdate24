import { Category, Post } from '../types';

/**
 * Devanagari to English phonetic transliteration map
 */
const VOWELS_MAP: Record<string, string> = {
  'अ': 'a',
  'आ': 'aa',
  'इ': 'i',
  'ई': 'ee',
  'उ': 'u',
  'ऊ': 'oo',
  'ऋ': 'ru',
  'ए': 'e',
  'ऐ': 'ai',
  'ओ': 'o',
  'औ': 'au',
  'अं': 'am',
  'अः': 'ah',
  'ऑ': 'o',
  'ॲ': 'a',
};

const MATRAS_MAP: Record<string, string> = {
  'ा': 'a',
  'ि': 'i',
  'ी': 'ee',
  'ु': 'u',
  'ू': 'oo',
  'ृ': 'ru',
  'े': 'e',
  'ै': 'ai',
  'ो': 'o',
  'ौ': 'au',
  'ं': 'n',
  'ः': 'h',
  'ॉ': 'o',
  'ॅ': 'a',
  '्': '', // halant
};

const CONSONANTS_MAP: Record<string, string> = {
  'क': 'k',
  'ख': 'kh',
  'ग': 'g',
  'घ': 'gh',
  'ङ': 'ng',
  'च': 'ch',
  'छ': 'chh',
  'ज': 'j',
  'झ': 'jh',
  'ञ': 'ny',
  'ट': 't',
  'ठ': 'th',
  'ड': 'd',
  'ढ': 'dh',
  'ण': 'n',
  'त': 't',
  'थ': 'th',
  'द': 'd',
  'ध': 'dh',
  'न': 'n',
  'प': 'p',
  'फ': 'ph',
  'ब': 'b',
  'भ': 'bh',
  'म': 'm',
  'य': 'y',
  'र': 'r',
  'ल': 'l',
  'व': 'v',
  'श': 'sh',
  'ष': 'sh',
  'स': 's',
  'ह': 'h',
  'ळ': 'l',
  'क्ष': 'ksh',
  'ज्ञ': 'dny',
};

// Common News Synonyms & Multilingual Translations Map (English <-> Marathi)
const NEWS_SYNONYMS: Record<string, string[]> = {
  // Weather & Monsoon
  rain: ['पाऊस', 'पावसाचे', 'पावसाच्या', 'पावसाने', 'मान्सून', 'जलस्तर', 'जलप्रलय'],
  rains: ['पाऊस', 'पावसाचे', 'पावसाने'],
  monsoon: ['मान्सून', 'पाऊस', 'पावसाचे', 'पावसाचे आगमन'],
  paus: ['पाऊस', 'पावसाचे', 'पावसाने', 'मान्सून', 'rain', 'monsoon'],
  paaus: ['पाऊस', 'पावसाचे', 'पावसाने'],
  pavas: ['पाऊस', 'पावसाचे', 'पावसाने'],
  pavasache: ['पावसाचे', 'पाऊस'],
  weather: ['हवामान', 'हवामान विभाग', 'अंदाज', 'तापमान', 'गारवा'],
  havaman: ['हवामान', 'हवामान विभाग', 'weather', 'climate', 'forecast'],
  alert: ['अलर्ट', 'इशारा', 'यलो अलर्ट', 'रेड अलर्ट', 'सतर्कता'],
  ishara: ['इशारा', 'अलर्ट', 'warning', 'alert'],

  // Politics & Government
  politics: ['राजकारण', 'राजकीय', 'निवडणूक', 'विधानसभा', 'पक्ष', 'नेते'],
  rajkaran: ['राजकारण', 'राजकीय', 'politics', 'political'],
  election: ['निवडणूक', 'मतदान', 'निकाल', 'आचारसंहिता', 'उमेदवार'],
  nivadnuk: ['निवडणूक', 'मतदान', 'election', 'voting'],
  modi: ['मोदी', 'पंतप्रधान मोदी', 'नरेंद्र मोदी'],
  shasan: ['शासन', 'सरकार', 'प्रशासन'],
  sarkar: ['सरकार', 'शासन', 'मंत्रिमंडळ', 'government'],
  government: ['सरकार', 'शासन', 'प्रशासन', 'मंत्रालय'],
  minister: ['मंत्री', 'मुख्यमंत्री', 'गृहमंत्री'],
  mantri: ['मंत्री', 'मंत्रालय', 'minister'],
  cm: ['मुख्यमंत्री', 'सीएम'],
  pm: ['पंतप्रधान', 'पीएम'],

  // Economy & Markets
  market: ['बाजार', 'शेअर बाजार', 'भांडवली बाजार', 'तेजी', 'मंदी'],
  bazar: ['बाजार', 'शेअर बाजार', 'मार्केट', 'market'],
  bazaar: ['बाजार', 'मार्केट'],
  share: ['शेअर', 'शेअर्स', 'शेअर बाजार', 'stocks'],
  stock: ['शेअर', 'स्टॉक', 'भागभांडवल'],
  stocks: ['शेअर', 'शेअर्स', 'स्टॉक्स'],
  sensex: ['सेन्सेक्स', 'निर्देशांक'],
  nifty: ['निफ्टी'],
  rally: ['उसळी', 'तेजी'],
  gold: ['सोने', 'सुवर्ण', 'सोने दर', 'तोळा'],
  sone: ['सोने', 'सुवर्ण', 'gold'],
  rates: ['दर', 'भाव', 'किंमत'],
  budget: ['अर्थसंकल्प', 'बजेट', 'वित्तीय'],
  arthasankalp: ['अर्थसंकल्प', 'बजेट', 'budget'],
  finance: ['वित्त', 'आर्थिक', 'अर्थव्यवस्था'],
  economy: ['अर्थव्यवस्था', 'आर्थिक'],

  // Sports & Cricket
  sports: ['क्रीडा', 'खेळ', 'सामना', 'क्रिकेट', 'विजय'],
  krida: ['क्रीडा', 'खेळ', 'sports', 'game'],
  khel: ['खेळ', 'क्रीडा', 'sports'],
  cricket: ['क्रिकेट', 'सामना', 'फलंदाज', 'गोलंदाज', 'षटक', 'धावा'],
  ipl: ['आयपीएल', 'आयपीएल २०२४', 'ipl', 'सामना'],
  match: ['सामना', 'मॅच', 'खेळ'],
  victory: ['विजय', 'जिंकले'],
  vijay: ['विजय', 'जिंकले', 'victory', 'win'],

  // Farmers & Agriculture
  farmer: ['शेतकरी', 'शेतकऱ्यांसाठी', 'शेती', 'पेरण्या'],
  farmers: ['शेतकरी', 'शेतकऱ्यांसाठी', 'बळीराजा'],
  shetkari: ['शेतकरी', 'शेतकऱ्यांसाठी', 'farmer', 'agriculture'],
  krushi: ['कृषी', 'शेती', 'agriculture'],
  agriculture: ['कृषी', 'शेती', 'शेतकरी'],

  // Geography & Locations
  maharashtra: ['महाराष्ट्र', 'महाराष्ट्रात', 'राज्यात', 'मराठी', 'maharashtra'],
  mumbai: ['मुंबई', 'मुंबईत', 'महानगर', 'mumbai'],
  pune: ['पुणे', 'पुण्यात', 'pune'],
  nagpur: ['नागपूर', 'नागपुरात', 'nagpur'],
  gadchiroli: ['गडचिरोली', 'गडचिरोलीत', 'gadchiroli'],
  vidarbha: ['विदर्भ', 'विदर्भातील', 'विदर्भात', 'vidarbha'],
  nashik: ['नाशिक', 'nashik'],
  kokan: ['कोकण', 'कोकणातील', 'kokan', 'konkan'],
  delhi: ['दिल्ली', 'नवी दिल्ली', 'delhi'],
  india: ['भारत', 'भारतीय', 'देशात', 'india'],
  bharat: ['भारत', 'भारतीय', 'india'],

  // Technology & World
  technology: ['तंत्रज्ञान', 'टेक', 'एआय', 'सायबर'],
  tech: ['तंत्रज्ञान', 'टेक', 'technology'],
  ai: ['कृत्रिम बुद्धिमत्ता', 'एआय', 'artificial intelligence'],
  isro: ['इस्रो', 'चांद्रयान', 'अंतराळ', 'उपग्रह'],
  space: ['अंतराळ', 'अवकाश'],
  world: ['जागतिक', 'विश्व', 'परदेश', 'आंतरराष्ट्रीय'],
  jagatik: ['जागतिक', 'विश्व', 'world', 'global'],

  // Entertainment
  entertainment: ['मनोरंजन', 'चित्रपट', 'सिनेमा', 'ओटीटी', 'कलाकार'],
  manoranjan: ['मनोरंजन', 'entertainment'],
  cinema: ['चित्रपट', 'सिनेमा', 'चित्रपटसृष्टी', 'cinema', 'film', 'movie'],
  movie: ['चित्रपट', 'सिनेमा', 'चित्रपटसृष्टी'],
  film: ['चित्रपट', 'सिनेमा'],

  // General news words
  news: ['बातम्या', 'बातमी', 'वृत्त', 'अपडेट'],
  batmi: ['बातमी', 'वृत्त', 'news', 'update'],
  batmya: ['बातम्या', 'वृत्त', 'news'],
  breaking: ['ब्रेकिंग', 'ताजी बातमी', 'महत्त्वाची बातमी'],
  taja: ['ताजी', 'ताज्या', 'fresh', 'latest'],
  latest: ['ताज्या', 'नवीनतम', 'अलीकडील'],
};

/**
 * Normalizes Unicode text: NFC normalization, removes invisible/zero-width chars, trims whitespace.
 */
export function normalizeUnicode(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // strip zero-width chars
    .trim();
}

/**
 * Converts Devanagari text into approximate Latin/English phonetic transliteration.
 */
export function devanagariToPhonetic(devanagariText: string): string {
  if (!devanagariText) return '';
  const normalized = normalizeUnicode(devanagariText);
  let result = '';

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextChar = normalized[i + 1];

    if (VOWELS_MAP[char]) {
      result += VOWELS_MAP[char];
    } else if (MATRAS_MAP[char] !== undefined) {
      result += MATRAS_MAP[char];
    } else if (CONSONANTS_MAP[char]) {
      const base = CONSONANTS_MAP[char];
      // If the next character is a matra or halant, don't append default 'a'
      if (nextChar && (MATRAS_MAP[nextChar] !== undefined || nextChar === '्')) {
        result += base;
      } else {
        result += base + 'a';
      }
    } else {
      // Keep digits, punctuation, and standard ascii characters
      result += char;
    }
  }

  // Clean up duplicate trailing vowels or awkward sequences
  return result.toLowerCase().replace(/aa+/g, 'a').replace(/ee+/g, 'i').replace(/oo+/g, 'u');
}

/**
 * Checks if a post matches a search query across Marathi, English, Unicode, and Transliteration.
 */
export function matchNewsPost(
  post: Post,
  rawQuery: string,
  categoriesMap?: Map<string, Category> | Record<string, Category> | Category[]
): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;

  const queryClean = normalizeUnicode(rawQuery).toLowerCase();
  const queryTokens = queryClean.split(/\s+/).filter(Boolean);

  // 1. Collect all textual fields from the post
  const title = normalizeUnicode(post.title || '');
  const content = normalizeUnicode(post.content || '');
  const excerpt = normalizeUnicode(post.excerpt || '');
  const slug = normalizeUnicode(post.slug || '').replace(/-/g, ' ');
  const tags = (post.tags || []).map((t) => normalizeUnicode(t)).join(' ');
  const location = normalizeUnicode(post.location || '');
  const authorName = normalizeUnicode(post.authorName || '');
  const imageAlt = normalizeUnicode(post.featuredImageAlt || '');
  const imageCaption = normalizeUnicode(post.featuredImageCaption || '');
  const focusKeyword = normalizeUnicode(post.seo?.focusKeyword || '');
  const seoTitle = normalizeUnicode(post.seo?.seoTitle || '');
  const metaDescription = normalizeUnicode(post.seo?.metaDescription || '');

  // Category names & slugs
  let categoryName = '';
  let categorySlug = '';
  if (categoriesMap) {
    let cat: Category | undefined;
    if (Array.isArray(categoriesMap)) {
      cat = categoriesMap.find((c) => c.id === post.categoryId);
    } else if (categoriesMap instanceof Map) {
      cat = categoriesMap.get(post.categoryId);
    } else {
      cat = categoriesMap[post.categoryId];
    }
    if (cat) {
      categoryName = normalizeUnicode(cat.name);
      categorySlug = normalizeUnicode(cat.slug).replace(/-/g, ' ');
    }
  }

  // Combine direct Marathi / English string pool
  const directTextPool = [
    title,
    content,
    excerpt,
    slug,
    tags,
    location,
    authorName,
    imageAlt,
    imageCaption,
    focusKeyword,
    seoTitle,
    metaDescription,
    categoryName,
    categorySlug,
  ]
    .join(' ')
    .toLowerCase();

  // 2. Generate phonetic transliteration of Marathi fields
  const phoneticTitle = devanagariToPhonetic(title);
  const phoneticContent = devanagariToPhonetic(content);
  const phoneticExcerpt = devanagariToPhonetic(excerpt);
  const phoneticTags = devanagariToPhonetic(tags);
  const phoneticCategory = devanagariToPhonetic(categoryName);
  const phoneticFocus = devanagariToPhonetic(focusKeyword);

  const phoneticTextPool = [
    phoneticTitle,
    phoneticContent,
    phoneticExcerpt,
    phoneticTags,
    phoneticCategory,
    phoneticFocus,
  ].join(' ');

  // 3. For every query token, check if it matches via:
  //    a) Direct substring match in direct text pool
  //    b) Match in phonetic transliterated text pool
  //    c) Synonym / translation mapping in direct text pool
  return queryTokens.every((token) => {
    // a) Direct substring in post's content/title/tags/slug/etc.
    if (directTextPool.includes(token)) {
      return true;
    }

    // b) Phonetic transliteration matching
    const phoneticToken = devanagariToPhonetic(token);
    if (phoneticTextPool.includes(token) || (phoneticToken && phoneticTextPool.includes(phoneticToken))) {
      return true;
    }

    // c) Check synonyms / dictionary equivalents
    const synonyms = NEWS_SYNONYMS[token] || [];
    for (const syn of synonyms) {
      const synClean = syn.toLowerCase();
      if (directTextPool.includes(synClean) || phoneticTextPool.includes(devanagariToPhonetic(synClean))) {
        return true;
      }
    }

    // d) Check partial phonetic stems (e.g. "maharash" in "maharashtra", "paus" in "pavasache")
    if (token.length >= 3) {
      const tokenStem = token.slice(0, Math.min(token.length, 5));
      if (phoneticTextPool.includes(tokenStem)) {
        return true;
      }
    }

    return false;
  });
}
