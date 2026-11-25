import { useCallback, useEffect, useState } from 'react';
import { idbDelete, idbGetAll, idbPut } from '../utils/idb.js';

export function useDrives(pushToast) {
  const supported = typeof window !== 'undefined' && !!window.showDirectoryPicker;
  const [drives, setDrives] = useState([]);
  const [pickerError, setPickerError] = useState('');

  useEffect(() => {
    if (!supported) return;
    (async () => {
      try {
        const records = await idbGetAll();
        const withStatus = await Promise.all(
          records.map(async (r) => {
            try {
              const status = await r.handle.queryPermission({ mode: 'readwrite' });
              return { ...r, status };
            } catch (e) {
              return { ...r, status: 'denied' };
            }
          })
        );
        setDrives(withStatus);
      } catch (e) {
        /* IndexedDB unavailable — start fresh, in-memory only */
      }
    })();
  }, [supported]);

  const addDrive = useCallback(async () => {
    setPickerError('');
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      for (const d of drives) {
        try {
          if (await d.handle.isSameEntry(handle)) {
            pushToast(`"${d.name}" is already added.`, null);
            return;
          }
        } catch (e) {}
      }
      const record = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name: handle.name, handle, addedAt: Date.now() };
      setDrives((prev) => [...prev, { ...record, status: 'granted' }]);
      try {
        await idbPut(record);
      } catch (e) {
        pushToast("Couldn't remember this drive for next visit, but it's ready to scan now.", null);
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      setPickerError("Couldn't open the folder picker. If this page is embedded in a preview, open its link directly in a new browser tab and try again.");
    }
  }, [drives, pushToast]);

  const continueDrive = useCallback(async (drive) => {
    try {
      const status = await drive.handle.requestPermission({ mode: 'readwrite' });
      setDrives((prev) => prev.map((d) => (d.id === drive.id ? { ...d, status } : d)));
    } catch (e) {
      setDrives((prev) => prev.map((d) => (d.id === drive.id ? { ...d, status: 'denied' } : d)));
    }
  }, []);

  const forgetDrive = useCallback(async (drive) => {
    setDrives((prev) => prev.filter((d) => d.id !== drive.id));
    try {
      await idbDelete(drive.id);
    } catch (e) {}
  }, []);

  const grantedDrives = drives.filter((d) => d.status === 'granted');

  return { supported, drives, grantedDrives, pickerError, addDrive, continueDrive, forgetDrive };
}
