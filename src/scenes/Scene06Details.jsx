import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { inView, riseChild, reducedChild } from "../lib/motion";
import { directionsUrl } from "../lib/maps";
import { downloadWeddingIcs } from "../lib/ics";
import { Photo } from "../components/Photo";

/**
 * Scene 06 — Locations & dress code · Emerald edition.
 * A green locations band with three ceremony cards, followed by the cream
 * Aso Ebi dress code panel.
 */
export function Scene06Details() {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;

  return (
    <section className="scene scene-details" aria-label="Wedding details">
      <div className="details-band details-band--locations">
        <motion.header className="scene-head" variants={riseChild} initial="initial" whileInView="animate" viewport={inView}>
          <p className="kicker">The details</p>
          <h1 className="type-display">Locations</h1>
          <p className="story-intro">Three moments across one day, in the order they happen.</p>
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
              whileHover={reduced ? undefined : { y: -7, rotate: -0.35 }}
              whileTap={reduced ? undefined : { scale: 0.99 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Photo
                photo={wedding.photos[e.photoKey]}
                alt={e.name}
                width={640}
                height={330}
                className="venue-card__photo"
              />
              <p className="venue-card__time">{e.time}</p>
              <p className="venue-card__label">{e.label}</p>
              <h2>{e.name}</h2>
              <p className="venue-card__meta">{e.address}</p>
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
        </motion.div>
      </div>

      <div className="details-band details-band--dress">
        <motion.article
          className="dress-card dress-card--code"
          variants={child}
          initial="initial"
          whileInView="animate"
          viewport={inView}
          whileHover={reduced ? undefined : { y: -6 }}
          whileTap={reduced ? undefined : { scale: 0.995 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className="dress-card__copy">
            <p className="dress-card__eyebrow">{wedding.dress.eyebrow}</p>
            <h2 className="dress-card__title">{wedding.dress.title}</h2>
            <p className="dress-card__copytext">{wedding.dress.intro}</p>
            <p className="dress-card__copytext">{wedding.dress.guide}</p>
          </div>
          <div className="dress-card__palette">
            <div className="dress-palette" aria-label="Colour palette: blush pink and cream">
              {wedding.dress.palette.map((colour) => (
                <div className="dress-swatch" key={colour.name}>
                  <span className="dress-swatch__chip" style={{ background: colour.color }} aria-hidden="true" />
                  <span className="dress-swatch__label">{colour.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
