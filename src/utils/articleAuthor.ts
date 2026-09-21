import type { Post, UserProfile } from '../types';

// Keep saved attribution intact, including legacy posts without an author ID.
export function getArticleAuthor(post: Pick<Post, 'authorId' | 'authorName' | 'authorAvatar' | 'authorRole' | 'authorDesignation'> | undefined, user: UserProfile) {
  return post ? {
    authorId: post.authorId,
    authorName: post.authorName,
    authorAvatar: post.authorAvatar,
    authorRole: post.authorRole,
    ...(post.authorDesignation !== undefined ? { authorDesignation: post.authorDesignation } : {}),
  } : {
    authorId: user.id,
    authorName: user.name,
    authorAvatar: user.avatar,
    authorRole: user.role,
    ...(user.designation !== undefined ? { authorDesignation: user.designation } : {}),
  };
}

export const AUTHOR_PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#e2e8f0"/><circle cx="20" cy="15" r="7" fill="#64748b"/><path d="M7 37v-4a13 13 0 0 1 26 0v4" fill="#64748b"/></svg>'
);
