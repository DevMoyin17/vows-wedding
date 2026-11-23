/** Pearl divider — the exact SVG used in Figma (81 × 9). */
export function PearlDivider({ className = "", scale = 1 }) {
  return (
    <img
      src="/assets/heirloom/pearl-divider.svg"
      alt=""
      aria-hidden="true"
      className={`pearls${className ? ` ${className}` : ""}`}
      width={Math.round(81 * scale)}
      height={Math.round(9 * scale)}
      style={{ width: Math.round(81 * scale), height: Math.round(9 * scale) }}
      draggable={false}
    />
  );
}
