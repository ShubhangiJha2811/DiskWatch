const MAX_EXT_MATCHES = 5;
const MAX_NAME_MATCHES = 20;

// Searches the already-collected scan data (bounded top-N lists, not a full
// file index — see scan.js — so this stays fast and memory-safe on huge scans).
export function searchScan(results, query) {
  const q = query.trim().toLowerCase().replace(/^\./, '');
  if (!results || !q) return { extMatches: [], nameMatches: [] };

  const extMatches = [];
  for (const [ext, stat] of results.extStats) {
    if (ext.includes(q)) extMatches.push({ ext, ...stat });
  }
  extMatches.sort((a, b) => b.size - a.size);

  const seen = new Set();
  const nameMatches = [];
  for (const item of [...results.flagged, ...results.topFiles, ...results.topFolders]) {
    if (seen.has(item.path)) continue;
    if (item.path.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)) {
      seen.add(item.path);
      nameMatches.push(item);
    }
  }
  nameMatches.sort((a, b) => b.size - a.size);

  return { extMatches: extMatches.slice(0, MAX_EXT_MATCHES), nameMatches: nameMatches.slice(0, MAX_NAME_MATCHES) };
}
