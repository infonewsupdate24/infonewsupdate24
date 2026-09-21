import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toPublicAuthor, resolvePostAuthor, countPublishedByAuthor } from './publicAuthors.mjs';

const profile = { id: 'reporter', name: 'Current Reporter', avatar: '', role: 'REPORTER', designation: 'विशेष प्रतिनिधी' };
const post = { id: 'post', authorId: 'reporter', authorName: 'Old Name', authorAvatar: 'old.jpg', authorRole: 'ADMIN', status: 'PUBLISHED' };

test('public profile excludes private user fields', () => {
  assert.deepEqual(toPublicAuthor({ ...profile, email: 'private@example.test', phone: 'private', password: 'secret', customPermissions: ['user.manage'] }), profile);
});
test('exact ID resolves current name, cleared photo and designation without transferring ownership', () => {
  const resolved = resolvePostAuthor(post, [profile]);
  assert.equal(resolved.authorId, 'reporter');
  assert.equal(resolved.authorName, 'Current Reporter');
  assert.equal(resolved.authorAvatar, '');
  assert.equal(resolved.authorRole, 'REPORTER');
  assert.equal(resolved.authorDesignation, 'विशेष प्रतिनिधी');
  assert.equal(post.authorName, 'Old Name');
});
test('renamed profile updates all matching posts; missing IDs never guess by name', () => {
  assert.equal(resolvePostAuthor(post, [{ ...profile, name: 'Renamed' }]).authorName, 'Renamed');
  assert.equal(resolvePostAuthor(post, [{ ...profile, id: 'editor' }]), post);
  const legacy = { ...post, authorId: '' };
  assert.equal(resolvePostAuthor(legacy, [{ ...profile, name: 'Old Name' }]), legacy);
});
test('published counts distinguish identical names by ID and exclude drafts', () => {
  const posts = [post, { ...post, authorName: 'Renamed' }, { ...post, authorId: 'other' }, { ...post, status: 'DRAFT' }];
  assert.equal(countPublishedByAuthor(posts, 'reporter'), 2);
  assert.equal(countPublishedByAuthor(posts, 'other'), 1);
  assert.equal(countPublishedByAuthor(posts, ''), 0);
});
