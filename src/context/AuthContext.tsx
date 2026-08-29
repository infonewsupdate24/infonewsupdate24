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
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      return localStorage.getItem('infonews_auth_session') || '';
    } catch {
      return '';
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('infonews_auth_session');
    } catch {
      return false;
    }
  });

  const FAKE_MOCK_USER_IDS = ['user-2', 'user-3', 'user-4', 'user-5', 'user-6', 'user-7', 'user-8'];

  // Initialize, hydrate users via UserService and Firestore Cloud
  useEffect(() => {
    let isMounted = true;

    // 1. Initial local hydration & scrubbing of fake demo users
    const initializeAuth = async () => {
      const rawUsers = await UserService.getAllUsers();
      // Filter out any leftover fake mock users
      const cleanUsers = rawUsers.filter((u) => !FAKE_MOCK_USER_IDS.includes(u.id));
      
      // Ensure official Super Admin is always present
      if (!cleanUsers.some((u) => u.id === SEED_USERS[0].id)) {
        cleanUsers.unshift(SEED_USERS[0]);
      }

      // Cleanup Firestore from fake mock users
      FAKE_MOCK_USER_IDS.forEach((fakeId) => {
        FirestoreNewsService.deleteUserProfile(fakeId).catch(() => {});
      });

      const savedId = (() => {
        try {
          return localStorage.getItem('infonews_auth_session');
        } catch {
          return null;
        }
      })();

      if (isMounted) {
        setAllUsers(cleanUsers);
        UserService.saveUsers(cleanUsers);

        if (savedId && cleanUsers.some((u) => u.id === savedId)) {
          const matched = cleanUsers.find((u) => u.id === savedId);
          if (matched && matched.status === 'ACTIVE') {
            setCurrentUserId(savedId);
            setIsLoggedIn(true);
          } else {
            try {
              localStorage.removeItem('infonews_auth_session');
            } catch {}
            setCurrentUserId('');
            setIsLoggedIn(false);
          }
        } else if (savedId && FAKE_MOCK_USER_IDS.includes(savedId)) {
          // If previously logged in as a mock user, switch to Komal
          setCurrentUserId(SEED_USERS[0].id);
          setIsLoggedIn(true);
          try {
            localStorage.setItem('infonews_auth_session', SEED_USERS[0].id);
          } catch {}
        } else {
          setCurrentUserId('');
          setIsLoggedIn(false);
        }
      }
    };
    initializeAuth();

    // 2. Ensure Super Admin is in Firestore
    FirestoreNewsService.saveUserProfile(SEED_USERS[0]).catch(() => {});

    // 3. Realtime Firestore User Listener (auto-filtering mock users)
    const unsubscribe = FirestoreNewsService.subscribeUsers((cloudUsers) => {
      if (isMounted && cloudUsers && cloudUsers.length > 0) {
        const filteredCloudUsers = cloudUsers.filter((u) => !FAKE_MOCK_USER_IDS.includes(u.id));
        if (filteredCloudUsers.length > 0) {
          // Ensure Super Admin is retained
          if (!filteredCloudUsers.some((u) => u.id === SEED_USERS[0].id)) {
            filteredCloudUsers.unshift(SEED_USERS[0]);
          }
          setAllUsers(filteredCloudUsers);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sync users to local storage persistence layer via UserService
  useEffect(() => {
    UserService.saveUsers(allUsers);
  }, [allUsers]);

  // Sync current user selection via UserService only if logged in
  useEffect(() => {
    if (isLoggedIn && currentUserId) {
      UserService.setCurrentUserId(currentUserId);
    }
  }, [currentUserId, isLoggedIn]);

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

  const switchRole = (role: UserRole) => {
    if (!isLoggedIn) return;
    const existing = allUsers.find((u) => u.role === role && u.status === 'ACTIVE');
    if (existing) {
      setCurrentUserId(existing.id);
      setIsLoggedIn(true);
      try {
        localStorage.setItem('infonews_auth_session', existing.id);
      } catch {}
    } else {
      // Create or update current user's role
      const updated = allUsers.map((u) => (u.id === currentUser.id ? { ...u, role } : u));
      setAllUsers(updated);
    }
  };

  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    if (!isLoggedIn) return;
    const updatedUser = { ...currentUser, ...updates };
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
    const clean = identifier.trim().toLowerCase();
    const matched = allUsers.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        (u.phone && u.phone.includes(clean)) ||
        u.name.toLowerCase() === clean ||
        u.id.toLowerCase() === clean ||
        (clean === 'komal' && u.role === 'SUPER_ADMIN') ||
        (clean === 'vicky' && u.role === 'SUPER_ADMIN') ||
        ((clean === 'admin' || clean === 'admin@infonews.com' || clean === 'admin@infonewsupdate24.com') && (u.role === 'SUPER_ADMIN' || u.role === 'ADMIN')) ||
        (clean === 'superadmin' && u.role === 'SUPER_ADMIN') ||
        (clean === 'editor' && u.role === 'EDITOR') ||
        (clean === 'reporter' && u.role === 'REPORTER')
    );

    if (!matched) {
      return {
        success: false,
        message: '❌ वापरकर्ता सापडला नाही. कृपया वैध ईमेल किंवा मोबाईल नंबर प्रविष्ट करा.',
      };
    }

    // 1. Password Verification
    if (password !== undefined) {
      const isPasswordCorrect = matched.password
        ? matched.password === password.trim()
        : password.trim() === 'admininfo@1234';

      if (!isPasswordCorrect) {
        return {
          success: false,
          message: '❌ चुकीचा पासवर्ड! कृपया योग्य पासवर्ड प्रविष्ट करा.',
        };
      }
    }

    // 2. Strict Approval Verification (Super Admin Approval Required)
    if (matched.status === 'PENDING') {
      return {
        success: false,
        message: '⏳ तुमचे खाते सुपर ॲडमिनच्या (Super Admin) मंजुरीसाठी प्रलंबित (Pending Approval) आहे. सुपर ॲडमिनने मान्यता दिल्यावरच तुम्ही लॉगिन करू शकाल.',
      };
    }

    // 3. Suspended or Inactive Verification
    if (matched.status === 'SUSPENDED' || matched.status === 'INACTIVE') {
      return {
        success: false,
        message: '⛔ तुमचे खाते निलंबित (Suspended) किंवा निष्क्रिय करण्यात आले आहे. कृपया मुख्य संपादकांशी किंवा सुपर ॲडमिनशी संपर्क साधा.',
      };
    }

    // Verified & Active
    setCurrentUserId(matched.id);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('infonews_auth_session', matched.id);
    } catch {}

    return { success: true, user: matched };
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
