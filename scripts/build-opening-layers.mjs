/**
 * Cuts the envelope-opening layers out of the Figma frame renders.
 *
 *   node scripts/build-opening-layers.mjs
 *
 * Sources (Figma "04 · Heirloom Lace"), git-ignored, export them first:
 *   media-originals/figma/mobile/*.png   864×1536 renders of the mobile frames
 *                                        (tablet uses the same renders)
 *   media-originals/figma/desktop/01-default-wide.png   1536×864 desktop render
 * Output:
 *   public/assets/heirloom/opening/stage/    portrait layers (mobile, tablet)
 *   public/assets/heirloom/opening/desktop/  wide layers (desktop)
 *
 * Every layer keeps the exact pixels of the Figma renders. The only
 * synthesised pixels are those the flap and seal hide: the lace and paper
 * under the seal (continued along each lace band); the open envelope's body
 * is recreated whole from the photo's paper tone, grain and folds.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { PORTRAIT, WIDE, FLAP_IN_SRC, CARD_SRC } from "../src/lib/openingGeometry.js";

const SRC = "media-originals/figma/mobile";
const DESKTOP = "media-originals/figma/desktop";
const PUBLIC = "public";
const Q = { quality: 90, alphaQuality: 100, effort: 6 };

const rgba = async (file) => {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};
const raw = (img) => sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } });
const polySvg = (pts, w, h, blur = 0) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      (blur ? `<filter id="f"><feGaussianBlur stdDeviation="${blur}"/></filter>` : "") +
      `<polygon points="${pts.map((p) => p.join(",")).join(" ")}" fill="#fff"${blur ? ' filter="url(#f)"' : ""}/></svg>`,
  );
/** Keep only the pixels inside a polygon (soft edge), then crop. */
async function cutPolygon(img, pts, box, out, blur = 0.6) {
  const masked = await raw(img)
    .composite([{ input: polySvg(pts, img.w, img.h, blur), blend: "dest-in" }])
    .png()
    .toBuffer();
  await sharp(masked)
    .extract({ left: box.l, top: box.t, width: box.r - box.l, height: box.b - box.t })
    .webp(Q)
    .toFile(out);
}
const norm = ([x, y]) => {
  const l = Math.hypot(x, y);
  return [x / l, y / l];
};
const sampler = (img) => (x, y, c) => {
  const xi = Math.max(0, Math.min(img.w - 1, Math.round(x)));
  const yi = Math.max(0, Math.min(img.h - 1, Math.round(y)));
  return img.data[(yi * img.w + xi) * 4 + c];
};

/**
 * The envelope layers of one Default render: the plate itself, the plate
 * with the seal lifted off, the lace flap, the open envelope's body and
 * the two pieces of the wax seal.
 */
async function cutEnvelope(G, file, out) {
  await mkdir(out, { recursive: true });
  const def = await rgba(file);
  await raw(def).webp(Q).toFile(`${out}/plate-default.webp`);

  /* seal-free plate: under the seal the two lace bands run on towards the
     flap tip, so each hidden pixel takes the pixel one seal-width back along
     its band — lace, the paper between the bands and the pocket continue */
  const dL = norm([G.LACE.l[1][0] - G.LACE.l[0][0], G.LACE.l[1][1] - G.LACE.l[0][1]]);
  const dR = norm([G.LACE.r[1][0] - G.LACE.r[0][0], G.LACE.r[1][1] - G.LACE.r[0][1]]);
  const R = G.SEAL.r + G.SEAL.shadow;
  const K = 2 * R + 12;
  const at = sampler(def);
  const clean = { data: Buffer.from(def.data), w: def.w, h: def.h };
  for (let y = G.SEAL.cy - R; y <= G.SEAL.cy + R; y += 1) {
    for (let x = G.SEAL.cx - R; x <= G.SEAL.cx + R; x += 1) {
      const d = Math.hypot(x - G.SEAL.cx, y - G.SEAL.cy);
      if (d > R) continue;
      const seam = Math.max(0, Math.min(1, (x - G.SEAL.cx + 6) / 12)); // 0 = left band, 1 = right
      const edge = Math.max(0, Math.min(1, (R - d) / 7)); // feather into the photo
      const i = (y * def.w + x) * 4;
      for (let c = 0; c < 3; c += 1) {
        const fill = at(x - K * dL[0], y - K * dL[1], c) * (1 - seam) + at(x - K * dR[0], y - K * dR[1], c) * seam;
        clean.data[i + c] = Math.round(fill * edge + def.data[i + c] * (1 - edge));
      }
    }
  }
  // the flap keeps its lace overhang; the plate under it must not
  await cutPolygon(clean, G.FLAP, G.FLAP_BOX, `${out}/flap.webp`);
  const plate = { data: Buffer.from(clean.data), w: clean.w, h: clean.h };
  {
    const B = G.FLAP_BOX;
    const E = G.ENV;
    const put = (x, y, sx, sy) => {
      const i = (y * plate.w + x) * 4;
      const j = (sy * plate.w + sx) * 4;
      for (let c = 0; c < 3; c += 1) plate.data[i + c] = clean.data[j + c];
    };
    for (let y = B.t - 2; y < B.b; y += 1) {
      for (let x = B.l - 2; x < E.l; x += 1) put(x, y, 2 * (B.l - 3) - x, y);
      for (let x = E.r; x < B.r + 2; x += 1) put(x, y, 2 * (B.r + 3) - x, y);
    }
    for (let y = B.t - 2; y < E.t; y += 1) for (let x = B.l - 2; x < B.r + 2; x += 1) put(x, y, x, 2 * (B.t - 3) - y);
  }
  await raw(plate).webp(Q).toFile(`${out}/plate-start.webp`);

  /* the open envelope's body, recreated whole: the paper tone is a smooth
     surface fitted to the pocket paper visible in the photo, carried across
     the entire envelope; real paper grain on top; crisp folds for the bottom
     flap and the side flaps' V; and above the V the inside of the same paper
     in shade. One piece, so nothing is cut or joined. */
  {
    const E = G.ENV;
    const w = E.r - E.l;
    const h = E.b - E.t;
    const px = sampler(clean);
    const lowerEdge = (x) => {
      const pts = G.FLAP.slice(2);
      let best = E.t;
      for (let i = 0; i < pts.length - 1; i += 1) {
        const [x0, y0] = pts[i];
        const [x1, y1] = pts[i + 1];
        if ((x - x0) * (x - x1) <= 0 && x0 !== x1) best = Math.max(best, y0 + ((x - x0) / (x1 - x0)) * (y1 - y0));
      }
      return best;
    };
    // full fold lines of the bottom flap: from near the bottom corners up to the V
    const folds = G.CREASES.map(([[x0, y0], [x1, y1]]) => {
      const yEnd = E.b - h * 0.07;
      const t = (yEnd - y1) / (y0 - y1);
      return [[x1 + (x0 - x1) * t, yEnd], [x1, y1]];
    });
    const segDist = (x, y, [[x0, y0], [x1, y1]]) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy)));
      return {
        d: Math.hypot(x - (x0 + t * dx), y - (y0 + t * dy)),
        side: (x - x0) * dy - (y - y0) * dx > 0 ? 1 : -1,
        inner: t > 0.01 && t < 0.99,
      };
    };

    // fit tone(x, y) = quadratic surface to the visible pocket paper
    const reach = (E.b - E.t) * 0.12;
    const feats = (x, y) => {
      const u = (x - (E.l + E.r) / 2) / w;
      const v = (y - (E.t + E.b) / 2) / h;
      return [1, u, v, u * u, u * v, v * v];
    };
    const AtA = Array.from({ length: 6 }, () => new Array(6).fill(0));
    const Atb = Array.from({ length: 6 }, () => [0, 0, 0]);
    for (let y = E.t + 8; y < E.b - 8; y += 2) {
      for (let x = E.l + 8; x < E.r - 8; x += 2) {
        if (y < lowerEdge(x) + reach) continue;
        if (folds.some((f) => segDist(x, y, f).d < 6)) continue;
        const f = feats(x, y);
        for (let i = 0; i < 6; i += 1) {
          for (let j = 0; j < 6; j += 1) AtA[i][j] += f[i] * f[j];
          for (let c = 0; c < 3; c += 1) Atb[i][c] += f[i] * px(x, y, c);
        }
      }
    }
    const solve = (A, bcol) => {
      const n = 6;
      const M = A.map((row, i) => [...row, bcol[i]]);
      for (let i = 0; i < n; i += 1) {
        let p = i;
        for (let r = i + 1; r < n; r += 1) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
        [M[i], M[p]] = [M[p], M[i]];
        for (let r = 0; r < n; r += 1) {
          if (r === i) continue;
          const k = M[r][i] / M[i][i];
          for (let c = i; c <= n; c += 1) M[r][c] -= k * M[i][c];
        }
      }
      return M.map((row, i) => row[n] / row[i]);
    };
    const coef = [0, 1, 2].map((c) => solve(AtA, Atb.map((r) => r[c])));
    const tone = (x, y, c) => feats(x, y).reduce((s, f, i) => s + f * coef[c][i], 0);

    // paper grain: plain patch of the same stock, mirrored tiles, true scale
    // grain only: the tile minus its own local shading, so repeats can't band
    const T = G.PAPER;
    const grainTile = new Float32Array(T.w * T.h * 3);
    {
      const r = 6;
      for (let y = 0; y < T.h; y += 1) {
        for (let x = 0; x < T.w; x += 1) {
          for (let c = 0; c < 3; c += 1) {
            let sum = 0;
            let n = 0;
            for (let dy = -r; dy <= r; dy += 2) {
              for (let dx = -r; dx <= r; dx += 2) {
                const xx = Math.max(0, Math.min(T.w - 1, x + dx));
                const yy = Math.max(0, Math.min(T.h - 1, y + dy));
                sum += px(T.l + xx, T.t + yy, c);
                n += 1;
              }
            }
            grainTile[(y * T.w + x) * 3 + c] = px(T.l + x, T.t + y, c) - sum / n;
          }
        }
      }
    }
    const mirror = (v, n) => {
      const m = ((v % (2 * n)) + 2 * n) % (2 * n);
      return m < n ? m : 2 * n - 1 - m;
    };

    const [ax, ay] = G.POCKET_APEX;
    const vAt = (x) => E.t + ((x < ax ? x - E.l : E.r - x) / (ax - E.l)) * (ay - E.t);
    const buf = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const gx = E.l + x + 0.5;
        const gy = E.t + y + 0.5;
        const above = vAt(gx) - gy; // > 0 inside the open mouth
        let light = 0;
        let mul = 1;
        if (above > 0) {
          // inside of the back panel: the same paper, in the envelope's shade
          const depth = Math.min(1, (gy - E.t) / (ay - E.t));
          mul = 0.91 + 0.065 * depth;
          light += above < 9 ? -10 * (1 - above / 9) : 0; // the side flaps' edge casts a soft shadow
          light += gy - E.t < 2 ? 5 : 0; // the back panel's top rim
        } else {
          light += -above < 1.6 ? 6 : 0; // the side flaps' cut edge catches the light
          for (const f of folds) {
            const { d, side, inner } = segDist(gx, gy, f);
            if (!inner) continue;
            light += d < 1.2 ? -10 * (1 - d / 1.2) : 0;
            light += side > 0 && d >= 1.2 && d < 3 ? 4 : 0;
          }
        }
        const o = (y * w + x) * 4;
        for (let c = 0; c < 3; c += 1) {
          // capped, so a stray speck in the sample can't repeat across the paper
          const grain = Math.max(-5, Math.min(5, 0.8 * grainTile[(mirror(y, T.h) * T.w + mirror(x, T.w)) * 3 + c]));
          buf[o + c] = Math.max(0, Math.min(255, Math.round(tone(gx, gy, c) * mul + grain + light)));
        }
        // a hair of antialiasing on the envelope's own outline
        const edge = Math.min(x + 0.5, y + 0.5, w - x - 0.5, h - y - 0.5);
        buf[o + 3] = Math.round(255 * Math.max(0, Math.min(1, edge)));
      }
    }
    await sharp(buf, { raw: { width: w, height: h, channels: 4 } }).webp(Q).toFile(`${out}/body.webp`);
  }


  /* the wax seal: alpha from the wax colour (gold vs. the neutral paper and
     lace) keeps the wavy wax edge exactly; split along the jagged crack */
  {
    const S = G.SEAL;
    const box = G.SEAL_BOX;
    const seal = { data: Buffer.alloc(box.w * box.h * 4), w: box.w, h: box.h };
    for (let y = 0; y < box.h; y += 1) {
      for (let x = 0; x < box.w; x += 1) {
        const gx = box.l + x;
        const gy = box.t + y;
        const si = (gy * def.w + gx) * 4;
        const o = (y * box.w + x) * 4;
        const [r, g, b] = [def.data[si], def.data[si + 1], def.data[si + 2]];
        let a = Math.max(0, Math.min(1, (r - b - 22) / 22)); // wax ≫ 40, paper/lace ≈ 0–12
        if (Math.hypot(gx - S.cx, gy - S.cy) > S.r + 4) a = 0;
        seal.data.set([r, g, b, Math.round(a * 255)], o);
      }
    }
    const full = await raw(seal).png().toBuffer();
    const chip = [...G.CRACK, [box.w + 2, box.h + 2], [box.w + 2, -2]];
    const main = [[-2, -2], ...G.CRACK, [-2, box.h + 2]];
    for (const [name, pts] of [["seal-main", main], ["seal-chip", chip]]) {
      await sharp(full)
        .composite([{ input: polySvg(pts, box.w, box.h, 0.4), blend: "dest-in" }])
        .webp(Q)
        .toFile(`${out}/${name}.webp`);
    }
  }
  return clean;
}

/* ================================================================ portrait */

const P = PORTRAIT;
const STAGE = `${PUBLIC}${P.dir}`;
await cutEnvelope(P, `${SRC}/01-default.png`, STAGE);

/* inside of the open flap, from "Flap opens" (shared with the wide layers) */
{
  const b = await rgba(`${SRC}/01b-flap-opens.png`);
  const f = FLAP_IN_SRC;
  const grow = 12;
  const pts = [[f.apex[0], f.apex[1] - grow], [f.br[0] + grow, f.br[1]], [f.bl[0] - grow, f.bl[1]]];
  const box = { l: f.bl[0] - grow, t: f.apex[1] - grow, r: f.br[0] + grow, b: f.br[1] };
  await cutPolygon(b, pts, box, `${STAGE}/flap-inside.webp`, 1);
}

/* the card, from "Card reveal" (shared with the wide layers) */
await sharp(`${SRC}/01d-card-reveal.png`)
  .extract({ left: CARD_SRC.l, top: CARD_SRC.t, width: CARD_SRC.r - CARD_SRC.l, height: CARD_SRC.b - CARD_SRC.t })
  .webp(Q)
  .toFile(`${STAGE}/card.webp`);

/* "Card reveal" without its card: the live card is the only card on
   screen, so nothing doubles while it lands. Under the card each row blends
   between the pixels just left and right of it. */
const reveal = await rgba(`${SRC}/01d-card-reveal.png`);
{
  const C = CARD_SRC;
  const avg = (x, y, c) => {
    let v = 0;
    let n = 0;
    for (let dy = -6; dy <= 6; dy += 1) {
      for (let dx = 0; dx < 3; dx += 1) {
        v += reveal.data[(Math.max(0, Math.min(reveal.h - 1, y + dy)) * reveal.w + x + dx) * 4 + c];
        n += 1;
      }
    }
    return v / n;
  };
  const edges = [];
  for (let y = C.t; y < C.b; y += 1) edges.push([0, 1, 2].map((c) => [avg(C.l - 4, y, c), avg(C.r + 1, y, c)]));
  for (let y = C.t; y < C.b; y += 1) {
    for (let x = C.l; x < C.r; x += 1) {
      const t = (x - C.l) / (C.r - C.l);
      const i = (y * reveal.w + x) * 4;
      for (let c = 0; c < 3; c += 1) reveal.data[i + c] = Math.round(edges[y - C.t][c][0] * (1 - t) + edges[y - C.t][c][1] * t);
    }
  }
  await raw(reveal).webp(Q).toFile(`${STAGE}/plate-reveal.webp`);
}

/* rack-focus frames (mobile/tablet): the background pulls out of focus
   while the card is close to the camera, the scene swaps, focus returns */
{
  const blur = 6;
  const F = P.FLAP_INSIDE;
  const R = P.SEAL_REST;
  const flapIn = await sharp(`${STAGE}/flap-inside.webp`).resize(Math.round(F.w), Math.round(F.h), { fit: "fill" }).toBuffer();
  const sealW = Math.round(P.SEAL_BOX.w * R.sx);
  const sealH = Math.round(P.SEAL_BOX.h * R.sy);
  const main = await sharp(`${STAGE}/seal-main.webp`).resize(sealW, sealH, { fit: "fill" }).toBuffer();
  const chipRot = await sharp(`${STAGE}/seal-chip.webp`).rotate(R.chip.rot, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  const cm = await sharp(chipRot).metadata();
  const chip = await sharp(chipRot).resize(Math.round(cm.width * R.sx), Math.round(cm.height * R.sy), { fit: "fill" }).toBuffer();
  const cm2 = await sharp(chip).metadata();
  const world = await sharp(`${STAGE}/plate-start.webp`)
    .composite([
      { input: `${STAGE}/body.webp`, left: P.ENV.l, top: P.ENV.t },
      { input: flapIn, left: Math.round(F.l), top: Math.round(F.t) },
      { input: main, left: Math.round(R.cx - sealW / 2), top: Math.round(R.cy - sealH / 2) },
      {
        input: chip,
        left: Math.round(R.cx + R.chip.x * P.SEAL_BOX.w * R.sx - cm2.width / 2),
        top: Math.round(R.cy + R.chip.y * P.SEAL_BOX.h * R.sy - cm2.height / 2),
      },
    ])
    .png()
    .toBuffer();
  await sharp(world).blur(blur).webp({ quality: 80 }).toFile(`${STAGE}/world-blur.webp`);
  await raw(reveal).blur(blur * 1.18).webp({ quality: 80 }).toFile(`${STAGE}/reveal-blur.webp`);
}

/* ==================================================================== wide */
// Desktop (184:4007): the whole opening plays on this one photo, so the
// envelope stays exactly where it is; the flap's inside and the card are the
// portrait layers above.
await cutEnvelope(WIDE, `${DESKTOP}/01-default-wide.png`, `${PUBLIC}${WIDE.dir}`);

console.log("opening layers written to", STAGE, "and", `${PUBLIC}${WIDE.dir}`);
