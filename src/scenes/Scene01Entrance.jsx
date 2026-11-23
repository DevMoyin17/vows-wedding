import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { wedding } from "../lib/wedding";
import { sound } from "../lib/sound";

const RENDERS = {
  idle: "/assets/heirloom/envelope-idle.png",
  seal: "/assets/heirloom/env-seal.png",
  flap: "/assets/heirloom/env-flap.png",
  rise: "/assets/heirloom/env-rise.png",
  open: "/assets/heirloom/envelope-open.png",
};

/**
 * Scene 01 — Invitation entrance · Heirloom Lace.
 *
 * The design is a fixed 390×844 composition, so the whole stage (envelope
 * renders + heading + CTA + date) is laid out proportionally inside an
 * aspect-ratio frame and scales as one unit — exactly like the Figma frame.
 * Desktop swaps the stage for the wide satin render with a masked crop.
 *
 * GSAP choreography: seal lifts (280/22) → flap opens → card rises (260/24)
 * → names write on 80ms stagger. Reduced motion: 240ms cross-fade.
 */
export function Scene01Entrance({ onOpened }) {
  const [phase, setPhase] = useState("idle");
  const rootRef = useRef(null);
  const artRef = useRef(null);
  const satinRef = useRef(null);
  const stepARef = useRef(null);
  const stageRef = useRef(null);
  const stepBRef = useRef(null);
  const stepCRef = useRef(null);
  const tARef = useRef(null);
  const tBRef = useRef(null);
  const tCRef = useRef(null);
  const tDRef = useRef(null);
  const tlRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => () => tlRef.current?.kill(), []);

  const open = () => {
    if (phase !== "idle") return;
    setPhase("playing");
    void sound.startOnGesture();

    const isWide = window.matchMedia("(min-width: 768px)").matches;

    // Tablet and desktop use the exported 768×1024 / 1440×900 renders exactly
    // as supplied: one restrained camera push, then the scene transition.
    if (isWide) {
      if (reduced) {
        onOpened();
        return;
      }
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

      // Tablet: same beats and seconds as mobile (~5s).
      if (!isDesktop) {
        const ta = tARef.current;
        const tb = tBRef.current;
        const tc = tCRef.current;
        const td = tDRef.current;
        const wideText = rootRef.current?.querySelector(".env-cardtext--wide");
        gsap.set([ta, tb, tc, td], { opacity: 0 });
        const tl = gsap.timeline({ onComplete: onOpened });
        tl.to(ta, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.08)
          .to(artRef.current, { opacity: 0, duration: 0.6, ease: "none" }, 0.08)
          .to(tb, { opacity: 1, duration: 1.1, ease: "power1.inOut" }, 0.8)
          .to(ta, { opacity: 0, duration: 1.0, ease: "none" }, 1.6)
          .to(tc, { opacity: 1, duration: 1.1, ease: "power1.inOut" }, 2.0)
          .to(tb, { opacity: 0, duration: 1.1, ease: "power1.inOut" }, 2.0)
          .to(td, { opacity: 1, duration: 1.3, ease: "power1.inOut" }, 3.0)
          .to(tc, { opacity: 0, duration: 0.7, ease: "none" }, 3.6)
          .to(wideText, { opacity: 1, duration: 1.0, ease: "power2.out" }, 3.4)
          .fromTo(rootRef.current, { scale: 1 }, { scale: 1.03, duration: 4.2, ease: "sine.inOut" }, 0)
          .to({}, { duration: 0.8 });
        tlRef.current = tl;
        return;
      }
      const satin = satinRef.current;
      const stepA = stepARef.current;
      const stage = stageRef.current;
      const b = stepBRef.current;
      const c = stepCRef.current;
      const wideText = rootRef.current?.querySelector(".env-cardtext--wide");

      gsap.set([satin, stepA, b, c], { opacity: 0 });
      gsap.set(stage, { opacity: 0, scale: 0.82 });

      const tl = gsap.timeline({ onComplete: onOpened });
      tl
        // same beats and seconds as mobile (~5s)
        .to(satin, { opacity: 1, duration: 0.6, ease: "none" }, 0.08)
        .to(stepA, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.08)
        .to(artRef.current, { opacity: 0, duration: 0.6, ease: "none" }, 0.08)
        // flap opening
        .set(b, { opacity: 1 }, 0.8)
        .to(stage, { opacity: 1, scale: 1, duration: 1.1, ease: "power1.inOut" }, 0.8)
        .to(stepA, { opacity: 0, duration: 1.0, ease: "none" }, 1.6)
        .to(stage, { scale: 1.03, duration: 4.2, ease: "sine.inOut" }, 0.8)
        // card rise
        .to(b, { opacity: 0, duration: 1.1, ease: "power1.inOut" }, 2.0)
        .to(c, { opacity: 1, duration: 1.3, ease: "power1.inOut" }, 3.0)
        .to(wideText, { opacity: 1, duration: 1.0, ease: "power2.out" }, 3.4)
        .to({}, { duration: 0.8 });
      tlRef.current = tl;
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    if (reduced) {
      const tl = gsap.timeline({ onComplete: onOpened });
      tl.set(root.querySelector('[data-layer="open"]'), { opacity: 1 })
        .fromTo(root.querySelector(".env-cardtext"), { opacity: 0 }, { opacity: 1, duration: 0.24 })
        .to({}, { duration: 0.5 });
      tlRef.current = tl;
      return;
    }

    const [idle, seal, flap, rise, openL] = Array.from(root.querySelectorAll(".env-layer"));
    const burst = root.querySelector(".env-burst");
    const cardLines = root.querySelectorAll(".env-cardtext > *");

    const tl = gsap.timeline({ onComplete: onOpened });
    tlRef.current = tl;

    tl.set([seal, flap, rise, openL], { opacity: 0 })
      // slow-motion choreography (~4.8s total)
      .fromTo(idle, { scale: 1 }, { scale: 1.015, duration: 2.2, ease: "none" }, 0)
      .to(seal, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.08)
      .fromTo(burst, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1.15, duration: 0.6, ease: "power2.out" }, 0.08)
      .to(burst, { opacity: 0, scale: 1.4, duration: 0.8, ease: "power2.in" }, 0.7)
      .to(flap, { opacity: 1, duration: 1.1, ease: "power1.inOut" }, 0.8)
      .to(rise, { opacity: 1, duration: 1.1, ease: "power1.inOut" }, 2.0)
      .to([idle, seal, flap], { y: 16, opacity: 0.55, duration: 1.0, ease: "power1.in" }, 2.0)
      .to(openL, { opacity: 1, duration: 1.3, ease: "power1.inOut" }, 3.0)
      .to([idle, seal, flap, rise], { opacity: 0, duration: 0.7 }, 3.6)
      .to(cardLines, { opacity: 1, y: 0, duration: 1.0, stagger: 0.1, ease: "power2.out" }, 3.1)
      .fromTo(root, { scale: 1 }, { scale: 1.03, duration: 4.2, ease: "sine.inOut" }, 0)
      .to({}, { duration: 0.8 });
  };

  return (
    <section className="scene scene-entrance" aria-label="Invitation entrance" data-phase={phase}>
      <div ref={rootRef} className="env-stage">
        <div className="env-anim env-anim--tablet" aria-hidden="true">
          <img ref={tARef} className="env-anim__full" src="/assets/heirloom/tablet/step-01a.svg" alt="" draggable={false} />
          <img ref={tBRef} className="env-anim__full" src="/assets/heirloom/tablet/step-01b.svg" alt="" draggable={false} />
          <img ref={tCRef} className="env-anim__full" src="/assets/heirloom/tablet/step-01c.svg" alt="" draggable={false} />
          <img ref={tDRef} className="env-anim__full" src="/assets/heirloom/tablet/step-01d.svg" alt="" draggable={false} />
        </div>
        <div className="env-anim" aria-hidden="true">
          <img ref={satinRef} className="env-anim__satin" src="/assets/heirloom/desktop/satin.svg" alt="" draggable={false} />
          <div className="env-anim__patch" aria-hidden="true" />
          <img ref={stepARef} className="env-anim__full" src="/assets/heirloom/desktop/step-01a.png" alt="" draggable={false} />
          <div ref={stageRef} className="env-anim__stage">
            <img ref={stepBRef} className="env-anim__step" src="/assets/heirloom/desktop/step-01b.svg" alt="" draggable={false} />
            <img ref={stepCRef} className="env-anim__step" src="/assets/heirloom/desktop/step-01c.svg" alt="" draggable={false} />
          </div>
        </div>
        <div ref={artRef} className="scene-entrance__art">
          <img
            className="scene-entrance__art-tablet"
            src="/assets/heirloom/tablet/entrance.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <img
            className="scene-entrance__art-desktop"
            src="/assets/heirloom/desktop/entrance.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        </div>

        <div className="env-cardtext env-cardtext--wide" aria-live="polite">
          <p>TOGETHER WITH THEIR FAMILIES</p>
          <p className="env-cardtext__names">
            {wedding.couple.first}
            <br />
            &amp; {wedding.couple.second}
          </p>
          <p className="env-cardtext__request">request the pleasure of your company</p>
          <p className="env-cardtext__date">{wedding.dateShort}</p>
        </div>
        <div className="env-fill" aria-hidden="true">
          {Object.entries(RENDERS).map(([key, src]) => (
            <div key={key} className="env-layer" data-layer={key} style={{ backgroundImage: `url(${src})` }} />
          ))}
          <div className="env-burst" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                className="env-burst__star"
                viewBox="0 0 24 24"
                style={{
                  left: `${50 + Math.cos((i / 6) * Math.PI * 2) * 17}%`,
                  top: `${54 + Math.sin((i / 6) * Math.PI * 2) * 13}%`,
                  width: i % 2 ? 9 : 14,
                }}
              >
                <path d="M12 1l2.2 7.4L21 10l-6.8 1.6L12 19l-2.2-7.4L3 10l6.8-1.6L12 1z" fill="#d8b967" />
              </svg>
            ))}
          </div>
          <div className="env-cardtext" aria-live="polite">
            <p style={{ opacity: 0, transform: "translateY(12px)" }}>TOGETHER WITH THEIR FAMILIES</p>
            <p className="env-cardtext__names" style={{ opacity: 0, transform: "translateY(12px)" }}>
              {wedding.couple.first}
              <br />
              &amp; {wedding.couple.second}
            </p>
            <p className="env-cardtext__request" style={{ opacity: 0, transform: "translateY(12px)" }}>
              request the pleasure of your company
            </p>
            <p className="env-cardtext__date">{wedding.dateShort}</p>
          </div>
        </div>

        <div className="scene-entrance__head">
          <p className="type-overline">You are invited to the wedding of</p>
          <h1 className="scene-entrance__names">
            {phase === "idle" ? (
              <>
                {wedding.couple.first}
                <br className="br-mobile" />
                <span className="scene-entrance__amp">&amp;</span> {wedding.couple.second}
              </>
            ) : (
              <span className="visually-hidden">{wedding.couple.first} and {wedding.couple.second}</span>
            )}
          </h1>
        </div>

        <div className="scene-entrance__cta">
          <p className="scene-entrance__prompt">An invitation awaits you</p>
          {phase === "idle" && (
            <motion.button
              type="button"
              className="vbtn vbtn--foil scene-entrance__open"
              onClick={open}
              whileTap={reduced ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 520, damping: 16 }}
            >
              Open your invitation
            </motion.button>
          )}
          <p className="scene-entrance__music">
            <span className="pill__bars" aria-hidden="true"><i /><i /><i /><i /></span>
            <span className="music-label">
              <span className="only-mobile">
                {phase === "idle" ? "Opens with music. Turn your sound up." : "Now playing · Our song"}
              </span>
              <span className="only-desktop">
                Opens with music · {wedding.dateFooter}
              </span>
            </span>
          </p>
        </div>

        <p className="scene-entrance__date">{wedding.dateFooter}</p>
      </div>
    </section>
  );
}
