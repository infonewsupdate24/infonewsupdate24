import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getArticleAuthor } from './articleAuthor';
import type { UserProfile } from '../types';

const editor = { id: 'editor-2', name: 'Editor', avatar: 'editor.png', role: 'EDITOR' } as UserProfile;
test('new article attributes all fields to the signed-in author', () => {
  assert.deepEqual(getArticleAuthor(undefined, editor), {
    authorId: 'editor-2', authorName: 'Editor', authorAvatar: 'editor.png', authorRole: 'EDITOR',
  });
});
test('editing keeps original reporter identity, photo and role together', () => {
  const original = { authorId: 'reporter-1', authorName: 'Reporter', authorAvatar: 'reporter.png', authorRole: 'REPORTER' as const };
  assert.deepEqual(getArticleAuthor(original, editor), original);
});
test('legacy incomplete attribution is never replaced by the current editor', () => {
  const original = { authorId: '', authorName: 'Legacy Byline', authorAvatar: '', authorRole: 'REPORTER' as const };
  assert.deepEqual(getArticleAuthor(original, editor), original);
});
