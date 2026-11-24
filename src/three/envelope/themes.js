/**
 * Material presets for the 3D envelope — one per Figma template (04 —
 * Templates). The envelope, seal and card are the same model in every
 * template; only these values change. A couple's own colours are layered
 * on top with `resolveTheme` (URL overrides for now, saved settings later).
 *
 *  satin   backdrop colour ramp: [shadow, mid, highlight]
 *  paper   outside of the envelope
 *  liner   inside of the flap and the open mouth (foil when metalness > 0)
 *  lace    trim along the flap and mouth edges (null = none)
 *  seal    wax seal; the monogram comes from the couple's initials
 *  card    invitation card paper, gold border and inks
 *  props   pearls and rose petals on the satin
 */

const GOLD = { color: "#c79a45", metalness: 0.9, roughness: 0.3 };

export const THEMES = {
  "heirloom-lace": {
    name: "Heirloom Lace",
    satin: ["#b9817f", "#d9aeb0", "#f1d1d3"],
    paper: { color: "#f7f5f1", roughness: 0.9 },
    liner: { color: "#f3d9d8", metalness: 0, roughness: 0.92 },
    lace: { color: "#f6f3ee" },
    seal: GOLD,
    card: { paper: "#fdfcf9", border: "#c39a48", inks: ["#7a5e1f", "#1c1c1c", "#5e5e5e", "#1c1c1c"] },
    props: { pearls: "#f7f2ec", petals: "#f3c4ca" },
  },
  "modern-royalty": {
    name: "Modern Royalty",
    satin: ["#a9aaae", "#d9dadd", "#f6f6f7"],
    paper: { color: "#fbfbf9", roughness: 0.85 },
    liner: { color: "#d6b061", metalness: 1, roughness: 0.28 },
    lace: null,
    seal: GOLD,
    card: { paper: "#fdfcf9", border: "#c39a48", inks: ["#7a5e1f", "#1c1c1c", "#5e5e5e", "#1c1c1c"] },
    props: { pearls: null, petals: null },
  },
  "garden-romance": {
    name: "Garden Romance",
    satin: ["#5f725a", "#8b9e84", "#b3c2aa"],
    paper: { color: "#9db095", roughness: 0.95 },
    liner: { color: "#d8a07e", metalness: 1, roughness: 0.32 },
    lace: null,
    seal: { color: "#b9714d", metalness: 0.85, roughness: 0.32 },
    card: { paper: "#fdfcf8", border: "#b98466", inks: ["#7d5a45", "#24301f", "#5c6358", "#24301f"] },
    props: { pearls: null, petals: "#f7f2ea" },
  },
  "velvet-vows": {
    name: "Velvet Vows",
    satin: ["#2c0910", "#561522", "#8a2b3b"],
    paper: { color: "#6b1a29", roughness: 1, sheen: "#d77a8a" },
    liner: { color: "#caa04c", metalness: 1, roughness: 0.38 },
    lace: null,
    seal: GOLD,
    card: { paper: "#fbf6ee", border: "#b8903f", inks: ["#7a5e1f", "#2a0d12", "#5a4a46", "#2a0d12"] },
    props: { pearls: null, petals: null },
  },
  "midnight-editorial": {
    name: "Midnight Editorial",
    satin: ["#080f20", "#17254a", "#3a5185"],
    paper: { color: "#1c2a4c", roughness: 0.8 },
    liner: { color: "#d0aa56", metalness: 1, roughness: 0.3 },
    lace: null,
    seal: GOLD,
    card: { paper: "#fbfaf6", border: "#b8903f", inks: ["#7a5e1f", "#121a2e", "#4f5566", "#121a2e"] },
    props: { pearls: null, petals: null },
  },
  "watercolour-coast": {
    name: "Watercolour Coast",
    satin: ["#a8abad", "#dcdfe0", "#f8f8f7"],
    paper: { color: "#f7f9f9", roughness: 0.92, wash: "#9cc6d0" },
    liner: { color: "#c9ced2", metalness: 1, roughness: 0.3 },
    lace: null,
    seal: { color: "#b8bdc3", metalness: 0.95, roughness: 0.28 },
    card: { paper: "#fdfdfb", border: "#9fb7bf", inks: ["#55707a", "#1d2b30", "#5b6669", "#1d2b30"] },
    props: { pearls: "#f4f3f0", petals: null },
  },
};

/* ------------------------------------------------------- colour helpers --- */

const hex = (h) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (rgb) => `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
const isHex = (s) => /^#?[0-9a-f]{6}$/i.test(s || "");
const norm = (s) => (s.startsWith("#") ? s : `#${s}`);

/** a satin ramp from one colour: deeper folds, paler highlights */
export const satinRamp = (c) => [mix(c, "#000000", 0.2), c, mix(c, "#ffffff", 0.45)];

/**
 * The theme for this page: a template preset plus the couple's overrides.
 * Overrides (prototype): ?theme=<key>&satin=<hex>&paper=<hex>&seal=<hex>&lace=<hex|none>
 */
export function resolveTheme(templateKey, search = typeof window !== "undefined" ? window.location.search : "") {
  const q = new URLSearchParams(search);
  const key = THEMES[q.get("theme")] ? q.get("theme") : THEMES[templateKey] ? templateKey : "heirloom-lace";
  const base = THEMES[key];
  const t = structuredClone(base);
  t.key = key;
  if (isHex(q.get("satin"))) t.satin = satinRamp(norm(q.get("satin")));
  if (isHex(q.get("paper"))) t.paper = { ...t.paper, color: norm(q.get("paper")), wash: undefined, sheen: undefined };
  if (isHex(q.get("seal"))) t.seal = { ...t.seal, color: norm(q.get("seal")) };
  if (q.get("lace") === "none") t.lace = null;
  else if (isHex(q.get("lace"))) t.lace = { color: norm(q.get("lace")) };
  return t;
}
