import { formatBytes } from '../utils/format.js';

const QUIET_THRESHOLD = 10 * 1024 * 1024;

export default function TrendBanner({ trend }) {
  const quiet = Math.abs(trend.deltaReclaim) < QUIET_THRESHOLD;
  const dotColor = quiet ? 'var(--text-muted)' : trend.deltaReclaim > 0 ? 'var(--status-warning)' : 'var(--status-good)';

  return (
    <section className="card p-4 mb-6 text-sm flex items-center gap-2">
      <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
      <span>
        {quiet
          ? `Reclaimable clutter is about the same as your last scan of these folders (${trend.when}).`
          : `Reclaimable clutter ${trend.deltaReclaim > 0 ? 'grew' : 'shrank'} ${formatBytes(Math.abs(trend.deltaReclaim))} ${trend.when}.`}
      </span>
    </section>
  );
}
