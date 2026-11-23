/**
 * Geometry of the opening pieces, in pixels of the 864×1536 Figma frame
 * renders (Figma frames 184:3388 Default · 184:3418 Flap opens · 184:3438
 * Card reveal). Shared by the asset cutter and (as percentages) the scene.
 */
export const IMG = { w: 864, h: 1536 };

// closed envelope in the Default frame
export const ENV = { l: 114, r: 750, t: 536, b: 976 };

// the closed lace flap: hinge corners, then down the right lace edge,
// the apex hidden under the seal, and back up the left lace edge
export const FLAP = [
  [110, 532], [754, 532],
  [756, 596], [724, 640], [688, 676], [656, 712], [616, 744], [576, 768],
  [546, 796], [514, 818], [494, 836], [462, 872], [428, 896],
  [394, 872], [362, 836], [332, 806], [298, 774], [258, 741], [214, 706],
  [174, 671], [139, 636], [108, 604],
];
export const FLAP_BOX = { l: 104, t: 532, r: 760, b: 900 };

// pocket mouth: hinge corners down to the V where the side flaps meet
export const POCKET_APEX = [432, 734];

// pocket paper the closed flap hides: the flap outline grown outward so it
// also covers the lace's baked-in shadow, clamped to the envelope
export const POCKET_BOX = { l: 114, t: 536, r: 750, b: 940 };

// wax seal in the Default frame
export const SEAL = { cx: 428, cy: 807, r: 70 };

// inside of the opened flap, from the Flap opens frame (apex up)
export const FLAP_IN_SRC = { apex: [436, 92], bl: [64, 560], br: [808, 560] };

// the invitation card in the Card reveal frame
export const CARD = { l: 153, t: 359, r: 716, b: 1148 };

// cut-out box of the two seal pieces and the crack between them (box px)
export const SEAL_BOX = { l: 344, t: 723, w: 168, h: 168 };
export const CRACK = [[114, -2], [106, 22], [115, 40], [102, 58], [111, 78], [100, 98], [114, 118], [128, 170]];

// Figma frames are 390×844 with the render object-cover'd: frame → image px
const COVER = 844 / 1536;
const OFFSET_X = (390 - 864 * COVER) / 2;
export const fromFrame = (x, y) => [(x - OFFSET_X) / COVER, y / COVER];

// Figma sparkles: 01a around the seal, 01c around the rising card
// [frame centre x, frame centre y, size px, rotation°]
export const SPARKLES_SEAL = [
  [230.4, 407.3, 18, -10], [156, 426, 12, 0], [256.8, 471.8, 10, -30], [179, 484, 8, 0], [209.5, 364.5, 9, 0],
];
export const SPARKLES_CARD = [[96, 206, 12, 0], [304.5, 164.5, 9, 0], [64, 384, 8, 0], [327, 347, 14, 0]];

// 01d text block on the card ("Card text (live)" 184:3440), as card fractions
export const CARD_TEXT = { left: 0.14, top: 0.2369, width: 0.7113 };

/* ---------------------------------------------- derived, shared positions --- */

export const FLAP_TIP = Math.max(...FLAP.map(([, y]) => y));
/** where the inside of the flap (cut from "Flap opens") lies once open */
export const FLAP_INSIDE = (() => {
  const sx = (ENV.r - ENV.l) / (FLAP_IN_SRC.br[0] - FLAP_IN_SRC.bl[0]);
  const sy = (FLAP_TIP - ENV.t) / (FLAP_IN_SRC.bl[1] - FLAP_IN_SRC.apex[1]);
  const w = (FLAP_IN_SRC.br[0] - FLAP_IN_SRC.bl[0] + 24) * sx;
  const h = (FLAP_IN_SRC.bl[1] - FLAP_IN_SRC.apex[1] + 12) * sy;
  return { l: ENV.l - 12 * sx, t: ENV.t - h, w, h };
})();

/** end camera: the open envelope lands on the "Card reveal" envelope
 *  (width 636 → 776 px, flap 360 → 414 px, hinge 536 → 510) */
export const END = { sx: 1.22, sy: 1.15, ox: 432, oy: 709.3 };
export const toWorld = (x, y) => [END.ox + (x - END.ox) / END.sx, END.oy + (y - END.oy) / END.sy];

/** the broken seal comes to rest where it lies in "Card reveal" */
export const SEAL_REST = (() => {
  const [cx, cy] = toWorld(700, 1262);
  return { cx, cy, sx: 1.24 / END.sx, sy: 1.24 / END.sy, chip: { x: 0.2, y: 0.04, rot: 16 } };
})();

/** shade inside the open mouth (top edge → pocket V) */
export const MOUTH_SHADE = [[0, "#d9d1ce"], [0.39, "#e6e0de"], [1, "#efebe9"]];
