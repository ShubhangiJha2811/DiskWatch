import { useCallback, useEffect, useMemo, useState } from 'react';
import { idbAddDismissed, idbDeleteDismissed, idbGetDismissed } from '../utils/idb.js';

export function useDismissed(pushToast) {
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setDismissed(await idbGetDismissed());
      } catch (e) {
        /* IndexedDB unavailable — dismissals just won't persist */
      }
    })();
  }, []);

  const dismissPath = useCallback(
    async (item) => {
      const record = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), type: 'path', value: item.path, category: item.category, addedAt: Date.now() };
      setDismissed((d) => [...d, record]);
      try {
        await idbAddDismissed(record);
      } catch (e) {}
      pushToast(`Won't suggest "${item.name}" again.`, null);
    },
    [pushToast]
  );

  const dismissName = useCallback(
    async (item) => {
      const value = item.name.toLowerCase();
      const record = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), type: 'name', value, category: item.category, addedAt: Date.now() };
      setDismissed((d) => [...d, record]);
      try {
        await idbAddDismissed(record);
      } catch (e) {}
      pushToast(`Won't suggest anything named "${item.name}" again.`, null);
    },
    [pushToast]
  );

  const restoreDismissed = useCallback(async (id) => {
    setDismissed((d) => d.filter((r) => r.id !== id));
    try {
      await idbDeleteDismissed(id);
    } catch (e) {}
  }, []);

  const dismissedSets = useMemo(() => {
    const paths = new Set();
    const names = new Set();
    for (const r of dismissed) {
      if (r.type === 'path') paths.add(r.value);
      else if (r.type === 'name') names.add(r.value);
    }
    return { paths, names };
  }, [dismissed]);

  return { dismissed, dismissedSets, dismissPath, dismissName, restoreDismissed };
}
