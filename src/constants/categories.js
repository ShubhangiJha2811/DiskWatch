export const CATEGORIES = [
  { key: 'buildJunk', label: 'Build & dependency junk', color: 'var(--cat-1)', confidence: 'very-safe' },
  { key: 'installers', label: 'Old installers & archives', color: 'var(--cat-2)', confidence: 'check-first' },
  { key: 'largeMedia', label: 'Large media files', color: 'var(--cat-3)', confidence: 'check-first' },
  { key: 'duplicates', label: 'Likely duplicates', color: 'var(--cat-4)', confidence: 'check-first' },
  { key: 'logs', label: 'Log files', color: 'var(--cat-5)', confidence: 'very-safe' },
  { key: 'tempFiles', label: 'Temporary & cache files', color: 'var(--cat-6)', confidence: 'very-safe' },
];

// Confidence is about how likely the recommendation is to be exactly right,
// not a promise — the delete action always still asks for confirmation.
export const CONFIDENCE_META = {
  'very-safe': { label: 'Very safe', color: 'var(--status-good)' },
  'check-first': { label: 'Check first', color: 'var(--status-warning)' },
};
