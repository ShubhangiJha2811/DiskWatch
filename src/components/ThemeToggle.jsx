const THEME_OPTIONS = [
  {
    key: 'system',
    label: 'System',
    icon: (
      <path d="M4 5h16v10H4z M9 19h6 M12 15v4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    key: 'light',
    label: 'Light',
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
        <circle cx={12} cy={12} r={4} />
        <path d="M12 2v2.5 M12 19.5V22 M4.2 4.2l1.8 1.8 M18 18l1.8 1.8 M2 12h2.5 M19.5 12H22 M4.2 19.8l1.8-1.8 M18 6l1.8-1.8" />
      </g>
    ),
  },
  {
    key: 'dark',
    label: 'Dark',
    icon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />,
  },
];

export default function ThemeToggle({ theme, onChange, bare = false }) {
  return (
    <div
      className={bare ? 'inline-flex items-center gap-0.5' : 'inline-flex items-center gap-0.5 p-0.5 rounded-lg hairline border'}
      role="radiogroup"
      aria-label="Theme"
    >
      {THEME_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          role="radio"
          aria-checked={theme === opt.key}
          title={opt.label}
          className="p-1.5 rounded-md transition-colors hover:opacity-80"
          style={theme === opt.key ? { background: 'var(--cat-1)', color: 'white' } : { color: 'var(--text-secondary)' }}
          onClick={() => onChange(opt.key)}
        >
          <svg width={15} height={15} viewBox="0 0 24 24">
            {opt.icon}
          </svg>
        </button>
      ))}
    </div>
  );
}
