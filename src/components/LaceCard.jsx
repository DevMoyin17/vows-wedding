/** Heirloom card with dashed lace stitching. */
export function LaceCard({ children, className = "", as = "div", style }) {
  const Tag = as;
  return (
    <Tag className={`lace-card${className ? ` ${className}` : ""}`} style={style}>
      {children}
    </Tag>
  );
}
