/**
 * Cuts the envelope-opening layers out of the Figma frame renders.
 *
 *   node scripts/build-opening-layers.mjs
 *
 * Sources (Figma "04 · Heirloom Lace", mobile 390×844 frames, exported at
 * 864×1536): media-originals/figma/mobile/*.png (not committed; export the Figma frames there)
 * Output: public/assets/heirloom/opening/stage/*.webp — the tablet and
 * desktop keyframes use these same renders (tablet at 768 px wide, desktop
 * in a centred 746×900 stage) — and opening/desktop/ for the wide Default.
 *
 * Every layer keeps the exact pixels of the Figma renders; the only
 * synthesised pixels are the paper and lace hidden under the wax seal,
 * continued along each lace band so the seal can lift off cleanly.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import * as G from "../src/lib/openingGeometry.js";

const SRC = "media-originals/figma/mobile";
const OUT = "public/assets/heirloom/opening/stage";
const DESKTOP = "media-originals/figma/desktop";
const OUT_WIDE = "public/assets/heirloom/opening/desktop";
const Q = { quality: 90, alphaQuality: 100, effort: 6 };

await mkdir(OUT, { recursive: true });
await mkdir(OUT_WIDE, { recursive: true });

const rgba = async (file) => {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};
const toWebp = (img, out, extract) => {
  let p = sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } });
  if (extract) p = p.extract(extract);
  return p.webp(Q).toFile(out);
};
const polySvg = (pts, w, h, blur = 0) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      (blur ? `<filter id="f"><feGaussianBlur stdDeviation="${blur}"/></filter>` : "") +
      `<polygon points="${pts.map((p) => p.join(",")).join(" ")}" fill="#fff"${blur ? ' filter="url(#f)"' : ""}/></svg>`,
  );
/** Keep only the pixels inside a polygon (soft edge), then crop. */
async function cutPolygon(img, pts, box, out, blur = 0.6) {
  const base = sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } });
  const masked = await base
    .composite([{ input: polySvg(pts, img.w, img.h, blur), blend: "dest-in" }])
    .png()
    .toBuffer();
  await sharp(masked)
    .extract({ left: box.l, top: box.t, width: box.r - box.l, height: box.b - box.t })
    .webp(Q)
    .toFile(out);
}

/* ---------------------------------------------------------- plates --- */

const def = await rgba(`${SRC}/01-default.png`);
await toWebp(def, `${OUT}/plate-default.webp`);
// "Card reveal" without its card: the live card (cut from this same frame)
// is the only card on screen, so nothing doubles while it lands. Under the
// card each row blends between the pixels just left and right of it.
const reveal = await rgba(`${SRC}/01d-card-reveal.png`);
{
  const C = G.CARD;
  const avg = (x, y, c) => {
    let v = 0;
    let n = 0;
    for (let dy = -6; dy <= 6; dy += 1) {
      for (let dx = 0; dx < 3; dx += 1) {
        const yy = Math.max(0, Math.min(reveal.h - 1, y + dy));
        v += reveal.data[(yy * reveal.w + x + dx) * 4 + c];
        n += 1;
      }
    }
    return v / n;
  };
  const edges = [];
  for (let y = C.t; y < C.b; y += 1) {
    edges.push([0, 1, 2].map((c) => [avg(C.l - 4, y, c), avg(C.r + 1, y, c)]));
  }
  for (let y = C.t; y < C.b; y += 1) {
    const e = edges[y - C.t];
    for (let x = C.l; x < C.r; x += 1) {
      const t = (x - C.l) / (C.r - C.l);
      const i = (y * reveal.w + x) * 4;
      for (let c = 0; c < 3; c += 1) reveal.data[i + c] = Math.round(e[c][0] * (1 - t) + e[c][1] * t);
    }
  }
  await toWebp(reveal, `${OUT}/plate-reveal.webp`);
}

/* ------------------------------------- seal-free Default (inpainted) --- */
// Under the seal the two lace bands run on towards the flap tip. Each hole
// pixel takes the pixel one seal-width back along its band, so the lace
// pattern, the paper between the bands and the pocket below all continue.
const norm = ([x, y]) => {
  const l = Math.hypot(x, y);
  return [x / l, y / l];
};
const dL = norm([362 - 139, 836 - 636]);
const dR = norm([494 - 724, 836 - 640]);
const R = G.SEAL.r + 8;
const K = 2 * R + 12;
const clean = { data: Buffer.from(def.data), w: def.w, h: def.h };
const sample = (x, y, c) => {
  const xi = Math.max(0, Math.min(def.w - 1, Math.round(x)));
  const yi = Math.max(0, Math.min(def.h - 1, Math.round(y)));
  return def.data[(yi * def.w + xi) * 4 + c];
};
for (let y = G.SEAL.cy - R; y <= G.SEAL.cy + R; y += 1) {
  for (let x = G.SEAL.cx - R; x <= G.SEAL.cx + R; x += 1) {
    const d = Math.hypot(x - G.SEAL.cx, y - G.SEAL.cy);
    if (d > R) continue;
    const seam = Math.max(0, Math.min(1, (x - G.SEAL.cx + 6) / 12)); // 0 = left band, 1 = right
    const edge = Math.max(0, Math.min(1, (R - d) / 7)); // feather into the photo
    const i = (y * def.w + x) * 4;
    for (let c = 0; c < 3; c += 1) {
      const l = sample(x - K * dL[0], y - K * dL[1], c);
      const r = sample(x - K * dR[0], y - K * dR[1], c);
      const fill = l * (1 - seam) + r * seam;
      clean.data[i + c] = Math.round(fill * edge + def.data[i + c] * (1 - edge));
    }
  }
}
await toWebp(clean, `${OUT}/plate-start.webp`);

/* ------------------------------- pocket paper under the closed flap --- */
// The paper the flap hides is rebuilt from the real envelope: fine paper
// grain from a plain patch of the same stock (at its true scale, mirrored
// tiles so there are no seams), toned column by column to the pocket paper
// just below the lace, with the two bottom-flap creases carried on to the V.
{
  const B = G.POCKET_BOX;
  const w = B.r - B.l;
  const h = B.b - B.t;
  const src = clean;
  const px = (x, y, c) => {
    const xi = Math.max(0, Math.min(src.w - 1, Math.round(x)));
    const yi = Math.max(0, Math.min(src.h - 1, Math.round(y)));
    return src.data[(yi * src.w + xi) * 4 + c];
  };
  // plain flap paper between the lace bands: the grain source
  const T = { l: 318, t: 546, w: 240, h: 140 };
  const tileMean = [0, 0, 0];
  for (let y = 0; y < T.h; y += 1) for (let x = 0; x < T.w; x += 1) for (let c = 0; c < 3; c += 1) tileMean[c] += px(T.l + x, T.t + y, c);
  tileMean.forEach((v, c) => (tileMean[c] = v / (T.w * T.h)));
  const mirror = (v, n) => {
    const m = ((v % (2 * n)) + 2 * n) % (2 * n);
    return m < n ? m : 2 * n - 1 - m;
  };
  const lowerEdge = (x) => {
    const pts = G.FLAP.slice(2);
    let best = G.ENV.t;
    for (let i = 0; i < pts.length - 1; i += 1) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      if ((x - x0) * (x - x1) <= 0 && x0 !== x1) best = Math.max(best, y0 + ((x - x0) / (x1 - x0)) * (y1 - y0));
    }
    return best;
  };
  // pocket tone per column, read just below the lace and smoothed
  const raw = [];
  for (let x = 0; x < w; x += 1) {
    const gx = B.l + x;
    const y0 = Math.min(G.ENV.b - 24, lowerEdge(gx) + 50);
    const acc = [0, 0, 0];
    for (let k = 0; k < 16; k += 1) for (let c = 0; c < 3; c += 1) acc[c] += px(gx, y0 + k, c);
    raw.push(acc.map((v) => v / 16));
  }
  const tone = raw.map((_, x) => {
    const acc = [0, 0, 0];
    let n = 0;
    for (let k = -40; k <= 40; k += 1) {
      const r = raw[Math.max(0, Math.min(w - 1, x + k))];
      for (let c = 0; c < 3; c += 1) acc[c] += r[c];
      n += 1;
    }
    return acc.map((v) => v / n);
  });
  // bottom-flap creases: as seen below the lace, continued to the pocket V
  const creases = [
    [[285, 770], [361, 689]],
    [[585, 770], [504, 690]],
  ];
  const creaseAt = (x, y) => {
    let v = 0;
    for (const [[x0, y0], [x1, y1]] of creases) {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len2 = dx * dx + dy * dy;
      const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / len2));
      const d = Math.hypot(x - (x0 + t * dx), y - (y0 + t * dy));
      const side = (x - x0) * dy - (y - y0) * dx > 0 ? 1 : -1;
      v += d < 1.6 ? -9 : d < 3 && side > 0 ? 4 : 0;
    }
    return v;
  };
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const gx = B.l + x;
      const gy = B.t + y;
      const tx = T.l + mirror(x, T.w);
      const ty = T.t + mirror(y, T.h);
      const cr = creaseAt(gx, gy);
      // a soft shade just under the pocket's V edge
      const vY = G.ENV.t + ((gx < G.POCKET_APEX[0] ? gx - G.ENV.l : G.ENV.r - gx) / (G.POCKET_APEX[0] - G.ENV.l)) * (G.POCKET_APEX[1] - G.ENV.t);
      const under = gy - vY;
      const shade = under > 0 && under < 10 ? -6 * (1 - under / 10) : 0;
      const o = (y * w + x) * 4;
      for (let c = 0; c < 3; c += 1) {
        const v = tone[x][c] + 0.7 * (px(tx, ty, c) - tileMean[c]) + cr + shade;
        out[o + c] = Math.max(0, Math.min(255, Math.round(v)));
      }
      out[o + 3] = 255;
    }
  }
  const nL = norm([-268, 286]);
  const nR = norm([276, 294]);
  const grown = G.FLAP.slice(2).map(([x, y]) => {
    const n = x < G.POCKET_APEX[0] - 2 ? nL : x > G.POCKET_APEX[0] + 2 ? nR : [0, 1];
    return [x + n[0] * 34, y + n[1] * 34];
  });
  const region = [[G.ENV.l, G.ENV.t], G.POCKET_APEX, [G.ENV.r, G.ENV.t], ...grown]
    .map(([x, y]) => [Math.min(G.ENV.r, Math.max(G.ENV.l, x)) - B.l, Math.max(G.ENV.t, y) - B.t]);
  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .composite([{ input: polySvg(region, w, h, 3), blend: "dest-in" }])
    .webp(Q)
    .toFile(`${OUT}/pocket.webp`);
}

/* -------------------------------------------------------- the flap --- */
await cutPolygon(clean, G.FLAP, G.FLAP_BOX, `${OUT}/flap.webp`);

/* ------------------------------------------- inside of the open flap --- */
{
  const b = await rgba(`${SRC}/01b-flap-opens.png`);
  const f = G.FLAP_IN_SRC;
  const grow = 12;
  const pts = [
    [f.apex[0], f.apex[1] - grow],
    [f.br[0] + grow, f.br[1]],
    [f.bl[0] - grow, f.bl[1]],
  ];
  const box = { l: f.bl[0] - grow, t: f.apex[1] - grow, r: f.br[0] + grow, b: f.br[1] };
  await cutPolygon(b, pts, box, `${OUT}/flap-inside.webp`, 1);
}

/* ---------------------------------------------------- the wax seal --- */
// Alpha from the wax colour (gold vs. the neutral paper and lace), so the
// wavy wax edge is kept exactly; then split along a jagged crack.
{
  const S = G.SEAL;
  const pad = 14;
  const box = { l: S.cx - S.r - pad, t: S.cy - S.r - pad, w: 2 * (S.r + pad), h: 2 * (S.r + pad) };
  const seal = { data: Buffer.alloc(box.w * box.h * 4), w: box.w, h: box.h };
  for (let y = 0; y < box.h; y += 1) {
    for (let x = 0; x < box.w; x += 1) {
      const gx = box.l + x;
      const gy = box.t + y;
      const si = (gy * def.w + gx) * 4;
      const o = (y * box.w + x) * 4;
      const [r, g, bl] = [def.data[si], def.data[si + 1], def.data[si + 2]];
      const warm = r - bl; // wax ≫ 40, paper/lace ≈ 0–12
      let a = Math.max(0, Math.min(1, (warm - 22) / 22));
      if (Math.hypot(gx - S.cx, gy - S.cy) > S.r + 4) a = 0;
      seal.data[o] = r;
      seal.data[o + 1] = g;
      seal.data[o + 2] = bl;
      seal.data[o + 3] = Math.round(a * 255);
    }
  }
  const full = await sharp(seal.data, { raw: { width: box.w, height: box.h, channels: 4 } }).png().toBuffer();
  const c = box.w / 2;
  // crack from the upper right rim down to the lower right rim (Figma 01a)
  const crack = [
    [c + 30, -2], [c + 22, 22], [c + 31, 40], [c + 18, 58], [c + 27, 78],
    [c + 16, 98], [c + 30, 118], [c + 44, box.h + 2],
  ];
  const chipPts = [...crack, [box.w + 2, box.h + 2], [box.w + 2, -2]];
  const mainPts = [[-2, -2], ...crack, [-2, box.h + 2]];
  for (const [name, pts] of [["seal-main", mainPts], ["seal-chip", chipPts]]) {
    await sharp(full)
      .composite([{ input: polySvg(pts, box.w, box.h, 0.4), blend: "dest-in" }])
      .webp(Q)
      .toFile(`${OUT}/${name}.webp`);
  }
  console.log("seal box", box, "crack", JSON.stringify(crack));
}

/* -------------------------------------------------------- the card --- */
await sharp(`${SRC}/01d-card-reveal.png`)
  .extract({ left: G.CARD.l, top: G.CARD.t, width: G.CARD.r - G.CARD.l, height: G.CARD.b - G.CARD.t })
  .webp(Q)
  .toFile(`${OUT}/card.webp`);


/* ------------------------------------------------ rack-focus frames --- */
// For the hand-off to "Card reveal" the background pulls out of focus while
// the card is close to the camera, the scene swaps, and focus returns. Both
// blurred frames are rendered here so the browser only cross-fades.
{
  const blur = 6;
  const F = G.FLAP_INSIDE;
  const R = G.SEAL_REST;
  const B = G.POCKET_BOX;
  const shadeStops = G.MOUTH_SHADE.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("");
  const mouth = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${G.IMG.w}" height="${G.IMG.h}">` +
      `<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="${G.ENV.t}" x2="0" y2="${G.POCKET_APEX[1]}">${shadeStops}</linearGradient></defs>` +
      `<polygon points="${G.ENV.l},${G.ENV.t} ${G.ENV.r},${G.ENV.t} ${G.POCKET_APEX.join(",")}" fill="url(#g)"/></svg>`,
  );
  const flapIn = await sharp(`${OUT}/flap-inside.webp`).resize(Math.round(F.w), Math.round(F.h), { fit: "fill" }).toBuffer();
  const sealW = Math.round(G.SEAL_BOX.w * R.sx);
  const sealH = Math.round(G.SEAL_BOX.h * R.sy);
  const main = await sharp(`${OUT}/seal-main.webp`).resize(sealW, sealH, { fit: "fill" }).toBuffer();
  const chipRot = await sharp(`${OUT}/seal-chip.webp`).rotate(R.chip.rot, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  const chipMeta = await sharp(chipRot).metadata();
  const chip = await sharp(chipRot)
    .resize(Math.round(chipMeta.width * R.sx), Math.round(chipMeta.height * R.sy), { fit: "fill" })
    .toBuffer();
  const chipM = await sharp(chip).metadata();
  const world = await sharp(`${OUT}/plate-start.webp`)
    .composite([
      { input: mouth },
      { input: `${OUT}/pocket.webp`, left: B.l, top: B.t },
      { input: flapIn, left: Math.round(F.l), top: Math.round(F.t) },
      { input: main, left: Math.round(R.cx - sealW / 2), top: Math.round(R.cy - sealH / 2) },
      {
        input: chip,
        left: Math.round(R.cx + R.chip.x * G.SEAL_BOX.w * R.sx - chipM.width / 2),
        top: Math.round(R.cy + R.chip.y * G.SEAL_BOX.h * R.sy - chipM.height / 2),
      },
    ])
    .png()
    .toBuffer();
  await sharp(world).blur(blur).webp({ quality: 80 }).toFile(`${OUT}/world-blur.webp`);
  // the world is on screen ×1.2 at this point, so the reveal gets the same apparent blur
  await sharp(reveal.data, { raw: { width: reveal.w, height: reveal.h, channels: 4 } })
    .blur(blur * 1.18)
    .webp({ quality: 80 })
    .toFile(`${OUT}/reveal-blur.webp`);
}

/* ------------------------------------------- desktop wide Default --- */
// Figma 184:4007 shows this 16:9 render full-bleed; the keyframes (225:5505…)
// keep it behind the stage as the "Satin fill (wide render)", blurred 3 px.
await sharp(`${DESKTOP}/01-default-wide.png`).webp(Q).toFile(`${OUT_WIDE}/wide.webp`);
await sharp(`${DESKTOP}/01-default-wide.png`).blur(3).webp({ quality: 82 }).toFile(`${OUT_WIDE}/wide-blur.webp`);

console.log("opening layers written to", OUT, "and", OUT_WIDE);
