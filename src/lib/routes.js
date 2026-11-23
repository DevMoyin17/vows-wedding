/** Clean, readable URLs — /our-story instead of #/scene/4 */
export const SLUGS = {
  1: "",
  2: "the-couple",
  3: "save-the-date",
  4: "our-story",
  5: "countdown",
  6: "wedding-details",
  7: "photographs",
  8: "rsvp",
  9: "with-love",
};

export function sceneFromPath(pathname = window.location.pathname) {
  const seg = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, "").split("/").pop() || "";
  const hit = Object.entries(SLUGS).find(([, slug]) => slug === seg);
  return hit ? Number(hit[0]) : 1;
}

export function pathFor(n) {
  return "/" + (SLUGS[n] ?? "");
}
