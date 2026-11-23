import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { riseChild, reducedChild } from "../lib/motion";
import { Photo } from "../components/Photo";
import { FloralEdge } from "../components/FloralEdge";
import { PearlDivider } from "../components/PearlDivider";

/**
 * Scene 02 — The invitation card · Heirloom Lace.
 * Exact geometry from Figma 192:6477 (mobile) / 239:5672 (desktop):
 * 16px card, 1px solid #ebdada + dashed 7px lace border at 70%,
 * 160×200 oval portrait, 34/40 names, and the desktop photo prints.
 */
export function Scene02Card({ onNext }) {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;

  return (
    <section className="scene scene-card" aria-label="The invitation">
      <FloralEdge corner="tl" size={150} />
      <FloralEdge corner="br" size={150} />

      <motion.div className="scene-card__stage" variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }} initial="initial" animate="animate">
        <div className="scene-card__prints" aria-hidden="true">
          <motion.figure className="print print--large" variants={child}>
            <Photo photo={wedding.photos.hero} alt="" width={360} height={480} />
          </motion.figure>
          <motion.figure className="print print--small" variants={child}>
            <Photo photo={wedding.photos.rings} alt="" width={200} height={200} />
          </motion.figure>
        </div>

        <motion.article className="invite-card" variants={child}>
          <div className="invite-card__portrait">
            <Photo
              photo={wedding.photos.hero}
              alt="Deborah and Michael walking hand in hand"
              width={160}
              height={200}
              crop="fill"
              gravity="faces"
            />
          </div>

          <p className="invite-card__families">
            <span>{wedding.families.bride}</span>
            <span>&amp;</span>
            <span>{wedding.families.groom}</span>
          </p>

          <p className="invite-card__request">{wedding.requestLine}</p>

          <PearlDivider className="invite-card__pearls" />

          <h1 className="invite-card__names">
            <span>{wedding.couple.first}</span>
            <span className="invite-card__amp">&amp;</span>
            <span>{wedding.couple.second}</span>
          </h1>

          <p className="invite-card__date">{wedding.dateFooter}</p>

          <button type="button" className="vbtn vbtn--soft invite-card__cta" onClick={onNext}>
            See the details
          </button>
        </motion.article>
      </motion.div>
    </section>
  );
}
