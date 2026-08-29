import {
  GADCHIROLI_SPOTLIGHT_STORIES,
  GADCHIROLI_TALUKAS,
  SpotlightStoryItem,
  SpotlightTalukaItem,
} from '../data/gadchiroliSpotlightData';

export type SpotlightThemeStyle =
  | 'FIERY_RED'
  | 'FOREST_GREEN'
  | 'ROYAL_BLUE'
  | 'GOLDEN_OBSIDIAN';

export interface GadchiroliSpotlightSettings {
  isEnabled: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  highlightBadge: string;
  themeStyle: SpotlightThemeStyle;
  showHelplineDesk: boolean;
  showAudioButton: boolean;
  showWhatsAppShare: boolean;
  autoPlayAudio: boolean;
}

const STORAGE_KEY_STORIES = 'infonews_gadchiroli_spotlight_stories_v3';
const STORAGE_KEY_TALUKAS = 'infonews_gadchiroli_spotlight_talukas_v3';
const STORAGE_KEY_SETTINGS = 'infonews_gadchiroli_spotlight_settings_v3';

export const DEFAULT_SPOTLIGHT_SETTINGS: GadchiroliSpotlightSettings = {
  isEnabled: true,
  sectionTitle: '🚩 गडचिरोली जिल्हा विशेष वार्ता',
  sectionSubtitle: '१२ तालुके थेट कव्हरेज • दुर्गम व ग्रामीण भागातील प्रत्येक तालुक्याचा थेट आवाज',
  highlightBadge: '🔴 Live Spotlight',
  themeStyle: 'FIERY_RED',
  showHelplineDesk: true,
  showAudioButton: true,
  showWhatsAppShare: true,
  autoPlayAudio: false,
};

export class GadchiroliSpotlightService {
  static getSettings(): GadchiroliSpotlightSettings {
    if (typeof window === 'undefined') return DEFAULT_SPOTLIGHT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) return { ...DEFAULT_SPOTLIGHT_SETTINGS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_SPOTLIGHT_SETTINGS;
  }

  static saveSettings(settings: GadchiroliSpotlightSettings): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('infonews:gadchiroli-spotlight-updated'));
    } catch {}
  }

  static getTalukas(): SpotlightTalukaItem[] {
    if (typeof window === 'undefined') return GADCHIROLI_TALUKAS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TALUKAS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return GADCHIROLI_TALUKAS;
  }

  static saveTalukas(talukas: SpotlightTalukaItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_TALUKAS, JSON.stringify(talukas));
      window.dispatchEvent(new CustomEvent('infonews:gadchiroli-spotlight-updated'));
    } catch {}
  }

  static updateTaluka(taluka: SpotlightTalukaItem): void {
    const list = this.getTalukas();
    const idx = list.findIndex((t) => t.id === taluka.id);
    if (idx !== -1) {
      list[idx] = taluka;
    } else {
      list.push(taluka);
    }
    this.saveTalukas(list);
  }

  static addTaluka(taluka: SpotlightTalukaItem): void {
    const list = this.getTalukas();
    list.push(taluka);
    this.saveTalukas(list);
  }

  static deleteTaluka(id: string): void {
    const list = this.getTalukas().filter((t) => t.id !== id);
    this.saveTalukas(list);
  }

  static getStories(): SpotlightStoryItem[] {
    if (typeof window === 'undefined') return GADCHIROLI_SPOTLIGHT_STORIES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_STORIES);
      if (stored) return JSON.parse(stored);
    } catch {}
    return GADCHIROLI_SPOTLIGHT_STORIES;
  }

  static saveStories(stories: SpotlightStoryItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(stories));
      window.dispatchEvent(new CustomEvent('infonews:gadchiroli-spotlight-updated'));
    } catch {}
  }

  static updateStory(story: SpotlightStoryItem): void {
    const current = this.getStories();
    const idx = current.findIndex((s) => s.id === story.id || s.slug === story.slug);
    if (idx !== -1) {
      current[idx] = story;
    } else {
      current.unshift(story);
    }
    this.saveStories(current);
  }

  static addStory(story: SpotlightStoryItem): void {
    const current = this.getStories();
    current.unshift(story);
    this.saveStories(current);
  }

  static deleteStory(storyId: string): void {
    const current = this.getStories();
    const updated = current.filter((s) => s.id !== storyId);
    this.saveStories(updated);
  }

  static resetToDefault(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY_STORIES);
      localStorage.removeItem(STORAGE_KEY_TALUKAS);
      localStorage.removeItem(STORAGE_KEY_SETTINGS);
      window.dispatchEvent(new CustomEvent('infonews:gadchiroli-spotlight-updated'));
    } catch {}
  }
}
