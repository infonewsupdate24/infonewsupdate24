import { test } from 'node:test';
import assert from 'node:assert/strict';
import { articleDraftKey, readArticleDraft, type ArticleDraft } from './articleDraft';
import { canEditPost, canPerformWorkflowTransition } from './rbac';
import type { UserProfile } from '../types';

const draft: ArticleDraft = {
  version: 1, editorId: 'editor', postId: 'post', savedAt: Date.parse('2026-09-21T10:00:00Z'),
  fields: {
    title: 'बातमी', slug: 'news', content: 'अपूर्ण मजकूर', excerpt: '',
    featuredImage: '', featuredImageAlt: '', featuredImageCaption: '', categoryId: 'cat',
    subCategoryId: '', postTags: ['बातमी'], location: 'गडचिरोली', videoUrl: '',
    attachmentUrl: '', attachmentName: '', focusKeyword: '', seoTitle: '', metaDescription: '',
    scheduleDate: '', editorialNote: '', isBreaking: false, isTrending: false,
    isVideoNews: false, visibility: 'PUBLIC',
  },
};

test('draft restores content and metadata for its editor and article', () => {
  assert.deepEqual(readArticleDraft(JSON.stringify(draft), 'editor', 'post'), draft);
});

test('drafts cannot cross accounts or articles, including new articles', () => {
  const raw = JSON.stringify(draft);
  assert.equal(readArticleDraft(raw, 'another-editor', 'post'), null);
  assert.equal(readArticleDraft(raw, 'editor', 'other-post'), null);
  assert.equal(readArticleDraft(raw, 'editor', null), null);
  assert.notEqual(articleDraftKey('editor', null), articleDraftKey('other-editor', null));
});

test('invalid and outdated local drafts are ignored', () => {
  assert.equal(readArticleDraft('{invalid', 'editor', 'post'), null);
  assert.equal(readArticleDraft(JSON.stringify({ ...draft, fields: { title: 'bad' } }), 'editor', 'post'), null);
  assert.equal(readArticleDraft(JSON.stringify(draft), 'editor', 'post', '2026-09-21T10:01:00Z'), null);
});

test('reporter can resubmit and edit their own resubmission without editing published posts', () => {
  const user = { id: 'reporter', role: 'REPORTER', status: 'ACTIVE' } as UserProfile;
  assert.equal(canPerformWorkflowTransition(user, 'NEEDS_CORRECTION', 'RESUBMITTED'), true);
  assert.equal(canPerformWorkflowTransition(user, 'RESUBMITTED', 'PUBLISHED'), false);
  assert.equal(canEditPost(user, { status: 'RESUBMITTED', authorId: user.id }), true);
  assert.equal(canEditPost(user, { status: 'RESUBMITTED', authorId: 'other' }), false);
  assert.equal(canEditPost(user, { status: 'PUBLISHED', authorId: user.id }), false);
});
