import { OTHER_TYPE, TYPE_META, extToType } from '../constants/fileTypes.js';

// Rolls the raw per-extension stats gathered during the scan up into the
// broad type buckets shown in the "space by file type" view.
export function computeTypeTotals(extStats) {
  const totals = {};
  [...TYPE_META, OTHER_TYPE].forEach((t) => {
    totals[t.key] = { size: 0, count: 0 };
  });
  for (const [ext, stat] of extStats) {
    const type = extToType(ext);
    totals[type].size += stat.size;
    totals[type].count += stat.count;
  }
  return totals;
}
