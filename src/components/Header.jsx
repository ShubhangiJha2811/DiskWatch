import { CATEGORIES } from '../constants/categories.js';
import ThemeToggle from './ThemeToggle.jsx';

const GRADIENT = 'linear-gradient(135deg, var(--cat-1), var(--cat-3))';

const BADGES = [
  {
    label: 'Runs entirely in your browser',
    icon: (
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
    ),
  },
  {
    label: 'No install, no account',
    icon: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />,
  },
  {
    label: 'Every suggestion explained',
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx={12} cy={12} r={3} />
      </g>
    ),
  },
];

function Logo() {
  return (
    <div
      className="relative shrink-0 w-14 h-14 rounded-2xl"
      style={{ background: GRADIENT, boxShadow: '0 10px 24px -8px var(--cat-1)' }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full"
          style={{ background: 'conic-gradient(white 0deg 130deg, rgba(255,255,255,0.42) 130deg 230deg, rgba(255,255,255,0.18) 230deg 360deg)' }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full" style={{ background: GRADIENT }} />
      </div>
    </div>
  );
}

export default function Header({ theme, onThemeChange, onOpenRules, onStartScan }) {
  return (
    <header className="card relative overflow-hidden mb-8 p-6 sm:p-7 flex items-start justify-between gap-5 flex-wrap">
      <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full" style={{ background: 'var(--cat-1)', opacity: 0.08 }} />
      <div className="pointer-events-none absolute -bottom-24 -left-10 w-56 h-56 rounded-full" style={{ background: 'var(--cat-3)', opacity: 0.06 }} />

      <div className="flex items-start gap-4 relative min-w-0">
        <Logo />
        <div className="min-w-0">
          <h1
            className="text-[28px] font-bold tracking-tight leading-tight"
            style={{ background: GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
          >
            DiskWatch Scanner
          </h1>
          <p className="text-sm mt-1 max-w-md" style={{ color: 'var(--text-secondary)' }}>
            A link, not an install. Everything runs in this browser tab — nothing is uploaded, and nothing scans unless this page is open.
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {BADGES.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full hairline border"
                style={{ color: 'var(--text-secondary)' }}
              >
                <svg width={12} height={12} viewBox="0 0 24 24" style={{ color: 'var(--cat-1)' }}>
                  {b.icon}
                </svg>
                {b.label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 mt-3">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Color-coded by category
            </span>
            <span className="flex items-center gap-1">
              {CATEGORIES.map((c) => (
                <span key={c.key} className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} title={c.label} />
              ))}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 relative shrink-0">
        <button
          className="cta-pulse inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-full transition-transform hover:scale-105"
          style={{ background: GRADIENT, boxShadow: '0 6px 16px -4px var(--cat-1)' }}
          onClick={onStartScan}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={11} cy={11} r={7} />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          Start scanning
        </button>

        <div className="flex items-center gap-1 p-1 rounded-xl hairline border" style={{ background: 'var(--page-plane)' }}>
          <button
            className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--surface-1)]"
            onClick={onOpenRules}
          >
            Rules
          </button>
          <span className="w-px h-5" style={{ background: 'var(--border)' }} />
          <ThemeToggle theme={theme} onChange={onThemeChange} bare />
        </div>
      </div>
    </header>
  );
}
