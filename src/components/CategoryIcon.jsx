// Simple stroke-based icons, one per cleanup category plus a generic folder
// icon for non-flagged treemap cells — for quick visual scanning without
// reading the category label every time.
const ICONS = {
  buildJunk: (
    <path
      d="M14.7 6.3a3 3 0 0 1-3.9 3.9L5 16v3h3l5.8-5.8a3 3 0 0 1 3.9-3.9l-2.3 2.3-1.4-1.4z"
      fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
    />
  ),
  installers: (
    <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8l8-4 8 4-8 4-8-4z" />
      <path d="M4 8v9l8 4 8-4V8" />
      <path d="M12 12v9" />
    </g>
  ),
  largeMedia: (
    <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x={3} y={5} width={18} height={14} rx={1.5} />
      <path d="M3 9h18 M3 15h18 M8 5v4 M8 15v4 M16 5v4 M16 15v4" />
    </g>
  ),
  duplicates: (
    <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x={8} y={8} width={12} height={12} rx={1.5} />
      <path d="M4 16V5a1 1 0 0 1 1-1h11" />
    </g>
  ),
  logs: (
    <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M9 12h7 M9 16h7 M9 8h3" />
    </g>
  ),
  tempFiles: (
    <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={13} r={8} />
      <path d="M12 9v4l3 2 M9 2h6" />
    </g>
  ),
  folder: (
    <path
      d="M4 6a1 1 0 0 1 1-1h4l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6z"
      fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
    />
  ),
};

export default function CategoryIcon({ category, size = 14, className = '', style }) {
  const icon = ICONS[category] || ICONS.folder;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
      {icon}
    </svg>
  );
}
