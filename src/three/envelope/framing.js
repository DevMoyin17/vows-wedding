/**
 * Where things sit in the 3D world, derived from the Figma frames so the
 * 3D envelope lands where the design puts it on every screen.
 *
 * World: the envelope lies on the satin in the XY plane, centred on the
 * origin, 3 units wide; +Z points up at the camera, which looks straight
 * down like the Figma photography. Positions given in Figma render pixels
 * (openingGeometry's PORTRAIT / WIDE) are mapped through the render's
 * object-cover onto the canvas, exactly as the old image plates were.
 */

export const ENV_W = 3;
export const FOV = 26;
const TAN = Math.tan((FOV * Math.PI) / 360);

// layers of paper, bottom to top (world z)
export const Z = {
  satin: -0.02,
  back: 0, // back panel 0 → 0.004
  card: 0.008,
  pocket: 0.011, // front pocket 0.011 → 0.015
  bottomFlap: 0.0155, // 0.0155 → 0.0275 (domed)
  hinge: 0.012, // flap pivot; closed at hinge + FLAP_R, open at hinge − FLAP_R
  flapR: 0.0165,
};

/** the envelope, the seal and the card in world units, for one Figma layout */
export function envelopeDims(G) {
  const k = ENV_W / (G.ENV.r - G.ENV.l); // world units per render px
  const cx = (G.ENV.l + G.ENV.r) / 2;
  const cy = (G.ENV.t + G.ENV.b) / 2;
  const toW = (x, y) => [(x - cx) * k, -(y - cy) * k];
  const W = ENV_W;
  const H = (G.ENV.b - G.ENV.t) * k;
  const sealR = G.SEAL.r * k;
  const sealY = toW(0, G.SEAL.cy)[1];
  const vY = toW(0, G.POCKET_APEX[1])[1]; // the V of the open mouth
  const flapDepth = H / 2 - (sealY - 0.5 * sealR); // flap tip under the seal
  const bottomApexY = sealY + 0.25 * sealR; // bottom flap's creases meet under the seal
  // the card fits inside the envelope (portrait card, landscape envelope)
  const cardH = H * 0.93;
  const cardW = cardH * ((G.CARD.r - G.CARD.l) / (G.CARD.b - G.CARD.t));
  return { k, toW, W, H, sealR, sealY, vY, flapDepth, bottomApexY, cardH, cardW, lace: 0.108 * W };
}

/** top of the front pocket at x (the V edges of the mouth) */
export const pocketTop = (d, x) => d.vY + (Math.min(Math.abs(x), d.W / 2) / (d.W / 2)) * (d.H / 2 - d.vY);

/**
 * Camera framing for a canvas of w×h css px. The canvas is the Figma stage
 * (full screen on phones and tablets, the 16:9 stage on desktop), and the
 * render is object-cover'd onto it.
 */
export function framing({ width: w, height: h }, G, d, idleShiftPct = 0) {
  const c = Math.max(w / G.IMG.w, h / G.IMG.h); // css px per render px
  const upp = d.k / c; // world units per css px at z = 0
  const D = (h * upp) / (2 * TAN);
  const [x, y] = d.toW(G.IMG.w / 2, G.IMG.h / 2); // the canvas centre
  const idleY = (idleShiftPct / 100) * h * upp;

  // render px → world point on a plane z, seen by a camera {x, y, D}
  const unproject = (cam, px, py, z = 0) => {
    const per = ((cam.D - z) * 2 * TAN) / h; // world per css px at z
    return [cam.x + (px - G.IMG.w / 2) * c * per, cam.y - (py - G.IMG.h / 2) * c * per];
  };

  // the end camera (Figma END): zoom about its origin
  const s = (G.END.sx + G.END.sy) / 2;
  const [fx, fy] = d.toW(G.END.ox, G.END.oy);
  const end = { s, fx, fy, x: fx + (x - fx) / s, y: fy + (y - fy) / s, D: D / s };

  // the card at rest: Figma "Card reveal" card, as seen by the end camera
  const cardPx = (G.CARD.b - G.CARD.t) * c;
  const cardZ = end.D - (d.cardH * h) / (cardPx * 2 * TAN);
  const [cardX, cardY] = unproject(end, (G.CARD.l + G.CARD.r) / 2, (G.CARD.t + G.CARD.b) / 2, cardZ);

  // the broken seal at rest on the satin (Figma "Card reveal")
  const [sealX, sealY] = unproject(end, G.SEAL_TARGET.cx, G.SEAL_TARGET.cy, Z.satin);

  // how much of the satin the camera can ever see (at its widest)
  const view = { w: w * upp * 1.35, h: h * upp * 1.35, x, y: y + Math.min(0, idleY) };

  return { c, upp, D, x, y, idleY, end, card: { x: cardX, y: cardY, z: cardZ }, sealRest: { x: sealX, y: sealY }, view, toW: d.toW };
}
