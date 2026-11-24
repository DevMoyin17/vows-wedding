/** The gold wax seal from the design. */
export function WaxSeal({ size = 64, className = "", alt = "Simeon & Janet wax seal" }) {
  return (
    <img
      src="/assets/renders/wax-seal.webp"
      alt={alt}
      width={size}
      height={size}
      className={`wax-seal${className ? ` ${className}` : ""}`}
      draggable={false}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        maskImage: "radial-gradient(circle, black 62%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(circle, black 62%, transparent 70%)",
        boxShadow: "var(--elev-wax-seal)",
      }}
    />
  );
}
