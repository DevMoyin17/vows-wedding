import { motion } from "framer-motion";

/** Fixed scene footer: "02 / 09 — progress — THE COUPLE" + gold RSVP pill. */
export function SceneFooter({ scene, total = 9, label, showRsvp, onRsvp }) {
  if (scene < 2) return null;
  const pct = Math.round((scene / total) * 100);
  return (
    <div className="scene-footer">
      <div className="progress">
        <span>{String(scene).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <span className="progress__track" aria-hidden="true">
          <span className="progress__fill" style={{ width: `${pct}%` }} />
        </span>
        <span>{label}</span>
      </div>
      {showRsvp && (
        <motion.button
          type="button"
          className="topbar-rsvp topbar-rsvp--foil footer-rsvp"
          onClick={onRsvp}
          aria-label="RSVP — respond to the invitation"
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 520, damping: 16 }}
        >
          RSVP
        </motion.button>
      )}
    </div>
  );
}
