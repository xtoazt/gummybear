import { useEffect, useState } from 'react';

const DEFAULT_THEME = 'monochrome';
const THEME_STORAGE_KEY = 'daisyui-theme';

export function useTheme() {
  // Initialize from localStorage or default - this runs immediately
  const getInitialTheme = () => {
    if (typeof window === 'undefined') return DEFAULT_THEME;
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved || DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  };

  const [currentTheme, setCurrentTheme] = useState<string>(getInitialTheme);

  useEffect(() => {
    // Sync with what was set in the inline script
    if (typeof document !== 'undefined') {
      const currentDataTheme = document.documentElement.getAttribute('data-theme');
      if (currentDataTheme) {
        setCurrentTheme(currentDataTheme);
      } else {
        // If somehow not set, set it now
        const themeToUse = getInitialTheme();
        document.documentElement.setAttribute('data-theme', themeToUse);
        setCurrentTheme(themeToUse);
      }
    }
  }, []);

  const changeTheme = (theme: string) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (e) {
        console.warn('Failed to save theme to localStorage:', e);
      }
      setCurrentTheme(theme);
    }
  };

  return { currentTheme, changeTheme };
}

