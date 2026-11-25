import { useEffect, useState } from 'react';

export default function Bar({ value, max, color }) {
  const [mounted, setMounted] = useState(false);

  // Starts at 0 and lets the CSS width transition (see .bar-fill) carry it up
  // to the real value right after mount, instead of appearing already-filled.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 1.5 : 0) : 0;
  return (
    <div className="bar-track w-full">
      <div className="bar-fill" style={{ width: (mounted ? pct : 0) + '%', background: color }} />
    </div>
  );
}
