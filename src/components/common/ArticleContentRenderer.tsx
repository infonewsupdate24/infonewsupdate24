import React, { useState, useMemo } from 'react';
import { AdSlotRenderer } from './AdSlotRenderer';
import {
  ListOrdered,
  ChevronDown,
  ChevronUp,
  BookmarkCheck,
  MapPin,
  PenTool,
  Radio,
} from 'lucide-react';
import { decodeHtmlEntities, stripAllHtmlTags } from '../../utils/contentFormatter';

interface ArticleContentRendererProps {
  content: string;
  className?: string;
  showInArticleAd?: boolean;
}

/**
 * Parses and renders Markdown inline tokens (**bold**, *italic*, [link](url))
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      const isDateline =
        inner.includes('प्रतिनिधी') ||
        inner.includes('ब्युरो') ||
        inner.includes(':') ||
        inner.includes('|');
      return (
        <strong
          key={index}
          className={`font-black ${
            isDateline
              ? 'text-red-700 bg-red-50/80 px-1.5 py-0.5 rounded-sm border-l-2 border-red-600 mr-1.5 inline-block text-sm sm:text-base font-sans shadow-2xs'
              : 'text-slate-950'
          }`}
        >
          {inner}
        </strong>
      );
    }

    // Italic *text*
    if (part.startsWith('*') && part.endsWith('*')) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic text-slate-800">
          {inner}
        </em>
      );
    }

    // Link [text](url)
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        return (
          <a
            key={index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-700 underline font-semibold transition-colors"
          >
            {match[1]}
          </a>
        );
      }
    }

    return part;
  });
}

export const ArticleContentRenderer: React.FC<ArticleContentRendererProps> = ({
  content,
  className = '',
  showInArticleAd = true,
}) => {
  const [isTocOpen, setIsTocOpen] = useState(true);

  if (!content) return null;

  // 1. Clean Gutenberg artifacts & decode HTML entities
  const decodedContent = decodeHtmlEntities(content);

  // 2. Check if content is HTML (contains <p>, <h1-6>, <div>, <strong>, etc.)
  const isHtml = /<[a-z][\s\S]*>/i.test(decodedContent);

  if (isHtml) {
    return (
      <HtmlArticleRenderer
        htmlContent={decodedContent}
        className={className}
        showInArticleAd={showInArticleAd}
        isTocOpen={isTocOpen}
        setIsTocOpen={setIsTocOpen}
      />
    );
  }

  // Fallback for Pure Markdown Content
  return (
    <MarkdownArticleRenderer
      markdownContent={decodedContent}
      className={className}
      showInArticleAd={showInArticleAd}
      isTocOpen={isTocOpen}
      setIsTocOpen={setIsTocOpen}
    />
  );
};

// ============================================================================
// HTML & WORDPRESS GUTENBERG BLOCK RENDERER
// ============================================================================

interface HtmlArticleRendererProps {
  htmlContent: string;
  className?: string;
  showInArticleAd?: boolean;
  isTocOpen: boolean;
  setIsTocOpen: (open: boolean) => void;
}

const HtmlArticleRenderer: React.FC<HtmlArticleRendererProps> = ({
  htmlContent,
  className = '',
  showInArticleAd = true,
  isTocOpen,
  setIsTocOpen,
}) => {
  // Clean raw WordPress tags before DOM parsing
  const sanitizedHtml = useMemo(() => {
    return htmlContent
      .replace(/\{\s*\{\s*"@context"[\s\S]*?\}\s*\}\s*\}/gi, '')
      .replace(/\{\s*"@context"\s*:\s*"https?:\/\/schema\.org"[\s\S]*?\}\s*\}/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<!--\s*\/?wp:[^>]*-->/gi, '')
      .replace(/<p\s+class="wp-block-paragraph"\s*>/gi, '<p>')
      .replace(/<h([1-6])\s+class="wp-block-heading"\s*>/gi, '<h$1>')
      .trim();
  }, [htmlContent]);

  // Parse HTML into DOM elements
  const parsedElements = useMemo(() => {
    if (typeof window === 'undefined') return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        `<body>${sanitizedHtml}</body>`,
        'text/html'
      );
      return Array.from(doc.body.children);
    } catch {
      return [];
    }
  }, [sanitizedHtml]);

  // Extract headings for Table of Contents (TOC)
  const tocHeadings: Array<{ id: string; text: string; level: number }> = [];
  parsedElements.forEach((el, idx) => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'h2' || tag === 'h3') {
      const text = el.textContent?.trim() || '';
      if (text) {
        tocHeadings.push({
          id: `toc-heading-${idx}`,
          text,
          level: tag === 'h2' ? 2 : 3,
        });
      }
    }
  });

  const elements: React.ReactNode[] = [];
  let paragraphCount = 0;
  let adInserted = false;
  let tocInserted = false;

  parsedElements.forEach((el, idx) => {
    const tag = el.tagName.toLowerCase();
    const innerHtml = el.innerHTML.trim();
    const rawText = el.textContent?.trim() || '';

    if (!innerHtml && !rawText) return;

    // Skip rogue schema JSON-LD blocks leaked into content
    if (
      rawText.startsWith('{{') ||
      rawText.startsWith('{"@context"') ||
      rawText.includes('"@context": "https://schema.org"') ||
      rawText.includes('"@type": "NewsArticle"') ||
      rawText.includes('"mainEntityOfPage"')
    ) {
      return;
    }

    // 1. Heading 5 or WordPress Dateline Header (e.g. "गडचिरोली | प्रतिनिधी | Info News Update 24")
    if (
      tag === 'h5' ||
      tag === 'h6' ||
      (tag === 'p' &&
        (rawText.includes('प्रतिनिधी') || rawText.includes('ब्युरो')) &&
        rawText.includes('|'))
    ) {
      elements.push(
        <div
          key={`dateline-${idx}`}
          className="my-4 inline-flex flex-wrap items-center gap-2 rounded-2xl bg-gradient-to-r from-red-50 to-amber-50 px-4 py-2 border border-red-200 text-red-950 font-black text-xs sm:text-sm shadow-2xs"
        >
          <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
          <MapPin className="h-3.5 w-3.5 text-red-600 shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: innerHtml }} />
        </div>
      );
      return;
    }

    // 2. Heading 2 (<h2>)
    if (tag === 'h2') {
      elements.push(
        <h2
          key={`h2-${idx}`}
          id={`toc-heading-${idx}`}
          className="text-xl sm:text-2xl font-black text-slate-950 mt-8 mb-3.5 border-l-4 border-red-600 pl-3.5 leading-snug tracking-tight scroll-mt-24 font-serif"
          dangerouslySetInnerHTML={{ __html: innerHtml }}
        />
      );
      return;
    }

    // 3. Heading 3 (<h3>)
    if (tag === 'h3') {
      elements.push(
        <h3
          key={`h3-${idx}`}
          id={`toc-heading-${idx}`}
          className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-2.5 leading-snug scroll-mt-24 flex items-center gap-2 font-serif"
        >
          <BookmarkCheck className="h-4 w-4 text-red-600 shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: innerHtml }} />
        </h3>
      );
      return;
    }

    // 4. Heading 4 (<h4>)
    if (tag === 'h4') {
      elements.push(
        <h4
          key={`h4-${idx}`}
          className="text-base sm:text-lg font-bold text-slate-900 mt-5 mb-2 leading-snug font-serif"
          dangerouslySetInnerHTML={{ __html: innerHtml }}
        />
      );
      return;
    }

    // 5. Blockquote (<blockquote>)
    if (tag === 'blockquote') {
      elements.push(
        <blockquote
          key={`quote-${idx}`}
          className="my-5 border-l-4 border-amber-500 bg-amber-50/50 p-4 rounded-r-2xl text-slate-800 italic text-base sm:text-lg leading-relaxed shadow-2xs"
          dangerouslySetInnerHTML={{ __html: innerHtml }}
        />
      );
      return;
    }

    // 6. Unordered & Ordered Lists (<ul>, <ol>)
    if (tag === 'ul' || tag === 'ol') {
      elements.push(
        <div
          key={`list-${idx}`}
          className="my-4 list-inside space-y-2 text-slate-800 text-base sm:text-lg leading-relaxed pl-2 [&_li]:list-disc [&_li]:marker:text-red-600"
          dangerouslySetInnerHTML={{ __html: el.outerHTML }}
        />
      );
      return;
    }

    // 7. Figure / Image (<figure>, <img>)
    if (tag === 'figure' || tag === 'img') {
      elements.push(
        <div
          key={`media-${idx}`}
          className="my-6 rounded-2xl overflow-hidden border border-slate-200 shadow-sm [&_img]:w-full [&_img]:max-h-[480px] [&_img]:object-cover [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-slate-500 [&_figcaption]:p-2 [&_figcaption]:bg-slate-50"
          dangerouslySetInnerHTML={{ __html: el.outerHTML }}
        />
      );
      return;
    }

    // 8. Standard Paragraph (<p> or fallback <div>)
    paragraphCount++;

    // Check if the paragraph contains a dateline prefix (e.g. "धानोरा (जि. गडचिरोली), दि. २८ ऑगस्ट :")
    elements.push(
      <p
        key={`p-${idx}`}
        className="text-base sm:text-lg leading-relaxed text-slate-800 my-4 font-normal text-justify font-sans [&_strong]:text-slate-950 [&_strong]:font-black [&_a]:text-red-600 [&_a]:underline [&_a]:font-semibold"
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    );

    // Table of Contents (TOC) box after 1st paragraph
    if (!tocInserted && tocHeadings.length >= 2 && paragraphCount === 1) {
      elements.push(
        <TableOfContentsBox
          key="toc-box-container"
          tocHeadings={tocHeadings}
          isTocOpen={isTocOpen}
          setIsTocOpen={setIsTocOpen}
        />
      );
      tocInserted = true;
    }

    // In-Article Ad Slot after 2nd paragraph
    if (
      showInArticleAd &&
      !adInserted &&
      (paragraphCount === 2 || idx === parsedElements.length - 1)
    ) {
      elements.push(
        <div
          key={`in-article-ad-${idx}`}
          className="my-6 min-h-[140px] md:min-h-[200px]"
        >
          <AdSlotRenderer position="ARTICLE_MIDDLE" />
        </div>
      );
      adInserted = true;
    }
  });

  // If parsed elements was empty, render raw sanitized HTML safely
  if (elements.length === 0) {
    return (
      <div
        className={`article-content-body font-sans text-slate-800 text-base sm:text-lg leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  return (
    <div
      className={`article-content-body font-sans text-slate-800 ${className}`}
    >
      {elements}
    </div>
  );
};

// ============================================================================
// MARKDOWN ARTICLE RENDERER
// ============================================================================

interface MarkdownArticleRendererProps {
  markdownContent: string;
  className?: string;
  showInArticleAd?: boolean;
  isTocOpen: boolean;
  setIsTocOpen: (open: boolean) => void;
}

const MarkdownArticleRenderer: React.FC<MarkdownArticleRendererProps> = ({
  markdownContent,
  className = '',
  showInArticleAd = true,
  isTocOpen,
  setIsTocOpen,
}) => {
  // Normalize lines and parse into logical distinct blocks
  const blocks = useMemo(() => {
    const lines = (markdownContent || '')
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((l) => l.trimEnd());

    const result: Array<{
      type: 'h2' | 'h3' | 'h4' | 'ul' | 'ol' | 'blockquote' | 'hr' | 'p';
      content: string | string[];
      raw: string;
    }> = [];

    let currentList: string[] = [];
    let currentListType: 'ul' | 'ol' | null = null;
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join(' ').trim();
        if (text) {
          result.push({ type: 'p', content: text, raw: text });
        }
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (currentList.length > 0 && currentListType) {
        result.push({
          type: currentListType,
          content: [...currentList],
          raw: currentList.join('\n'),
        });
        currentList = [];
        currentListType = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        flushParagraph();
        flushList();
        continue;
      }

      // Horizontal rule (--- or ***)
      if (line === '---' || line === '***' || line === '___') {
        flushParagraph();
        flushList();
        result.push({ type: 'hr', content: '', raw: line });
        continue;
      }

      // Heading 2 (## )
      if (line.startsWith('## ') && !line.startsWith('### ')) {
        flushParagraph();
        flushList();
        result.push({
          type: 'h2',
          content: line.replace(/^##\s+/, '').trim(),
          raw: line,
        });
        continue;
      }

      // Heading 3 (### )
      if (line.startsWith('### ')) {
        flushParagraph();
        flushList();
        result.push({
          type: 'h3',
          content: line.replace(/^###\s+/, '').trim(),
          raw: line,
        });
        continue;
      }

      // Heading 4 (#### )
      if (line.startsWith('#### ')) {
        flushParagraph();
        flushList();
        result.push({
          type: 'h4',
          content: line.replace(/^####\s+/, '').trim(),
          raw: line,
        });
        continue;
      }

      // Blockquote (> )
      if (line.startsWith('> ')) {
        flushParagraph();
        flushList();
        result.push({
          type: 'blockquote',
          content: line.replace(/^>\s+/, '').trim(),
          raw: line,
        });
        continue;
      }

      // Unordered list item (- , * , • )
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        flushParagraph();
        if (currentListType && currentListType !== 'ul') {
          flushList();
        }
        currentListType = 'ul';
        currentList.push(line.replace(/^[-*•]\s+/, '').trim());
        continue;
      }

      // Ordered list item (1. , 2. )
      const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (olMatch) {
        flushParagraph();
        if (currentListType && currentListType !== 'ol') {
          flushList();
        }
        currentListType = 'ol';
        currentList.push(olMatch[2].trim());
        continue;
      }

      // Normal paragraph text
      if (currentList.length > 0) {
        flushList();
      }
      currentParagraph.push(line);
    }

    flushParagraph();
    flushList();
    return result;
  }, [markdownContent]);

  // Extract TOC headings
  const tocHeadings: Array<{ id: string; text: string; level: number }> = [];
  blocks.forEach((b, idx) => {
    if (b.type === 'h2') {
      tocHeadings.push({
        id: `toc-heading-${idx}`,
        text: (b.content as string).replace(/[*_#]/g, ''),
        level: 2,
      });
    } else if (b.type === 'h3') {
      tocHeadings.push({
        id: `toc-heading-${idx}`,
        text: (b.content as string).replace(/[*_#]/g, ''),
        level: 3,
      });
    }
  });

  const elements: React.ReactNode[] = [];
  let paragraphIndex = 0;
  let adInserted = false;
  let tocInserted = false;

  blocks.forEach((block, bIdx) => {
    // 1. Heading 2
    if (block.type === 'h2') {
      elements.push(
        <h2
          key={`h2-${bIdx}`}
          id={`toc-heading-${bIdx}`}
          className="text-xl sm:text-2xl font-black text-slate-950 mt-8 mb-3.5 border-l-4 border-red-600 pl-3.5 leading-snug tracking-tight scroll-mt-24 font-serif"
        >
          {renderInlineMarkdown(block.content as string)}
        </h2>
      );
      return;
    }

    // 2. Heading 3
    if (block.type === 'h3') {
      elements.push(
        <h3
          key={`h3-${bIdx}`}
          id={`toc-heading-${bIdx}`}
          className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-2.5 leading-snug scroll-mt-24 flex items-center gap-2 font-serif"
        >
          <BookmarkCheck className="h-4 w-4 text-red-600 shrink-0" />
          <span>{renderInlineMarkdown(block.content as string)}</span>
        </h3>
      );
      return;
    }

    // 3. Heading 4
    if (block.type === 'h4') {
      elements.push(
        <h4
          key={`h4-${bIdx}`}
          className="text-base font-bold text-slate-900 mt-4 mb-2 leading-snug"
        >
          {renderInlineMarkdown(block.content as string)}
        </h4>
      );
      return;
    }

    // 4. Horizontal Rule
    if (block.type === 'hr') {
      elements.push(
        <hr key={`hr-${bIdx}`} className="my-6 border-slate-200" />
      );
      return;
    }

    // 5. Unordered Bullet List
    if (block.type === 'ul') {
      const items = block.content as string[];
      elements.push(
        <ul
          key={`ul-${bIdx}`}
          className="my-4 list-disc pl-6 space-y-2.5 text-slate-800 text-base sm:text-lg leading-relaxed marker:text-red-600"
        >
          {items.map((item, lIdx) => (
            <li key={lIdx} className="pl-1">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      return;
    }

    // 6. Ordered Numbered List
    if (block.type === 'ol') {
      const items = block.content as string[];
      elements.push(
        <ol
          key={`ol-${bIdx}`}
          className="my-4 list-decimal pl-6 space-y-2.5 text-slate-800 text-base sm:text-lg leading-relaxed marker:font-bold marker:text-red-600"
        >
          {items.map((item, lIdx) => (
            <li key={lIdx} className="pl-1">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      return;
    }

    // 7. Blockquote
    if (block.type === 'blockquote') {
      elements.push(
        <blockquote
          key={`quote-${bIdx}`}
          className="my-5 border-l-4 border-amber-500 bg-amber-50/40 p-4 rounded-r-xl text-slate-800 italic text-base sm:text-lg leading-relaxed shadow-2xs"
        >
          {renderInlineMarkdown(block.content as string)}
        </blockquote>
      );
      return;
    }

    // 8. Standard Paragraph
    paragraphIndex++;
    elements.push(
      <p
        key={`p-${bIdx}`}
        className="text-base sm:text-lg leading-relaxed text-slate-800 my-4 font-normal text-justify"
      >
        {renderInlineMarkdown(block.content as string)}
      </p>
    );

    // Table of Contents Insertion
    if (!tocInserted && tocHeadings.length >= 2 && paragraphIndex === 1) {
      elements.push(
        <TableOfContentsBox
          key="toc-box-container"
          tocHeadings={tocHeadings}
          isTocOpen={isTocOpen}
          setIsTocOpen={setIsTocOpen}
        />
      );
      tocInserted = true;
    }

    // In-Article Ad Insertion
    if (showInArticleAd && !adInserted && (paragraphIndex === 2 || bIdx === 1)) {
      elements.push(
        <div
          key={`in-article-ad-${bIdx}`}
          className="my-6 min-h-[140px] md:min-h-[200px]"
        >
          <AdSlotRenderer position="ARTICLE_MIDDLE" />
        </div>
      );
      adInserted = true;
    }
  });

  return (
    <div
      className={`article-content-body font-sans text-slate-800 ${className}`}
    >
      {elements}
    </div>
  );
};

// ============================================================================
// TABLE OF CONTENTS COMPONENT
// ============================================================================

interface TableOfContentsBoxProps {
  tocHeadings: Array<{ id: string; text: string; level: number }>;
  isTocOpen: boolean;
  setIsTocOpen: (open: boolean) => void;
}

const TableOfContentsBox: React.FC<TableOfContentsBoxProps> = ({
  tocHeadings,
  isTocOpen,
  setIsTocOpen,
}) => {
  return (
    <div className="my-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 shadow-2xs">
      <div
        onClick={() => setIsTocOpen(!isTocOpen)}
        className="flex items-center justify-between cursor-pointer font-bold text-slate-900 text-xs sm:text-sm select-none"
      >
        <div className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-red-600" />
          <span>📑 बातमीतील महत्त्वाचे मुद्दे (Table of Contents)</span>
        </div>
        <button type="button" className="text-slate-500 hover:text-slate-800">
          {isTocOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {isTocOpen && (
        <ol className="mt-3.5 space-y-2 border-t border-slate-200/80 pt-3 text-xs sm:text-sm">
          {tocHeadings.map((h, hIdx) => (
            <li
              key={h.id}
              className={`${
                h.level === 3 ? 'pl-4 text-slate-600' : 'font-bold text-slate-800'
              }`}
            >
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(h.id);
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="hover:text-red-600 transition-colors flex items-center gap-1.5"
              >
                <span className="text-red-600 font-mono font-black">
                  {hIdx + 1}.
                </span>
                <span>{h.text}</span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
