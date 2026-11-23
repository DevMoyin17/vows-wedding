import { motion, useReducedMotion } from "framer-motion";

const STARS = [
  { x: 12, y: 12, size: 14, delay: 0 },
  { x: 84, y: 8, size: 10, delay: 0.7 },
  { x: 90, y: 34, size: 16, delay: 1.4 },
  { x: 8, y: 42, size: 9, delay: 0.35 },
  { x: 20, y: 6, size: 8, delay: 1.1 },
  { x: 80, y: 74, size: 12, delay: 0.9 },
  { x: 6, y: 82, size: 8, delay: 1.8 },
  { x: 58, y: 5, size: 8, delay: 2.2 },
];

/** Twinkling gold sparkles (decorative only). */
export function Sparkles({ className = "" }) {
  const reduced = useReducedMotion();
  return (
    <div className={`sparkles${className ? ` ${className}` : ""}`} aria-hidden="true">
      {STARS.map((s, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 24 24"
          style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={reduced ? { opacity: 0.7 } : { opacity: [0.25, 0.9, 0.25], scale: [0.85, 1, 0.85] }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 3, delay: s.delay, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <path d="M12 1l2.2 7.4L21 10l-6.8 1.6L12 19l-2.2-7.4L3 10l6.8-1.6L12 1z" fill="#c9a95c" opacity="0.9" />
        </motion.svg>
      ))}
    </div>
  );
}
