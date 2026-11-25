import { useEffect, useState } from 'react';
import { applyTheme, getStoredTheme } from '../utils/theme.js';

export function useTheme() {
  const [theme, setTheme] = useState(getStoredTheme);
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  return [theme, setTheme];
}
