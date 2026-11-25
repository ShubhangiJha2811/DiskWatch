export function sameDrives(namesA, namesB) {
  if (namesA.length !== namesB.length) return false;
  const a = [...namesA].sort();
  const b = [...namesB].sort();
  return a.every((n, i) => n === b[i]);
}

export function describeWhen(fromTs, toTs) {
  const days = Math.round((toTs - fromTs) / 86400000);
  if (days <= 0) return 'since your last scan';
  if (days === 1) return 'since yesterday';
  if (days < 7) return `since ${days} days ago`;
  if (days <= 10) return 'since last week';
  const weeks = Math.round(days / 7);
  return weeks <= 1 ? 'since last week' : `since ~${weeks} weeks ago`;
}

// Only compares scans that covered the same set of drives/folders,
// otherwise "growth" could just mean a different scan scope.
export function computeTrend(current, previous) {
  if (!previous || !sameDrives(current.driveNames, previous.driveNames)) return null;
  return {
    deltaReclaim: current.reclaimableSize - previous.reclaimableSize,
    deltaTotal: current.totalSize - previous.totalSize,
    when: describeWhen(previous.timestamp, current.timestamp),
    previous,
  };
}
