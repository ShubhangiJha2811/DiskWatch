import { CATEGORIES } from '../constants/categories.js';
import { formatBytes, truncateMiddle } from './format.js';

export function buildNarrative(ctx, driveCount) {
  const parts = [];
  parts.push(
    `This scan covered ${driveCount} drive${driveCount === 1 ? '' : 's'}, walking ${ctx.totalFiles.toLocaleString()} files across ${ctx.totalFolders.toLocaleString()} folders for a total of ${formatBytes(ctx.totalSize)}.`
  );

  const ranked = CATEGORIES.map((c) => ({ ...c, ...ctx.categoryTotals[c.key] }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.size - a.size);

  if (ranked.length > 0) {
    const top = ranked.slice(0, 3);
    const clauses = top.map((c) => `${formatBytes(c.size)} in ${c.label.toLowerCase()} (${c.count.toLocaleString()} item${c.count === 1 ? '' : 's'})`);
    parts.push(`Most of the reclaimable space is ${clauses.join(', ')}.`);
  } else {
    parts.push('No obvious clutter matched the cleanup rules — this disk looks fairly tidy.');
  }

  if (ctx.topFolders.length > 0) {
    const biggest = ctx.topFolders[0];
    parts.push(`The single largest folder found was "${truncateMiddle(biggest.path, 60)}" at ${formatBytes(biggest.size)}.`);
  }

  const reclaimable = ranked.reduce((s, c) => s + c.size, 0);
  if (reclaimable > 0) {
    parts.push(`If every flagged item were removed, this scan estimates about ${formatBytes(reclaimable)} could be freed — always review the list before deleting anything.`);
  }
  return parts.join(' ');
}
