import { useState } from 'react';
import DismissedList from './DismissedList.jsx';

function ChipListEditor({ label, help, placeholder, values, onAdd, onRemove }) {
  const [value, setValue] = useState('');
  const submit = (e) => {
    e.preventDefault();
    onAdd(value);
    setValue('');
  };
  return (
    <div className="mb-5">
      <p className="text-sm font-medium mb-1">{label}</p>
      {help && (
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
          {help}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((name) => (
          <span key={name} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md hairline border">
            {name}
            <button aria-label={`Remove ${name}`} style={{ color: 'var(--text-muted)' }} onClick={() => onRemove(name)}>
              ×
            </button>
          </span>
        ))}
        {values.length === 0 && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            None.
          </span>
        )}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          className="text-sm rounded-md px-2 py-1.5 hairline border bg-transparent flex-1"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className="px-3 py-1.5 rounded-md text-xs font-medium text-white shrink-0" style={{ background: 'var(--cat-1)' }}>
          Add
        </button>
      </form>
    </div>
  );
}

export default function RulesModal({ rules, onUpdate, onAddToList, onRemoveFromList, onResetDefaults, dismissed, onRestoreDismissed, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div className="card p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold">Cleanup rules</h3>
          <button className="text-sm" style={{ color: 'var(--text-muted)' }} onClick={onClose}>
            Close
          </button>
        </div>
        <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
          Changes apply the next time you scan.
        </p>

        <ChipListEditor
          label="Folder names treated as build/dependency junk"
          help="Scanned normally, then flagged as safe-to-delete."
          placeholder="e.g. .parcel-cache"
          values={rules.junkDirNames}
          onAdd={(name) => onAddToList('junkDirNames', name)}
          onRemove={(name) => onRemoveFromList('junkDirNames', name)}
        />

        <ChipListEditor
          label="Folders excluded from scanning"
          help="Skipped entirely — not opened, sized, or flagged. Use this to skip known-huge irrelevant folders, like a synced cloud folder or a mounted network drive, and speed up scans."
          placeholder="e.g. OneDrive"
          values={rules.excludedNames}
          onAdd={(name) => onAddToList('excludedNames', name)}
          onRemove={(name) => onRemoveFromList('excludedNames', name)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <label className="text-sm">
            <span className="block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Large media (MB)
            </span>
            <input
              type="number"
              min={1}
              className="w-full text-sm rounded-md px-2 py-1.5 hairline border bg-transparent"
              value={rules.largeMediaThresholdMB}
              onChange={(e) => onUpdate({ largeMediaThresholdMB: Math.max(1, Number(e.target.value) || 1) })}
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Installer age (days)
            </span>
            <input
              type="number"
              min={1}
              className="w-full text-sm rounded-md px-2 py-1.5 hairline border bg-transparent"
              value={rules.installerAgeDays}
              onChange={(e) => onUpdate({ installerAgeDays: Math.max(1, Number(e.target.value) || 1) })}
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Duplicate min size (MB)
            </span>
            <input
              type="number"
              min={0.01}
              step={0.01}
              className="w-full text-sm rounded-md px-2 py-1.5 hairline border bg-transparent"
              value={rules.dupMinSizeMB}
              onChange={(e) => onUpdate({ dupMinSizeMB: Math.max(0.01, Number(e.target.value) || 0.01) })}
            />
          </label>
        </div>

        <button className="text-xs mb-6" style={{ color: 'var(--text-muted)' }} onClick={onResetDefaults}>
          Reset to defaults
        </button>

        <div>
          <p className="text-sm font-medium mb-2">Dismissed suggestions ({dismissed.length})</p>
          <DismissedList dismissed={dismissed} onRestore={onRestoreDismissed} />
        </div>
      </div>
    </div>
  );
}
