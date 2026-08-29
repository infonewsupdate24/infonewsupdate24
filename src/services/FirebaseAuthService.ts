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

export class FirebaseAuthService {
  /**
   * Listen to Firebase Auth state
   */
  static onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Register a new user in Firebase Authentication and create profile in Firestore
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
   * Sign In with Email and Password
   */
  static async loginWithEmail(
    email: string,
    pass: string
  ): Promise<{ success: boolean; user?: FirebaseUser; profile?: UserProfile | null; error?: string }> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await FirestoreNewsService.getUserProfile(cred.user.uid);

      if (profile && profile.status === 'PENDING') {
        return {
          success: false,
          error: '⏳ तुमचे खाते सुपर ॲडमिनच्या (Super Admin) मंजुरीसाठी प्रलंबित (Pending Approval) आहे. सुपर ॲडमिनने मान्यता दिल्यावरच तुम्ही लॉगिन करू शकाल.',
          profile,
        };
      }

      if (profile && (profile.status === 'SUSPENDED' || profile.status === 'INACTIVE')) {
        return {
          success: false,
          error: '⛔ तुमचे खाते निलंबित किंवा निष्क्रिय करण्यात आले आहे. कृपया सुपर ॲडमिनशी संपर्क साधा.',
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
   * Sign In with Google
   */
  static async loginWithGoogle(): Promise<{ success: boolean; user?: FirebaseUser; profile?: UserProfile; error?: string }> {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const uid = cred.user.uid;
      let profile = await FirestoreNewsService.getUserProfile(uid);

      if (!profile) {
        profile = {
          id: uid,
          name: cred.user.displayName || 'Google User',
          email: cred.user.email || '',
          role: 'USER',
          phone: cred.user.phoneNumber || '',
          avatar: cred.user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          location: 'Reader Community',
          designation: 'Public Reader',
          memberSince: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          status: 'ACTIVE',
          customPermissions: [],
        };
        await FirestoreNewsService.saveUserProfile(profile);
      }

      return { success: true, user: cred.user, profile };
    } catch (err: any) {
      console.warn('Firebase Auth Google login note:', err);
      return { success: false, error: err?.message || 'Google login failed' };
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
