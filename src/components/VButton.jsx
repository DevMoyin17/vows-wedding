import { forwardRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** VOWS button — press = scale(.97) spring 520/16. Pill by default (Heirloom Lace). */
export const VButton = forwardRef(function VButton(
  { children, variant = "foil", className = "", disabled, loading, type = "button", onClick, ariaLabel, full = false },
  ref
) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      ref={ref}
      type={type}
      className={`vbtn vbtn--${variant}${full ? " vbtn--full" : ""}${className ? ` ${className}` : ""}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 520, damping: 16 }}
    >
      {loading && <span className="vbtn__spinner" aria-hidden="true" />}
      <span>{children}</span>
    </motion.button>
  );
});
