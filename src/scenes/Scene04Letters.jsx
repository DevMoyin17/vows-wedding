import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { riseChild, reducedChild } from "../lib/motion";
import { Photo } from "../components/Photo";
import { FloralEdge } from "../components/FloralEdge";

/**
 * Scene 04 — Letters · Heirloom Lace.
 * Each chapter is a small note card with a photo and a dated italic heading;
 * cards deal in one after another.
 */
export function Scene04Letters() {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;

  return (
    <section className="scene scene-letters" aria-label="Our story">
      <FloralEdge corner="tl" size={110} />
      <FloralEdge corner="br" size={150} />

      <motion.header
        className="scene-head"
        variants={riseChild}
        initial="initial"
        animate="animate"
      >
        <p className="kicker">Letters from</p>
        <h1 className="type-display">Our story</h1>
        <p className="story-intro">
          From a birthday dinner in Ibadan to “I do” — these are the letters that brought us here.
        </p>
      </motion.header>

      <motion.ol
        className="letters-list"
        variants={{ animate: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
        initial="initial"
        animate="animate"
      >
        {wedding.story.map((m) => (
          <motion.li key={m.title} className="letter-card" variants={child}>
            <span className="letter-card__stitch" aria-hidden="true" />
            <div className="letter-card__top">
              <Photo
                photo={wedding.photos[m.photoKey]}
                alt=""
                width={88}
                height={88}
                className="letter-card__photo"
                crop="fill"
                gravity="faces"
              />
              <div className="letter-card__heading">
                <p className="letter-card__date">{m.date}</p>
                <h2 className="letter-card__title">{m.title}</h2>
              </div>
            </div>
            <p className="letter-card__body">{m.text}</p>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  );
}
