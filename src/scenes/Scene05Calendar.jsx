import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { inView, riseChild, reducedChild } from "../lib/motion";
import { FloralEdge } from "../components/FloralEdge";
import { PearlDivider } from "../components/PearlDivider";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

function useCountdown(target) {
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(t);
  }, [target]);
  return left;
}

/**
 * Scene 05 — Countdown calendar · Heirloom Lace.
 * February 2027 printed like a desk calendar; a gold ring marks the 20th;
 * days-to-go ticks beneath.
 */
export function Scene05Calendar() {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;
  const target = useMemo(() => new Date(wedding.dateISO).getTime(), []);
  const ms = useCountdown(target);

  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const ringRef = useRef(null);
  const reducedMotion = reduced;

  return (
    <section className="scene scene-calendar" aria-label="Countdown">
      <FloralEdge corner="tl" size={150} />
      <FloralEdge corner="br" size={150} />

      <motion.div
        className="calendar-card"
        variants={riseChild}
        initial="initial"
        whileInView="animate"
        viewport={inView}
        whileHover={reduced ? undefined : { y: -4 }}
      >
        <span className="calendar-card__stitch" aria-hidden="true" />
        <p className="type-display-italic calendar-card__month">February</p>
        <p className="type-overline calendar-card__year">2027</p>

        <div className="calendar" role="grid" aria-label="February 2027 calendar">
          <div className="calendar__row calendar__row--head" role="row">
            {WEEKDAYS.map((d, i) => (
              <span className="calendar__weekday" role="columnheader" key={`${d}-${i}`}>{d}</span>
            ))}
          </div>
          {[0, 1, 2, 3].map((w) => (
            <div className="calendar__row" role="row" key={w}>
              {DAYS.slice(w * 7, w * 7 + 7).map((d) => (
                <span className={`calendar__day${d === 20 ? " is-wedding" : ""}`} role="gridcell" key={d}>
                  {d === 20 && (
                    <motion.span
                      ref={ringRef}
                      className="calendar__ring"
                      aria-hidden="true"
                      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.6 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={inView}
                      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.8 }}
                    />
                  )}
                  <span className="calendar__num">{d}</span>
                  {d === 20 && <span className="visually-hidden"> — wedding day</span>}
                </span>
              ))}
            </div>
          ))}
        </div>

        <PearlDivider className="calendar-card__pearls" />
        <p className="type-subheading-italic calendar-card__left" aria-live="polite">
          {days > 0 ? `${days} days to go` : "Today is the day"}
        </p>
        <p className="type-small text-secondary">
          {days > 0 ? `${hours} hours · ${minutes} minutes` : "We are so glad you are here"}
        </p>
      </motion.div>
    </section>
  );
}
