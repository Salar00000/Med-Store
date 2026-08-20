import { useEffect, useState } from 'react';

export function useCountUp(target, suffix = '', duration = 2000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf;
    let current = 0;
    const step = target / (duration / 16);
    const tick = () => {
      current = Math.min(current + step, target);
      setValue(Math.round(current));
      if (current < target) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  const display = value >= 1000 ? value.toLocaleString() : String(value);
  return `${display}${suffix}`;
}
