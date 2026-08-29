import { CricketMatchScore, APMCMandiRate } from '../types';
import {
  SEED_CRICKET_MATCHES,
  SEED_MANDI_RATES,
} from '../data/cricketAndMandiSeedData';

export class LiveScoreAndMandiService {
  private static CRICKET_KEY = 'infonews_cricket_matches_v2';
  private static MANDI_KEY = 'infonews_mandi_rates_v2';
  private static CRICKET_BAR_ENABLED_KEY = 'infonews_cricket_bar_enabled';

  public static isCricketBarEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    const val = localStorage.getItem(this.CRICKET_BAR_ENABLED_KEY);
    return val === null ? true : val === 'true';
  }

  public static setCricketBarEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.CRICKET_BAR_ENABLED_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('infonews:cricket-bar-toggle', { detail: enabled }));
  }

  public static getMatches(): CricketMatchScore[] {
    try {
      if (typeof window === 'undefined') return SEED_CRICKET_MATCHES;
      const stored = localStorage.getItem(this.CRICKET_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return SEED_CRICKET_MATCHES;
  }

  public static updateMatch(id: string, updates: Partial<CricketMatchScore>): CricketMatchScore[] {
    const matches = this.getMatches();
    const updated = matches.map((m) => (m.id === id ? { ...m, ...updates } : m));
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.CRICKET_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('infonews:cricket-score-update', { detail: updated }));
      }
    } catch {}
    return updated;
  }

  public static resetToUpcomingMatch(): CricketMatchScore[] {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.CRICKET_KEY, JSON.stringify(SEED_CRICKET_MATCHES));
        window.dispatchEvent(new CustomEvent('infonews:cricket-score-update', { detail: SEED_CRICKET_MATCHES }));
      }
    } catch {}
    return SEED_CRICKET_MATCHES;
  }

  // =========================================================================
  // APMC MANDI RATES (OFFICIAL DAILY BENCHMARK DATA)
  // =========================================================================

  public static getMandiRates(): APMCMandiRate[] {
    try {
      if (typeof window === 'undefined') return SEED_MANDI_RATES;
      const stored = localStorage.getItem(this.MANDI_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return SEED_MANDI_RATES;
  }

  public static updateMandiRate(id: string, updates: Partial<APMCMandiRate>): APMCMandiRate[] {
    const rates = this.getMandiRates();
    const updated = rates.map((r) => (r.id === id ? { ...r, ...updates } : r));
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.MANDI_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('infonews:mandi-rate-update', { detail: updated }));
      }
    } catch {}
    return updated;
  }

  public static resetToOfficialDailyRates(): APMCMandiRate[] {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.MANDI_KEY, JSON.stringify(SEED_MANDI_RATES));
        window.dispatchEvent(new CustomEvent('infonews:mandi-rate-update', { detail: SEED_MANDI_RATES }));
      }
    } catch {}
    return SEED_MANDI_RATES;
  }

  public static addMandiRate(rate: Omit<APMCMandiRate, 'id'>): APMCMandiRate[] {
    const rates = this.getMandiRates();
    const newRate: APMCMandiRate = {
      ...rate,
      id: `rate-${Date.now()}`,
    };
    const updated = [newRate, ...rates];
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.MANDI_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('infonews:mandi-rate-update', { detail: updated }));
      }
    } catch {}
    return updated;
  }

  public static deleteMandiRate(id: string): APMCMandiRate[] {
    const rates = this.getMandiRates();
    const updated = rates.filter((r) => r.id !== id);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.MANDI_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('infonews:mandi-rate-update', { detail: updated }));
      }
    } catch {}
    return updated;
  }
}
