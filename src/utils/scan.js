import { CATEGORIES } from '../constants/categories.js';
import {
  TEMP_NAME_RE, TEMP_EXACT, LOG_RE, ARCHIVE_INSTALLER_RE, MEDIA_RE,
  MAX_DUP_KEYS, MAX_FLAGGED, TOP_N, MAX_EXT_KEYS, EXT_TOP_N,
} from '../constants/rules.js';
import { truncateMiddle } from './format.js';

export class CancelledError extends Error {}

export function yieldToMain() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Keeps `list` sorted descending by size, capped at `n` entries,
// without a full re-sort on every insertion (important on very large scans).
export function pushTopN(list, item, n) {
  if (list.length < n) {
    list.push(item);
    let i = list.length - 1;
    while (i > 0 && list[i - 1].size < list[i].size) {
      [list[i - 1], list[i]] = [list[i], list[i - 1]];
      i--;
    }
    return;
  }
  if (item.size <= list[n - 1].size) return;
  list[n - 1] = item;
  let i = n - 1;
  while (i > 0 && list[i - 1].size < list[i].size) {
    [list[i - 1], list[i]] = [list[i], list[i - 1]];
    i--;
  }
}

export function initCategoryTotals() {
  const o = {};
  CATEGORIES.forEach((c) => {
    o[c.key] = { size: 0, count: 0 };
  });
  return o;
}

function addCategoryTotal(ctx, key, size) {
  const c = ctx.categoryTotals[key];
  c.size += size;
  c.count += 1;
}

function isDismissed(ctx, name, path) {
  return ctx.dismissed.paths.has(path) || ctx.dismissed.names.has(name.toLowerCase());
}

// File managers rename same-folder copies ("photo.png" -> "photo - Copy.png",
// "photo (1).png", "photo copy 2.png") — the single most common way real
// duplicates get created. Stripping that suffix before comparing means those
// renamed copies still match their original on name + size.
const COPY_SUFFIX_RE = /(\s*-\s*copy(\s*\(\d+\))?|\s*copy(\s*\d+)?|\s*\(\d+\)|[-_]copy\d*)$/i;
function normalizeDupName(name) {
  const dotIdx = name.lastIndexOf('.');
  const base = dotIdx > 0 ? name.slice(0, dotIdx) : name;
  const ext = dotIdx > 0 ? name.slice(dotIdx) : '';
  return (base.replace(COPY_SUFFIX_RE, '').trim() + ext).toLowerCase();
}

function extOf(name) {
  const idx = name.lastIndexOf('.');
  if (idx <= 0 || idx === name.length - 1) return '(no extension)';
  return name.slice(idx + 1).toLowerCase();
}

// Tracked separately from the cleanup categories — feeds the "space by file
// type" view and the extension search, not the delete recommendations.
function recordExtStat(ctx, name, size, path, handle, parentHandle) {
  const ext = extOf(name);
  if (!ctx.extStats.has(ext)) {
    if (ctx.extStats.size >= MAX_EXT_KEYS) return;
    ctx.extStats.set(ext, { size: 0, count: 0, top: [] });
  }
  const stat = ctx.extStats.get(ext);
  stat.size += size;
  stat.count += 1;
  pushTopN(stat.top, { name, path, size, handle, parentHandle }, EXT_TOP_N);
}

export function addFlagged(ctx, category, name, path, size, kind, handle, parentHandle, reason) {
  if (ctx.flagged.length >= MAX_FLAGGED) {
    ctx.truncated = true;
    return;
  }
  ctx.flagged.push({ id: ctx.nextId++, category, name, path, size, kind, reason, handle, parentHandle });
  addCategoryTotal(ctx, category, size);
}

function classifyFile(name, size, lastModified, path, fileHandle, parentHandle, ctx) {
  if (isDismissed(ctx, name, path)) return;
  const lower = name.toLowerCase();
  const { largeMediaThreshold, installerAgeMs, dupMinSize } = ctx.rules;

  if (/^~\$/.test(name) || TEMP_EXACT.has(lower) || TEMP_NAME_RE.test(lower)) {
    addFlagged(ctx, 'tempFiles', name, path, size, 'file', fileHandle, parentHandle,
      'Temporary or cache file left behind by an application — usually safe to remove.');
    return;
  }
  if (LOG_RE.test(lower)) {
    addFlagged(ctx, 'logs', name, path, size, 'file', fileHandle, parentHandle,
      'Log file — safe to clear unless you need it for troubleshooting.');
    return;
  }
  if (ARCHIVE_INSTALLER_RE.test(lower) && Date.now() - lastModified > installerAgeMs) {
    addFlagged(ctx, 'installers', name, path, size, 'file', fileHandle, parentHandle,
      'Installer or archive last modified over 90 days ago — likely already used and no longer needed.');
    return;
  }
  if (MEDIA_RE.test(lower) && size >= largeMediaThreshold) {
    addFlagged(ctx, 'largeMedia', name, path, size, 'file', fileHandle, parentHandle,
      'Large media file — review before keeping, or move it to external storage.');
    return;
  }
  if (size >= dupMinSize) {
    const key = size + '|' + normalizeDupName(name);
    if (ctx.dupMap.has(key) || ctx.dupMap.size < MAX_DUP_KEYS) {
      if (!ctx.dupMap.has(key)) ctx.dupMap.set(key, []);
      ctx.dupMap.get(key).push({ name, size, path, handle: fileHandle, parentHandle });
    }
  }
}

export async function computeAggregate(handle, ctx) {
  let size = 0;
  let entries;
  try {
    entries = handle.entries();
  } catch (e) {
    return size;
  }
  try {
    for await (const [, childHandle] of entries) {
      ctx.opCount++;
      if (ctx.opCount % 300 === 0) {
        await yieldToMain();
        if (ctx.cancelled) throw new CancelledError();
      }
      if (childHandle.kind === 'directory') {
        size += await computeAggregate(childHandle, ctx);
      } else {
        try {
          const f = await childHandle.getFile();
          size += f.size;
        } catch (e) {
          ctx.skipped.push(childHandle.name);
        }
      }
    }
  } catch (e) {
    if (e instanceof CancelledError) throw e;
    ctx.skipped.push(handle.name);
  }
  return size;
}

export async function walk(handle, path, parentHandle, ctx, depth) {
  if (ctx.cancelled) throw new CancelledError();

  if (depth > 0 && ctx.rules.excludedNames.has(handle.name.toLowerCase())) {
    ctx.excludedCount += 1;
    return 0;
  }

  const isJunkDir = depth > 0 && ctx.rules.junkDirNames.has(handle.name.toLowerCase());
  if (isJunkDir && !isDismissed(ctx, handle.name, path)) {
    let size = 0;
    try {
      size = await computeAggregate(handle, ctx);
    } catch (e) {
      if (e instanceof CancelledError) throw e;
    }
    ctx.totalSize += size;
    ctx.totalFolders += 1;
    addFlagged(ctx, 'buildJunk', handle.name, path, size, 'directory', handle, parentHandle,
      'Dependency or build-output folder — regenerated automatically by its tool, safe to delete when you are not actively building this project.');
    ctx.onProgress(ctx);
    return size;
  }

  let dirSize = 0;
  let entries;
  try {
    entries = handle.entries();
  } catch (e) {
    ctx.skipped.push(path);
    return 0;
  }
  try {
    for await (const [name, childHandle] of entries) {
      ctx.opCount++;
      if (ctx.opCount % 300 === 0) {
        await yieldToMain();
        ctx.onProgress(ctx, path);
        if (ctx.cancelled) throw new CancelledError();
      }
      const childPath = path + '/' + name;
      if (childHandle.kind === 'directory') {
        dirSize += await walk(childHandle, childPath, handle, ctx, depth + 1);
        ctx.totalFolders += 1;
      } else {
        let file;
        try {
          file = await childHandle.getFile();
        } catch (e) {
          ctx.skipped.push(childPath);
          continue;
        }
        const size = file.size;
        dirSize += size;
        ctx.totalFiles += 1;
        ctx.totalSize += size;
        pushTopN(ctx.topFiles, { name, path: childPath, size, handle: childHandle, parentHandle: handle }, TOP_N);
        recordExtStat(ctx, name, size, childPath, childHandle, handle);
        classifyFile(name, size, file.lastModified, childPath, childHandle, handle, ctx);
      }
    }
  } catch (e) {
    if (e instanceof CancelledError) throw e;
    ctx.skipped.push(path);
  }
  if (depth > 0) {
    pushTopN(ctx.topFolders, { name: handle.name, path, size: dirSize, handle, parentHandle }, TOP_N);
  }
  return dirSize;
}

export function createScanContext(onProgress, engineRules, dismissedSets) {
  return {
    flagged: [], nextId: 1, topFolders: [], topFiles: [],
    categoryTotals: initCategoryTotals(), dupMap: new Map(), extStats: new Map(), skipped: [],
    opCount: 0, cancelled: false, truncated: false, excludedCount: 0,
    totalSize: 0, totalFiles: 0, totalFolders: 0,
    rules: engineRules,
    dismissed: dismissedSets,
    onProgress,
  };
}

export function finalizeDuplicates(ctx) {
  for (const [, group] of ctx.dupMap) {
    if (group.length > 1) {
      for (let i = 1; i < group.length; i++) {
        if (ctx.flagged.length >= MAX_FLAGGED) {
          ctx.truncated = true;
          break;
        }
        const it = group[i];
        addFlagged(ctx, 'duplicates', it.name, it.path, it.size, 'file', it.handle, it.parentHandle,
          `Same size and name (ignoring "Copy"/"(1)"-style suffixes) as ${truncateMiddle(group[0].path, 50)} — verify before keeping both.`);
      }
    }
  }
}
