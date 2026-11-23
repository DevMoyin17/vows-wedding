import sharp from "sharp";
import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const original = path.join(root, "media-originals/assets/renders/wax-seal.png");
const backup = path.join(root, "media-originals/assets/renders/wax-seal-dm.png");
const platePublic = path.join(root, "public/assets/renders/monogram-sj.png");
const sealPublic = path.join(root, "public/assets/renders/wax-seal.webp");

if (!existsSync(backup)) await copyFile(original, backup);

const plateSvg = `
<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="plate" cx="42%" cy="34%" r="78%">
      <stop offset="0" stop-color="#f9ecc6"/>
      <stop offset=".34" stop-color="#d9b45e"/>
      <stop offset=".72" stop-color="#b8933a"/>
      <stop offset="1" stop-color="#7a5f1e"/>
    </radialGradient>
    <linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7a5f1e"/>
      <stop offset=".28" stop-color="#f6e7b8"/>
      <stop offset=".52" stop-color="#b8933a"/>
      <stop offset=".78" stop-color="#f6e7b8"/>
      <stop offset="1" stop-color="#7a5f1e"/>
    </linearGradient>
  </defs>
  <circle cx="300" cy="300" r="292" fill="url(#plate)"/>
  <circle cx="300" cy="300" r="292" fill="none" stroke="#6b4c15" stroke-opacity=".38" stroke-width="5"/>
  <text x="300" y="392" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
    font-size="238" letter-spacing="-18" fill="#5b400f" opacity=".72">SJ</text>
  <text x="300" y="386" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
    font-size="238" letter-spacing="-18" fill="url(#foil)">SJ</text>
  <text x="300" y="380" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
    font-size="238" letter-spacing="-18" fill="none" stroke="#f9efcf" stroke-opacity=".33" stroke-width="1.2">SJ</text>
</svg>`;

const plate = await sharp(Buffer.from(plateSvg)).png().toBuffer();
await mkdir(path.dirname(platePublic), { recursive: true });
await sharp(plate).toFile(platePublic);

// Keep the original wax texture and rim; replace only the monogram plate.
await sharp(backup)
  .composite([{ input: plate, left: 212, top: 212 }])
  .png()
  .toFile(original);

await sharp(original).resize(256, 256).webp({ quality: 90, effort: 6 }).toFile(sealPublic);

console.log("Created SJ monogram plate and updated the wax seal.");
