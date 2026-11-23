import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { inView, riseChild, reducedChild } from "../lib/motion";
import { Photo } from "../components/Photo";
import { FloralEdge } from "../components/FloralEdge";
import { Lightbox } from "../components/Lightbox";

/**
 * Scene 07 — Photographs · Heirloom Lace.
 * Two-column keepsake cards, each with a white print frame and an italic
 * caption; tap for the lightbox.
 */
export function Scene07Gallery() {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;
  const [lb, setLb] = useState(null);

  const items = wedding.gallery.map((g) => ({
    photo: wedding.photos[g.photoKey],
    alt: g.alt,
    caption: g.caption,
    photoKey: g.photoKey,
  }));

  return (
    <section className="scene scene-gallery" aria-label="Photographs">
      <FloralEdge corner="tl" size={110} />
      <FloralEdge corner="br" size={150} />

      <motion.header className="scene-head" variants={riseChild} initial="initial" whileInView="animate" viewport={inView}>
        <p className="kicker">Keepsakes</p>
        <h1 className="type-display">Photographs</h1>
      </motion.header>

      <motion.div
        className="keepsake-grid"
        variants={{ animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
        initial="initial"
        whileInView="animate"
        viewport={inView}
      >
        {wedding.gallery.map((g, i) => (
          <motion.button
            key={g.photoKey}
            className="keepsake"
            variants={child}
            onClick={() => setLb(i)}
            aria-label={`Open ${g.caption}`}
            whileHover={reduced ? undefined : { y: -4 }}
            whileTap={reduced ? undefined : { scale: 0.99 }}
          >
            <span className="keepsake__printwrap">
              <Photo
                photo={wedding.photos[g.photoKey]}
                alt={g.alt}
                width={320}
                height={400}
                className="keepsake__photo"
                crop="fill"
                gravity="faces"
              />
            </span>
            <span className="keepsake__caption">{g.caption}</span>
          </motion.button>
        ))}
      </motion.div>

      <Lightbox items={items} index={lb} onClose={() => setLb(null)} onIndex={(i) => setLb(i)} />
    </section>
  );
}
