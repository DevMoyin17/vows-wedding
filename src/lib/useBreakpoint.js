import { useEffect, useState } from "react";

/**
 * Matches the three authored compositions:
 * mobile 390×844, tablet 768×1024, desktop 1440×900.
 * Only the active breakpoint's entrance renders are mounted, so a phone
 * never downloads the desktop artwork (and vice versa).
 */
const QUERIES = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
};

function current() {
  if (typeof window === "undefined") return "mobile";
  if (window.matchMedia(QUERIES.desktop).matches) return "desktop";
  if (window.matchMedia(QUERIES.tablet).matches) return "tablet";
  return "mobile";
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState(current);

  useEffect(() => {
    const lists = Object.values(QUERIES).map((query) => window.matchMedia(query));
    const onChange = () => setBreakpoint(current());
    lists.forEach((list) => list.addEventListener("change", onChange));
    return () => lists.forEach((list) => list.removeEventListener("change", onChange));
  }, []);

  return breakpoint;
}
