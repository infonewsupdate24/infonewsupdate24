import { SEED_USERS } from '../data/seedData';
import { Permission, PostStatus, UserProfile, UserRole } from '../types';
import { canPerformWorkflowTransition, hasPermission, ROLE_PERMISSIONS } from '../utils/rbac';

export const USERS_STORAGE_KEY = 'infonews_users_v1';
export const CURRENT_USER_KEY = 'infonews_current_user_v1';

export interface RoleVerificationResult {
  isValid: boolean;
  role: UserRole;
  isActive: boolean;
  status: string;
  permissions: Permission[];
}

export interface UserCapabilities {
  canCreatePost: boolean;
  canEditPost: boolean;
  canPublishPost: boolean;
  canDeletePost: boolean;
  canReviewPost: boolean;
  canManageCategories: boolean;
  canManageTags: boolean;
  canUploadMedia: boolean;
  canManageMedia: boolean;
  canManagePages: boolean;
  canManageMenus: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canManageAppearance: boolean;
  canManageSettings: boolean;
  canManageAds: boolean;
  canManageSeo: boolean;
  canManageComments: boolean;
  canViewAnalytics: boolean;
  canViewLogs: boolean;
}

/**
 * Service to manage user retrieval, role verification, and permission mapping.
 * Encapsulates client and API layer interactions with the user directory and security matrix.
 */
export class UserService {
  /**
   * Fetch all users from storage or seed fallback.
   */
  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return SEED_USERS;
  }

  /**
   * Retrieve a user by ID.
   */
  static async getUserById(userId: string): Promise<UserProfile | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.id === userId) || null;
  }

  /**
   * Save the complete list of users to persistence.
   */
  static async saveUsers(users: UserProfile[]): Promise<void> {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to persist users', e);
    }
  }

  /**
   * Save current active user ID.
   */
  static async setCurrentUserId(userId: string): Promise<void> {
    try {
      localStorage.setItem(CURRENT_USER_KEY, userId);
    } catch (e) {
      console.error('Failed to set current user ID', e);
    }
  }

  /**
   * Retrieve current active user ID.
   */
  static async getCurrentUserId(): Promise<string> {
    try {
      const savedId = localStorage.getItem(CURRENT_USER_KEY);
      if (savedId) return savedId;
    } catch {
      // Fallback
    }
    return '';
  }

  /**
   * Verify a user's role status and active capabilities.
   */
  static verifyUserRole(user: UserProfile | null): RoleVerificationResult {
    if (!user) {
      return {
        isValid: false,
        role: 'USER',
        isActive: false,
        status: 'INACTIVE',
        permissions: [],
      };
    }

    const isActive = user.status === 'ACTIVE';
    const permissions = isActive ? (ROLE_PERMISSIONS[user.role] || []) : [];

    return {
      isValid: isActive,
      role: user.role,
      isActive,
      status: user.status,
      permissions,
    };
  }

  /**
   * Map user permissions to a high-level capabilities structure for UI bindings.
   */
  static mapUserCapabilities(user: UserProfile | null): UserCapabilities {
    if (!user || user.status !== 'ACTIVE') {
      return {
        canCreatePost: false,
        canEditPost: false,
        canPublishPost: false,
        canDeletePost: false,
        canReviewPost: false,
        canManageCategories: false,
        canManageTags: false,
        canUploadMedia: false,
        canManageMedia: false,
        canManagePages: false,
        canManageMenus: false,
        canManageUsers: false,
        canManageRoles: false,
        canManageAppearance: false,
        canManageSettings: false,
        canManageAds: false,
        canManageSeo: false,
        canManageComments: false,
        canViewAnalytics: false,
        canViewLogs: false,
      };
    }

    return {
      canCreatePost: hasPermission(user, 'post.create'),
      canEditPost: hasPermission(user, 'post.edit') || hasPermission(user, 'post.edit_own'),
      canPublishPost: hasPermission(user, 'post.publish'),
      canDeletePost: hasPermission(user, 'post.delete') || hasPermission(user, 'post.delete_own'),
      canReviewPost: hasPermission(user, 'post.review'),
      canManageCategories: hasPermission(user, 'category.manage'),
      canManageTags: hasPermission(user, 'tag.manage'),
      canUploadMedia: hasPermission(user, 'media.upload'),
      canManageMedia: hasPermission(user, 'media.manage'),
      canManagePages: hasPermission(user, 'page.manage'),
      canManageMenus: hasPermission(user, 'menu.manage'),
      canManageUsers: hasPermission(user, 'user.manage'),
      canManageRoles: hasPermission(user, 'role.manage'),
      canManageAppearance: hasPermission(user, 'appearance.manage'),
      canManageSettings: hasPermission(user, 'settings.manage'),
      canManageAds: hasPermission(user, 'advertisement.manage'),
      canManageSeo: hasPermission(user, 'seo.manage'),
      canManageComments: hasPermission(user, 'comments.manage'),
      canViewAnalytics: hasPermission(user, 'analytics.view'),
      canViewLogs: hasPermission(user, 'logs.view'),
    };
  }

  /**
   * Check if a user has a specific permission.
   */
  static checkPermission(user: UserProfile | null, permission: Permission): boolean {
    return hasPermission(user, permission);
  }

  /**
   * Check if a user can transition a post from one editorial status to another.
   */
  static canTransitionWorkflow(user: UserProfile | null, fromStatus: PostStatus, toStatus: PostStatus): boolean {
    return canPerformWorkflowTransition(user, fromStatus, toStatus);
  }
}
