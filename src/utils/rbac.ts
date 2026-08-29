import { Permission, PostStatus, UserProfile, UserRole } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'post.create',
    'post.edit',
    'post.edit_own',
    'post.delete',
    'post.delete_own',
    'post.submit',
    'post.review',
    'post.approve',
    'post.publish',
    'category.manage',
    'tag.manage',
    'media.upload',
    'media.manage',
    'page.manage',
    'menu.manage',
    'user.manage',
    'role.manage',
    'appearance.manage',
    'theme.manage',
    'advertisement.manage',
    'seo.manage',
    'settings.manage',
    'comments.manage',
    'analytics.view',
    'logs.view',
  ],
  ADMIN: [
    'post.create',
    'post.edit',
    'post.edit_own',
    'post.delete',
    'post.delete_own',
    'post.submit',
    'post.review',
    'post.approve',
    'post.publish',
    'category.manage',
    'tag.manage',
    'media.upload',
    'media.manage',
    'page.manage',
    'menu.manage',
    'appearance.manage',
    'theme.manage',
    'advertisement.manage',
    'seo.manage',
    'settings.manage',
    'comments.manage',
    'analytics.view',
    'logs.view',
  ],
  EDITOR: [
    'post.create',
    'post.edit',
    'post.edit_own',
    'post.delete_own',
    'post.submit',
    'post.review',
    'post.approve',
    'post.publish',
    'category.manage',
    'tag.manage',
    'media.upload',
    'media.manage',
    'seo.manage',
    'comments.manage',
    'analytics.view',
  ],
  SUB_EDITOR: [
    'post.create',
    'post.edit',
    'post.edit_own',
    'post.submit',
    'post.review',
    'media.upload',
    'media.manage',
    'tag.manage',
    'seo.manage',
    'comments.manage',
  ],
  REPORTER: [
    'post.create',
    'post.edit_own',
    'post.delete_own',
    'post.submit',
    'media.upload',
    'seo.manage',
  ],
  VIDEO_REPORTER: [
    'post.create',
    'post.edit_own',
    'post.submit',
    'media.upload',
  ],
  PHOTOGRAPHER: [
    'media.upload',
    'media.manage',
  ],
  USER: [],
};

export function hasPermission(user: UserProfile | null, permission: Permission): boolean {
  if (!user || user.status !== 'ACTIVE') return false;
  
  // Check custom individual permissions override first
  if (user.customPermissions && user.customPermissions.includes(permission)) {
    return true;
  }

  const rolePerms = ROLE_PERMISSIONS[user.role] || [];
  return rolePerms.includes(permission);
}

export function canPerformWorkflowTransition(
  user: UserProfile | null,
  fromStatus: PostStatus,
  toStatus: PostStatus
): boolean {
  if (!user || user.status !== 'ACTIVE') return false;

  // Super Admin & Admin can execute any logical transition
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return true;
  }

  // Reporter & Video Reporter: Can move between DRAFT and SUBMITTED
  if (user.role === 'REPORTER' || user.role === 'VIDEO_REPORTER') {
    if (fromStatus === 'DRAFT' && toStatus === 'SUBMITTED') return true;
    if (fromStatus === 'NEEDS_CORRECTION' && toStatus === 'SUBMITTED') return true;
    if (fromStatus === 'SUBMITTED' && toStatus === 'DRAFT') return true;
    return false;
  }

  // Editor & Sub-editor: Can review, request correction, approve, schedule, publish
  if (user.role === 'EDITOR') {
    return true; // Editor has full editorial workflow rights
  }

  if (user.role === 'SUB_EDITOR') {
    if (toStatus === 'UNDER_REVIEW' || toStatus === 'NEEDS_CORRECTION' || toStatus === 'APPROVED') {
      return true;
    }
    // Sub-editor cannot directly publish without Editor/Admin approval
    return false;
  }

  return false;
}

/**
 * Checks if the current user can edit a specific post based on its status and authorship.
 * Strict Security Rule: Once a post is PUBLISHED, ONLY SUPER_ADMIN and ADMIN can edit or update it.
 * Non-admins (Reporter, Contributor, Author, Sub-Editor) are locked to Read-Only mode for published posts.
 */
export function canEditPost(
  user: UserProfile | null,
  post?: { status: PostStatus; authorId?: string } | null
): boolean {
  if (!user || user.status !== 'ACTIVE') return false;

  // Super Admin & Admin have full editorial authority on all posts (draft & published)
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return true;
  }

  // If no specific post is provided, check if user can create a new post
  if (!post) {
    return hasPermission(user, 'post.create');
  }

  // 🔒 PUBLISHED POST LOCK: If post is PUBLISHED or ARCHIVED, strictly locked to Admins only!
  if (post.status === 'PUBLISHED' || post.status === 'ARCHIVED') {
    return false;
  }

  // Editor can edit pre-published workflow posts
  if (user.role === 'EDITOR') {
    return true;
  }

  // Sub-Editor can edit draft / under-review posts
  if (user.role === 'SUB_EDITOR') {
    return (
      post.status === 'DRAFT' ||
      post.status === 'UNDER_REVIEW' ||
      post.status === 'SUBMITTED' ||
      post.status === 'NEEDS_CORRECTION'
    );
  }

  // Reporter & Video Reporter: Can only edit their OWN draft / submitted posts before publish
  if (user.role === 'REPORTER' || user.role === 'VIDEO_REPORTER') {
    const isOwner = !post.authorId || post.authorId === user.id;
    return (
      isOwner &&
      (post.status === 'DRAFT' ||
        post.status === 'SUBMITTED' ||
        post.status === 'NEEDS_CORRECTION')
    );
  }

  return false;
}

/**
 * Checks if the current user can delete a specific post.
 * Strict Security Rule: Once published, ONLY SUPER_ADMIN and ADMIN can delete.
 */
export function canDeletePost(
  user: UserProfile | null,
  post?: { status: PostStatus; authorId?: string } | null
): boolean {
  if (!user || user.status !== 'ACTIVE') return false;

  // Super Admin & Admin can always delete
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return true;
  }

  // 🔒 PUBLISHED POST LOCK: Non-admins CANNOT delete published posts under any circumstance
  if (post && (post.status === 'PUBLISHED' || post.status === 'ARCHIVED')) {
    return false;
  }

  // Reporter can only delete their own DRAFT posts
  if (user.role === 'REPORTER' || user.role === 'VIDEO_REPORTER') {
    const isOwner = !post?.authorId || post?.authorId === user.id;
    return isOwner && post?.status === 'DRAFT';
  }

  return false;
}

/**
 * Checks if the current user can manage static pages (About Us, Privacy Policy, Terms, etc.)
 * Strict Security Rule: ONLY SUPER_ADMIN and ADMIN can create, edit, or delete static pages.
 */
export function canManagePages(user: UserProfile | null): boolean {
  if (!user || user.status !== 'ACTIVE') return false;
  return user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
}
