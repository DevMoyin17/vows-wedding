/**
 * Clean, readable URLs for the invitation. Every section lives under the
 * couple's invitation base so the marketing site can own `/`.
 */
export const INVITATION_SLUG = "simeon-janet";
export const INVITATION_BASE = `/i/${INVITATION_SLUG}`;

export const SLUGS = {
  1: "",
  2: "the-couple",
  3: "save-the-date",
  4: "our-story",
  6: "wedding-details",
  7: "photographs",
  8: "rsvp",
  9: "with-love",
};

export function sceneFromPath(pathname = window.location.pathname) {
  const clean = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, "");
  const base = INVITATION_BASE.replace(/^\//, "");
  let rest = clean;

  if (clean === base) return 1;
  if (clean.startsWith(`${base}/`)) rest = clean.slice(base.length + 1);

  const seg = rest.split("/").pop() || "";
  const hit = Object.entries(SLUGS).find(([, slug]) => slug === seg);
  return hit ? Number(hit[0]) : 1;
}

export function pathFor(n) {
  if (Number(n) === 1) return INVITATION_BASE;
  return `${INVITATION_BASE}/${SLUGS[n] ?? ""}`;
}
