import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sound } from "../lib/sound";

/** Music chip — always-visible mute control reflecting real audio state. */
export function MusicChip({ expandedLabel, className = "" }) {
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => sound.subscribe((p, a) => { setPlaying(p); setAvailable(a); }), []);

  const label = !available ? "Music unavailable" : playing ? expandedLabel ?? "Sound on" : "Sound off";

  return (
    <motion.button
      type="button"
      className={`pill${className ? ` ${className}` : ""}`}
      onClick={() => sound.toggle()}
      aria-pressed={playing}
      aria-label={`${label}. Tap to turn sound ${playing ? "off" : "on"}.`}
      whileTap={{ scale: 0.97 }}
    >
      <span className={`pill__bars${playing ? "" : " is-paused"}`} aria-hidden="true">
        <i /><i /><i /><i />
      </span>
      <span className="pill__label">{label}</span>
    </motion.button>
  );
}
