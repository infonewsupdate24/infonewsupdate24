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

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.notifyListeners(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
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
    return this.deferredPrompt !== null || this.isIOS();
  }

  public static async promptInstall(): Promise<'accepted' | 'dismissed' | 'manual_ios'> {
    if (this.isIOS()) {
      return 'manual_ios';
    }

    if (!this.deferredPrompt) {
      return 'dismissed';
    }

    try {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.notifyListeners(false);
      return choiceResult.outcome;
    } catch {
      return 'dismissed';
    }
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
