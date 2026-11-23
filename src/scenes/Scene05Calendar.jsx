import { motion, useReducedMotion } from "framer-motion";
import { inView, riseChild } from "../lib/motion";
import { FloralEdge } from "../components/FloralEdge";
import { PearlDivider } from "../components/PearlDivider";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

/**
 * Scene 05 — February 2027 calendar.
 * The month printed like a desk calendar with the wedding day ringed in gold.
 */
export function Scene05Calendar() {
  const reduced = useReducedMotion();

  return (
    <section className="scene scene-calendar" aria-label="Calendar">
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
            {WEEKDAYS.map((day, index) => (
              <span className="calendar__weekday" role="columnheader" key={`${day}-${index}`}>
                {day}
              </span>
            ))}
          </div>
          {[0, 1, 2, 3].map((week) => (
            <div className="calendar__row" role="row" key={week}>
              {DAYS.slice(week * 7, week * 7 + 7).map((day) => (
                <span
                  className={`calendar__day${day === 20 ? " is-wedding" : ""}`}
                  role="gridcell"
                  key={day}
                >
                  {day === 20 && (
                    <motion.span
                      className="calendar__ring"
                      aria-hidden="true"
                      initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.6 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={inView}
                      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.8 }}
                    />
                  )}
                  <span className="calendar__num">{day}</span>
                  {day === 20 && <span className="visually-hidden"> — wedding day</span>}
                </span>
              ))}
            </div>
          ))}
        </div>

        <PearlDivider className="calendar-card__pearls" />
        <p className="type-subheading-italic calendar-card__left">The wedding day</p>
        <p className="type-small text-secondary">Saturday, 20 February 2027</p>
      </motion.div>
    </section>
  );
}
