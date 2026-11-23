import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { riseChild, reducedChild } from "../lib/motion";
import { directionsUrl } from "../lib/maps";
import { downloadWeddingIcs } from "../lib/ics";
import { Photo } from "../components/Photo";
import { FloralEdge } from "../components/FloralEdge";

/**
 * Scene 06 — Detail cards · Heirloom Lace.
 * Lace-bordered venue cards, order of the day card, dress code card.
 */
export function Scene06Details() {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;

  return (
    <section className="scene scene-details" aria-label="Wedding details">
      <FloralEdge corner="tl" size={110} />
      <FloralEdge corner="br" size={150} />

      <motion.header className="scene-head" variants={riseChild} initial="initial" animate="animate">
        <p className="kicker">The details</p>
        <h1 className="type-display">Ceremony &amp; reception</h1>
      </motion.header>

      <motion.div
        className="details-list"
        variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } } }}
        initial="initial"
        animate="animate"
      >
        {wedding.events.map((e) => (
          <motion.article className="venue-card" key={e.name} variants={child}>
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

        <motion.article className="programme-card" variants={child}>
          <span className="programme-card__stitch" aria-hidden="true" />
          <h2 className="type-title">Order of the day</h2>
          <ul className="programme-list">
            {wedding.programme.map((row) => (
              <li className="programme-row" key={row.title}>
                <span className="type-body-strong programme-row__title">{row.title}</span>
                <span className="programme-row__dots" aria-hidden="true" />
                <span className="type-small text-secondary programme-row__time">{row.time}</span>
              </li>
            ))}
          </ul>
        </motion.article>

        <motion.article className="dress-card" variants={child}>
          <span className="dress-card__stitch" aria-hidden="true" />
          <p className="type-gold-italic">Dress code</p>
          <h2 className="type-title">{wedding.dress.headline}</h2>
          <p className="type-small text-secondary">{wedding.dress.text}</p>
        </motion.article>
      </motion.div>
    </section>
  );
}
