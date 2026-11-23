/**
 * Geometry of the envelope-opening pieces, in pixels of the Figma renders.
 * Shared by the asset cutter (scripts/build-opening-layers.mjs) and, as
 * percentages, by the scene.
 *
 *  - PORTRAIT: the 864×1536 renders of the mobile and tablet frames
 *    (184:3388 Default · 184:3418 Flap opens · 184:3438 Card reveal).
 *  - WIDE: the 1536×864 render of the desktop Default frame (184:4007). The
 *    desktop opening plays on this photo, so its envelope never moves.
 */

/** the inside of the opened flap, cut from "Flap opens" (apex up) */
export const FLAP_IN_SRC = { apex: [436, 92], bl: [64, 560], br: [808, 560] };
/** the invitation card, cut from the portrait "Card reveal" */
export const CARD_SRC = { l: 153, t: 359, r: 716, b: 1148 };
/** shade inside the open mouth (top edge → pocket V) */
export const MOUTH_SHADE = [[0, "#d9d1ce"], [0.39, "#e6e0de"], [1, "#efebe9"]];

/** jagged crack across the seal's right side, in seal-box px (Figma 01a) */
const crackFor = (box) => {
  const s = box.w / 168;
  const c = box.w / 2;
  return [[30, -2], [22, 22], [31, 40], [18, 58], [27, 78], [16, 98], [30, 118], [44, 170]].map(([x, y]) => [
    Math.round(c + x * s),
    Math.round(y === 170 ? box.h + 2 : y * s),
  ]);
};

/* -------------------------------------------------- portrait renders --- */

const P = {
  key: "portrait",
  dir: "/assets/heirloom/opening/stage",
  IMG: { w: 864, h: 1536 },
  // closed envelope in the Default frame
  ENV: { l: 114, r: 750, t: 536, b: 976 },
  // the closed lace flap: hinge corners, down the right lace edge, the apex
  // hidden under the seal, and back up the left lace edge (kept loose)
  FLAP: [
    [110, 532], [754, 532],
    [756, 596], [724, 640], [688, 676], [656, 712], [616, 744], [576, 768],
    [546, 796], [514, 818], [494, 836], [462, 872], [428, 896],
    [394, 872], [362, 836], [332, 806], [298, 774], [258, 741], [214, 706],
    [174, 671], [139, 636], [108, 604],
  ],
  FLAP_BOX: { l: 104, t: 532, r: 760, b: 900 },
  // where the side pockets meet (the V of the open mouth)
  POCKET_APEX: [432, 734],
  POCKET_BOX: { l: 114, t: 536, r: 750, b: 940 },
  SEAL: { cx: 428, cy: 807, r: 70, shadow: 8 },
  // each lace band's run towards the flap tip (for filling in under the seal)
  LACE: { l: [[139, 636], [362, 836]], r: [[724, 640], [494, 836]] },
  // outward normals of the flap's lower edges
  NORMALS: { l: [-268, 286], r: [276, 294] },
  // a plain patch of flap paper: the grain source for the hidden pocket
  PAPER: { l: 318, t: 546, w: 240, h: 140 },
  // bottom-flap creases as seen below the lace, carried on to the V
  CREASES: [[[285, 770], [361, 689]], [[585, 770], [504, 690]]],
  // the card settles exactly on the "Card reveal" card
  CARD: CARD_SRC,
  CARD_IN: 0.72,
  CARD_TILT: 0,
  // end camera: the open envelope lands on the "Card reveal" envelope
  // (width 636 → 776 px, flap 360 → 414 px, hinge 536 → 510)
  END: { sx: 1.22, sy: 1.15, ox: 432, oy: 709.3 },
  // the broken seal in "Card reveal" (screen px, before the end camera)
  SEAL_TARGET: { cx: 700, cy: 1262, scale: 1.24 },
  reveal: true,
};

// Figma frames are 390×844 with the render object-cover'd: frame → image px
const COVER = 844 / 1536;
const OFFSET_X = (390 - 864 * COVER) / 2;
export const fromFrame = (x, y) => [(x - OFFSET_X) / COVER, y / COVER];
// Figma sparkles: 01a around the seal, 01c around the rising card
// [frame centre x, frame centre y, size px, rotation°] → image px
const toImg = ([x, y, size, rot]) => [...fromFrame(x, y), size / COVER, rot];
P.SPARKLES_SEAL = [
  [230.4, 407.3, 18, -10], [156, 426, 12, 0], [256.8, 471.8, 10, -30], [179, 484, 8, 0], [209.5, 364.5, 9, 0],
].map(toImg);
P.SPARKLES_CARD = [[96, 206, 12, 0], [304.5, 164.5, 9, 0], [64, 384, 8, 0], [327, 347, 14, 0]].map(toImg);

/* --------------------------------------------------- wide desktop render --- */

const Wd = {
  key: "wide",
  dir: "/assets/heirloom/opening/desktop",
  IMG: { w: 1536, h: 864 },
  ENV: { l: 468, r: 1068, t: 248, b: 612 },
  FLAP: [
    [464, 244], [1072, 244],
    [1074, 336], [1036, 354], [976, 384], [916, 420], [866, 450], [832, 480],
    [802, 505], [762, 520],
    [722, 505], [700, 486], [662, 454], [618, 424], [568, 394], [508, 364], [464, 340],
  ],
  FLAP_BOX: { l: 460, t: 244, r: 1078, b: 526 },
  POCKET_APEX: [768, 412],
  POCKET_BOX: { l: 468, t: 248, r: 1068, b: 560 },
  // the wide render's seal casts a longer shadow below it
  SEAL: { cx: 765, cy: 475, r: 60, shadow: 20 },
  LACE: { l: [[508, 364], [700, 486]], r: [[976, 384], [832, 480]] },
  NORMALS: { l: [-122, 192], r: [96, 144] },
  PAPER: { l: 650, t: 256, w: 220, h: 70 },
  CREASES: [[[630, 445], [701, 376]], [[905, 445], [834, 376]]],
  // card resting on the envelope at the size of the desktop "Card reveal"
  // (225:5547: 486×681 frame px → render px)
  CARD: { l: 537, t: 93, r: 1003, b: 747 },
  CARD_IN: 0.64,
  // the wide envelope is shallow: the card leans back as it slides out
  CARD_TILT: -45,
  END: { sx: 1, sy: 1, ox: 768, oy: 432 },
  // the broken seal comes to rest on the satin, bottom right (as in 225:5547)
  SEAL_TARGET: { cx: 978, cy: 812, scale: 1.0 },
  reveal: false,
};
// sparkles: the portrait ones, placed the same way around this envelope
{
  const k = (Wd.ENV.r - Wd.ENV.l) / (P.ENV.r - P.ENV.l);
  const pc = [(P.ENV.l + P.ENV.r) / 2, (P.ENV.t + P.ENV.b) / 2];
  const wc = [(Wd.ENV.l + Wd.ENV.r) / 2, (Wd.ENV.t + Wd.ENV.b) / 2];
  const sc = [P.SEAL.cx, P.SEAL.cy];
  const wsc = [Wd.SEAL.cx, Wd.SEAL.cy];
  const map = (origin, target) => ([x, y, s, r]) => [target[0] + (x - origin[0]) * k, target[1] + (y - origin[1]) * k, s * k, r];
  Wd.SPARKLES_SEAL = P.SPARKLES_SEAL.map(map(sc, wsc));
  Wd.SPARKLES_CARD = P.SPARKLES_CARD.map(map(pc, wc));
}

/* ------------------------------------------------------------ derived --- */

function derive(G) {
  const pad = 14;
  const SEAL_BOX = {
    l: G.SEAL.cx - G.SEAL.r - pad,
    t: G.SEAL.cy - G.SEAL.r - pad,
    w: 2 * (G.SEAL.r + pad),
    h: 2 * (G.SEAL.r + pad),
  };
  const FLAP_TIP = Math.max(...G.FLAP.map(([, y]) => y));
  // where the inside of the flap lies once it has turned 180°
  const sx = (G.ENV.r - G.ENV.l) / (FLAP_IN_SRC.br[0] - FLAP_IN_SRC.bl[0]);
  const sy = (FLAP_TIP - G.ENV.t) / (FLAP_IN_SRC.bl[1] - FLAP_IN_SRC.apex[1]);
  const fw = (FLAP_IN_SRC.br[0] - FLAP_IN_SRC.bl[0] + 24) * sx;
  const fh = (FLAP_IN_SRC.bl[1] - FLAP_IN_SRC.apex[1] + 12) * sy;
  const FLAP_INSIDE = { l: G.ENV.l - 12 * sx, t: G.ENV.t - fh, w: fw, h: fh };
  const toWorld = (x, y) => [G.END.ox + (x - G.END.ox) / G.END.sx, G.END.oy + (y - G.END.oy) / G.END.sy];
  const [rx, ry] = toWorld(G.SEAL_TARGET.cx, G.SEAL_TARGET.cy);
  const SEAL_REST = {
    cx: rx,
    cy: ry,
    sx: G.SEAL_TARGET.scale / G.END.sx,
    sy: G.SEAL_TARGET.scale / G.END.sy,
    chip: { x: 0.2, y: 0.04, rot: 16 },
  };
  return { ...G, SEAL_BOX, CRACK: crackFor(SEAL_BOX), FLAP_TIP, FLAP_INSIDE, SEAL_REST, toWorld };
}

export const PORTRAIT = derive(P);
export const WIDE = derive(Wd);
