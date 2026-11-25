import { formatBytes, truncateMiddle } from '../utils/format.js';
import Bar from './Bar.jsx';

export default function RankedList({ items, emptyLabel }) {
  if (items.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {emptyLabel}
      </p>
    );
  }
  const max = Math.max(...items.map((i) => i.size), 1);
  return (
    <div className="space-y-2.5">
      {items.slice(0, 10).map((item, idx) => (
        <div key={idx}>
          <div className="flex items-center justify-between text-sm mb-1 gap-3">
            <span className="truncate" title={item.path} style={{ color: 'var(--text-primary)' }}>
              {truncateMiddle(item.path, 54)}
            </span>
            <span className="tabular shrink-0" style={{ color: 'var(--text-secondary)' }}>
              {formatBytes(item.size)}
            </span>
          </div>
          <Bar value={item.size} max={max} color="var(--seq-450)" />
        </div>
      ))}
    </div>
  );
}
