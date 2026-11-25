export default function ConfirmModal({ title, body, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onCancel}>
      <div className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          {body}
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium hairline border" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: danger ? 'var(--status-critical)' : 'var(--cat-1)' }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
