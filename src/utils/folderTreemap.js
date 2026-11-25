import { CATEGORIES } from '../constants/categories.js';

const MAX_CELLS = 24;
// Deliberately not the sequential blue used for "biggest folders/files" bars —
// that hex is identical to the buildJunk category color in light mode, which
// would erase the "colored by category" distinction this view exists for.
const NEUTRAL_COLOR = 'var(--baseline)';
const OTHER_COLOR = 'var(--gridline)';

// Regular (non-flagged) folders can still nest inside each other in the
// top-N list (top-N by size doesn't know about ancestry) — dedupe those by
// always keeping the larger of any ancestor/descendant pair.
function dedupeNested(folders) {
  const sorted = [...folders].sort((a, b) => b.size - a.size);
  const kept = [];
  for (const f of sorted) {
    const overlaps = kept.some((k) => f.path === k.path || f.path.startsWith(k.path + '/') || k.path.startsWith(f.path + '/'));
    if (!overlaps) kept.push(f);
  }
  return kept;
}

// Builds an honest treemap dataset from already-scanned data.
//
// Flagged build/dependency-junk directories always get their own tile — that's
// the whole point of "colored by category" — rather than being folded into
// whichever enclosing folder happens to be bigger (a parent folder's size is
// always >= its child's, so a naive "keep the bigger one on overlap" rule
// would silently swallow every junk folder into its non-junk parent). Instead,
// any regular folder that contains a shown junk folder has that junk folder's
// bytes subtracted from its own tile, so nothing is ever double-counted.
export function buildFolderTreemapData(results) {
  const buildJunkColor = CATEGORIES.find((c) => c.key === 'buildJunk').color;
  const junkFolders = results.flagged
    .filter((f) => f.kind === 'directory')
    .map((f) => ({ path: f.path, name: f.name, size: f.size, color: buildJunkColor, flagged: true, reason: f.reason }));

  const regularCandidates = results.topFolders.map((f) => ({ path: f.path, name: f.name, size: f.size, color: NEUTRAL_COLOR, flagged: false }));
  const regularFolders = dedupeNested(regularCandidates)
    .map((f) => {
      const junkInside = junkFolders.filter((j) => j.path.startsWith(f.path + '/')).reduce((s, j) => s + j.size, 0);
      return { ...f, size: f.size - junkInside };
    })
    .filter((f) => f.size > 0);

  const combined = [...junkFolders, ...regularFolders].sort((a, b) => b.size - a.size);
  const shown = combined.slice(0, MAX_CELLS);

  const shownSize = shown.reduce((s, f) => s + f.size, 0);
  const otherSize = Math.max(0, results.totalSize - shownSize);

  const cells = shown.map((f) => ({ key: f.path, label: f.name, path: f.path, size: f.size, color: f.color, flagged: f.flagged, reason: f.reason }));
  if (otherSize > 0) {
    cells.push({ key: '__other__', label: 'Everything else', size: otherSize, color: OTHER_COLOR, flagged: false, other: true });
  }
  return cells;
}
