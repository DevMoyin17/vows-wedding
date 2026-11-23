import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Photo } from "./Photo";

/** Tap-to-expand lightbox: counter, ✕, arrows, swipe, Esc. */
export function Lightbox({ items, index, onClose, onIndex }) {
  const [loaded, setLoaded] = useState(false);
  const touchX = useRef(null);
  const reduced = useReducedMotion();
  const open = index !== null;

  const prev = useCallback(() => {
    if (index === null) return;
    onIndex((index - 1 + items.length) % items.length);
  }, [index, items.length, onIndex]);

  const next = useCallback(() => {
    if (index === null) return;
    onIndex((index + 1) % items.length);
  }, [index, items.length, onIndex]);

  useEffect(() => {
    if (!open) return;
    setLoaded(false);
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, prev, next]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const item = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${index + 1} of ${items.length}`}
          initial={reduced ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (dx > 48) prev();
            else if (dx < -48) next();
            touchX.current = null;
          }}
        >
          <button className="lightbox__close" onClick={onClose} aria-label="Close photo">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <span className="lightbox__counter">{index + 1} / {items.length}</span>
          {!loaded && <div className="lightbox__loading" aria-hidden="true" />}
          <motion.div
            key={item.photoKey || item.src}
            className="lightbox__frame"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <Photo photo={item.photo} alt={item.alt} width={1080} className="lightbox__img" loading="eager" crop="limit" onLoad={() => setLoaded(true)} />
            <p className="lightbox__caption type-subheading-italic">{item.caption}</p>
          </motion.div>
          <button className="lightbox__nav lightbox__nav--prev" onClick={prev} aria-label="Previous photo">
            <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
              <path d="M9 2L3 8l6 6M3 8h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </svg>
          </button>
          <button className="lightbox__nav lightbox__nav--next" onClick={next} aria-label="Next photo">
            <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
              <path d="M13 2l6 6-6 6M19 8H1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </svg>
          </button>
          <span className="lightbox__hint">Swipe to see more</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
