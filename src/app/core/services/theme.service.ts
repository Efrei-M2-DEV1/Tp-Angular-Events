import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storageKey = 'theme';
  private current: Theme = 'light';

  constructor() {
    const saved = (localStorage.getItem(this.storageKey) as Theme) || null;
    if (saved === 'dark' || saved === 'light') {
      this.setTheme(saved);
    } else {
      // Try system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  get theme(): Theme {
    return this.current;
  }

  isDark(): boolean {
    return this.current === 'dark';
  }

  toggle(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.current = theme;
    localStorage.setItem(this.storageKey, theme);
    const root = document.documentElement; // <html>
    root.setAttribute('data-theme', theme);
  }
}
