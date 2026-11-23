/**
 * Production asset pipeline for VOWS.
 *
 * - Archives unused source files to media-originals/legacy (not deployed).
 * - Re-encodes photographs and writes xs/md/lg variants + a manifest that
 *   src/lib/media.js uses to pick the right local file.
 * - Converts the heavy PNG/SVG illustration renders to WebP.
 * - Generates favicons, app icons, the web manifest and the OG share image.
 * - Converts the music bed from WAV to MP3.
 *
 * Original files are kept in media-originals/ (git-ignored) so the script
 * can be re-run at any time. Run with: npm run assets
 */
import sharp from "sharp";
import * as lame from "@breezystack/lamejs";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = (rel) => path.join(root, "public", rel);
const originals = path.join(root, "media-originals");
const legacy = path.join(originals, "legacy");

const fmt = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

async function ensureDir(file) {
  await fs.mkdir(path.dirname(file), { recursive: true });
}

/** Keep one original copy outside public/ before we transform it. */
async function keepOriginal(rel) {
  const src = pub(rel);
  const dest = path.join(originals, rel);
  if (!existsSync(src)) return existsSync(dest) ? dest : null;
  if (!existsSync(dest)) {
    await ensureDir(dest);
    await fs.copyFile(src, dest);
  }
  return dest;
}

/** Move a file that is not referenced anywhere out of the deploy. */
async function archive(rel) {
  const src = pub(rel);
  if (!existsSync(src)) return 0;
  const dest = path.join(legacy, rel.replace(/^assets\//, ""));
  await ensureDir(dest);
  await fs.rename(src, dest);
  const { size } = await fs.stat(dest);
  console.log(`  archived ${rel} (${fmt(size)})`);
  return size;
}

/** Write WebP and remove the source from public/. */
async function convert(rel, out, { width, height, quality = 86 } = {}) {
  const src = await keepOriginal(rel);
  if (!src) return 0;
  await ensureDir(pub(out));
  let img = sharp(src, { density: 150 }).rotate();
  if (width || height) img = img.resize(width, height, { fit: "fill" });
  await img.webp({ quality, effort: 6, smartSubsample: true }).toFile(pub(out));
  if (existsSync(pub(rel))) await fs.unlink(pub(rel));
  const { size } = await fs.stat(pub(out));
  console.log(`  ${rel} → ${out} (${fmt(size)})`);
  return size;
}

/* ------------------------------------------------------------------ photos */
const PHOTO_VARIANTS = [
  { suffix: "xs", width: 360 },
  { suffix: "md", width: 720 },
  { suffix: "lg", width: 1280 },
];

const PHOTOS = [
  "gallery-1.jpg",
  "gallery-2.jpg",
  "gallery-3.jpg",
  "gallery-4.jpg",
  "gallery-5.jpg",
  "gallery-6.jpg",
  "ms-first-date.jpg",
  "ms-met.jpg",
  "ms-proposal.jpg",
  "ms-rings.jpg",
  "venue-chapel.jpg",
  "venue-church.jpg",
];

async function optimisePhotos() {
  const manifest = {};
  let total = 0;

  for (const name of PHOTOS) {
    const rel = `assets/photos/${name}`;
    const src = await keepOriginal(rel);
    if (!src) continue;

    const meta = await sharp(src).metadata();
    const base = name.replace(/\.jpe?g$/i, "");
    const variants = [];

    // Full-size image used by the lightbox and as the ultimate fallback.
    const full = await sharp(src)
      .rotate()
      .jpeg({ quality: 80, mozjpeg: true, progressive: true })
      .toFile(pub(rel));

    for (const v of PHOTO_VARIANTS) {
      if (meta.width <= v.width + 80) continue;
      const out = `assets/photos/${base}-${v.suffix}.jpg`;
      const info = await sharp(src)
        .rotate()
        .resize({ width: v.width, withoutEnlargement: true })
        .jpeg({ quality: 78, mozjpeg: true, progressive: true })
        .toFile(pub(out));
      variants.push({ w: info.width, src: `/${out}` });
      total += info.size;
    }

    total += full.size;
    manifest[`/${rel}`] = {
      width: meta.width,
      height: meta.height,
      variants,
    };
    console.log(`  ${name} (${fmt(full.size)}) + ${variants.length} variants`);
  }

  await ensureDir(path.join(root, "src/lib"));
  await fs.writeFile(
    path.join(root, "src/lib/photo-manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  return total;
}

/* ------------------------------------------------------------ illustrations */
async function optimiseIllustrations() {
  let total = 0;
  const heirloom = [
    ["assets/heirloom/envelope-idle.png", "assets/heirloom/envelope-idle.webp", 864, 1536],
    ["assets/heirloom/env-seal.png", "assets/heirloom/env-seal.webp", 864, 1536],
    ["assets/heirloom/env-flap.png", "assets/heirloom/env-flap.webp", 864, 1536],
    ["assets/heirloom/env-rise.png", "assets/heirloom/env-rise.webp", 864, 1536],
    ["assets/heirloom/envelope-open.png", "assets/heirloom/envelope-open.webp", 864, 1536],
    ["assets/heirloom/tablet/entrance.svg", "assets/heirloom/tablet/entrance.webp", 864, 1152],
    ["assets/heirloom/tablet/step-01a.svg", "assets/heirloom/tablet/step-01a.webp", 864, 1152],
    ["assets/heirloom/tablet/step-01b.svg", "assets/heirloom/tablet/step-01b.webp", 864, 1152],
    ["assets/heirloom/tablet/step-01c.svg", "assets/heirloom/tablet/step-01c.webp", 864, 1152],
    ["assets/heirloom/tablet/step-01d.svg", "assets/heirloom/tablet/step-01d.webp", 864, 1152],
    ["assets/heirloom/desktop/entrance.svg", "assets/heirloom/desktop/entrance.webp", 1440, 900],
    ["assets/heirloom/desktop/satin.svg", "assets/heirloom/desktop/satin.webp", 1440, 900],
    ["assets/heirloom/desktop/step-01a.png", "assets/heirloom/desktop/step-01a.webp", 1440, 900],
    ["assets/heirloom/desktop/step-01b.svg", "assets/heirloom/desktop/step-01b.webp", 746, 900],
    ["assets/heirloom/desktop/step-01c.svg", "assets/heirloom/desktop/step-01c.webp", 746, 900],
  ];

  for (const [rel, out, width, height] of heirloom) {
    total += await convert(rel, out, { width, height, quality: 88 });
  }

  // Decorative pieces are displayed small; keep just enough resolution.
  total += await convert("assets/heirloom/floral-tl.png", "assets/heirloom/floral-tl.webp", {
    width: 480,
    height: 720,
    quality: 86,
  });
  total += await convert("assets/renders/wax-seal.png", "assets/renders/wax-seal.webp", {
    width: 256,
    height: 256,
    quality: 90,
  });

  return total;
}

/* ------------------------------------------------------ save-the-date hero */
async function saveDateHero() {
  const src = path.join(legacy, "photos/first-dance.jpg");
  if (!existsSync(src)) return;
  const out = "assets/photos/save-the-date.webp";
  await ensureDir(pub(out));
  const info = await sharp(src)
    .resize({ width: 1536, withoutEnlargement: true })
    .webp({ quality: 84, effort: 6, smartSubsample: true })
    .toFile(pub(out));
  console.log(`  ${out} (${fmt(info.size)})`);
}

/* -------------------------------------------------------------------- audio */
function parseWav(buffer) {
  let offset = 12;
  let fmt = null;
  let data = null;

  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const body = offset + 8;
    if (id === "fmt ") {
      fmt = {
        format: buffer.readUInt16LE(body),
        channels: buffer.readUInt16LE(body + 2),
        sampleRate: buffer.readUInt32LE(body + 4),
        bits: buffer.readUInt16LE(body + 14),
      };
    } else if (id === "data") {
      data = buffer.subarray(body, body + size);
      break;
    }
    offset = body + size + (size % 2);
  }

  if (!fmt || !data || fmt.format !== 1 || fmt.bits !== 16) {
    throw new Error("Only 16-bit PCM WAV files are supported.");
  }
  return { ...fmt, data };
}

async function optimiseAudio() {
  const rel = "assets/audio/our-song.wav";
  const src = await keepOriginal(rel);
  if (!src) return 0;

  const { channels, sampleRate, data } = parseWav(await fs.readFile(src));
  if (channels !== 1) throw new Error("Expected a mono music bed.");

  const samples = new Int16Array(data.buffer, data.byteOffset, Math.floor(data.length / 2));
  const encoder = new lame.Mp3Encoder(1, sampleRate, 96);
  const chunks = [];
  const block = 1152;
  for (let i = 0; i < samples.length; i += block) {
    const slice = samples.subarray(i, i + block);
    const encoded = encoder.encodeBuffer(slice);
    if (encoded.length) chunks.push(Buffer.from(encoded));
  }
  const tail = encoder.flush();
  if (tail.length) chunks.push(Buffer.from(tail));

  const out = "assets/audio/our-song.mp3";
  await ensureDir(pub(out));
  await fs.writeFile(pub(out), Buffer.concat(chunks));
  if (existsSync(pub(rel))) await fs.unlink(pub(rel));
  const { size } = await fs.stat(pub(out));
  console.log(`  ${rel} → ${out} (${fmt(size)})`);
  return size;
}

/* ------------------------------------------------------------- brand icons */
async function brandIcons() {
  const src = path.join(originals, "assets/renders/wax-seal.png");
  if (!existsSync(src)) return;

  // Tightish crop around the wax blob, on the blush canvas.
  const seal = await sharp(src)
    .extract({ left: 132, top: 122, width: 760, height: 760 })
    .resize(512, 512, { fit: "cover" })
    .toBuffer();

  // Full-bleed crop reads best at tab/app-icon sizes.
  const plain = async (size) => sharp(seal).resize(size, size).png().toBuffer();

  // Maskable icons need breathing room inside the safe zone.
  const maskable = async (size) => {
    const inner = Math.round(size * 0.76);
    const mark = await sharp(seal).resize(inner, inner).toBuffer();
    return sharp({ create: { width: size, height: size, channels: 4, background: "#f5ebeb" } })
      .composite([{ input: mark, gravity: "centre" }])
      .png()
      .toBuffer();
  };

  const icons = [
    ["icons/favicon-16.png", await plain(16)],
    ["icons/favicon-32.png", await plain(32)],
    ["icons/apple-touch-icon.png", await plain(180)],
    ["icons/icon-192.png", await plain(192)],
    ["icons/icon-512.png", await plain(512)],
    ["icons/icon-maskable-512.png", await maskable(512)],
  ];
  for (const [rel, data] of icons) {
    await ensureDir(pub(rel));
    await fs.writeFile(pub(rel), data);
  }

  // Multi-size .ico with embedded PNGs (supported by every modern browser).
  const icoSizes = [16, 32, 48];
  const pngs = await Promise.all(icoSizes.map((s) => plain(s)));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(icoSizes.length, 4);
  let offset = 6 + 16 * icoSizes.length;
  const entries = icoSizes.map((size, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(pngs[i].length, 8);
    e.writeUInt32LE(offset, 12);
    offset += pngs[i].length;
    return e;
  });
  await fs.writeFile(pub("favicon.ico"), Buffer.concat([header, ...entries, ...pngs]));

  const manifest = {
    name: "Deborah & Michael — 20 February 2027",
    short_name: "D & M",
    description:
      "The wedding of Deborah and Michael — Saturday, 20 February 2027, Ibadan. View the invitation and reply.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5ebeb",
    theme_color: "#f5ebeb",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
  await fs.writeFile(pub("site.webmanifest"), JSON.stringify(manifest, null, 2) + "\n");
  console.log("  icons, favicon.ico and site.webmanifest written");
}

/* ---------------------------------------------------------------- OG image */
async function ogImage() {
  const W = 1200;
  const H = 630;
  const photoX = 640;
  const photoW = W - photoX;

  const photoSrc = path.join(originals, "assets/photos/gallery-1.jpg");
  if (!existsSync(photoSrc)) return;

  const photo = await sharp(photoSrc)
    .resize(photoW, H, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.98, saturation: 0.95 })
    .toBuffer();

  const sealSrc = path.join(originals, "assets/renders/wax-seal.png");
  const seal = existsSync(sealSrc)
    ? await sharp(sealSrc)
        .extract({ left: 132, top: 122, width: 760, height: 760 })
        .resize(64, 64)
        .toBuffer()
    : null;

  const overlay = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${photoX - 14}" y="0" width="14" height="${H}" fill="#ead9c7"/>
      <rect x="${photoX - 1}" y="0" width="1" height="${H}" fill="#b8933a" opacity="0.55"/>
      <line x1="100" y1="104" x2="144" y2="104" stroke="#b8933a" stroke-width="1.5"/>
      <text x="100" y="150" font-family="Segoe UI, Arial, sans-serif" font-size="15"
        letter-spacing="3.4" fill="#7e4f46">TOGETHER WITH THEIR FAMILIES</text>
      <text x="96" y="266" font-family="Georgia, 'Times New Roman', serif" font-size="82"
        fill="#1c1c1c">Deborah</text>
      <text x="96" y="354" font-family="Georgia, 'Times New Roman', serif" font-size="82"
        fill="#1c1c1c"><tspan font-style="italic" fill="#b8933a">&amp;</tspan> Michael</text>
      <line x1="100" y1="408" x2="400" y2="408" stroke="#b8933a" stroke-width="1" opacity="0.6"/>
      <text x="100" y="456" font-family="Segoe UI, Arial, sans-serif" font-size="18"
        letter-spacing="2.2" fill="#1c1c1c">SATURDAY · 20 FEBRUARY 2027</text>
      <text x="100" y="492" font-family="Segoe UI, Arial, sans-serif" font-size="14"
        letter-spacing="2.6" fill="#7e4f46">IBADAN · NIGERIA</text>
      <text x="184" y="561" font-family="Georgia, 'Times New Roman', serif" font-style="italic"
        font-size="22" fill="#5e5e5e">You are invited</text>
    </svg>
  `);

  const layers = [{ input: photo, left: photoX, top: 0 }, { input: overlay, left: 0, top: 0 }];
  if (seal) layers.push({ input: seal, left: 100, top: 512, blend: "over" });

  await ensureDir(pub("assets/og/og-image.jpg"));
  const info = await sharp({
    create: { width: W, height: H, channels: 3, background: "#f5ebeb" },
  })
    .composite(layers)
    .jpeg({ quality: 90, mozjpeg: true, progressive: true })
    .toFile(pub("assets/og/og-image.jpg"));
  console.log(`  assets/og/og-image.jpg (${fmt(info.size)})`);
}

/* -------------------------------------------------------------------- main */
const before = (
  await Promise.all(
    ["assets/photos", "assets/heirloom", "assets/renders", "assets/svg", "assets/audio"].map(
      async (rel) => {
        try {
          const files = await fs.readdir(pub(rel), { recursive: true, withFileTypes: true });
          let sum = 0;
          for (const f of files) {
            if (f.isFile()) {
              const p = path.join(f.parentPath ?? f.path, f.name);
              sum += (await fs.stat(p)).size;
            }
          }
          return sum;
        } catch {
          return 0;
        }
      },
    ),
  )
).reduce((a, b) => a + b, 0);

console.log("\n› Archiving unused sources");
const archived = [
  "assets/heirloom/floral-br.png",
  "assets/heirloom/satin-wide.png",
  "assets/photos/closing-couple.jpg",
  "assets/photos/first-dance.jpg",
  "assets/photos/gallery-bouquet.jpg",
  "assets/photos/hero-couple.jpg",
  "assets/photos/venue-atrium.jpg",
  "assets/renders/envelope-idle.png",
  "assets/renders/envelope-open.png",
  "assets/renders/env-step1-seal.png",
  "assets/renders/env-step2-flap.png",
  "assets/renders/env-step3-rise.png",
  "assets/renders/floral-edge.png",
  "assets/renders/satin-wide.png",
  "assets/svg/icon-a.svg",
  "assets/svg/icon-b.svg",
  "assets/svg/icon-c.svg",
  "assets/svg/icon-d.svg",
  "assets/svg/sparkle-1.svg",
  "assets/svg/sparkle-2.svg",
];
let saved = 0;
for (const rel of archived) saved += await archive(rel);

console.log("\n› Optimising photographs");
await optimisePhotos();

console.log("\n› Converting illustration renders to WebP");
await optimiseIllustrations();

console.log("\n› Save-the-date hero");
await saveDateHero();

console.log("\n› Encoding music to MP3");
await optimiseAudio();

console.log("\n› Brand icons + share image");
await brandIcons();
await ogImage();

const after = (
  await Promise.all(
    ["assets/photos", "assets/heirloom", "assets/renders", "assets/svg", "assets/audio", "icons", "assets/og"].map(
      async (rel) => {
        try {
          const files = await fs.readdir(pub(rel), { recursive: true, withFileTypes: true });
          let sum = 0;
          for (const f of files) {
            if (f.isFile()) {
              const p = path.join(f.parentPath ?? f.path, f.name);
              sum += (await fs.stat(p)).size;
            }
          }
          return sum;
        } catch {
          return 0;
        }
      },
    ),
  )
).reduce((a, b) => a + b, 0);

console.log(`\n✓ Assets: ${fmt(before)} → ${fmt(after)}`);
