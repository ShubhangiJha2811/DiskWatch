import { useCallback, useState } from 'react';
import { defaultRules, getStoredRules, saveRules } from '../utils/rulesStore.js';

export function useRulesConfig() {
  const [rules, setRules] = useState(getStoredRules);

  const update = useCallback((partial) => {
    setRules((prev) => {
      const next = { ...prev, ...partial };
      saveRules(next);
      return next;
    });
  }, []);

  const addToList = useCallback((listKey, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setRules((prev) => {
      if (prev[listKey].some((n) => n.toLowerCase() === trimmed.toLowerCase())) return prev;
      const next = { ...prev, [listKey]: [...prev[listKey], trimmed] };
      saveRules(next);
      return next;
    });
  }, []);

  const removeFromList = useCallback((listKey, name) => {
    setRules((prev) => {
      const next = { ...prev, [listKey]: prev[listKey].filter((n) => n !== name) };
      saveRules(next);
      return next;
    });
  }, []);

  const resetDefaults = useCallback(() => {
    const next = defaultRules();
    saveRules(next);
    setRules(next);
  }, []);

  return { rules, update, addToList, removeFromList, resetDefaults };
}
