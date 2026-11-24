import { useState } from "react";
import { motion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { inView, riseChild } from "../lib/motion";
import { Photo } from "../components/Photo";
import { FloralEdge } from "../components/FloralEdge";
import { Lightbox } from "../components/Lightbox";

/**
 * Scene 07 — Our Gallery · Heirloom Lace.
 * A continuous marquee of keepsake prints; tap one for the lightbox.
 */
export function Scene07Gallery() {
  const [lb, setLb] = useState(null);

  const items = wedding.gallery.map((g) => ({
    photo: wedding.photos[g.photoKey],
    alt: g.alt,
    caption: g.caption,
    photoKey: g.photoKey,
  }));

  return (
    <section className="scene scene-gallery" aria-label="Our gallery">
      <FloralEdge corner="tl" size={110} />
      <FloralEdge corner="br" size={150} />

      <motion.header className="scene-head" variants={riseChild} initial="initial" whileInView="animate" viewport={inView}>
        <h1 className="type-display">Our Gallery</h1>
      </motion.header>

      <div className="gallery-marquee">
        <div className="gallery-track">
          {[0, 1].map((copy) => (
            <div
              className="gallery-group"
              key={copy}
              aria-hidden={copy ? true : undefined}
            >
              {wedding.gallery.map((g, i) => (
                <button
                  type="button"
                  key={`${copy}-${g.photoKey}`}
                  className="keepsake"
                  onClick={() => setLb(i)}
                  aria-label={`Open ${g.caption}`}
                  tabIndex={copy ? -1 : undefined}
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
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Lightbox items={items} index={lb} onClose={() => setLb(null)} onIndex={(i) => setLb(i)} />
    </section>
  );
}
