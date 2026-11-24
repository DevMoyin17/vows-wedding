/**
 * Source textures for the 3D entrance (src/three/envelope).
 *
 *  - satin-luma.webp: the clean satin from the Figma "Satin backdrop" render
 *    (158:45), as a neutral luminance map. The scene colours it per template,
 *    so one photo serves every satin colour.
 *
 * Source: media-originals/figma/3d/satin-white.png (git-ignored).
 * Run: node scripts/build-3d-textures.mjs
 */
import sharp from "sharp";

const SRC = "media-originals/figma/3d/satin-white.png";
const OUT = "public/assets/three";

// the left of the render is clear of the envelope
await sharp(SRC)
  .extract({ left: 0, top: 0, width: 820, height: 864 })
  .greyscale()
  .normalise({ lower: 1, upper: 99 })
  .webp({ quality: 88 })
  .toFile(`${OUT}/satin-luma.webp`);

console.log(`satin luminance map written to ${OUT}`);
