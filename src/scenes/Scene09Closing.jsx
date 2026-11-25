import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { inView, riseChild, reducedChild } from "../lib/motion";

/**
 * Scene 09 — With gratitude · Emerald edition.
 * A deep green closing with gold script, the couple's names and the date.
 */
export function Scene09Closing({ onDetails, onReplay }) {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;

  return (
    <section className="scene scene-thanks" aria-label="With gratitude">
      <motion.div
        className="thanks-card"
        initial="initial"
        whileInView="animate"
        viewport={inView}
        whileHover={reduced ? undefined : { y: -4 }}
        variants={{ animate: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
      >
        <motion.p className="thanks-card__script" variants={child}>With gratitude</motion.p>
        <motion.p className="thanks-card__line" variants={child}>
          Thank you for celebrating with us.<br />Your presence is the finest gift.
        </motion.p>
        <motion.span className="thanks-card__rule" variants={child} aria-hidden="true" />
        <motion.h1 className="thanks-card__names" variants={child}>
          {wedding.couple.first} <span className="thanks-card__amp">&amp;</span> {wedding.couple.second}
        </motion.h1>
        <motion.p className="thanks-card__date" variants={child}>{wedding.dateShort}</motion.p>
      </motion.div>

      <motion.div className="thanks-actions" initial="initial" whileInView="animate" viewport={inView} variants={riseChild}>
        <button type="button" className="vbtn vbtn--foil" onClick={onDetails}>View the details</button>
        <button type="button" className="vbtn vbtn--ghost" onClick={onReplay}>Replay</button>
      </motion.div>

      <p className="thanks-footer">Made with VOWS</p>
    </section>
  );
}
