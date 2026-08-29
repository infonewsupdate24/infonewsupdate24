import React from 'react';

/**
 * Decodes all HTML entities (named, decimal &#8216;, and hexadecimal &#x2018;)
 * and strips WordPress Gutenberg artifacts, shortcodes, and rogue schema JSON snippets.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';

  let res = text
    // 1. Strip raw Schema JSON-LD blocks leaked into content/excerpt from plugins
    .replace(/\{\s*\{\s*"@context"[\s\S]*?\}\s*\}\s*\}/gi, '')
    .replace(/\{\s*"@context"\s*:\s*"https?:\/\/schema\.org"[\s\S]*?\}\s*\}/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')

    // 2. Strip WordPress Gutenberg comment blocks
    .replace(/<!--\s*\/?wp:[^>]*-->/gi, '')

    // 3. Strip / Flatten common WordPress Shortcodes
    .replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi, '$1')
    .replace(/\[embed[^\]]*\]([\s\S]*?)\[\/embed\]/gi, '$1')
    .replace(
      /\[\/?(wpforms|contact-form-7|elementor-template|vc_[a-zA-Z0-9_-]+|gallery|audio|video|playlist|recent-posts)[^\]]*\]/gi,
      ''
    )

    // 4. Named HTML Entities
    .replace(/\[&hellip;\]/gi, '...')
    .replace(/&hellip;/gi, '...')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&lsquo;/gi, '‘')
    .replace(/&rsquo;/gi, '’')
    .replace(/&ldquo;/gi, '“')
    .replace(/&rdquo;/gi, '”')
    .replace(/&copy;/gi, '©')
    .replace(/&reg;/gi, '®')
    .replace(/&trade;/gi, '™');

  // 5. Decode Decimal Numeric Entities (e.g. &#8216; -> ‘, &#8217; -> ’, &#8220; -> “, &#8221; -> ”, &#8211; -> –)
  res = res.replace(/&#(\d+);/g, (match, decStr) => {
    const dec = parseInt(decStr, 10);
    // Specific well-known punctuation mapping for reliable rendering
    switch (dec) {
      case 8216:
        return '‘';
      case 8217:
        return '’';
      case 8220:
        return '“';
      case 8221:
        return '”';
      case 8211:
        return '–';
      case 8212:
        return '—';
      case 8230:
        return '…';
      case 38:
        return '&';
      case 39:
        return "'";
      case 34:
        return '"';
      case 60:
        return '<';
      case 61:
        return '=';
      case 62:
        return '>';
      case 160:
        return ' ';
      default:
        try {
          return String.fromCharCode(dec);
        } catch {
          return match;
        }
    }
  });

  // 6. Decode Hexadecimal Numeric Entities (e.g. &#x2018; -> ‘, &#x2019; -> ’, &#x201C; -> “)
  res = res.replace(/&#x([0-9a-fA-F]+);/g, (match, hexStr) => {
    try {
      const dec = parseInt(hexStr, 16);
      return String.fromCharCode(dec);
    } catch {
      return match;
    }
  });

  return res;
}

/**
 * Strips all HTML tags and Gutenberg block comments, returning clean, pure text.
 */
export function stripAllHtmlTags(html: string): string {
  if (!html) return '';
  const decoded = decodeHtmlEntities(html);
  return decoded
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Universal helper for formatting and sanitizing news titles.
 * Eliminates raw entities like &#8216;, &#8217;, &amp;, &quot;, and HTML tags.
 */
export function formatNewsTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return stripAllHtmlTags(rawTitle);
}

/**
 * Cleans an article excerpt so it never displays raw HTML tags, entities like [&hellip;], or broken tags.
 */
export function cleanExcerpt(
  excerpt: string,
  fallbackContent?: string,
  maxLength = 180
): string {
  let cleaned = stripAllHtmlTags(excerpt || '');

  if (!cleaned && fallbackContent) {
    cleaned = stripAllHtmlTags(fallbackContent);
  }

  // Remove trailing ellipsis or brackets if any
  cleaned = cleaned
    .replace(/\[\.\.\.\]/g, '')
    .replace(/\.\.\.$/, '')
    .trim();

  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength).trim() + '...';
  }

  return cleaned;
}

/**
 * Formats and prepares clean Marathi/English plain text specifically for Text-to-Speech audio reading.
 */
export function cleanTextForTTS(rawText: string): string {
  if (!rawText) return '';

  // 1. Decode entities & clean schema
  let clean = decodeHtmlEntities(rawText);

  // 2. Strip HTML tags
  clean = stripAllHtmlTags(clean);

  // 3. Remove emojis and special icons
  clean = clean.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}🔴⚡🚨📢🎙️✅📑💰📱]/gu,
    ' '
  );

  // 4. Remove Markdown headings and formatting
  clean = clean
    .replace(/^##+\s+/gm, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '');

  // 5. Clean datelines (e.g. "गडचिरोली (विशेष प्रतिनिधी):" -> "गडचिरोली येथून मिळालेल्या माहितीनुसार, ")
  clean = clean.replace(
    /([^\s]+)\s*\((विशेष प्रतिनिधी|प्रतिनिधी|ब्युरो रिपोर्ट|ब्युरो)\)\s*:/g,
    '$1 येथून, '
  );

  // 6. Strip URLs, Social media boilerplates, and media caption text
  clean = clean
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/www\.\S+/gi, '')
    .replace(/Instagram\s+photos\s+and\s+videos/gi, '')
    .replace(/photos\s+and\s+videos/gi, '')
    .replace(/follow\s+us\s+on\s+[a-z]+/gi, '')
    .replace(/photo\s*credits?\s*:\s*[^\n.]+/gi, '')
    .replace(/@\w+/g, '')
    .replace(/#\w+/g, '')
    .replace(/\bInfoNewsUpdate24\b/gi, 'इन्फो न्यूज २४')
    .replace(/\bIMD\b/gi, 'आय एम डी')
    .replace(/\bIPL\b/gi, 'आय पी एल')
    .replace(/\bMPSC\b/gi, 'एम पी एस सी')
    .replace(/\bUPSC\b/gi, 'यु पी एस सी')
    .replace(/\bAI\b/gi, 'ए आय')
    .replace(/&/g, ' आणि ')
    .replace(/\\n/gi, ' ')
    .replace(/\\r/gi, ' ')
    .replace(/\\t/gi, ' ')
    .replace(/\b[nN]{2,}\b/g, ' ')
    .replace(/\b[nN]\b/g, ' ')
    .replace(/[\[\]{}()<>|\/\\~^_•*#@=]/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return clean;
}

/**
 * Splits text into optimal speech chunks for natural narration (Mobile & Desktop optimized).
 */
export function splitIntoSpeechParagraphs(
  title: string,
  excerpt: string,
  content: string,
  introGreeting?: string
): string[] {
  const chunks: string[] = [];

  if (introGreeting) {
    const cleanIntro = cleanTextForTTS(introGreeting);
    if (cleanIntro) chunks.push(cleanIntro);
  }

  if (title) {
    const cleanT = cleanTextForTTS(title);
    if (cleanT) chunks.push(`बातमी: ${cleanT}`);
  }

  if (excerpt) {
    const cleanExp = cleanTextForTTS(cleanExcerpt(excerpt, content, 120));
    if (cleanExp && !title.includes(cleanExp.slice(0, 25))) {
      chunks.push(`ठळक मुद्दे: ${cleanExp}`);
    }
  }

  if (content) {
    const cleanFull = cleanTextForTTS(content);
    // Split into sentences using punctuation (।, ., !, ?, ;)
    const sentences = cleanFull
      .split(/[।.\n!?;\u0964]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 3);

    sentences.forEach((sent) => {
      // If a sentence is very long, split into ~80 character sub-phrases for mobile stability
      if (sent.length > 90) {
        const words = sent.split(/\s+/);
        let subChunk = '';
        words.forEach((w) => {
          if ((subChunk + ' ' + w).length > 75) {
            if (subChunk.trim()) chunks.push(subChunk.trim());
            subChunk = w;
          } else {
            subChunk += (subChunk ? ' ' : '') + w;
          }
        });
        if (subChunk.trim()) chunks.push(subChunk.trim());
      } else {
        chunks.push(sent);
      }
    });
  }

  return chunks.filter((c) => c.trim().length > 0);
}

export const DEFAULT_NEWS_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';

/**
 * Universal date formatter for Marathi news portal.
 * Converts raw ISO timestamps (e.g. 2026-01-18T17:52:30) or English dates to clean, professional Marathi format.
 */
export function formatMarathiDate(rawDate?: string): string {
  if (!rawDate) return 'आजची बातमी';

  try {
    const trimmed = rawDate.trim();

    // If it's already a clean Marathi text like "२९ ऑगस्ट २०२६"
    if (trimmed.includes('ऑगस्ट') || trimmed.includes('जानेवारी') || trimmed.includes('आधी')) {
      return trimmed;
    }

    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      return trimmed;
    }

    const monthsMarathi = [
      'जानेवारी',
      'फेब्रुवारी',
      'मार्च',
      'एप्रिल',
      'मे',
      'जून',
      'जुलै',
      'ऑगस्ट',
      'सप्टेंबर',
      'ऑक्टोबर',
      'नोव्हेंबर',
      'डिसेंबर',
    ];

    const day = d.getDate();
    const month = monthsMarathi[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
  } catch {
    return rawDate || 'आजची बातमी';
  }
}

/**
 * Ensures image URLs are safe, HTTPS-compliant, and will not trigger Mixed Content or broken icon.
 */
export function getSafeImageUrl(url?: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return DEFAULT_NEWS_FALLBACK_IMAGE;
  }

  const trimmed = url.trim();

  // If already HTTPS or data URI
  if (trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // If HTTP image, convert to HTTPS if same domain or proxy via images.weserv.nl
  if (trimmed.startsWith('http://')) {
    const withoutHttp = trimmed.replace(/^http:\/\//i, '');
    return `https://images.weserv.nl/?url=${encodeURIComponent(withoutHttp)}&default=${encodeURIComponent(DEFAULT_NEWS_FALLBACK_IMAGE)}`;
  }

  return trimmed;
}

