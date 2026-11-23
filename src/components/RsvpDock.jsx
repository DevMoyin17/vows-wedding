import { motion, useReducedMotion } from "framer-motion";

/** Floating RSVP shortcut for phones and tablets (desktop uses the top bar). */
export function RsvpDock({ visible, onRsvp }) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      className="rsvp-dock"
      onClick={onRsvp}
      aria-label="RSVP — respond to the invitation"
      aria-hidden={!visible || undefined}
      tabIndex={visible ? undefined : -1}
      initial={false}
      animate={
        visible
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 24, scale: 0.96 }
      }
      transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 320, damping: 28 }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      whileTap={reduced ? undefined : { scale: 0.95 }}
    >
      <span className="rsvp-dock__dot" aria-hidden="true" />
      RSVP
    </motion.button>
  );
}
