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
