import { useEffect, useState } from "react";

/**
 * Which Figma entrance layout fits this screen, by its shape rather than its
 * width: mobile 390×844 (0.46), tablet 768×1024 (0.75), desktop 1440×900
 * (1.6). The cut-offs sit between those ratios, so a narrow desktop window
 * or a large phone gets the composition it actually resembles.
 */
const QUERIES = {
  desktop: "(min-aspect-ratio: 11/10)",
  tablet: "(min-aspect-ratio: 59/100)",
};

function current() {
  if (typeof window === "undefined" || !window.matchMedia) return "mobile";
  if (window.matchMedia(QUERIES.desktop).matches) return "desktop";
  if (window.matchMedia(QUERIES.tablet).matches) return "tablet";
  return "mobile";
}

export function useEntranceLayout() {
  const [layout, setLayout] = useState(current);

  useEffect(() => {
    const lists = Object.values(QUERIES).map((q) => window.matchMedia(q));
    const onChange = () => setLayout(current());
    lists.forEach((l) => l.addEventListener("change", onChange));
    return () => lists.forEach((l) => l.removeEventListener("change", onChange));
  }, []);

  return layout;
}
