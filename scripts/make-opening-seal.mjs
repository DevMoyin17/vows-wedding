/**
 * Replaces the DM monogram baked into the 3D envelope-opening renders with
 * the couple's SJ monogram, without touching the rest of the seal.
 *
 *   node scripts/make-opening-seal.mjs
 *
 * The first run copies the DM assets to
 * media-originals/assets/heirloom/opening-dm/ (git-ignored) and then patches
 * the files under public/. Later runs reuse those originals, so the script is
 * safe to run again.
 *
 * The SJ letterforms come from public/assets/renders/monogram-sj.png
 * (scripts/make-monogram.mjs). The patch keeps the seal's own gold lighting by
 * matching a blurred copy of the target render, then fades out inside the
 * raised inner ring.
 */
import sharp from "sharp";
import { copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { PORTRAIT } from "../src/lib/openingGeometry.js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const DM = path.join(ROOT, "media-originals/assets/heirloom/opening-dm");
const STAGE = path.join(ROOT, "public/assets/heirloom/opening/stage");
const DESKTOP = path.join(ROOT, "public/assets/heirloom/opening/desktop");
const TILE = path.join(ROOT, "public/assets/renders/monogram-sj.png");
const Q = { quality: 90, alphaQuality: 100, effort: 6 };

const backup = async (src, dest) => {
  if (existsSync(dest)) return;
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(src, dest);
};

await backup(path.join(STAGE, "seal-main.webp"), path.join(DM, "stage/seal-main.webp"));
await backup(path.join(STAGE, "seal-chip.webp"), path.join(DM, "stage/seal-chip.webp"));
await backup(path.join(STAGE, "plate-default.webp"), path.join(DM, "stage/plate-default.webp"));
await backup(path.join(STAGE, "plate-reveal.webp"), path.join(DM, "stage/plate-reveal.webp"));
await backup(path.join(DESKTOP, "seal-main.webp"), path.join(DM, "desktop/seal-main.webp"));
await backup(path.join(DESKTOP, "seal-chip.webp"), path.join(DM, "desktop/seal-chip.webp"));
await backup(path.join(DESKTOP, "plate-default.webp"), path.join(DM, "desktop/plate-default.webp"));

const load = (file) => sharp(file).toBuffer();
const assemble = async (main, chip) =>
  sharp(await load(main)).composite([{ input: await load(chip) }]).png().toBuffer();

/** Scale each patch pixel so its blurred gold matches the target render. */
async function matchLighting(patch, target, sigma = 16) {
  const { data: p, info } = await sharp(patch).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pb = await sharp(patch).blur(sigma).ensureAlpha().raw().toBuffer();
  const tb = await sharp(target).blur(sigma).ensureAlpha().raw().toBuffer();
  const out = Buffer.from(p);
  for (let i = 0; i < info.width * info.height; i += 1) {
    const o = i * 4;
    if (p[o + 3] === 0) continue;
    for (let c = 0; c < 3; c += 1) {
      const ratio = Math.max(0.6, Math.min(1.6, tb[o + c] / Math.max(12, pb[o + c])));
      out[o + c] = Math.max(0, Math.min(255, Math.round(p[o + c] * ratio)));
    }
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** Gold plate + the SJ monogram, masked to a soft disc. */
async function makePatch(seal, { size, tileSize, radius, sigma = 16 }) {
  const tile = await sharp(TILE).resize(tileSize, tileSize, { fit: "fill" }).png().toBuffer();
  const canvasSize = Math.max(size, tileSize);
  const left = Math.round((canvasSize - tileSize) / 2);
  const canvas = await sharp({
    create: { width: canvasSize, height: canvasSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: tile, left, top: left }])
    .png()
    .toBuffer();
  const target = await sharp(seal).resize(canvasSize, canvasSize, { fit: "fill" }).png().toBuffer();
  const matched = await matchLighting(canvas, target, sigma);
  const mask = Buffer.from(
    `<svg width="${canvasSize}" height="${canvasSize}"><defs><radialGradient id="m"><stop offset=".78" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient></defs><circle cx="${canvasSize / 2}" cy="${canvasSize / 2}" r="${radius}" fill="url(#m)"/></svg>`,
  );
  const big = await sharp(matched).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const off = Math.round((canvasSize - size) / 2);
  return sharp(big).extract({ left: off, top: off, width: size, height: size }).png().toBuffer();
}

/** Put the patched seal back together and split it along the original crack. */
async function patchSeal(mainFile, chipFile, options) {
  const main = await load(mainFile);
  const chip = await load(chipFile);
  const assembled = await assemble(mainFile, chipFile);
  const patch = await makePatch(assembled, options);
  const patched = await sharp(assembled).composite([{ input: patch }]).png().toBuffer();
  const patchedMain = await sharp(patched)
    .composite([{ input: main, blend: "dest-in" }])
    .webp(Q)
    .toBuffer();
  const patchedChip = await sharp(patched)
    .composite([{ input: chip, blend: "dest-in" }])
    .webp(Q)
    .toBuffer();
  return { patched, patchedMain, patchedChip, patch, size: options.size };
}

/* portrait (mobile + tablet) */
const stage = await patchSeal(path.join(DM, "stage/seal-main.webp"), path.join(DM, "stage/seal-chip.webp"), {
  size: 168,
  tileSize: 190,
  radius: 48.5,
});
await sharp(stage.patchedMain).toFile(path.join(STAGE, "seal-main.webp"));
await sharp(stage.patchedChip).toFile(path.join(STAGE, "seal-chip.webp"));

/* the closed envelope: the idle frame has the seal baked into the photo */
{
  const plate = await sharp(path.join(DM, "stage/plate-default.webp"))
    .composite([{ input: stage.patched, left: 428 - 84, top: 807 - 84 }])
    .webp(Q)
    .toBuffer();
  await sharp(plate).toFile(path.join(STAGE, "plate-default.webp"));
}

/* "Card reveal": the broken seal on the satin, at 1.24× */
{
  const patch = await sharp(stage.patch)
    .resize(233, 233, { fit: "fill" })
    .png()
    .toBuffer();
  const mask = Buffer.from(
    '<svg width="233" height="233"><defs><radialGradient id="m"><stop offset=".82" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient></defs><circle cx="116.5" cy="116.5" r="68" fill="url(#m)"/></svg>',
  );
  const masked = await sharp(patch).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const reveal = await sharp(path.join(DM, "stage/plate-reveal.webp"))
    .composite([{ input: masked, left: 700 - 116, top: 1262 - 116 }])
    .webp(Q)
    .toBuffer();
  await sharp(reveal).toFile(path.join(STAGE, "plate-reveal.webp"));
}

/* desktop / wide opening */
const desk = await patchSeal(path.join(DM, "desktop/seal-main.webp"), path.join(DM, "desktop/seal-chip.webp"), {
  size: 148,
  tileSize: 167,
  radius: 41.5,
});
await sharp(desk.patchedMain).toFile(path.join(DESKTOP, "seal-main.webp"));
await sharp(desk.patchedChip).toFile(path.join(DESKTOP, "seal-chip.webp"));
{
  const plate = await sharp(path.join(DM, "desktop/plate-default.webp"))
    .composite([{ input: desk.patched, left: 765 - 74, top: 475 - 74 }])
    .webp(Q)
    .toBuffer();
  await sharp(plate).toFile(path.join(DESKTOP, "plate-default.webp"));
}

/* rack-focus frames: rebuild from the patched seal and reveal */
{
  const P = PORTRAIT;
  const R = P.SEAL_REST;
  const F = P.FLAP_INSIDE;
  const sealW = Math.round(P.SEAL_BOX.w * R.sx);
  const sealH = Math.round(P.SEAL_BOX.h * R.sy);
  const main = await sharp(path.join(STAGE, "seal-main.webp")).resize(sealW, sealH, { fit: "fill" }).toBuffer();
  const chipRot = await sharp(path.join(STAGE, "seal-chip.webp")).rotate(R.chip.rot, {
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  }).toBuffer();
  const cm = await sharp(chipRot).metadata();
  const chip = await sharp(chipRot)
    .resize(Math.round(cm.width * R.sx), Math.round(cm.height * R.sy), { fit: "fill" })
    .toBuffer();
  const cm2 = await sharp(chip).metadata();

  const world = await sharp(path.join(STAGE, "plate-start.webp"))
    .composite([
      { input: path.join(STAGE, "body.webp"), left: P.ENV.l, top: P.ENV.t },
      {
        input: await sharp(path.join(STAGE, "flap-inside.webp"))
          .resize(Math.round(F.w), Math.round(F.h), { fit: "fill" })
          .toBuffer(),
        left: Math.round(F.l),
        top: Math.round(F.t),
      },
      { input: main, left: Math.round(R.cx - sealW / 2), top: Math.round(R.cy - sealH / 2) },
      {
        input: chip,
        left: Math.round(R.cx + R.chip.x * P.SEAL_BOX.w * R.sx - cm2.width / 2),
        top: Math.round(R.cy + R.chip.y * P.SEAL_BOX.h * R.sy - cm2.height / 2),
      },
    ])
    .png()
    .toBuffer();
  await sharp(world).blur(6).webp({ quality: 80 }).toFile(path.join(STAGE, "world-blur.webp"));
  await sharp(path.join(STAGE, "plate-reveal.webp"))
    .blur(7.08)
    .webp({ quality: 80 })
    .toFile(path.join(STAGE, "reveal-blur.webp"));
}

console.log("SJ monogram applied to the 3D opening seal.");
