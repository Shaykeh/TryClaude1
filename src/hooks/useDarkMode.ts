import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('quicknote-theme') as Theme) || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function apply() {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      root.classList.toggle('dark', isDark);

      // Update theme-color meta tag for status bar
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', isDark ? '#111827' : '#2563eb');
      }
    }

    apply();
    mediaQuery.addEventListener('change', apply);
    localStorage.setItem('quicknote-theme', theme);

    return () => mediaQuery.removeEventListener('change', apply);
  }, [theme]);

  return { theme, setTheme };
}
