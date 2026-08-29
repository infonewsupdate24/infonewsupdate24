import { WebStory } from '../types';
import { SEED_WEB_STORIES } from '../data/webStoriesSeedData';

const STORAGE_KEY = 'infonews_web_stories_v1';

export class WebStoryService {
  public static getStories(): WebStory[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return SEED_WEB_STORIES;
  }

  public static getPublishedStories(): WebStory[] {
    return this.getStories().filter((s) => s.isPublished);
  }

  public static getStoryBySlug(slug: string): WebStory | undefined {
    return this.getStories().find((s) => s.slug === slug);
  }

  public static setStories(stories: WebStory[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
      window.dispatchEvent(
        new CustomEvent('infonews:web-stories-updated', { detail: stories })
      );
    } catch {}
  }

  public static createStory(
    data: Omit<WebStory, 'id' | 'viewsCount' | 'publishDate'>
  ): WebStory {
    const stories = this.getStories();
    const newStory: WebStory = {
      ...data,
      id: `ws-${Date.now()}`,
      viewsCount: 1,
      publishDate: new Date().toLocaleDateString('mr-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
    const updated = [newStory, ...stories];
    this.setStories(updated);
    return newStory;
  }

  public static updateStory(id: string, updates: Partial<WebStory>): WebStory[] {
    const stories = this.getStories();
    const updated = stories.map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.setStories(updated);
    return updated;
  }

  public static deleteStory(id: string): WebStory[] {
    const stories = this.getStories().filter((s) => s.id !== id);
    this.setStories(updatedStories(stories));
    return stories;
  }

  public static incrementViews(id: string): void {
    const stories = this.getStories();
    const updated = stories.map((s) =>
      s.id === id ? { ...s, viewsCount: s.viewsCount + 1 } : s
    );
    this.setStories(updated);
  }

  public static generateWhatsAppShareUrl(story: WebStory): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infonewsupdate24.com';
    const text = `📱 *Google Web Story (InfoNewsUpdate24)*\n\n✨ *${story.title}*\n\n👉 ही व्हिज्युअल वेब स्टोरी पाहण्यासाठी येथे टॅप करा:\n${origin}/?story=${story.slug}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }
}

function updatedStories(s: WebStory[]) {
  return s;
}
