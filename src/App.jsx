import { useCallback, useMemo, useState } from 'react';
import { formatBytes } from './utils/format.js';
import { computeTypeTotals } from './utils/fileTypes.js';
import { useTheme } from './hooks/useTheme.js';
import { useToasts } from './hooks/useToasts.js';
import { useDrives } from './hooks/useDrives.js';
import { useScanner } from './hooks/useScanner.js';
import { useCleanup } from './hooks/useCleanup.js';
import { useRulesConfig } from './hooks/useRulesConfig.js';
import { useDismissed } from './hooks/useDismissed.js';
import { useMoveDestination } from './hooks/useMoveDestination.js';
import { MAX_FLAGGED } from './constants/rules.js';

import Header from './components/Header.jsx';
import UnsupportedScreen from './components/UnsupportedScreen.jsx';
import DrivesCard from './components/DrivesCard.jsx';
import ComparisonCard from './components/ComparisonCard.jsx';
import TrendBanner from './components/TrendBanner.jsx';
import StatTiles from './components/StatTiles.jsx';
import ExportButtons from './components/ExportButtons.jsx';
import TreemapView from './components/TreemapView.jsx';
import SummaryCard from './components/SummaryCard.jsx';
import RankedFolders from './components/RankedFolders.jsx';
import SearchPanel from './components/SearchPanel.jsx';
import CleanupSection from './components/CleanupSection.jsx';
import DismissedPanel from './components/DismissedPanel.jsx';
import ScanHistoryPanel from './components/ScanHistoryPanel.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import MoveModal from './components/MoveModal.jsx';
import ToastStack from './components/ToastStack.jsx';
import RulesModal from './components/RulesModal.jsx';

export default function App() {
  const [theme, setTheme] = useTheme();
  const { toasts, pushToast } = useToasts();
  const { supported, drives, grantedDrives, pickerError, addDrive, continueDrive, forgetDrive } = useDrives(pushToast);
  const rulesConfig = useRulesConfig();
  const dismissed = useDismissed(pushToast);
  const moveDestination = useMoveDestination();
  const scanner = useScanner(grantedDrives, pushToast, rulesConfig.rules, dismissed.dismissedSets);
  const cleanup = useCleanup({
    results: scanner.results,
    setResults: scanner.setResults,
    pushToast,
    registerFreed: scanner.registerFreed,
  });
  const [summaryMode, setSummaryMode] = useState('quick');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [moveItemTarget, setMoveItemTarget] = useState(null);

  const handleScan = useCallback(() => {
    cleanup.clearSelection();
    scanner.startScan();
  }, [cleanup, scanner]);

  // Dismissing a suggestion also pulls it out of the currently displayed
  // results immediately, rather than waiting for the next scan.
  const handleDismissPath = useCallback(
    (item) => {
      dismissed.dismissPath(item);
      scanner.setResults((r) => {
        if (!r) return r;
        const flagged = r.flagged.filter((f) => f.id !== item.id);
        const categoryTotals = {
          ...r.categoryTotals,
          [item.category]: { size: r.categoryTotals[item.category].size - item.size, count: r.categoryTotals[item.category].count - 1 },
        };
        return { ...r, flagged, categoryTotals };
      });
    },
    [dismissed, scanner]
  );

  const handleDismissName = useCallback(
    (item) => {
      dismissed.dismissName(item);
      const lower = item.name.toLowerCase();
      scanner.setResults((r) => {
        if (!r) return r;
        const toRemove = r.flagged.filter((f) => f.name.toLowerCase() === lower);
        if (toRemove.length === 0) return r;
        const categoryTotals = { ...r.categoryTotals };
        for (const it of toRemove) {
          categoryTotals[it.category] = {
            size: Math.max(0, categoryTotals[it.category].size - it.size),
            count: Math.max(0, categoryTotals[it.category].count - 1),
          };
        }
        return { ...r, flagged: r.flagged.filter((f) => f.name.toLowerCase() !== lower), categoryTotals };
      });
    },
    [dismissed, scanner]
  );

  const typeTotals = useMemo(() => (scanner.results ? computeTypeTotals(scanner.results.extStats) : null), [scanner.results]);

  if (!supported) return <UnsupportedScreen />;

  const { results } = scanner;

  return (
    <div className="min-h-screen max-w-3xl mx-auto p-5 sm:p-8">
      <Header theme={theme} onThemeChange={setTheme} onOpenRules={() => setRulesOpen(true)} onStartScan={addDrive} />

      <DrivesCard
        drives={drives}
        onContinue={continueDrive}
        onForget={forgetDrive}
        pickerError={pickerError}
        onAddDrive={addDrive}
        grantedCount={grantedDrives.length}
        scanning={scanner.scanning}
        progress={scanner.progress}
        onScan={handleScan}
        onStop={scanner.stopScan}
        pendingFreed={scanner.pendingFreed}
      />

      {scanner.comparison && <ComparisonCard comparison={scanner.comparison} onDismiss={() => scanner.setComparison(null)} />}
      {scanner.trend && <TrendBanner trend={scanner.trend} />}

      {results && (
        <>
          {results.truncated && (
            <div className="card p-4 mb-6 text-sm" style={{ borderColor: 'var(--status-warning)', color: 'var(--text-secondary)' }}>
              This is a very large scan — showing the first {MAX_FLAGGED.toLocaleString()} flagged items. Scan a subfolder for full detail on the rest.
            </div>
          )}
          {results.excludedCount > 0 && (
            <div className="card p-4 mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Skipped {results.excludedCount} excluded folder{results.excludedCount === 1 ? '' : 's'} entirely (not sized or scanned) — manage the list in Rules.
            </div>
          )}

          <StatTiles results={results} reclaimableSize={cleanup.totalFlaggedSize} />

          <ExportButtons results={results} driveNames={results.driveNames} typeTotals={typeTotals} />

          <section className="card p-5 sm:p-6 mb-6">
            <h3 className="font-semibold mb-3 text-sm">Disk map</h3>
            <TreemapView results={results} />
          </section>

          <SummaryCard
            summaryMode={summaryMode}
            onModeChange={setSummaryMode}
            categoryTotals={results.categoryTotals}
            totalFlaggedSize={cleanup.totalFlaggedSize}
            typeTotals={typeTotals}
            narrative={results.narrative}
          />

          <RankedFolders topFolders={results.topFolders} topFiles={results.topFiles} />

          <SearchPanel results={results} />

          <CleanupSection
            flaggedFiltered={cleanup.flaggedFiltered}
            categoryFilter={cleanup.categoryFilter}
            onCategoryFilterChange={cleanup.setCategoryFilter}
            selected={cleanup.selected}
            onToggleSelected={cleanup.toggleSelected}
            onSelectAll={cleanup.selectAll}
            onDeleteSelectedClick={() => cleanup.setConfirmBulk(true)}
            onDeleteItemClick={(item) => cleanup.setConfirmItem(item)}
            onDismissPath={handleDismissPath}
            onDismissName={handleDismissName}
            onMoveClick={(item) => setMoveItemTarget(item)}
          />

          <DismissedPanel dismissed={dismissed.dismissed} onRestore={dismissed.restoreDismissed} />

          <ScanHistoryPanel history={scanner.history} showHistory={scanner.showHistory} onToggle={() => scanner.setShowHistory((s) => !s)} />
        </>
      )}

      {cleanup.confirmItem && (
        <ConfirmModal
          title={`Delete "${cleanup.confirmItem.name}"?`}
          body={`${cleanup.confirmItem.kind === 'directory' ? 'This folder and everything inside it' : 'This file'} will be permanently removed (${formatBytes(
            cleanup.confirmItem.size
          )}). This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => cleanup.deleteOne(cleanup.confirmItem)}
          onCancel={() => cleanup.setConfirmItem(null)}
        />
      )}
      {cleanup.confirmBulk && (
        <ConfirmModal
          title={`Delete ${cleanup.selected.size} items?`}
          body="These files and folders will be permanently removed. This cannot be undone."
          confirmLabel="Delete all"
          danger
          onConfirm={cleanup.deleteSelected}
          onCancel={() => cleanup.setConfirmBulk(false)}
        />
      )}

      {moveItemTarget && (
        <MoveModal
          item={moveItemTarget}
          destination={moveDestination.destination}
          onPickDestination={moveDestination.pickDestination}
          onReconfirmDestination={moveDestination.reconfirmDestination}
          onMove={cleanup.moveItem}
          onClose={() => setMoveItemTarget(null)}
        />
      )}

      {rulesOpen && (
        <RulesModal
          rules={rulesConfig.rules}
          onUpdate={rulesConfig.update}
          onAddToList={rulesConfig.addToList}
          onRemoveFromList={rulesConfig.removeFromList}
          onResetDefaults={rulesConfig.resetDefaults}
          dismissed={dismissed.dismissed}
          onRestoreDismissed={dismissed.restoreDismissed}
          onClose={() => setRulesOpen(false)}
        />
      )}

      <ToastStack toasts={toasts} />
    </div>
  );
}
