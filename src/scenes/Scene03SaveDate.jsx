import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { riseChild, reducedChild } from "../lib/motion";
import { FloralEdge } from "../components/FloralEdge";
import { PearlDivider } from "../components/PearlDivider";

/**
 * Scene 03 — Save the date · Heirloom Lace.
 * Two cards slightly fanned; the front card slides out from behind.
 */
export function Scene03SaveDate() {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;

  return (
    <section className="scene scene-save" aria-label="Save the date">
      <FloralEdge corner="tl" size={150} />
      <FloralEdge corner="br" size={150} />

      <div className="save-stage">
        <motion.div
          className="save-card save-card--back"
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: 40, rotate: 2 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0, rotate: 2 }}
          transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          aria-hidden="true"
        />

        <motion.div
          className="save-card save-card--front"
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: -60, rotate: -3 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0, rotate: -3 }}
          transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.12 }}
        >
          <motion.p className="type-gold-italic" variants={child}>Save the date</motion.p>
          <motion.p className="type-numeral save-card__20" variants={child}>
            20
          </motion.p>
          <motion.p className="type-date save-card__month" variants={child}>
            February 2027
          </motion.p>
          <motion.div variants={child}>
            <PearlDivider />
          </motion.div>
          <motion.p className="type-subheading-italic text-secondary" variants={child}>
            {wedding.city}
          </motion.p>
          <motion.p className="type-small text-secondary" variants={child}>
            Formal invitation to follow
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
