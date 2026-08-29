export interface PWAStatus {
  isSupported: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  hasServiceWorker: boolean;
}

export class PWAService {
  private static deferredPrompt: any = null;
  private static listeners: Array<(canInstall: boolean) => void> = [];

  public static init(): void {
    if (typeof window === 'undefined') return;

    if ((window as any).__deferredPwaPrompt) {
      this.deferredPrompt = (window as any).__deferredPwaPrompt;
      this.notifyListeners(true);
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      (window as any).__deferredPwaPrompt = e;
      this.notifyListeners(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      (window as any).__deferredPwaPrompt = null;
      this.notifyListeners(false);
    });
  }

  public static isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }

  public static isAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    return /android/.test(window.navigator.userAgent.toLowerCase());
  }

  public static isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  public static canInstall(): boolean {
    return this.deferredPrompt !== null || (typeof window !== 'undefined' && (this.isIOS() || this.isAndroid()));
  }

  public static getDeferredPrompt(): any {
    return this.deferredPrompt || (typeof window !== 'undefined' ? (window as any).__deferredPwaPrompt : null);
  }

  public static async promptInstall(onFallbackGuide?: () => void): Promise<'accepted' | 'dismissed' | 'manual_guide'> {
    const prompt = this.getDeferredPrompt();

    if (prompt) {
      try {
        prompt.prompt();
        const choiceResult = await prompt.userChoice;
        this.deferredPrompt = null;
        if (typeof window !== 'undefined') (window as any).__deferredPwaPrompt = null;
        this.notifyListeners(false);
        return choiceResult.outcome;
      } catch {
        if (onFallbackGuide) onFallbackGuide();
        return 'manual_guide';
      }
    }

    // If native prompt is not available, show visual step-by-step install modal
    if (onFallbackGuide) {
      onFallbackGuide();
      return 'manual_guide';
    }

    return 'dismissed';
  }

  public static subscribe(listener: (canInstall: boolean) => void): () => void {
    this.listeners.push(listener);
    listener(this.canInstall());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners(canInstall: boolean): void {
    this.listeners.forEach((listener) => listener(canInstall));
  }
}
