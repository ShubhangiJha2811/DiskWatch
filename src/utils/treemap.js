// Squarified treemap layout (Bruls, Huizing, van Wijk). Operates in a virtual
// coordinate space — callers render cells with percentage-based CSS so the
// layout itself never needs to know the real pixel size of its container.

function worstRatio(row, length) {
  const sum = row.reduce((a, b) => a + b.value, 0);
  const rmax = Math.max(...row.map((r) => r.value));
  const rmin = Math.min(...row.map((r) => r.value));
  return Math.max((length * length * rmax) / (sum * sum), (sum * sum) / (length * length * rmin));
}

function layoutRow(row, rect, results) {
  const rowSum = row.reduce((a, b) => a + b.value, 0);
  const isWide = rect.w >= rect.h;
  const rowThickness = isWide ? rowSum / rect.h : rowSum / rect.w;
  let offset = 0;
  for (const item of row) {
    const itemLength = rowThickness > 0 ? item.value / rowThickness : 0;
    if (isWide) {
      results.push({ ...item, x: rect.x, y: rect.y + offset, w: rowThickness, h: itemLength });
    } else {
      results.push({ ...item, x: rect.x + offset, y: rect.y, w: itemLength, h: rowThickness });
    }
    offset += itemLength;
  }
  return isWide
    ? { x: rect.x + rowThickness, y: rect.y, w: rect.w - rowThickness, h: rect.h }
    : { x: rect.x, y: rect.y + rowThickness, w: rect.w, h: rect.h - rowThickness };
}

function squarify(items, rect) {
  const results = [];
  let remaining = items;
  let currentRect = rect;
  while (remaining.length > 0) {
    const length = Math.min(currentRect.w, currentRect.h);
    let row = [remaining[0]];
    let i = 1;
    while (i < remaining.length) {
      const nextRow = [...row, remaining[i]];
      if (worstRatio(nextRow, length) <= worstRatio(row, length)) {
        row = nextRow;
        i++;
      } else {
        break;
      }
    }
    currentRect = layoutRow(row, currentRect, results);
    remaining = remaining.slice(row.length);
  }
  return results;
}

// items: [{ size, ...anything }], width/height: virtual units for the container.
export function computeTreemap(items, width, height) {
  const positiveItems = items.filter((i) => i.size > 0);
  const total = positiveItems.reduce((s, i) => s + i.size, 0);
  if (total <= 0) return [];
  const scale = (width * height) / total;
  const scaled = positiveItems.map((i) => ({ ...i, value: i.size * scale })).sort((a, b) => b.value - a.value);
  return squarify(scaled, { x: 0, y: 0, w: width, h: height });
}
