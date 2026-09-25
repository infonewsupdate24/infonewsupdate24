import type { Post, Category, Menu } from '../types';
import type { HomepageSectionConfig } from './HomepageLayoutService';

export interface PublishedHomepage {
  version: number;
  generatedAt: number;
  posts: Post[];
  categories: Category[];
  menus: Menu[];
  sections: HomepageSectionConfig[];
}
let snapshot: PublishedHomepage | null = null;
try {
  const value = JSON.parse(document.getElementById('infonews-homepage')?.textContent || 'null');
  if (value?.version === 1 && Array.isArray(value.posts) && Array.isArray(value.sections)) snapshot = value;
} catch { /* Direct CMS routes can start without a public snapshot. */ }
export const getPublishedHomepage = () => snapshot;
export async function loadPublishedHomepage() {
  const response = await fetch('/api/homepage', { cache:'no-store', signal:AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Published homepage unavailable');
  const next = await response.json();
  if (next?.version !== 1 || !Array.isArray(next.posts) || !Array.isArray(next.sections)) throw new Error('Invalid homepage');
  snapshot = next;
  window.dispatchEvent(new CustomEvent('infonews:published-homepage', { detail:next }));
  return snapshot;
}
export async function refreshPublishedHomepage() {
  try {
    const { auth } = await import('./firebase');
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Login required');
    const response = await fetch('https://www.infonewsupdate24.com/api/homepage', { method:'POST', headers:{Authorization:`Bearer ${token}`}, signal:AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error('Homepage refresh failed');
    snapshot = await response.json();
    window.dispatchEvent(new CustomEvent('infonews:homepage-sync-status', {detail:true}));
    window.dispatchEvent(new CustomEvent('infonews:published-homepage', {detail:snapshot}));
  } catch (error) {
    // The Firestore save already succeeded. Do not make a create retry insert a
    // duplicate article just because the separate public cache is unavailable.
    console.warn('Saved content; homepage refresh pending:', error);
    window.dispatchEvent(new CustomEvent('infonews:homepage-sync-status', {detail:false}));
  }
}
