import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES } from '../constants/categories.js';
import { idbAddHistory, idbGetHistory } from '../utils/idb.js';
import { buildNarrative } from '../utils/narrative.js';
import { CancelledError, createScanContext, finalizeDuplicates, walk } from '../utils/scan.js';
import { computeTrend } from '../utils/trend.js';
import { toEngineRules } from '../utils/rulesStore.js';

export function useScanner(grantedDrives, pushToast, rules, dismissedSets) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ files: 0, folders: 0, path: '' });
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [scanBaseline, setScanBaseline] = useState(null);
  const [pendingFreed, setPendingFreed] = useState(0);
  const [comparison, setComparison] = useState(null);
  const scanCtxRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setHistory(await idbGetHistory());
      } catch (e) {
        /* IndexedDB unavailable — history just won't persist */
      }
    })();
  }, []);

  const trend = useMemo(() => {
    if (history.length < 2) return null;
    return computeTrend(history[history.length - 1], history[history.length - 2]);
  }, [history]);

  const startScan = useCallback(async () => {
    if (grantedDrives.length === 0) return;
    const priorBaseline = scanBaseline;
    const priorPendingFreed = pendingFreed;

    setResults(null);
    setScanning(true);
    setProgress({ files: 0, folders: 0, path: '' });

    const ctx = createScanContext(
      (c, path) => setProgress({ files: c.totalFiles, folders: c.totalFolders, path: path || '' }),
      toEngineRules(rules),
      dismissedSets
    );
    scanCtxRef.current = ctx;

    try {
      for (const drive of grantedDrives) {
        if (ctx.cancelled) break;
        await walk(drive.handle, drive.name, null, ctx, 0);
      }
    } catch (e) {
      if (!(e instanceof CancelledError)) pushToast('Scan stopped early after an unexpected error.', 'error');
    }

    finalizeDuplicates(ctx);

    ctx.topFolders.sort((a, b) => b.size - a.size);
    ctx.topFiles.sort((a, b) => b.size - a.size);
    ctx.narrative = buildNarrative(ctx, grantedDrives.length);
    ctx.driveNames = grantedDrives.map((d) => d.name);
    setResults(ctx);
    setScanning(false);
    scanCtxRef.current = null;

    if (!ctx.cancelled) {
      const reclaimableSize = CATEGORIES.reduce((s, c) => s + ctx.categoryTotals[c.key].size, 0);
      const record = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        timestamp: Date.now(),
        totalSize: ctx.totalSize,
        totalFiles: ctx.totalFiles,
        totalFolders: ctx.totalFolders,
        reclaimableSize,
        driveNames: grantedDrives.map((d) => d.name),
      };
      setHistory((h) => [...h, record]);
      try {
        await idbAddHistory(record);
      } catch (e) {}

      if (priorBaseline != null && priorPendingFreed > 0) {
        setComparison({ before: priorBaseline, after: ctx.totalSize, expected: priorPendingFreed, actual: priorBaseline - ctx.totalSize });
      }
      setScanBaseline(ctx.totalSize);
      setPendingFreed(0);
    }
  }, [grantedDrives, pushToast, scanBaseline, pendingFreed, rules, dismissedSets]);

  const stopScan = useCallback(() => {
    if (scanCtxRef.current) scanCtxRef.current.cancelled = true;
  }, []);

  const registerFreed = useCallback((bytes) => {
    if (bytes > 0) {
      setPendingFreed((p) => p + bytes);
      setComparison(null);
    }
  }, []);

  return {
    scanning, progress, results, setResults,
    startScan, stopScan,
    history, showHistory, setShowHistory,
    trend, comparison, setComparison,
    pendingFreed, registerFreed,
  };
}
