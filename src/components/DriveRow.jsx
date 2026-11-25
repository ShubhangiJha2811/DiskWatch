export default function DriveRow({ drive, onContinue, onForget }) {
  const statusLabel = drive.status === 'granted' ? 'Connected' : drive.status === 'denied' ? 'Access denied' : 'Needs one click to reconnect';
  const statusColor = drive.status === 'granted' ? 'var(--status-good)' : drive.status === 'denied' ? 'var(--status-critical)' : 'var(--status-warning)';

  return (
    <div className="flex items-center justify-between gap-3 py-3 px-4 hairline border rounded-lg">
      <div className="min-w-0">
        <p className="font-medium truncate">{drive.name}</p>
        <p className="text-xs flex items-center gap-1.5 mt-0.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
          <span style={{ color: 'var(--text-muted)' }}>{statusLabel}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {drive.status !== 'granted' && (
          <button
            className="px-3 py-1.5 rounded-md text-xs font-medium text-white"
            style={{ background: 'var(--cat-1)' }}
            onClick={() => onContinue(drive)}
          >
            Continue
          </button>
        )}
        <button className="px-3 py-1.5 rounded-md text-xs font-medium hairline border" onClick={() => onForget(drive)}>
          Forget
        </button>
      </div>
    </div>
  );
}
