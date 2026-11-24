import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { inView, riseChild, reducedChild } from "../lib/motion";
import { directionsUrl } from "../lib/maps";
import { downloadWeddingIcs } from "../lib/ics";
import { Photo } from "../components/Photo";
import { FloralEdge } from "../components/FloralEdge";

/**
 * Scene 06 — Detail cards · Heirloom Lace.
 * Lace-bordered venue cards and the Aso Ebi dress code card.
 */
export function Scene06Details() {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;

  return (
    <section className="scene scene-details" aria-label="Wedding details">
      <FloralEdge corner="tl" size={110} />
      <FloralEdge corner="br" size={150} />

      <motion.header className="scene-head" variants={riseChild} initial="initial" whileInView="animate" viewport={inView}>
        <p className="kicker">The details</p>
        <h1 className="type-display">Venues</h1>
      </motion.header>

      <motion.div
        className="details-list"
        variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } } }}
        initial="initial"
        whileInView="animate"
        viewport={inView}
      >
        {wedding.events.map((e) => (
          <motion.article
            className="venue-card"
            key={`${e.label}-${e.name}`}
            variants={child}
            whileHover={reduced ? undefined : { y: -4 }}
          >
            <span className="venue-card__stitch" aria-hidden="true" />
            <Photo
              photo={wedding.photos[e.photoKey]}
              alt={e.name}
              width={640}
              height={330}
              className="venue-card__photo"
            />
            <p className="venue-card__label">{e.label}</p>
            <h2>{e.name}</h2>
            <p className="venue-card__meta">{e.time} · {e.address}</p>
            <div className="venue-card__actions">
              <a className="vbtn vbtn--ink" href={directionsUrl(e)} target="_blank" rel="noreferrer">
                Directions
              </a>
              <button type="button" className="vbtn vbtn--white" onClick={downloadWeddingIcs}>
                Calendar
              </button>
            </div>
          </motion.article>
        ))}

        <motion.article className="dress-card dress-card--code" variants={child} whileHover={reduced ? undefined : { y: -4 }}>
          <span className="dress-card__stitch" aria-hidden="true" />
          <p className="dress-card__eyebrow">{wedding.dress.eyebrow}</p>
          <h2 className="dress-card__title">{wedding.dress.title}</h2>
          <p className="dress-card__copy">{wedding.dress.intro}</p>
          <p className="dress-card__copy">{wedding.dress.guide}</p>
          <div className="dress-palette" aria-label="Colour palette: blush pink and cream">
            {wedding.dress.palette.map((colour) => (
              <div className="dress-swatch" key={colour.name}>
                <span className="dress-swatch__chip" style={{ background: colour.color }} aria-hidden="true" />
                <span className="dress-swatch__label">{colour.name}</span>
              </div>
            ))}
          </div>
        </motion.article>
      </motion.div>
    </section>
  );
}
