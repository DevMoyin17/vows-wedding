/**
 * Every surface detail of the envelope is drawn here, in code: paper grain,
 * the lace trim, the wax seal's stamp, the invitation card, rose petals.
 * Nothing is baked from a photo, so each one takes the template's colours.
 *
 * Height fields are drawn white-on-black and turned into normal maps, so the
 * lights in the scene shade the relief (lace threads, the pressed monogram).
 */
import * as THREE from "three";

const canvas = (w, h) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

// a small deterministic random, so every load draws the same paper
function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** height canvas (red channel) → tangent-space normal map */
function normalFrom(src, strength = 2, { wrap = false } = {}) {
  const { width: w, height: h } = src;
  const data = src.getContext("2d").getImageData(0, 0, w, h).data;
  const out = canvas(w, h);
  const ctx = out.getContext("2d");
  const img = ctx.createImageData(w, h);
  const at = (x, y) => {
    if (wrap) {
      x = (x + w) % w;
      y = (y + h) % h;
    } else {
      x = Math.min(w - 1, Math.max(0, x));
      y = Math.min(h - 1, Math.max(0, y));
    }
    return data[(y * w + x) * 4] / 255;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      // canvas y runs down, texture v runs up
      let nx = -dx;
      let ny = dy;
      const nz = 1;
      const l = Math.hypot(nx, ny, nz);
      const i = (y * w + x) * 4;
      img.data[i] = ((nx / l) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((ny / l) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((nz / l) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

const tex = (c, { color = false, repeat = false, aniso = 8 } = {}) => {
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = aniso;
  return t;
};

/* --------------------------------------------------------------- paper --- */

/**
 * Laid paper: soft fibres and a faint tooth. `wash` adds watercolour blooms
 * (Watercolour Coast). Returns a colour map and a normal map that tile.
 */
export function paperTextures({ color, wash } = {}, seed = 7) {
  const S = 512;
  const r = rng(seed);
  const hgt = canvas(S, S);
  const h = hgt.getContext("2d");
  h.fillStyle = "#808080";
  h.fillRect(0, 0, S, S);
  // tooth
  const id = h.getImageData(0, 0, S, S);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = 128 + (r() - 0.5) * 22;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
  }
  h.putImageData(id, 0, 0);
  // fibres, drawn three times over so they wrap
  h.lineCap = "round";
  for (let i = 0; i < 900; i++) {
    const x = r() * S;
    const y = r() * S;
    const a = r() * Math.PI * 2;
    const len = 6 + r() * 26;
    const bright = r() < 0.5;
    h.strokeStyle = bright ? `rgba(255,255,255,${0.05 + r() * 0.08})` : `rgba(0,0,0,${0.04 + r() * 0.06})`;
    h.lineWidth = 0.6 + r() * 1.1;
    for (const ox of [-S, 0, S])
      for (const oy of [-S, 0, S]) {
        h.beginPath();
        h.moveTo(x + ox, y + oy);
        h.quadraticCurveTo(x + ox + Math.cos(a + 0.6) * len * 0.5, y + oy + Math.sin(a + 0.6) * len * 0.5, x + ox + Math.cos(a) * len, y + oy + Math.sin(a) * len);
        h.stroke();
      }
  }
  const normalMap = tex(normalFrom(hgt, 1.6, { wrap: true }), { repeat: true });

  const col = canvas(S, S);
  const c = col.getContext("2d");
  c.fillStyle = color || "#ffffff";
  c.fillRect(0, 0, S, S);
  // a whisper of the fibres in the colour too
  c.globalAlpha = 0.18;
  c.globalCompositeOperation = "overlay";
  c.drawImage(hgt, 0, 0);
  c.globalCompositeOperation = "source-over";
  c.globalAlpha = 1;
  if (wash) {
    for (let i = 0; i < 9; i++) {
      const x = r() * S;
      const y = r() * S;
      const rad = 60 + r() * 140;
      for (const ox of [-S, 0, S])
        for (const oy of [-S, 0, S]) {
          const g = c.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
          g.addColorStop(0, `${wash}66`);
          g.addColorStop(0.7, `${wash}22`);
          g.addColorStop(1, `${wash}00`);
          c.fillStyle = g;
          c.fillRect(0, 0, S, S);
        }
    }
  }
  const map = tex(col, { color: true, repeat: true });
  return { map, normalMap };
}

/* ---------------------------------------------------------------- lace --- */

/**
 * One repeat of the lace trim, tiling along its length (drawn at 2× for
 * crisp threads): a corded heading (top), a net ground with a row of large
 * daisies, leaves and buds, and a scalloped edge with picots (bottom).
 *
 *  - alphaMap: the lace's silhouette (the holes in the net)
 *  - map: thread shading — the open net reads greyer, the solid motifs
 *    whiter, with the petals' stitched veins drawn in
 *  - normalMap: the relief of the threads, for the scene's lights
 */
export function laceTextures() {
  const K = 2; // drawing scale
  const W = 1024;
  const H = 256;
  const P = 128; // scallop pitch
  const top = 30;
  const scY = 178; // scallop centres
  const scR = 58;
  const each = (fn) => {
    for (let x = -P; x <= W + P; x += P) fn(x);
  };

  const sil = canvas(W * K, H * K); // white = thread
  const det = canvas(W * K, H * K); // dark = stitched detail
  const s = sil.getContext("2d");
  const d = det.getContext("2d");
  s.scale(K, K);
  d.scale(K, K);
  s.fillStyle = "#000";
  s.fillRect(0, 0, W, H);

  // net ground, kept inside the heading and the scallops
  s.save();
  s.beginPath();
  s.rect(-10, top, W + 20, scY - top);
  each((x) => {
    s.moveTo(x + P / 2 + scR, scY);
    s.arc(x + P / 2, scY, scR, 0, Math.PI);
  });
  s.clip();
  s.strokeStyle = "rgba(255,255,255,0.85)";
  s.lineWidth = 1.7;
  for (let k = -H; k < W + H; k += 9) {
    s.beginPath();
    s.moveTo(k, top);
    s.lineTo(k + H, top + H);
    s.moveTo(k, top);
    s.lineTo(k - H, top + H);
    s.stroke();
  }
  s.restore();

  // heading: corded band with a running stitch
  s.fillStyle = "#fff";
  s.fillRect(-10, top - 14, W + 20, 13);
  s.strokeStyle = "#fff";
  s.lineWidth = 3;
  s.beginPath();
  for (let x = 0; x <= W; x += 10) {
    s.moveTo(x, top);
    s.lineTo(x + 5, top + 8);
    s.lineTo(x + 10, top);
  }
  s.stroke();
  d.fillStyle = "#000";
  for (let x = 0; x < W; x += 14) d.fillRect(x, top - 9.5, 8, 2.4);

  // scalloped edge: heavy cord, inner rim, picots, a fan of petals
  each((x) => {
    const cx = x + P / 2;
    s.strokeStyle = "#fff";
    s.lineWidth = 11;
    s.beginPath();
    s.arc(cx, scY, scR, 0.02, Math.PI - 0.02);
    s.stroke();
    s.lineWidth = 4;
    s.beginPath();
    s.arc(cx, scY, scR - 17, 0.12, Math.PI - 0.12);
    s.stroke();
    d.strokeStyle = "#000";
    d.lineWidth = 1.4;
    d.beginPath();
    d.arc(cx, scY, scR, 0.05, Math.PI - 0.05);
    d.stroke();
    s.fillStyle = "#fff";
    for (let a = 0.1; a < Math.PI; a += Math.PI / 10) {
      s.beginPath();
      s.arc(cx + Math.cos(a) * (scR + 9), scY + Math.sin(a) * (scR + 9), 5, 0, Math.PI * 2);
      s.fill();
    }
    for (let a = 0.45; a < Math.PI - 0.3; a += 0.45) {
      const px = cx + Math.cos(a) * (scR - 31);
      const py = scY + Math.sin(a) * (scR - 31);
      s.save();
      s.translate(px, py);
      s.rotate(a);
      s.beginPath();
      s.ellipse(0, 0, 9, 4.5, 0, 0, Math.PI * 2);
      s.fill();
      s.restore();
    }
  });

  // big daisies (the Figma lace reads as a row of flowers), leaves, buds
  const daisy = (cx, cy, R) => {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.3;
      const px = cx + Math.cos(a) * R * 0.56;
      const py = cy + Math.sin(a) * R * 0.56;
      for (const [g, fill] of [[s, true], [d, false]]) {
        g.save();
        g.translate(px, py);
        g.rotate(a);
        g.beginPath();
        g.ellipse(0, 0, R * 0.56, R * 0.33, 0, 0, Math.PI * 2);
        if (fill) {
          g.fillStyle = "#fff";
          g.fill();
        } else {
          g.strokeStyle = "#000";
          g.lineWidth = 1.6;
          g.stroke();
          g.beginPath();
          g.moveTo(-R * 0.4, 0);
          g.lineTo(R * 0.38, 0);
          g.stroke();
        }
        g.restore();
      }
    }
    s.fillStyle = "#fff";
    s.beginPath();
    s.arc(cx, cy, R * 0.3, 0, Math.PI * 2);
    s.fill();
    d.strokeStyle = "#000";
    d.lineWidth = 2;
    d.beginPath();
    d.arc(cx, cy, R * 0.3, 0, Math.PI * 2);
    d.stroke();
    d.fillStyle = "#000";
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      d.beginPath();
      d.arc(cx + Math.cos(a) * R * 0.15, cy + Math.sin(a) * R * 0.15, 2.2, 0, Math.PI * 2);
      d.fill();
    }
  };
  const leaf = (cx, cy, a) => {
    for (const [g, fill] of [[s, true], [d, false]]) {
      g.save();
      g.translate(cx, cy);
      g.rotate(a);
      g.beginPath();
      g.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2);
      if (fill) {
        g.fillStyle = "#fff";
        g.fill();
      } else {
        g.strokeStyle = "#000";
        g.lineWidth = 1.3;
        g.stroke();
        g.beginPath();
        g.moveTo(-16, 0);
        g.lineTo(16, 0);
        for (let k = -10; k <= 10; k += 5) {
          g.moveTo(k, 0);
          g.lineTo(k + 4, -5);
          g.moveTo(k, 0);
          g.lineTo(k + 4, 5);
        }
        g.stroke();
      }
      g.restore();
    }
  };
  for (let x = -2 * P; x <= W + 2 * P; x += 2 * P) {
    daisy(x + P, 104, 62);
    leaf(x + 2 * P - 22, 76, -0.7);
    leaf(x + 2 * P + 22, 76, 0.7 + Math.PI);
    s.fillStyle = "#fff";
    s.beginPath();
    s.arc(x + 2 * P, 120, 12, 0, Math.PI * 2);
    s.fill();
    d.strokeStyle = "#000";
    d.lineWidth = 1.6;
    d.beginPath();
    d.arc(x + 2 * P, 120, 12, 0, Math.PI * 2);
    d.stroke();
  }

  // colour: open net greyer, solid motifs whiter, stitched details darker
  const col = canvas(W * K, H * K);
  const c = col.getContext("2d");
  c.filter = "blur(3px)";
  c.drawImage(sil, 0, 0);
  c.filter = "none";
  c.globalCompositeOperation = "screen";
  c.fillStyle = "rgb(210,205,198)"; // thinnest thread never darker than this
  c.fillRect(0, 0, W * K, H * K);
  c.globalCompositeOperation = "multiply";
  c.globalAlpha = 0.4;
  c.drawImage(det, 0, 0);
  c.globalAlpha = 1;
  c.globalCompositeOperation = "source-over";
  const map = tex(col, { color: true, aniso: 16 });
  map.wrapS = THREE.RepeatWrapping;

  const alphaMap = tex(sil, { aniso: 16 });
  alphaMap.wrapS = THREE.RepeatWrapping;

  // relief: threads rounded, stitched details sunk
  const rel = canvas(W * K, H * K);
  const r = rel.getContext("2d");
  r.filter = "blur(2.5px)";
  r.drawImage(sil, 0, 0);
  r.filter = "blur(1px)";
  r.globalCompositeOperation = "multiply";
  r.globalAlpha = 0.5;
  r.drawImage(det, 0, 0);
  const normalMap = tex(normalFrom(rel, 4), { aniso: 16 });
  normalMap.wrapS = THREE.RepeatWrapping;
  return { map, alphaMap, normalMap, aspect: W / H };
}

/* ---------------------------------------------------------------- seal --- */

/**
 * The stamp pressed into the wax: a raised lip, the pressed field, a ring of
 * lace scallops and the couple's monogram. Covers [-S, S] of the seal's top
 * face (see EnvelopeScene's Seal for the UV mapping).
 */
export function sealTextures(initials = "DM", font = "Cormorant Garamond") {
  const N = 1024;
  const c = canvas(N, N);
  const g = c.getContext("2d");
  const m = N / 2;
  const R = N * 0.4; // the seal's radius in this canvas (S = R / 0.8)

  // the wax: dome-ish, the stamp's field pressed down inside the lip
  let grad = g.createRadialGradient(m, m, 0, m, m, R * 1.25);
  grad.addColorStop(0, "#5a5a5a");
  grad.addColorStop(0.6, "#5a5a5a");
  grad.addColorStop(0.64, "#9a9a9a");
  grad.addColorStop(0.7, "#bdbdbd");
  grad.addColorStop(0.8, "#8a8a8a");
  grad.addColorStop(1, "#606060");
  g.fillStyle = grad;
  g.fillRect(0, 0, N, N);

  // wax ripple
  const r = rng(11);
  for (let i = 0; i < 260; i++) {
    const x = r() * N;
    const y = r() * N;
    const rr = 6 + r() * 30;
    const gg = g.createRadialGradient(x, y, 0, x, y, rr);
    const v = r() < 0.5 ? "255,255,255" : "0,0,0";
    gg.addColorStop(0, `rgba(${v},0.05)`);
    gg.addColorStop(1, `rgba(${v},0)`);
    g.fillStyle = gg;
    g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }

  g.save();
  g.filter = "blur(2px)";
  // fine ring inside the field
  g.strokeStyle = "#8c8c8c";
  g.lineWidth = 6;
  g.beginPath();
  g.arc(m, m, R * 0.6, 0, Math.PI * 2);
  g.stroke();
  // ring of lace scallops
  const n = 26;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = m + Math.cos(a) * R * 0.66;
    const y = m + Math.sin(a) * R * 0.66;
    g.lineWidth = 5;
    g.beginPath();
    g.arc(x, y, R * 0.07, a - Math.PI / 2, a + Math.PI / 2);
    g.stroke();
    g.fillStyle = "#8c8c8c";
    g.beginPath();
    g.arc(m + Math.cos(a) * R * 0.71, m + Math.sin(a) * R * 0.71, 4, 0, Math.PI * 2);
    g.fill();
  }
  // monogram: two letters overlapped
  const [a, b] = [initials[0] || "", initials[1] || ""];
  g.fillStyle = "#b4b4b4";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `600 ${R * 0.78}px "${font}", Georgia, serif`;
  g.fillText(a, m - R * 0.13, m - R * 0.04);
  g.fillText(b, m + R * 0.15, m + R * 0.08);
  g.restore();

  const normalMap = tex(normalFrom(c, 5));

  // brighter where the wax is raised (the lip, the letters): a roughness map
  const rough = canvas(N, N);
  const q = rough.getContext("2d");
  q.fillStyle = "#6a6a6a";
  q.fillRect(0, 0, N, N);
  q.globalAlpha = 0.5;
  q.globalCompositeOperation = "difference";
  q.drawImage(c, 0, 0);
  const roughnessMap = tex(rough);
  return { normalMap, roughnessMap, coverage: 1.25 };
}

/* ---------------------------------------------------------------- card --- */

/**
 * The invitation card's printed face, laid out like the Figma "Card reveal"
 * card (op-card__text): a gold rule inset from the edge and the wording.
 */
export function cardTexture({ paper, border, inks }, words, fonts) {
  const W = 1430;
  const H = Math.round(W / 0.7136);
  const c = canvas(W, H);
  const g = c.getContext("2d");
  g.fillStyle = paper;
  g.fillRect(0, 0, W, H);
  // paper tooth
  const r = rng(5);
  for (let i = 0; i < 4200; i++) {
    g.fillStyle = r() < 0.5 ? "rgba(0,0,0,0.018)" : "rgba(255,255,255,0.4)";
    g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2);
  }
  // gold rule, 30/563 of the width in from the edge
  const inset = W * (30 / 563);
  g.strokeStyle = border;
  g.lineWidth = W * 0.0042;
  g.strokeRect(inset, inset, W - inset * 2, H - inset * 2);

  const [over, names, request, date] = inks;
  const u = W / 100; // 1% of the card's width
  const left = W * 0.1399;
  const width = W * 0.711;
  const cx = left + width / 2;
  let y = H * 0.2369;
  g.textAlign = "center";
  g.textBaseline = "top";

  const spaced = (text, size, track) => {
    // canvas letter-spacing where supported, else plain
    if ("letterSpacing" in g) g.letterSpacing = `${track}px`;
    g.fillText(text, cx + track / 2, y);
    if ("letterSpacing" in g) g.letterSpacing = "0px";
  };

  g.fillStyle = over;
  g.font = `500 ${4.49 * u}px "${fonts.body}", system-ui, sans-serif`;
  spaced(words.over.toUpperCase(), 4.49 * u, 0.81 * u);
  y += 6.53 * u + 5.7 * u;

  g.fillStyle = names;
  g.font = `400 ${13.9 * u}px "${fonts.display}", Georgia, serif`;
  for (const line of words.names) {
    g.fillText(line, cx, y + 1.2 * u);
    y += 16.3 * u;
  }
  y += 5.7 * u;

  g.fillStyle = request;
  g.font = `italic 400 ${8.16 * u}px "${fonts.display}", Georgia, serif`;
  // wrap the request line to the text column
  const wordsOf = words.request.split(" ");
  let line = "";
  const lines = [];
  for (const w of wordsOf) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > width && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  lines.push(line);
  for (const l of lines) {
    g.fillText(l, cx, y);
    y += 10.6 * u;
  }
  y += 5.7 * u;

  g.fillStyle = date;
  g.font = `500 ${4.49 * u}px "${fonts.body}", system-ui, sans-serif`;
  spaced(words.date.toUpperCase(), 4.49 * u, 0.81 * u);

  const t = tex(c, { color: true, aniso: 16 });
  return { map: t, aspect: W / H };
}

/* -------------------------------------------------------------- petals --- */

/** a rose petal: deeper at the tip, paler at the base, with faint veins */
export function petalTexture(color) {
  const N = 256;
  const c = canvas(N, N);
  const g = c.getContext("2d");
  const shape = () => {
    g.beginPath();
    g.moveTo(N / 2, N * 0.96);
    g.bezierCurveTo(N * 0.06, N * 0.7, N * 0.02, N * 0.12, N * 0.34, N * 0.06);
    g.quadraticCurveTo(N / 2, N * 0.14, N * 0.66, N * 0.06);
    g.bezierCurveTo(N * 0.98, N * 0.12, N * 0.94, N * 0.7, N / 2, N * 0.96);
    g.closePath();
  };
  shape();
  const grad = g.createLinearGradient(0, N, 0, 0);
  grad.addColorStop(0, "#fbf3ef");
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, color);
  g.fillStyle = grad;
  g.fill();
  g.save();
  shape();
  g.clip();
  g.strokeStyle = "rgba(255,255,255,0.25)";
  g.lineWidth = 1.2;
  for (let i = -5; i <= 5; i++) {
    g.beginPath();
    g.moveTo(N / 2, N * 0.95);
    g.quadraticCurveTo(N / 2 + i * 10, N * 0.5, N / 2 + i * 22, N * 0.05);
    g.stroke();
  }
  // a soft darker rim
  g.lineWidth = 10;
  g.strokeStyle = "rgba(160,60,80,0.10)";
  shape();
  g.stroke();
  g.restore();
  return tex(c, { color: true });
}
