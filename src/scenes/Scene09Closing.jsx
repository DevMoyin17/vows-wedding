import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { riseChild, reducedChild } from "../lib/motion";
import { FloralEdge } from "../components/FloralEdge";
import { WaxSeal } from "../components/WaxSeal";
import { PearlDivider } from "../components/PearlDivider";

/**
 * Scene 09 — Thank-you card · Heirloom Lace.
 * "With gratitude" in gold script, seal, pearl divider, names.
 */
export function Scene09Closing({ onDetails, onReplay }) {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;

  return (
    <section className="scene scene-thanks" aria-label="With gratitude">
      <FloralEdge corner="tl" size={150} />
      <FloralEdge corner="br" size={150} />

      <motion.div
        className="thanks-card"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
      >
        <span className="thanks-card__stitch" aria-hidden="true" />
        <motion.div variants={child}><WaxSeal size={70} /></motion.div>
        <motion.p className="type-script-gold thanks-card__script" variants={child}>With gratitude</motion.p>
        <motion.p className="type-body-lg text-secondary thanks-card__line" variants={child}>
          Thank you for celebrating with us.<br />Your presence is the finest gift.
        </motion.p>
        <motion.div variants={child}><PearlDivider /></motion.div>
        <motion.h1 className="type-title thanks-card__names" variants={child}>
          {wedding.couple.first} <span className="thanks-card__amp">&amp;</span> {wedding.couple.second}
        </motion.h1>
        <motion.p className="type-date type-date--gold" variants={child}>{wedding.dateShort}</motion.p>
      </motion.div>

      <motion.div className="thanks-actions" initial="initial" animate="animate" variants={riseChild}>
        <button type="button" className="vbtn vbtn--white" onClick={onDetails}>Wedding details</button>
        <button type="button" className="vbtn vbtn--ghost" onClick={onReplay}>Replay</button>
      </motion.div>
    </section>
  );
}
