import { useEffect, useState } from "react";

/** Milliseconds until `target` (a timestamp), ticking once a second. */
export function useCountdown(target) {
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  return left;
}
