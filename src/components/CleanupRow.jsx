import { CATEGORIES, CONFIDENCE_META } from '../constants/categories.js';
import { formatBytes, truncateMiddle } from '../utils/format.js';
import CategoryIcon from './CategoryIcon.jsx';

const EyeOffIcon = (
  <path
    d="M2 12s3.5-7 10-7c1.6 0 3 .3 4.2.9M22 12s-1 2-3 3.8M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18"
    fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
  />
);
const BanIcon = (
  <g fill="none" stroke="currentColor" strokeWidth={1.6}>
    <circle cx={12} cy={12} r={9} />
    <path d="M5.5 5.5l13 13" strokeLinecap="round" />
  </g>
);

function DismissButton({ icon, onClick, title, children }) {
  return (
    <button
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors hover:bg-[var(--page-plane)]"
      style={{ color: 'var(--cat-1)' }}
      title={title}
      onClick={onClick}
    >
      <svg width={12} height={12} viewBox="0 0 24 24">
        {icon}
      </svg>
      {children}
    </button>
  );
}

export default function CleanupRow({ item, checked, onToggle, onDelete, onDismissPath, onDismissName, onMoveClick }) {
  const cat = CATEGORIES.find((c) => c.key === item.category);
  const confidence = cat ? CONFIDENCE_META[cat.confidence] : null;
  const canMove = item.category === 'largeMedia' && item.kind === 'file';

  return (
    <div className="py-3">
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={checked} onChange={onToggle} />
        <CategoryIcon category={item.category} size={16} className="shrink-0" style={{ color: cat ? cat.color : 'var(--text-muted)' }} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm truncate" title={item.path}>
              {item.name}
            </p>
            {confidence && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0"
                style={{ color: confidence.color, background: 'var(--page-plane)' }}
              >
                {confidence.label}
              </span>
            )}
          </div>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {item.reason}
          </p>
        </div>
        <span className="tabular text-sm shrink-0" style={{ color: 'var(--text-secondary)' }}>
          {formatBytes(item.size)}
        </span>
        {canMove && (
          <button className="text-xs font-medium px-2 py-1 rounded-md shrink-0 hairline border" onClick={() => onMoveClick(item)}>
            Move
          </button>
        )}
        <button className="text-xs font-medium px-2 py-1 rounded-md shrink-0" style={{ color: 'var(--status-critical)' }} onClick={onDelete}>
          Delete
        </button>
      </div>
      <div className="flex items-center gap-1 mt-0.5 pl-8">
        <DismissButton
          icon={EyeOffIcon}
          title={`Stop suggesting this ${item.kind === 'directory' ? 'folder' : 'file'} — it won't show up again`}
          onClick={() => onDismissPath(item)}
        >
          Keep this {item.kind === 'directory' ? 'folder' : 'file'}
        </DismissButton>
        <DismissButton
          icon={BanIcon}
          title={`Stop suggesting anything named "${item.name}" in future scans`}
          onClick={() => onDismissName(item)}
        >
          Always ignore "{truncateMiddle(item.name, 24)}"
        </DismissButton>
      </div>
    </div>
  );
}
