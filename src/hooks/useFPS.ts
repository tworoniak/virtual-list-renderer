import { useEffect, useRef, useState } from 'react';

export function useFPS() {
  const [fps, setFPS] = useState(0);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const countRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      countRef.current++;
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 500) {
        setFPS(Math.round((countRef.current / elapsed) * 1000));
        countRef.current = 0;
        lastTimeRef.current = now;
      }

      frameRef.current++;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return fps;
}
