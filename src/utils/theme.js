export const THEME_KEY = 'diskwatch-theme';

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'system';
  } catch (e) {
    return 'system';
  }
}

export function applyTheme(theme) {
  try {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem(THEME_KEY);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(THEME_KEY, theme);
    }
  } catch (e) {
    /* localStorage unavailable — theme just won't persist across visits */
  }
}
