import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { inView, riseChild, reducedChild } from "../lib/motion";
import { useCountdown } from "../lib/useCountdown";
import { downloadWeddingIcs } from "../lib/ics";
import { Photo } from "../components/Photo";

const pad = (value) => String(value).padStart(2, "0");

/**
 * Scene 03 — The Countdown.
 * The section heading sits above a cinematic couple portrait; the live timer,
 * date and add-to-calendar action sit on the photograph.
 */
export function Scene03SaveDate() {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;
  const target = useMemo(() => new Date(wedding.dateISO).getTime(), []);
  const left = useCountdown(target);
  const married = Date.now() >= target;

  const days = Math.floor(left / 86400000);
  const hours = Math.floor((left % 86400000) / 3600000);
  const minutes = Math.floor((left % 3600000) / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  const eventTime = wedding.events?.[0]?.time ?? "8:00 AM";

  const units = [
    { value: days, label: "days" },
    { value: hours, label: "hours" },
    { value: minutes, label: "min" },
    { value: seconds, label: "sec" },
  ];

  return (
    <section className="scene scene-save-date" aria-label="Save the date">
      <motion.header
        className="save-date__head"
        variants={riseChild}
        initial="initial"
        whileInView="animate"
        viewport={inView}
      >
        <p className="kicker">Save the date</p>
        <h1 className="type-display">{married ? "The Celebration" : "The Countdown"}</h1>
      </motion.header>

      <div className="save-date__stage">
        <Photo
          photo={wedding.photos.saveTheDate}
          alt=""
          width={1536}
          height={1024}
          className="save-date__photo"
          loading="lazy"
        />
        <div className="save-date__veil" aria-hidden="true" />

        <motion.div
          className="save-date__content"
          initial="initial"
          whileInView="animate"
          viewport={inView}
          variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } } }}
        >
          {married ? (
            <motion.p className="save-date__married" variants={child}>
              We’re married
            </motion.p>
          ) : (
            <motion.div
              className="save-date__timer"
              variants={child}
              role="timer"
              aria-label="Countdown to the wedding"
              aria-live="off"
            >
              {units.map((unit) => (
                <div className="save-date__unit" key={unit.label}>
                  <span className="save-date__num">{pad(unit.value)}</span>
                  <span className="save-date__label">{unit.label}</span>
                </div>
              ))}
            </motion.div>
          )}

          <motion.p className="save-date__when" variants={child}>
            {wedding.dateLong} · {eventTime}
          </motion.p>

          {married ? (
            <motion.p className="save-date__married-note" variants={child}>
              Thank you for celebrating with us.
            </motion.p>
          ) : (
            <motion.button
              type="button"
              className="save-date__cta"
              variants={child}
              onClick={downloadWeddingIcs}
            >
              Add to calendar
            </motion.button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
