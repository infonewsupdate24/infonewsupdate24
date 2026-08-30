/**
 * Firestore Realtime & Persistent Database Service for InfoNewsUpdate24
 * Full automated Cloud Database persistence (equivalent to WordPress + Hostinger MySQL DB)
 */
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Post,
  Category,
  Tag,
  UserProfile,
  BreakingTickerItem,
  CitizenNewsReport,
  MediaItem,
  StaticPage,
  Menu,
  SocialMediaPost,
  Comment,
  AdUnit,
  AdSenseGlobalSettings,
  SiteGlobalSettings,
  ThemeSettings,
  EPaperSettings,
  WhatsAppChannelSettings,
  MerchantAdBooking,
} from '../types';

export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  // Preserve Date objects
  if (data instanceof Date) {
    return data;
  }
  // Preserve Firestore Timestamp, FieldValue, serverTimestamp
  if (
    typeof data === 'object' &&
    data !== null &&
    (typeof (data as any).toMillis === 'function' ||
      typeof (data as any).toDate === 'function' ||
      (data as any)._methodName ||
      (data as any)._delegate)
  ) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && data !== null) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return data;
}

export class FirestoreNewsService {
  // -------------------------------------------------------------
  // 1. POSTS (News Articles & Content)
  // -------------------------------------------------------------
  static subscribePosts(onUpdate: (posts: Post[]) => void): Unsubscribe {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('updatedAt', 'desc'), limit(150));

    return onSnapshot(
      q,
      (snapshot) => {
        const posts: Post[] = [];
        snapshot.forEach((docSnap) => {
          posts.push({ ...docSnap.data(), id: docSnap.id } as Post);
        });
        if (posts.length > 0) {
          onUpdate(posts);
        }
      },
      (error) => {
        console.warn('Firestore posts subscription note:', error);
      }
    );
  }

  static async savePost(post: Post): Promise<void> {
    try {
      const postRef = doc(db, 'posts', post.id);
      const cleanData = sanitizeForFirestore(post);
      await setDoc(
        postRef,
        {
          ...cleanData,
          _syncedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to save post to Firestore:', err);
      throw err;
    }
  }

  static async getPostBySlugOrId(slugOrId: string): Promise<Post | null> {
    try {
      const cleanTarget = decodeURIComponent(slugOrId).trim().toLowerCase().replace(/^\/+|\/+$/g, '');
      // 1. Try direct doc ID
      const docSnap = await getDoc(doc(db, 'posts', cleanTarget));
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as Post;
      }
      // 2. Try query by slug field
      const q = query(collection(db, 'posts'), where('slug', '==', cleanTarget), limit(1));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        const foundDoc = qSnap.docs[0];
        return { ...foundDoc.data(), id: foundDoc.id } as Post;
      }
      return null;
    } catch (err) {
      console.warn('Firestore getPostBySlugOrId lookup note:', err);
      return null;
    }
  }

  static async deletePost(postId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (err) {
      console.error('Failed to delete post from Firestore:', err);
      throw err;
    }
  }

  static async bulkSyncInitialPosts(initialPosts: Post[]): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'posts'));
      if (snapshot.empty && initialPosts.length > 0) {
        for (const p of initialPosts) {
          const cleanPost = sanitizeForFirestore(p);
          await setDoc(doc(db, 'posts', p.id), {
            ...cleanPost,
            _syncedAt: serverTimestamp(),
          });
        }
      }
    } catch (err) {
      console.warn('Failed to seed posts in Firestore:', err);
    }
  }

  // -------------------------------------------------------------
  // 2. PAGES (WordPress-Style Custom Pages)
  // -------------------------------------------------------------
  static subscribePages(onUpdate: (pages: StaticPage[]) => void): Unsubscribe {
    const pagesRef = collection(db, 'pages');
    const q = query(pagesRef, orderBy('createdAt', 'desc'), limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const pages: StaticPage[] = [];
        snapshot.forEach((docSnap) => {
          pages.push({ ...docSnap.data(), id: docSnap.id } as StaticPage);
        });
        if (pages.length > 0) {
          onUpdate(pages);
        }
      },
      (error) => {
        console.warn('Firestore pages subscription note:', error);
      }
    );
  }

  static async savePage(page: StaticPage): Promise<void> {
    try {
      await setDoc(
        doc(db, 'pages', page.id),
        {
          ...page,
          _syncedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to save page to Firestore:', err);
      throw err;
    }
  }

  static async deletePage(pageId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'pages', pageId));
    } catch (err) {
      console.error('Failed to delete page from Firestore:', err);
      throw err;
    }
  }

  static async bulkSyncInitialPages(initialPages: StaticPage[]): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'pages'));
      if (snapshot.empty && initialPages.length > 0) {
        for (const page of initialPages) {
          await setDoc(doc(db, 'pages', page.id), {
            ...page,
            _syncedAt: serverTimestamp(),
          });
        }
      }
    } catch (err) {
      console.warn('Failed to seed pages in Firestore:', err);
    }
  }

  // -------------------------------------------------------------
  // 3. MEDIA LIBRARY
  // -------------------------------------------------------------
  static subscribeMedia(onUpdate: (media: MediaItem[]) => void): Unsubscribe {
    const mediaRef = collection(db, 'media');
    const q = query(mediaRef, orderBy('createdAt', 'desc'), limit(150));

    return onSnapshot(
      q,
      (snapshot) => {
        const mediaItems: MediaItem[] = [];
        snapshot.forEach((docSnap) => {
          mediaItems.push({ ...docSnap.data(), id: docSnap.id } as MediaItem);
        });
        if (mediaItems.length > 0) {
          onUpdate(mediaItems);
        }
      },
      (error) => {
        console.warn('Firestore media subscription note:', error);
      }
    );
  }

  static async saveMediaItem(item: MediaItem): Promise<void> {
    try {
      const mediaRef = doc(db, 'media', item.id);
      await setDoc(
        mediaRef,
        {
          ...item,
          _syncedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to save media item to Firestore:', err);
      throw err;
    }
  }

  static async deleteMediaItem(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'media', id));
    } catch (err) {
      console.error('Failed to delete media item from Firestore:', err);
      throw err;
    }
  }

  static async bulkDeleteMediaItems(ids: string[]): Promise<void> {
    try {
      for (const id of ids) {
        await deleteDoc(doc(db, 'media', id));
      }
    } catch (err) {
      console.error('Failed to bulk delete media items from Firestore:', err);
      throw err;
    }
  }

  static async bulkSyncInitialMedia(initialMedia: MediaItem[]): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'media'));
      if (snapshot.empty && initialMedia.length > 0) {
        for (const item of initialMedia) {
          await setDoc(doc(db, 'media', item.id), {
            ...item,
            _syncedAt: serverTimestamp(),
          });
        }
      }
    } catch (err) {
      console.warn('Firestore initial media seeding note:', err);
    }
  }

  // -------------------------------------------------------------
  // 4. CATEGORIES & TAXONOMY
  // -------------------------------------------------------------
  static subscribeCategories(onUpdate: (cats: Category[]) => void): Unsubscribe {
    const catsRef = collection(db, 'categories');
    return onSnapshot(
      catsRef,
      (snapshot) => {
        const items: Category[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as Category);
        });
        if (items.length > 0) {
          onUpdate(items);
        }
      },
      (error) => {
        console.warn('Firestore categories subscription note:', error);
      }
    );
  }

  static async saveCategory(cat: Category): Promise<void> {
    try {
      await setDoc(doc(db, 'categories', cat.id), { ...cat, _syncedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('Failed to save category to Firestore:', err);
    }
  }

  static async deleteCategory(catId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'categories', catId));
    } catch (err) {
      console.error('Failed to delete category from Firestore:', err);
    }
  }

  static async bulkSyncInitialCategories(initialCats: Category[]): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      if (snapshot.empty && initialCats.length > 0) {
        for (const c of initialCats) {
          await setDoc(doc(db, 'categories', c.id), { ...c, _syncedAt: serverTimestamp() });
        }
      }
    } catch (err) {
      console.warn('Firestore initial category sync note:', err);
    }
  }

  // -------------------------------------------------------------
  // 5. TAGS
  // -------------------------------------------------------------
  static subscribeTags(onUpdate: (tags: Tag[]) => void): Unsubscribe {
    const tagsRef = collection(db, 'tags');
    return onSnapshot(
      tagsRef,
      (snapshot) => {
        const items: Tag[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as Tag);
        });
        if (items.length > 0) {
          onUpdate(items);
        }
      },
      (error) => {
        console.warn('Firestore tags subscription note:', error);
      }
    );
  }

  static async saveTag(tag: Tag): Promise<void> {
    try {
      await setDoc(doc(db, 'tags', tag.id), { ...tag, _syncedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('Failed to save tag to Firestore:', err);
    }
  }

  static async deleteTag(tagId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tags', tagId));
    } catch (err) {
      console.error('Failed to delete tag from Firestore:', err);
    }
  }

  static async bulkSyncInitialTags(initialTags: Tag[]): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'tags'));
      if (snapshot.empty && initialTags.length > 0) {
        for (const t of initialTags) {
          await setDoc(doc(db, 'tags', t.id), { ...t, _syncedAt: serverTimestamp() });
        }
      }
    } catch (err) {
      console.warn('Firestore initial tags sync note:', err);
    }
  }

  // -------------------------------------------------------------
  // 6. MENUS (Header & Footer Navigation)
  // -------------------------------------------------------------
  static subscribeMenus(onUpdate: (menus: Menu[]) => void): Unsubscribe {
    const ref = collection(db, 'menus');
    return onSnapshot(
      ref,
      (snapshot) => {
        const items: Menu[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as Menu);
        });
        if (items.length > 0) {
          onUpdate(items);
        }
      },
      (error) => {
        console.warn('Firestore menus subscription note:', error);
      }
    );
  }

  static async saveMenu(menu: Menu): Promise<void> {
    try {
      await setDoc(doc(db, 'menus', menu.id), { ...menu, _syncedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('Failed to save menu to Firestore:', err);
    }
  }

  static async bulkSyncInitialMenus(initialMenus: Menu[]): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'menus'));
      if (snapshot.empty && initialMenus.length > 0) {
        for (const m of initialMenus) {
          await setDoc(doc(db, 'menus', m.id), { ...m, _syncedAt: serverTimestamp() });
        }
      }
    } catch (err) {
      console.warn('Firestore initial menus sync note:', err);
    }
  }

  // -------------------------------------------------------------
  // 7. SOCIAL MEDIA & REELS
  // -------------------------------------------------------------
  static subscribeSocialPosts(onUpdate: (posts: SocialMediaPost[]) => void): Unsubscribe {
    const ref = collection(db, 'social_posts');
    const q = query(ref, orderBy('createdAt', 'desc'), limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const items: SocialMediaPost[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as SocialMediaPost);
        });
        if (items.length > 0) {
          onUpdate(items);
        }
      },
      (error) => {
        console.warn('Firestore social_posts subscription note:', error);
      }
    );
  }

  static async saveSocialPost(post: SocialMediaPost): Promise<void> {
    try {
      await setDoc(doc(db, 'social_posts', post.id), { ...post, _syncedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('Failed to save social post to Firestore:', err);
    }
  }

  static async deleteSocialPost(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'social_posts', id));
    } catch (err) {
      console.error('Failed to delete social post from Firestore:', err);
    }
  }

  static async bulkSyncInitialSocialPosts(initialPosts: SocialMediaPost[]): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'social_posts'));
      if (snapshot.empty && initialPosts.length > 0) {
        for (const sp of initialPosts) {
          await setDoc(doc(db, 'social_posts', sp.id), { ...sp, _syncedAt: serverTimestamp() });
        }
      }
    } catch (err) {
      console.warn('Firestore initial social_posts sync note:', err);
    }
  }

  // -------------------------------------------------------------
  // 8. COMMENTS
  // -------------------------------------------------------------
  static subscribeComments(onUpdate: (comments: Comment[]) => void): Unsubscribe {
    const ref = collection(db, 'comments');
    return onSnapshot(
      ref,
      (snapshot) => {
        const items: Comment[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as Comment);
        });
        if (items.length > 0) {
          onUpdate(items);
        }
      },
      (error) => {
        console.warn('Firestore comments subscription note:', error);
      }
    );
  }

  static async saveComment(comment: Comment): Promise<void> {
    try {
      await setDoc(doc(db, 'comments', comment.id), { ...comment, _syncedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('Failed to save comment to Firestore:', err);
    }
  }

  static async deleteComment(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      console.error('Failed to delete comment from Firestore:', err);
    }
  }

  static async bulkSyncInitialComments(initialComments: Comment[]): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'comments'));
      if (snapshot.empty && initialComments.length > 0) {
        for (const c of initialComments) {
          await setDoc(doc(db, 'comments', c.id), { ...c, _syncedAt: serverTimestamp() });
        }
      }
    } catch (err) {
      console.warn('Firestore initial comments sync note:', err);
    }
  }

  // -------------------------------------------------------------
  // 9. ADS & AD UNITS
  // -------------------------------------------------------------
  static subscribeAds(onUpdate: (ads: AdUnit[]) => void): Unsubscribe {
    const ref = collection(db, 'ads');
    return onSnapshot(
      ref,
      (snapshot) => {
        const items: AdUnit[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as AdUnit);
        });
        if (items.length > 0) {
          onUpdate(items);
        }
      },
      (error) => {
        console.warn('Firestore ads subscription note:', error);
      }
    );
  }

  static async saveAd(ad: AdUnit): Promise<void> {
    try {
      await setDoc(doc(db, 'ads', ad.id), { ...ad, _syncedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('Failed to save ad to Firestore:', err);
    }
  }

  static async deleteAd(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'ads', id));
    } catch (err) {
      console.error('Failed to delete ad from Firestore:', err);
    }
  }

  static async bulkSyncInitialAds(initialAds: AdUnit[]): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'ads'));
      if (snapshot.empty && initialAds.length > 0) {
        for (const a of initialAds) {
          await setDoc(doc(db, 'ads', a.id), { ...a, _syncedAt: serverTimestamp() });
        }
      }
    } catch (err) {
      console.warn('Firestore initial ads sync note:', err);
    }
  }

  // -------------------------------------------------------------
  // 10. BREAKING NEWS TICKER
  // -------------------------------------------------------------
  static subscribeTickers(onUpdate: (tickers: BreakingTickerItem[]) => void): Unsubscribe {
    const tickersRef = collection(db, 'tickers');
    return onSnapshot(
      tickersRef,
      (snapshot) => {
        const tickers: BreakingTickerItem[] = [];
        snapshot.forEach((docSnap) => {
          tickers.push({ ...docSnap.data(), id: docSnap.id } as BreakingTickerItem);
        });
        if (tickers.length > 0) {
          onUpdate(tickers);
        }
      },
      (error) => {
        console.error('Error subscribing to tickers:', error);
      }
    );
  }

  static async saveTicker(ticker: BreakingTickerItem): Promise<void> {
    await setDoc(doc(db, 'tickers', ticker.id), { ...ticker, _syncedAt: serverTimestamp() }, { merge: true });
  }

  static async deleteTicker(id: string): Promise<void> {
    await deleteDoc(doc(db, 'tickers', id));
  }

  // -------------------------------------------------------------
  // 11. CITIZEN REPORTS
  // -------------------------------------------------------------
  static subscribeCitizenReports(onUpdate: (reports: CitizenNewsReport[]) => void): Unsubscribe {
    const ref = collection(db, 'citizen_reports');
    return onSnapshot(
      ref,
      (snapshot) => {
        const reports: CitizenNewsReport[] = [];
        snapshot.forEach((docSnap) => {
          reports.push({ ...docSnap.data(), id: docSnap.id } as CitizenNewsReport);
        });
        if (reports.length > 0) {
          onUpdate(reports);
        }
      },
      (error) => {
        console.error('Error subscribing to citizen reports:', error);
      }
    );
  }

  static async saveCitizenReport(report: CitizenNewsReport): Promise<void> {
    await setDoc(doc(db, 'citizen_reports', report.id), { ...report, _syncedAt: serverTimestamp() }, { merge: true });
  }

  // -------------------------------------------------------------
  // 12. MERCHANT AD BOOKINGS
  // -------------------------------------------------------------
  static subscribeMerchantBookings(onUpdate: (bookings: MerchantAdBooking[]) => void): Unsubscribe {
    const ref = collection(db, 'merchant_ads');
    return onSnapshot(
      ref,
      (snapshot) => {
        const items: MerchantAdBooking[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as MerchantAdBooking);
        });
        if (items.length > 0) {
          onUpdate(items);
        }
      },
      (error) => {
        console.warn('Firestore merchant ads subscription note:', error);
      }
    );
  }

  static async saveMerchantBooking(booking: MerchantAdBooking): Promise<void> {
    await setDoc(doc(db, 'merchant_ads', booking.id), { ...booking, _syncedAt: serverTimestamp() }, { merge: true });
  }

  // -------------------------------------------------------------
  // 13. GLOBAL SETTINGS (Site, Theme, SEO, AdSense, EPaper, WhatsApp)
  // -------------------------------------------------------------
  static async getSettingDoc<T>(settingId: string): Promise<T | null> {
    try {
      const snap = await getDoc(doc(db, 'settings', settingId));
      if (snap.exists()) {
        return snap.data() as T;
      }
      return null;
    } catch (err) {
      console.warn(`Failed to fetch setting ${settingId} from Firestore:`, err);
      return null;
    }
  }

  static async saveSettingDoc(settingId: string, data: any): Promise<void> {
    try {
      await setDoc(
        doc(db, 'settings', settingId),
        {
          ...data,
          _updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn(`Failed to save setting ${settingId} to Firestore:`, err);
    }
  }

  static subscribeSettingDoc<T>(settingId: string, onUpdate: (data: T) => void): Unsubscribe {
    return onSnapshot(
      doc(db, 'settings', settingId),
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as T);
        }
      },
      (err) => {
        console.warn(`Setting subscription error for ${settingId}:`, err);
      }
    );
  }

  // -------------------------------------------------------------
  // 14. USER PROFILES & DIRECTORY
  // -------------------------------------------------------------
  static subscribeUsers(onUpdate: (users: UserProfile[]) => void): Unsubscribe {
    const usersRef = collection(db, 'users');
    return onSnapshot(
      usersRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const users: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            users.push({ ...docSnap.data(), id: docSnap.id } as UserProfile);
          });
          onUpdate(users);
        }
      },
      (error) => {
        console.warn('Firestore users subscription notice:', error);
      }
    );
  }

  static async bulkSyncInitialUsers(initialUsers: UserProfile[]): Promise<void> {
    try {
      if (initialUsers.length > 0) {
        for (const u of initialUsers) {
          await setDoc(
            doc(db, 'users', u.id),
            {
              ...u,
              _syncedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      }
    } catch (err) {
      console.warn('Firestore initial user seeding note:', err);
    }
  }

  static async syncAllUsersToCloud(users: UserProfile[]): Promise<{ count: number; error?: string }> {
    try {
      let count = 0;
      for (const u of users) {
        await setDoc(
          doc(db, 'users', u.id),
          {
            ...u,
            _syncedAt: serverTimestamp(),
          },
          { merge: true }
        );
        count++;
      }
      return { count };
    } catch (err: any) {
      console.error('Failed to sync all users to Firestore:', err);
      return { count: 0, error: err?.message || 'Sync failed' };
    }
  }

  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  }

  static async saveUserProfile(user: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
    } catch (err) {
      console.warn('Failed to save user to Firestore:', err);
    }
  }

  static async deleteUserProfile(uid: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (err) {
      console.warn('Failed to delete user from Firestore:', err);
    }
  }

  static async forceSyncAllToCloud(payload: {
    posts: Post[];
    categories: Category[];
    tags: Tag[];
    pages: StaticPage[];
    users: UserProfile[];
    settings?: any;
  }): Promise<{ success: boolean; stats: { posts: number; categories: number; users: number; pages: number }; error?: string }> {
    try {
      let postsCount = 0;
      let categoriesCount = 0;
      let usersCount = 0;
      let pagesCount = 0;

      // 1. Sync Posts
      for (const p of payload.posts) {
        await setDoc(doc(db, 'posts', p.id), { ...p, _syncedAt: serverTimestamp() }, { merge: true });
        postsCount++;
      }

      // 2. Sync Categories
      for (const c of payload.categories) {
        await setDoc(doc(db, 'categories', c.id), { ...c, _syncedAt: serverTimestamp() }, { merge: true });
        categoriesCount++;
      }

      // 3. Sync Users
      for (const u of payload.users) {
        await setDoc(doc(db, 'users', u.id), { ...u, _syncedAt: serverTimestamp() }, { merge: true });
        usersCount++;
      }

      // 4. Sync Pages
      for (const page of payload.pages) {
        await setDoc(doc(db, 'pages', page.id), { ...page, _syncedAt: serverTimestamp() }, { merge: true });
        pagesCount++;
      }

      // 5. Sync Settings if provided
      if (payload.settings) {
        await setDoc(doc(db, 'settings', 'site_global_settings'), payload.settings, { merge: true });
      }

      return {
        success: true,
        stats: { posts: postsCount, categories: categoriesCount, users: usersCount, pages: pagesCount },
      };
    } catch (err: any) {
      console.error('Force Cloud Sync error:', err);
      return {
        success: false,
        stats: { posts: 0, categories: 0, users: 0, pages: 0 },
        error: err?.message || 'Sync failed. Please check Firestore Rules and Database status.',
      };
    }
  }
}
