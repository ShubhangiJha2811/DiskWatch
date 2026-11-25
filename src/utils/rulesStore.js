import {
  DEFAULT_JUNK_DIR_NAMES, DEFAULT_LARGE_MEDIA_THRESHOLD_MB,
  DEFAULT_INSTALLER_AGE_DAYS, DEFAULT_DUP_MIN_SIZE_MB, DEFAULT_EXCLUDED_NAMES,
} from '../constants/rules.js';

const RULES_KEY = 'diskwatch-rules';

export function defaultRules() {
  return {
    junkDirNames: [...DEFAULT_JUNK_DIR_NAMES],
    excludedNames: [...DEFAULT_EXCLUDED_NAMES],
    largeMediaThresholdMB: DEFAULT_LARGE_MEDIA_THRESHOLD_MB,
    installerAgeDays: DEFAULT_INSTALLER_AGE_DAYS,
    dupMinSizeMB: DEFAULT_DUP_MIN_SIZE_MB,
  };
}

export function getStoredRules() {
  try {
    const raw = localStorage.getItem(RULES_KEY);
    if (!raw) return defaultRules();
    const parsed = JSON.parse(raw);
    return { ...defaultRules(), ...parsed };
  } catch (e) {
    return defaultRules();
  }
}

export function saveRules(rules) {
  try {
    localStorage.setItem(RULES_KEY, JSON.stringify(rules));
  } catch (e) {
    /* localStorage unavailable — rule changes just won't persist across visits */
  }
}

// Derives the values scan.js actually consumes (Sets, byte thresholds, ms thresholds)
// from the user-facing config shape (arrays, MB, days).
export function toEngineRules(rules) {
  return {
    junkDirNames: new Set(rules.junkDirNames.map((n) => n.toLowerCase())),
    excludedNames: new Set(rules.excludedNames.map((n) => n.toLowerCase())),
    largeMediaThreshold: rules.largeMediaThresholdMB * 1024 * 1024,
    installerAgeMs: rules.installerAgeDays * 24 * 60 * 60 * 1000,
    dupMinSize: rules.dupMinSizeMB * 1024 * 1024,
  };
}
