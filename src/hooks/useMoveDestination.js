import { useCallback, useEffect, useState } from 'react';
import { idbClearMoveDestination, idbGetMoveDestination, idbSetMoveDestination } from '../utils/idb.js';

export function useMoveDestination() {
  const [destination, setDestination] = useState(null); // { name, handle, status } | null

  useEffect(() => {
    (async () => {
      try {
        const record = await idbGetMoveDestination();
        if (!record) return;
        try {
          const status = await record.handle.queryPermission({ mode: 'readwrite' });
          setDestination({ name: record.name, handle: record.handle, status });
        } catch (e) {
          setDestination({ name: record.name, handle: record.handle, status: 'denied' });
        }
      } catch (e) {
        /* IndexedDB unavailable — destination just won't persist */
      }
    })();
  }, []);

  const pickDestination = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setDestination({ name: handle.name, handle, status: 'granted' });
      try {
        await idbSetMoveDestination(handle, handle.name);
      } catch (e) {}
      return handle;
    } catch (e) {
      return null; // user cancelled the picker
    }
  }, []);

  const reconfirmDestination = useCallback(async () => {
    if (!destination) return;
    try {
      const status = await destination.handle.requestPermission({ mode: 'readwrite' });
      setDestination((d) => (d ? { ...d, status } : d));
    } catch (e) {
      setDestination((d) => (d ? { ...d, status: 'denied' } : d));
    }
  }, [destination]);

  const clearDestination = useCallback(async () => {
    setDestination(null);
    try {
      await idbClearMoveDestination();
    } catch (e) {}
  }, []);

  return { destination, pickDestination, reconfirmDestination, clearDestination };
}
