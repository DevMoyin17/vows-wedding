import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { inView, riseChild, reducedChild } from "../lib/motion";

function StoryCard({ item, child, reduced, wide = false }) {
  const [open, setOpen] = useState(false);
  const paragraphs = Array.isArray(item.text) ? item.text : [item.text];
  const visible = open ? paragraphs : paragraphs.slice(0, 1);

  return (
    <motion.li
      className={`letter-card${wide ? " letter-card--wide" : ""}`}
      variants={child}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      <div className="letter-card__heading">
        <p className="letter-card__date">{item.date}</p>
        <h2 className="letter-card__title">{item.title}</h2>
      </div>
      <div className="letter-card__body">
        {visible.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      {paragraphs.length > 1 && (
        <button
          type="button"
          className="letter-card__more"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {open ? "Read less" : "Read more"}
        </button>
      )}
    </motion.li>
  );
}

/**
 * Scene 04 — Letters from our love story · Emerald edition.
 * Three note cards and one wide wedding card, in cream and green.
 */
export function Scene04Letters() {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;

  return (
    <section className="scene scene-letters" aria-label="Our story">
      <motion.header
        className="scene-head"
        variants={riseChild}
        initial="initial"
        whileInView="animate"
        viewport={inView}
      >
        <p className="kicker">Letters from</p>
        <h1 className="type-display">Our Love Story</h1>
        <p className="story-intro">
          {wedding.storyIntro}
        </p>
      </motion.header>

      <motion.ol
        className="letters-list"
        variants={{ animate: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
        initial="initial"
        whileInView="animate"
        viewport={inView}
      >
        {wedding.story.map((m, index) => (
          <StoryCard key={m.title} item={m} child={child} reduced={reduced} wide={index === 3} />
        ))}
      </motion.ol>
    </section>
  );
}
