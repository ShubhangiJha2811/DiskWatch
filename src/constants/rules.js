// Fixed classification patterns — not user-configurable (unlike the values in
// utils/rulesStore.js, which the user can tune from the Rules panel).
export const TEMP_NAME_RE = /(\.tmp|\.temp|\.bak|\.old)$/i;
export const TEMP_EXACT = new Set(['thumbs.db', '.ds_store', 'desktop.ini']);
export const LOG_RE = /\.log$/i;
export const ARCHIVE_INSTALLER_RE = /\.(zip|rar|7z|tar|gz|tgz|exe|msi|dmg|pkg|iso)$/i;
export const MEDIA_RE = /\.(mp4|mov|mkv|avi|wmv|flv|wav|flac|aiff|m4v)$/i;

// Fixed engine limits, guarding memory/UI size on very large scans.
export const MAX_DUP_KEYS = 20000;
export const MAX_FLAGGED = 3000;
export const TOP_N = 50;
export const MAX_EXT_KEYS = 2000;
export const EXT_TOP_N = 20;

// Defaults for the user-configurable cleanup rules (see utils/rulesStore.js).
export const DEFAULT_JUNK_DIR_NAMES = [
  'node_modules', '.git', 'dist', 'build', '.next', '.nuxt',
  'target', '.cache', '__pycache__', '.venv', 'venv', '.gradle', '.turbo',
];
export const DEFAULT_LARGE_MEDIA_THRESHOLD_MB = 200;
export const DEFAULT_INSTALLER_AGE_DAYS = 90;
export const DEFAULT_DUP_MIN_SIZE_MB = 0.01;

// Folders skipped entirely — not walked, not sized, not flagged.
// Unlike junk-dir names, these are for known-huge/irrelevant folders you want
// scans to bypass for speed (a synced OneDrive folder, a mounted network share).
export const DEFAULT_EXCLUDED_NAMES = ['$RECYCLE.BIN', 'System Volume Information'];
