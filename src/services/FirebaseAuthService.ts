import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { FirestoreNewsService } from './FirestoreNewsService';
import { UserProfile } from '../types';

const VALID_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR', 'REPORTER', 'VIDEO_REPORTER', 'PHOTOGRAPHER', 'USER'];

export class FirebaseAuthService {
  /**
   * Listen to Firebase Auth state
   */
  static onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Register a new user in Firebase Authentication and create profile in Firestore
   * (Restricted for Admin User Management use only)
   */
  static async registerWithEmail(
    email: string,
    pass: string,
    profileData: Partial<UserProfile>
  ): Promise<{ success: boolean; user?: FirebaseUser; profile?: UserProfile; error?: string }> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = cred.user.uid;

      const newProfile: UserProfile = {
        id: uid,
        name: profileData.name || email.split('@')[0],
        email: email,
        password: pass,
        role: profileData.role || 'REPORTER',
        phone: profileData.phone || '',
        avatar: profileData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        location: profileData.location || 'Gadchiroli Portal',
        designation: profileData.designation || 'Staff Member',
        memberSince: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        status: profileData.status || 'PENDING',
        customPermissions: profileData.customPermissions || [],
      };

      // Save to Firestore
      await FirestoreNewsService.saveUserProfile(newProfile);

      return { success: true, user: cred.user, profile: newProfile };
    } catch (err: any) {
      console.warn('Firebase Auth Register note:', err);
      return { success: false, error: err?.message || 'Registration failed' };
    }
  }

  /**
   * Sign In with Email and Password (Strict Admin-Controlled Verification)
   */
  static async loginWithEmail(
    email: string,
    pass: string
  ): Promise<{ success: boolean; user?: FirebaseUser; profile?: UserProfile | null; error?: string }> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await FirestoreNewsService.getUserProfile(cred.user.uid);

      // 1. Must have pre-existing Firestore profile
      if (!profile) {
        await signOut(auth);
        return {
          success: false,
          error: 'हे खाते प्रणालीमध्ये नोंदणीकृत नाही. कृपया प्रशासकाशी संपर्क साधा.',
        };
      }

      // 2. Must be ACTIVE status
      if (profile.status === 'PENDING') {
        await signOut(auth);
        return {
          success: false,
          error: '⏳ तुमचे खाते सुपर ॲडमिनच्या (Super Admin) मंजुरीसाठी प्रलंबित (Pending Approval) आहे. सुपर ॲडमिनने मान्यता दिल्यावरच तुम्ही लॉगिन करू शकाल.',
          profile,
        };
      }

      if (profile.status === 'SUSPENDED' || profile.status === 'INACTIVE' || profile.status !== 'ACTIVE') {
        await signOut(auth);
        return {
          success: false,
          error: '⛔ तुमचे खाते निलंबित किंवा निष्क्रिय करण्यात आले आहे. कृपया प्रशासकाशी संपर्क साधा.',
          profile,
        };
      }

      // 3. Must have a valid role
      if (!VALID_ROLES.includes(profile.role)) {
        await signOut(auth);
        return {
          success: false,
          error: 'अवैध वापरकर्ता रोल. प्रवेश नाकारला.',
          profile,
        };
      }

      return { success: true, user: cred.user, profile };
    } catch (err: any) {
      console.warn('Firebase Auth Login note:', err);
      return { success: false, error: err?.message || 'Login failed' };
    }
  }

  /**
   * Sign In with Google (Strict Admin-Controlled & Verification Gate)
   * NO AUTO USER CREATION: Requires pre-existing active Firestore profile.
   */
  static async loginWithGoogle(): Promise<{ success: boolean; user?: FirebaseUser; profile?: UserProfile; error?: string }> {
    try {
      const cred = await signInWithPopup(auth, googleProvider);

      // 1. Email Verification Security Gate
      if (!cred.user.emailVerified) {
        await signOut(auth);
        return {
          success: false,
          error: 'आपले Google खाते/ईमेल पडताळणी पूर्ण झाल्यानंतरच लॉगिन करता येईल.',
        };
      }

      const uid = cred.user.uid;
      const profile = await FirestoreNewsService.getUserProfile(uid);

      // 2. Reject if no pre-registered Firestore user profile exists (NO AUTO CREATION)
      if (!profile) {
        await signOut(auth);
        return {
          success: false,
          error: 'हे खाते प्रणालीमध्ये नोंदणीकृत नाही. कृपया प्रशासकाशी संपर्क साधा.',
        };
      }

      // 3. Status Validation
      if (profile.status === 'PENDING') {
        await signOut(auth);
        return {
          success: false,
          error: '⏳ तुमचे खाते सुपर ॲडमिनच्या (Super Admin) मंजुरीसाठी प्रलंबित (Pending Approval) आहे. सुपर ॲडमिनने मान्यता दिल्यावरच तुम्ही लॉगिन करू शकाल.',
          profile,
        };
      }

      if (profile.status === 'SUSPENDED' || profile.status === 'INACTIVE' || profile.status !== 'ACTIVE') {
        await signOut(auth);
        return {
          success: false,
          error: '⛔ तुमचे खाते निलंबित किंवा निष्क्रिय करण्यात आले आहे. कृपया प्रशासकाशी संपर्क साधा.',
          profile,
        };
      }

      // 4. Role Validation
      if (!VALID_ROLES.includes(profile.role)) {
        await signOut(auth);
        return {
          success: false,
          error: 'अवैध वापरकर्ता रोल. प्रवेश नाकारला.',
          profile,
        };
      }

      return { success: true, user: cred.user, profile };
    } catch (err: any) {
      console.warn('Firebase Auth Google login note:', err);
      return { success: false, error: err?.message || 'Google लॉगिन अयशस्वी झाले किंवा रद्द केले गेले.' };
    }
  }

  /**
   * Sign Out
   */
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase logout note:', err);
    }
  }
}
