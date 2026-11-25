import { useState } from 'react';
import { CATEGORIES, CONFIDENCE_META } from '../constants/categories.js';
import { formatBytes } from '../utils/format.js';
import Bar from './Bar.jsx';
import CategoryIcon from './CategoryIcon.jsx';

export default function CategoryChart({ categoryTotals, totalFlaggedSize }) {
  const rows = CATEGORIES.map((c) => ({ ...c, ...categoryTotals[c.key] }));
  const max = Math.max(...rows.map((r) => r.size), 1);
  const [hover, setHover] = useState(null);

  return (
    <div className="space-y-3">
      {rows.map((r, idx) => (
        <div key={r.key} className="relative" onMouseEnter={() => setHover(idx)} onMouseLeave={() => setHover(null)}>
          <div className="flex items-center justify-between text-sm mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <CategoryIcon category={r.key} size={15} className="shrink-0" style={{ color: r.color }} />
              <span className="truncate" style={{ color: 'var(--text-primary)' }}>
                {r.label}
              </span>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0"
                style={{ color: CONFIDENCE_META[r.confidence].color, background: 'var(--page-plane)' }}
              >
                {CONFIDENCE_META[r.confidence].label}
              </span>
            </div>
            <span className="tabular shrink-0 ml-2" style={{ color: 'var(--text-secondary)' }}>
              {r.count > 0 ? `${formatBytes(r.size)} · ${r.count.toLocaleString()} item${r.count === 1 ? '' : 's'}` : '—'}
            </span>
          </div>
          <Bar value={r.size} max={max} color={r.color} />
          {hover === idx && r.count > 0 && (
            <div className="tooltip -top-7 left-0">{totalFlaggedSize > 0 ? ((r.size / totalFlaggedSize) * 100).toFixed(1) : '0'}% of flagged space</div>
          )}
        </div>
      ))}
    </div>
  );
}
