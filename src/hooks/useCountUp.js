import { useEffect, useRef, useState } from 'react';

// Ticks a number from 0 up to `target` over `durationMs`, eased out so it
// races early and settles at the end rather than moving at a constant rate.
export function useCountUp(target, durationMs = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf;
    let start = null;
    const from = 0;

    const step = (ts) => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}
