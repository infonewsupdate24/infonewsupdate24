// This allowlist is also used by profile writes. Never spread a private user document here.
export function toPublicAuthor(user) {
  return { id: user.id, name: user.name || '', avatar: user.avatar || '',
    role: user.role || 'USER', designation: user.designation || '' };
}

export function resolvePostAuthor(post, authors) {
  const profile = post.authorId && authors.find(author => author.id === post.authorId);
  if (!profile) return post;
  return { ...post, authorName: profile.name, authorAvatar: profile.avatar,
    authorRole: profile.role, authorDesignation: profile.designation || '' };
}

export function countPublishedByAuthor(posts, authorId) {
  return authorId ? posts.filter(post => post.status === 'PUBLISHED' && post.authorId === authorId).length : 0;
}
