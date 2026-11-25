// Indeterminate by design: without walking the whole drive first (which
// would defeat the purpose of showing progress while walking it), there's no
// real denominator for a true percentage — so this spins rather than faking
// one, but the live counts inside it are real, ticking data, not decoration.
export default function ScanProgressRing({ files, folders }) {
  const size = 88;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const arc = circumference * 0.7;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 ring-spin">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gridline)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--cat-1)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference - arc}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-semibold tabular">{files.toLocaleString()}</span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          files
        </span>
      </div>
    </div>
  );
}
