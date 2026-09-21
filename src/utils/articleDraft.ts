// Restore editable content only. Authorship and workflow state always come from the article.
export interface ArticleDraftFields {
  title: string; slug: string; content: string; excerpt: string;
  featuredImage: string; featuredImageAlt: string; featuredImageCaption: string;
  categoryId: string; subCategoryId: string; postTags: string[]; location: string;
  videoUrl: string; attachmentUrl: string; attachmentName: string;
  focusKeyword: string; seoTitle: string; metaDescription: string;
  scheduleDate: string; editorialNote: string;
  isBreaking: boolean; isTrending: boolean; isVideoNews: boolean;
  visibility: 'PUBLIC' | 'PRIVATE' | 'PASSWORD_PROTECTED';
}

export interface ArticleDraft {
  version: 1;
  editorId: string;
  postId: string | null;
  savedAt: number;
  fields: ArticleDraftFields;
}

export function articleDraftKey(editorId: string, postId: string | null) {
  return `infonews_autosave_v1:${encodeURIComponent(editorId)}:${encodeURIComponent(postId || 'new')}`;
}

export function readArticleDraft(raw: string | null, editorId: string, postId: string | null, updatedAt?: string): ArticleDraft | null {
  try {
    const draft = JSON.parse(raw || 'null');
    if (!draft || draft.version !== 1 || draft.editorId !== editorId || draft.postId !== postId ||
        !Number.isFinite(draft.savedAt) || draft.savedAt <= 0 || !draft.fields) return null;
    const updated = Date.parse(updatedAt || '');
    if (Number.isFinite(updated) && draft.savedAt <= updated) return null;
    const fields = draft.fields;
    const strings = ['title', 'slug', 'content', 'excerpt', 'featuredImage', 'featuredImageAlt',
      'featuredImageCaption', 'categoryId', 'subCategoryId', 'location', 'videoUrl',
      'attachmentUrl', 'attachmentName', 'focusKeyword', 'seoTitle', 'metaDescription', 'scheduleDate', 'editorialNote'];
    if (!strings.every(key => typeof fields[key] === 'string') ||
        !['isBreaking', 'isTrending', 'isVideoNews'].every(key => typeof fields[key] === 'boolean') ||
        !Array.isArray(fields.postTags) || !fields.postTags.every((tag: unknown) => typeof tag === 'string') ||
        !['PUBLIC', 'PRIVATE', 'PASSWORD_PROTECTED'].includes(fields.visibility)) return null;
    return draft as ArticleDraft;
  } catch {
    return null;
  }
}
