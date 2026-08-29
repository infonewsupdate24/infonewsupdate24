export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'infonews_theme_mode';

export class ThemeService {
  static getTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      // System preference check
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {}
    return 'light';
  }

  static applyThemeToDOM(theme: ThemeMode): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }

  static setTheme(theme: ThemeMode): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      this.applyThemeToDOM(theme);
      // Asynchronously dispatch event so it doesn't trigger setState in the middle of another component's render
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('infonews:theme-changed', { detail: { theme } }));
      }, 0);
    } catch {}
  }

  static toggleTheme(): ThemeMode {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  static initTheme(): ThemeMode {
    const theme = this.getTheme();
    this.applyThemeToDOM(theme);
    return theme;
  }
}

