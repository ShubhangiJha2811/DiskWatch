import { formatBytes } from '../utils/format.js';
import { useCountUp } from '../hooks/useCountUp.js';

function StatTile({ label, rawValue, format, accent }) {
  const animated = useCountUp(rawValue);
  return (
    <div className="card p-4 text-center">
      <p className="text-xl font-semibold tabular" style={accent ? { color: accent } : undefined}>
        {format(animated)}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  );
}

export default function StatTiles({ results, reclaimableSize }) {
  const tiles = [
    { label: 'Total scanned', rawValue: results.totalSize, format: formatBytes },
    { label: 'Reclaimable', rawValue: reclaimableSize, format: formatBytes, accent: 'var(--status-warning)' },
    { label: 'Files', rawValue: results.totalFiles, format: (v) => Math.round(v).toLocaleString() },
    { label: 'Folders', rawValue: results.totalFolders, format: (v) => Math.round(v).toLocaleString() },
  ];
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {tiles.map((t) => (
        <StatTile key={t.label} {...t} />
      ))}
    </section>
  );
}
