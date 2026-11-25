import { useCallback, useMemo, useState } from 'react';
import { CATEGORIES } from '../constants/categories.js';
import { formatBytes } from '../utils/format.js';
import { moveFileTo } from '../utils/moveFile.js';

export function useCleanup({ results, setResults, pushToast, registerFreed }) {
  const [selected, setSelected] = useState(new Set());
  const [confirmItem, setConfirmItem] = useState(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const clearSelection = useCallback(() => setSelected(new Set()), []);
  const toggleSelected = useCallback((id) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);
  const selectAll = useCallback((items, checked) => {
    setSelected((s) => {
      const n = new Set(s);
      items.forEach((item) => (checked ? n.add(item.id) : n.delete(item.id)));
      return n;
    });
  }, []);

  const deleteOne = useCallback(
    async (item) => {
      try {
        await item.parentHandle.removeEntry(item.name, { recursive: item.kind === 'directory' });
        setResults((r) => {
          if (!r) return r;
          const flagged = r.flagged.filter((f) => f.id !== item.id);
          const categoryTotals = {
            ...r.categoryTotals,
            [item.category]: { size: r.categoryTotals[item.category].size - item.size, count: r.categoryTotals[item.category].count - 1 },
          };
          return { ...r, flagged, categoryTotals, totalSize: r.totalSize - item.size };
        });
        setSelected((s) => {
          const n = new Set(s);
          n.delete(item.id);
          return n;
        });
        registerFreed(item.size);
        pushToast(`Deleted "${item.name}" — freed ${formatBytes(item.size)}.`, null);
      } catch (e) {
        pushToast(`Couldn't delete "${item.name}": ${e.message || e}`, 'error');
      }
      setConfirmItem(null);
    },
    [setResults, pushToast, registerFreed]
  );

  const deleteSelected = useCallback(async () => {
    if (!results) return;
    const items = results.flagged.filter((f) => selected.has(f.id));
    let freed = 0;
    let failed = 0;
    const deletedIds = new Set();
    for (const item of items) {
      try {
        await item.parentHandle.removeEntry(item.name, { recursive: item.kind === 'directory' });
        freed += item.size;
        deletedIds.add(item.id);
      } catch (e) {
        failed++;
      }
    }
    setResults((r) => {
      if (!r) return r;
      const categoryTotals = { ...r.categoryTotals };
      for (const it of items) {
        if (deletedIds.has(it.id) && categoryTotals[it.category]) {
          categoryTotals[it.category] = {
            size: Math.max(0, categoryTotals[it.category].size - it.size),
            count: Math.max(0, categoryTotals[it.category].count - 1),
          };
        }
      }
      return { ...r, flagged: r.flagged.filter((f) => !deletedIds.has(f.id)), categoryTotals, totalSize: r.totalSize - freed };
    });
    setSelected((s) => {
      const n = new Set(s);
      deletedIds.forEach((id) => n.delete(id));
      return n;
    });
    setConfirmBulk(false);
    registerFreed(freed);
    pushToast(
      failed > 0
        ? `Deleted ${items.length - failed} of ${items.length} items (freed ${formatBytes(freed)}); ${failed} failed.`
        : `Deleted ${items.length} items — freed ${formatBytes(freed)}.`,
      failed > 0 ? 'error' : null
    );
  }, [results, selected, setResults, pushToast, registerFreed]);

  // Moving is a gentler alternative to deleting: the item leaves its flagged
  // location, but since the destination could itself be inside a scanned drive,
  // we can't be sure total disk usage actually dropped — so unlike deleteOne,
  // this never touches totalSize or the re-scan "estimated freed" tracking.
  const moveItem = useCallback(
    async (item, destinationHandle, destinationName) => {
      try {
        const finalName = await moveFileTo(item, destinationHandle);
        setResults((r) => {
          if (!r) return r;
          const flagged = r.flagged.filter((f) => f.id !== item.id);
          const categoryTotals = {
            ...r.categoryTotals,
            [item.category]: { size: r.categoryTotals[item.category].size - item.size, count: r.categoryTotals[item.category].count - 1 },
          };
          return { ...r, flagged, categoryTotals };
        });
        setSelected((s) => {
          const n = new Set(s);
          n.delete(item.id);
          return n;
        });
        pushToast(`Moved "${item.name}" to "${destinationName}"${finalName !== item.name ? ` as "${finalName}"` : ''}.`, null);
        return true;
      } catch (e) {
        pushToast(`Couldn't move "${item.name}": ${e.message || e}`, 'error');
        return false;
      }
    },
    [setResults, pushToast]
  );

  const flaggedFiltered = useMemo(() => {
    if (!results) return [];
    return categoryFilter === 'all' ? results.flagged : results.flagged.filter((f) => f.category === categoryFilter);
  }, [results, categoryFilter]);

  const totalFlaggedSize = useMemo(() => {
    if (!results) return 0;
    return CATEGORIES.reduce((s, c) => s + results.categoryTotals[c.key].size, 0);
  }, [results]);

  return {
    selected, toggleSelected, selectAll, clearSelection,
    confirmItem, setConfirmItem,
    confirmBulk, setConfirmBulk,
    categoryFilter, setCategoryFilter,
    flaggedFiltered, totalFlaggedSize,
    deleteOne, deleteSelected, moveItem,
  };
}
