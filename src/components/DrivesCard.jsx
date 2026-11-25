import DriveRow from './DriveRow.jsx';
import ScanProgressRing from './ScanProgressRing.jsx';
import { formatBytes } from '../utils/format.js';

export default function DrivesCard({
  drives, onContinue, onForget, pickerError, onAddDrive,
  grantedCount, scanning, progress, onScan, onStop,
  pendingFreed,
}) {
  return (
    <section className="card p-5 sm:p-6 mb-6">
      <h2 className="font-semibold mb-3">Folders & drives</h2>

      {drives.length > 0 && (
        <div className="space-y-2 mb-4">
          {drives.map((d) => (
            <DriveRow key={d.id} drive={d} onContinue={onContinue} onForget={onForget} />
          ))}
        </div>
      )}

      {pickerError && (
        <p className="text-sm mb-3" style={{ color: 'var(--status-critical)' }}>
          {pickerError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--cat-1)' }} onClick={onAddDrive}>
          + Add a folder or drive
        </button>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Tip: browsers block picking an entire drive root (e.g. "C:") or system folders. Pick your user folder or specific folders instead — add
          several and DiskWatch combines them into one scan.
        </span>
        {!scanning && (
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: grantedCount ? 'var(--status-good)' : 'var(--gridline)', color: grantedCount ? 'white' : 'var(--text-muted)' }}
            disabled={grantedCount === 0}
            onClick={onScan}
          >
            Scan selected
          </button>
        )}
        {scanning && (
          <button className="px-4 py-2 rounded-lg text-sm font-medium hairline border" onClick={onStop}>
            Stop scan
          </button>
        )}
      </div>

      {scanning && (
        <div className="flex items-center gap-4 mt-4">
          <ScanProgressRing files={progress.files} folders={progress.folders} />
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p className="tabular">
              {progress.files.toLocaleString()} files, {progress.folders.toLocaleString()} folders scanned so far
            </p>
            {progress.path && (
              <p className="text-xs mt-1 truncate max-w-xs" style={{ color: 'var(--text-muted)' }} title={progress.path}>
                {progress.path}
              </p>
            )}
          </div>
        </div>
      )}

      {!scanning && pendingFreed > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--page-plane)' }}>
          <span>~{formatBytes(pendingFreed)} estimated freed by recent deletions — re-scan to confirm it actually landed on disk.</span>
          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-white shrink-0" style={{ background: 'var(--cat-1)' }} onClick={onScan}>
            Re-scan to confirm
          </button>
        </div>
      )}
    </section>
  );
}
