import { useState } from 'react';
import { OTHER_TYPE, TYPE_META } from '../constants/fileTypes.js';
import { formatBytes } from '../utils/format.js';
import Bar from './Bar.jsx';

export default function TypeChart({ typeTotals }) {
  const rows = [...TYPE_META, OTHER_TYPE].map((t) => ({ ...t, ...typeTotals[t.key] }));
  const totalSize = rows.reduce((s, r) => s + r.size, 0);
  const max = Math.max(...rows.map((r) => r.size), 1);
  const [hover, setHover] = useState(null);

  if (totalSize === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        No files to break down yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows
        .filter((r) => r.count > 0)
        .map((r, idx) => (
          <div key={r.key} className="relative" onMouseEnter={() => setHover(idx)} onMouseLeave={() => setHover(null)}>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                <span className="truncate" style={{ color: 'var(--text-primary)' }}>
                  {r.label}
                </span>
              </div>
              <span className="tabular shrink-0 ml-2" style={{ color: 'var(--text-secondary)' }}>
                {formatBytes(r.size)} · {r.count.toLocaleString()} file{r.count === 1 ? '' : 's'}
              </span>
            </div>
            <Bar value={r.size} max={max} color={r.color} />
            {hover === idx && (
              <div className="tooltip -top-7 left-0">{((r.size / totalSize) * 100).toFixed(1)}% of scanned space</div>
            )}
          </div>
        ))}
    </div>
  );
}
