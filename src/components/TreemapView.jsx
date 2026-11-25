import { useMemo, useRef, useState } from 'react';
import { computeTreemap } from '../utils/treemap.js';
import { buildFolderTreemapData } from '../utils/folderTreemap.js';
import { formatBytes, truncateMiddle } from '../utils/format.js';
import CategoryIcon from './CategoryIcon.jsx';

const VW = 1000;
const VH = 460;

const LEGEND = [
  { label: 'Build & dependency junk', color: 'var(--cat-1)' },
  { label: 'Other folders', color: 'var(--baseline)' },
  { label: 'Everything else', color: 'var(--gridline)' },
];

export default function TreemapView({ results }) {
  const containerRef = useRef(null);
  const [hover, setHover] = useState(null); // { cell, x, y }

  const cells = useMemo(() => buildFolderTreemapData(results), [results]);
  const layout = useMemo(() => computeTreemap(cells, VW, VH), [cells]);

  // Shown so the color split can be checked against real numbers rather than
  // taken on faith — a treemap that goes "mostly one color" should be
  // verifiable, not just trusted.
  const totals = useMemo(() => {
    let junk = 0, other = 0, rest = 0;
    for (const c of cells) {
      if (c.other) rest += c.size;
      else if (c.flagged) junk += c.size;
      else other += c.size;
    }
    return { junk, other, rest, total: junk + other + rest };
  }, [cells]);

  if (layout.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Not enough folder data to map yet.
      </p>
    );
  }

  const handleMove = (cell) => (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    setHover({ cell, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
      {totals.total > 0 && (
        <p className="text-xs mb-3 tabular" style={{ color: 'var(--text-muted)' }}>
          {formatBytes(totals.junk)} junk ({((totals.junk / totals.total) * 100).toFixed(0)}%) · {formatBytes(totals.other)} other folders (
          {((totals.other / totals.total) * 100).toFixed(0)}%) · {formatBytes(totals.rest)} everything else ({((totals.rest / totals.total) * 100).toFixed(0)}%)
        </p>
      )}

      <div ref={containerRef} className="relative w-full" style={{ aspectRatio: `${VW} / ${VH}` }} onMouseLeave={() => setHover(null)}>
        {layout.map((cell) => {
          const wPct = (cell.w / VW) * 100;
          const hPct = (cell.h / VH) * 100;
          const showLabel = wPct >= 8 && hPct >= 11;
          return (
            <div
              key={cell.key}
              className="absolute overflow-hidden flex flex-col justify-end p-1.5"
              style={{
                left: `${(cell.x / VW) * 100}%`,
                top: `${(cell.y / VH) * 100}%`,
                width: `${wPct}%`,
                height: `${hPct}%`,
                background: cell.color,
                border: '2px solid var(--surface-1)',
                boxSizing: 'border-box',
              }}
              onMouseMove={handleMove(cell)}
              onMouseEnter={handleMove(cell)}
            >
              {showLabel && (
                <div className="text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}>
                  <div className="flex items-center gap-1 text-xs font-medium truncate">
                    {cell.flagged && <CategoryIcon category="buildJunk" size={11} />}
                    {!cell.other && !cell.flagged && <CategoryIcon category="folder" size={11} />}
                    <span className="truncate">{cell.label}</span>
                  </div>
                  <div className="text-[10px] opacity-90 tabular">{formatBytes(cell.size)}</div>
                </div>
              )}
            </div>
          );
        })}

        {hover && (
          <div className="tooltip" style={{ left: hover.x + 12, top: hover.y + 12, maxWidth: 260, whiteSpace: 'normal' }}>
            <div className="font-medium">{truncateMiddle(hover.cell.path || hover.cell.label, 60)}</div>
            <div className="opacity-80">{formatBytes(hover.cell.size)}</div>
            {hover.cell.reason && <div className="opacity-80 mt-1">{hover.cell.reason}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
