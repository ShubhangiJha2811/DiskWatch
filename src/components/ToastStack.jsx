export default function ToastStack({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((t) => (
        <div key={t.id} className="card px-4 py-3 text-sm shadow-lg" style={{ borderColor: t.tone === 'error' ? 'var(--status-critical)' : 'var(--border)' }}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
