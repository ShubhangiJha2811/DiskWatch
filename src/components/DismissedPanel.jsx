import { useState } from 'react';
import DismissedList from './DismissedList.jsx';

// Surfaced right next to the cleanup list (not just buried in Rules) so
// dismissing something is easy to notice and undo without hunting for it.
export default function DismissedPanel({ dismissed, onRestore }) {
  const [open, setOpen] = useState(false);
  if (dismissed.length === 0) return null;

  return (
    <section className="card p-5 sm:p-6 mt-6">
      <button className="flex items-center justify-between w-full text-sm font-semibold" onClick={() => setOpen((o) => !o)}>
        <span>Dismissed suggestions ({dismissed.length})</span>
        <span style={{ color: 'var(--text-muted)' }}>{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="mt-4">
          <DismissedList dismissed={dismissed} onRestore={onRestore} />
        </div>
      )}
    </section>
  );
}
