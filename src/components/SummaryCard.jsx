import CategoryChart from './CategoryChart.jsx';
import TypeChart from './TypeChart.jsx';

const MODES = [
  { key: 'quick', label: 'Quick summary' },
  { key: 'byType', label: 'By file type' },
  { key: 'plain', label: 'Plain-English summary' },
];

export default function SummaryCard({ summaryMode, onModeChange, categoryTotals, totalFlaggedSize, typeTotals, narrative }) {
  return (
    <section className="card p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {MODES.map((mode) => (
          <button
            key={mode.key}
            className="px-3 py-1.5 rounded-md text-sm font-medium"
            style={summaryMode === mode.key ? { background: 'var(--cat-1)', color: 'white' } : { color: 'var(--text-secondary)' }}
            onClick={() => onModeChange(mode.key)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {summaryMode === 'quick' && <CategoryChart categoryTotals={categoryTotals} totalFlaggedSize={totalFlaggedSize} />}

      {summaryMode === 'byType' && <TypeChart typeTotals={typeTotals} />}

      {summaryMode === 'plain' && (
        <div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {narrative}
          </p>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Generated locally from category totals only — no file names or paths leave this browser, and no external AI service is called.
          </p>
        </div>
      )}
    </section>
  );
}
