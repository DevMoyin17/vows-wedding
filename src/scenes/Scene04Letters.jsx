import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { inView, riseChild, reducedChild } from "../lib/motion";
import { FloralEdge } from "../components/FloralEdge";

function StoryCard({ item, child, reduced }) {
  const [open, setOpen] = useState(false);
  const paragraphs = Array.isArray(item.text) ? item.text : [item.text];
  const visible = open ? paragraphs : paragraphs.slice(0, 1);

  return (
    <motion.li
      className="letter-card"
      variants={child}
      whileHover={reduced ? undefined : { y: -4 }}
    >
      <span className="letter-card__stitch" aria-hidden="true" />
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
        whileInView="animate"
        viewport={inView}
      >
        <p className="kicker">Letters from</p>
        <h1 className="type-display">Our Love story</h1>
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
        {wedding.story.map((m) => (
          <StoryCard key={m.title} item={m} child={child} reduced={reduced} />
        ))}
      </motion.ol>
    </section>
  );
}
