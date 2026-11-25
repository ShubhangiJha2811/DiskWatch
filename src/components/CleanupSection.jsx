import { CATEGORIES } from '../constants/categories.js';
import CleanupRow from './CleanupRow.jsx';

export default function CleanupSection({
  flaggedFiltered, categoryFilter, onCategoryFilterChange,
  selected, onToggleSelected, onSelectAll, onDeleteSelectedClick, onDeleteItemClick,
  onDismissPath, onDismissName, onMoveClick,
}) {
  const visibleSelectedCount = flaggedFiltered.filter((f) => selected.has(f.id)).length;
  const allVisibleSelected = flaggedFiltered.length > 0 && visibleSelectedCount === flaggedFiltered.length;

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold">Cleanup suggestions ({flaggedFiltered.length})</h3>
        <select
          className="text-sm rounded-md px-2 py-1 hairline border bg-transparent"
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {flaggedFiltered.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--page-plane)' }}>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={allVisibleSelected} onChange={() => onSelectAll(flaggedFiltered, !allVisibleSelected)} />
            <span>{visibleSelectedCount > 0 ? `${visibleSelectedCount} selected` : 'Select all shown'}</span>
          </label>
          <button
            className="px-3 py-1.5 rounded-md text-xs font-medium text-white disabled:opacity-40"
            style={{ background: 'var(--status-critical)' }}
            disabled={visibleSelectedCount === 0}
            onClick={onDeleteSelectedClick}
          >
            Delete selected
          </button>
        </div>
      )}

      {flaggedFiltered.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Nothing flagged in this category.
        </p>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--gridline)' }}>
          {flaggedFiltered.map((item) => (
            <CleanupRow
              key={item.id}
              item={item}
              checked={selected.has(item.id)}
              onToggle={() => onToggleSelected(item.id)}
              onDelete={() => onDeleteItemClick(item)}
              onDismissPath={onDismissPath}
              onDismissName={onDismissName}
              onMoveClick={onMoveClick}
            />
          ))}
        </div>
      )}
    </section>
  );
}
