import React, { createContext, useContext, useEffect, useState } from 'react';
import { SEED_USERS } from '../data/seedData';
import { FirebaseAuthService } from '../services/FirebaseAuthService';
import { FirestoreNewsService } from '../services/FirestoreNewsService';
import { UserService } from '../services/UserService';
import { Permission, PostStatus, UserProfile, UserRole } from '../types';
import { canPerformWorkflowTransition, hasPermission as checkPermission } from '../utils/rbac';

interface AuthContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  isAuthenticated: boolean;
  isLoggedIn: boolean;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
  hasPermission: (permission: Permission) => boolean;
  addUser: (user: Omit<UserProfile, 'id' | 'memberSince'>) => UserProfile;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  approveUser: (id: string) => Promise<void>;
  rejectUser: (id: string) => Promise<void>;
  logout: () => void;
  loginWithCredentials: (
    identifier: string,
    password?: string
  ) => Promise<{ success: boolean; user?: UserProfile; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(SEED_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Realtime Firebase Auth & Firestore State Management
  useEffect(() => {
    let isMounted = true;

    // 1. Single Source of Truth: Real Firebase Auth State Listener
    const unsubscribeAuth = FirebaseAuthService.onAuthChange(async (firebaseUser) => {
      if (!isMounted) return;

      if (!firebaseUser) {
        setIsLoggedIn(false);
        setCurrentUserId('');
        try {
          localStorage.removeItem('infonews_auth_session');
          localStorage.removeItem('infonews_current_user_v1');
        } catch {}
        return;
      }

      try {
        const profile = await FirestoreNewsService.getUserProfile(firebaseUser.uid);
        const validRoles: UserRole[] = [
          'SUPER_ADMIN',
          'ADMIN',
          'EDITOR',
          'SUB_EDITOR',
          'REPORTER',
          'VIDEO_REPORTER',
          'PHOTOGRAPHER',
          'USER',
        ];

        if (profile && profile.status === 'ACTIVE' && validRoles.includes(profile.role)) {
          if (isMounted) {
            setAllUsers((prev) => {
              const exists = prev.some((u) => u.id === profile.id);
              return exists ? prev.map((u) => (u.id === profile.id ? profile : u)) : [profile, ...prev];
            });
            setCurrentUserId(profile.id);
            setIsLoggedIn(true);
            try {
              localStorage.setItem('infonews_auth_session', profile.id);
            } catch {}
          }
        } else {
          // Reject unapproved, inactive, or non-existent profile
          await FirebaseAuthService.logout();
          if (isMounted) {
            setIsLoggedIn(false);
            setCurrentUserId('');
            try {
              localStorage.removeItem('infonews_auth_session');
              localStorage.removeItem('infonews_current_user_v1');
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Auth state verification note:', err);
        await FirebaseAuthService.logout();
        if (isMounted) {
          setIsLoggedIn(false);
          setCurrentUserId('');
        }
      }
    });

    // 2. Realtime Firestore User Directory Listener
    const unsubscribeUsers = FirestoreNewsService.subscribeUsers((cloudUsers) => {
      if (isMounted && cloudUsers && cloudUsers.length > 0) {
        const filtered = cloudUsers.filter(
          (u) => !['user-2', 'user-3', 'user-4', 'user-5', 'user-6', 'user-7', 'user-8'].includes(u.id)
        );
        if (filtered.length > 0) {
          setAllUsers(filtered);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      unsubscribeUsers();
    };
  }, []);

  const guestUser: UserProfile = {
    id: 'guest-reader',
    name: 'वाचक / अतिथी',
    email: '',
    role: 'USER',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    memberSince: '2026',
    designation: 'सार्वजनिक वाचक',
  };

  const currentUser = isLoggedIn && currentUserId
    ? allUsers.find((u) => u.id === currentUserId) || guestUser
    : guestUser;

  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target && target.status === 'ACTIVE') {
      setCurrentUserId(userId);
      setIsLoggedIn(true);
      try {
        localStorage.setItem('infonews_auth_session', userId);
      } catch {}
    }
  };

  const switchRole = (_role: UserRole) => {
    // Client-side arbitrary role switching is strictly disabled.
    // Role is authoritative from Firestore profile.
  };

  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    if (!isLoggedIn) return;
    // Prevent updating role, status, or id from client-side profile helper
    const { role, status, id, ...allowedUpdates } = updates as any;
    const updatedUser = { ...currentUser, ...allowedUpdates };
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );
    FirestoreNewsService.saveUserProfile(updatedUser).catch(() => {});
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!isLoggedIn || currentUser.status !== 'ACTIVE' || currentUser.role === 'USER') return false;
    return UserService.checkPermission(currentUser, permission);
  };

  const addUser = (userData: Omit<UserProfile, 'id' | 'memberSince'>): UserProfile => {
    const newUser: UserProfile = {
      ...userData,
      id: `user-${Date.now()}`,
      status: userData.status || 'PENDING',
      memberSince: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    setAllUsers((prev) => [newUser, ...prev]);
    FirestoreNewsService.saveUserProfile(newUser).catch(() => {});
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    let targetUpdated: UserProfile | null = null;
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          targetUpdated = { ...u, ...updates };
          return targetUpdated;
        }
        return u;
      })
    );
    if (targetUpdated) {
      FirestoreNewsService.saveUserProfile(targetUpdated).catch(() => {});
    }
  };

  const approveUser = async (id: string) => {
    let approvedUser: UserProfile | null = null;
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          approvedUser = { ...u, status: 'ACTIVE' };
          return approvedUser;
        }
        return u;
      })
    );
    if (approvedUser) {
      await FirestoreNewsService.saveUserProfile(approvedUser);
    }
  };

  const rejectUser = async (id: string) => {
    if (id === currentUser.id) return;
    setAllUsers((prev) => prev.filter((u) => u.id !== id));
    await FirestoreNewsService.deleteUserProfile(id);
  };

  const deleteUser = (id: string) => {
    if (id === currentUser.id) return; // Cannot delete self
    setAllUsers((prev) => prev.filter((u) => u.id !== id));
    FirestoreNewsService.deleteUserProfile(id).catch(() => {});
  };

  const logout = () => {
    try {
      localStorage.removeItem('infonews_auth_session');
      localStorage.removeItem('infonews_current_user_v1');
      sessionStorage.removeItem('infonews_auth_session');
    } catch {}
    FirebaseAuthService.logout().catch(() => {});
    setIsLoggedIn(false);
    setCurrentUserId('');
  };

  const loginWithCredentials = async (
    identifier: string,
    password?: string
  ): Promise<{ success: boolean; user?: UserProfile; message?: string }> => {
    if (!password) {
      return {
        success: false,
        message: '❌ कृपया पासवर्ड प्रविष्ट करा.',
      };
    }

    try {
      const authRes = await FirebaseAuthService.loginWithEmail(identifier.trim(), password);
      if (authRes.success && authRes.profile) {
        switchUser(authRes.profile.id);
        return { success: true, user: authRes.profile };
      }
      return {
        success: false,
        message: authRes.error || '❌ लॉगिन अयशस्वी झाले. कृपया क्रेडेंशियल्स तपासा.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || '❌ ऑथेंटिकेशन अयशस्वी झाले.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthenticated: true,
        isLoggedIn,
        switchUser,
        switchRole,
        updateCurrentUserProfile,
        hasPermission,
        addUser,
        updateUser,
        deleteUser,
        approveUser,
        rejectUser,
        logout,
        loginWithCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export interface UsePermissionsResult {
  currentUser: UserProfile;
  role: UserRole;
  isActive: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canPerformWorkflowTransition: (fromStatus: PostStatus, toStatus: PostStatus) => boolean;

  // Role booleans
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isSubEditor: boolean;
  isReporter: boolean;
  isVideoReporter: boolean;
  isPhotographer: boolean;
  isUser: boolean;

  // Domain capability flags
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
 * Custom hook to centralize RBAC logic and access checks via UserService.
 */
export const usePermissions = (): UsePermissionsResult => {
  const { currentUser, hasPermission } = useAuth();
  const roleVerification = UserService.verifyUserRole(currentUser);
  const capabilities = UserService.mapUserCapabilities(currentUser);
  const role = currentUser.role;
  const isActive = roleVerification.isActive;

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((p) => hasPermission(p));
  };

  return {
    currentUser,
    role,
    isActive,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformWorkflowTransition: (fromStatus: PostStatus, toStatus: PostStatus) =>
      UserService.canTransitionWorkflow(currentUser, fromStatus, toStatus),

    // Role booleans
    isSuperAdmin: role === 'SUPER_ADMIN',
    isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
    isEditor: role === 'EDITOR' || role === 'ADMIN' || role === 'SUPER_ADMIN',
    isSubEditor: role === 'SUB_EDITOR',
    isReporter: role === 'REPORTER',
    isVideoReporter: role === 'VIDEO_REPORTER',
    isPhotographer: role === 'PHOTOGRAPHER',
    isUser: role === 'USER',

    // Specific Domain Capabilities mapped by UserService
    ...capabilities,
  };
};
