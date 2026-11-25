import { formatBytes } from '../utils/format.js';

export default function ScanHistoryPanel({ history, showHistory, onToggle }) {
  if (history.length === 0) return null;
  return (
    <section className="card p-5 sm:p-6 mt-6">
      <button className="flex items-center justify-between w-full text-sm font-semibold" onClick={onToggle}>
        <span>Scan history ({history.length})</span>
        <span style={{ color: 'var(--text-muted)' }}>{showHistory ? 'Hide' : 'Show'}</span>
      </button>

      {showHistory && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                <th className="font-normal pb-2 pr-3">Date</th>
                <th className="font-normal pb-2 pr-3">Total size</th>
                <th className="font-normal pb-2">Reclaimable</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--gridline)' }}>
              {[...history].reverse().map((h) => (
                <tr key={h.id}>
                  <td className="py-2 pr-3 tabular" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(h.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3 tabular">{formatBytes(h.totalSize)}</td>
                  <td className="py-2 tabular">{formatBytes(h.reclaimableSize)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
