import { formatBytes } from '../utils/format.js';

export default function ComparisonCard({ comparison, onDismiss }) {
  const matched = comparison.actual >= comparison.expected * 0.9;
  return (
    <section className="card p-4 mb-6 flex items-start justify-between gap-3 text-sm" style={{ borderColor: matched ? 'var(--status-good)' : 'var(--status-warning)' }}>
      <div>
        <p className="font-medium mb-1">Re-scan confirmed</p>
        <p style={{ color: 'var(--text-secondary)' }}>
          Before: {formatBytes(comparison.before)} → After: {formatBytes(comparison.after)} — actually freed {formatBytes(Math.max(0, comparison.actual))} (estimated{' '}
          {formatBytes(comparison.expected)}).
        </p>
      </div>
      <button className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }} onClick={onDismiss}>
        Dismiss
      </button>
    </section>
  );
}
