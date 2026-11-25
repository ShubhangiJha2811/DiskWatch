export default function DismissedList({ dismissed, onRestore }) {
  if (dismissed.length === 0) {
    return (
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Nothing dismissed yet — use "Keep this file" or "Always ignore" on a suggestion to keep it from resurfacing.
      </p>
    );
  }
  return (
    <div className="space-y-1.5">
      {dismissed.map((d) => (
        <div key={d.id} className="flex items-center justify-between text-xs gap-2">
          <span className="truncate" title={d.value} style={{ color: 'var(--text-secondary)' }}>
            {d.type === 'name' ? `Any file/folder named "${d.value}"` : d.value}
          </span>
          <button className="shrink-0 font-medium" style={{ color: 'var(--cat-1)' }} onClick={() => onRestore(d.id)}>
            Restore
          </button>
        </div>
      ))}
    </div>
  );
}
