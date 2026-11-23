/**
 * Cloudinary photo pipeline.
 * Set VITE_CLOUDINARY_CLOUD_NAME to serve photographs from Cloudinary
 * with responsive transforms; without it, bundled local copies are used.
 */
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";

const BASE = CLOUD ? `https://res.cloudinary.com/${CLOUD}/image/upload` : "";

/**
 * Build a transformed Cloudinary URL for a photo object { local, cloud }.
 * @param {{local: string, cloud: string}} photo
 * @param {{w?: number, h?: number, crop?: string, gravity?: string, dpr?: number}} opts
 */
export function photoUrl(photo, opts = {}) {
  if (!photo) return "";
  if (!CLOUD) return photo.local;

  const { w, h, crop = "fill", gravity = "auto", dpr = 1 } = opts;
  const parts = ["f_auto", "q_auto", "c_" + crop];
  if (gravity) parts.push("g_" + gravity);
  if (w) parts.push("w_" + Math.round(w * dpr));
  if (h) parts.push("h_" + Math.round(h * dpr));
  if (dpr > 1) parts.push(`dpr_${dpr}`);
  return `${BASE}/${parts.join(",")}/${photo.cloud}`;
}

/** Responsive srcset (1x/2x) for <img srcSet>. Falls back to a single local src. */
export function photoSrcSet(photo, { w, h, crop, gravity } = {}) {
  if (!CLOUD || !photo) return undefined;
  const one = photoUrl(photo, { w, h, crop, gravity, dpr: 1 });
  const two = photoUrl(photo, { w, h, crop, gravity, dpr: 2 });
  return `${one} 1x, ${two} 2x`;
}

export const cloudinaryEnabled = Boolean(CLOUD);
