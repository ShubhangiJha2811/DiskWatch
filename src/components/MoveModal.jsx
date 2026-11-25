import { useState } from 'react';
import { formatBytes } from '../utils/format.js';

export default function MoveModal({ item, destination, onPickDestination, onReconfirmDestination, onMove, onClose }) {
  const [busy, setBusy] = useState(false);
  const ready = destination && destination.status === 'granted';

  const handleMove = async () => {
    setBusy(true);
    const ok = await onMove(item, destination.handle, destination.name);
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">Move "{item.name}"</h3>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          {formatBytes(item.size)} — moves the file instead of deleting it, so you can review it later without losing it.
        </p>

        {!destination && (
          <button className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white mb-2" style={{ background: 'var(--cat-1)' }} onClick={onPickDestination}>
            Choose a destination folder...
          </button>
        )}

        {destination && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--page-plane)' }}>
            <p>
              Destination: <strong>{destination.name}</strong>
            </p>
            {destination.status !== 'granted' && (
              <p className="mt-1" style={{ color: 'var(--status-warning)' }}>
                Needs one click to reconnect.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium hairline border" onClick={onClose}>
            Cancel
          </button>
          {destination && (
            <button className="px-4 py-2 rounded-lg text-sm font-medium hairline border" onClick={onPickDestination}>
              Choose different folder
            </button>
          )}
          {destination && !ready && (
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--cat-1)' }} onClick={onReconfirmDestination}>
              Reconnect
            </button>
          )}
          {ready && (
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ background: 'var(--cat-1)' }} disabled={busy} onClick={handleMove}>
              {busy ? 'Moving...' : 'Move here'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
