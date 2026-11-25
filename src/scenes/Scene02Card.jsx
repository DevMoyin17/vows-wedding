import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { inView, riseChild, reducedChild } from "../lib/motion";
import { Photo } from "../components/Photo";
import { WaxSeal } from "../components/WaxSeal";

/**
 * Scene 02 — The invitation card · Emerald edition.
 * A green and gold card with an oval portrait, the families, the request,
 * the couple's names and a direct RSVP action.
 */
export function Scene02Card({ onNext, onRsvp }) {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;

  return (
    <section className="scene scene-card" aria-label="The invitation">
      <motion.div
        className="scene-card__stage"
        variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}
        initial="initial"
        whileInView="animate"
        viewport={inView}
      >
        <motion.article
          className="invite-card"
          variants={child}
          whileHover={reduced ? undefined : { y: -4 }}
        >
          <div className="invite-card__portrait">
            <Photo
              photo={wedding.photos.hero}
              alt="Simeon and Janet in black and cream"
              width={320}
              height={420}
              crop="fill"
              gravity="faces"
            />
            <span className="invite-card__seal" aria-hidden="true">
              <WaxSeal size={72} alt="" />
            </span>
          </div>

          <div className="invite-card__content">
            <p className="invite-card__families">
              <span>{wedding.families.bride}</span>
              <span className="invite-card__family-amp">&amp;</span>
              <span>{wedding.families.groom}</span>
            </p>

            <p className="invite-card__request">{wedding.requestLine}</p>

            <span className="invite-card__rule" aria-hidden="true" />

            <h1 className="invite-card__names">
              <span className="invite-card__name">{wedding.couple.first}</span>
              <span className="invite-card__amp">&amp;</span>
              <span className="invite-card__name">{wedding.couple.second}</span>
            </h1>

            <p className="invite-card__date">{wedding.dateFooter}</p>

            <div className="invite-card__actions">
              <button type="button" className="vbtn vbtn--foil invite-card__cta" onClick={onNext}>
                See the details
              </button>
              <button type="button" className="vbtn vbtn--white invite-card__cta" onClick={onRsvp}>
                RSVP by {wedding.rsvpBy}
              </button>
            </div>
          </div>
        </motion.article>
      </motion.div>
    </section>
  );
}
