/**
 * Decorative pink-rose corner spray (Heirloom Lace) — the same asset and
 * mix-blend-multiply treatment as the Figma component.
 */
const SRC = "/assets/heirloom/floral-tl.webp";

export function FloralEdge({ corner = "tl", size = 150 }) {
  const flipX = corner === "tr" || corner === "br";
  const flipY = corner === "bl" || corner === "br";
  const pos = {
    tl: { top: 66, left: -8 },
    tr: { top: 66, right: -8 },
    bl: { bottom: 84, left: -8 },
    br: { bottom: 84, right: -8 },
  }[corner];

  return (
    <img
      src={SRC}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{
        position: "absolute",
        width: size,
        height: "auto",
        transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
        opacity: 0.95,
        mixBlendMode: "multiply",
        pointerEvents: "none",
        zIndex: 0,
        ...pos,
      }}
    />
  );
}
