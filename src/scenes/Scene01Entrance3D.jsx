import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { wedding } from "../lib/wedding";
import { sound } from "../lib/sound";
import { useEntranceLayout } from "../lib/useEntranceLayout";
import { MusicChip } from "../components/MusicChip";
import { PORTRAIT, WIDE } from "../lib/openingGeometry";
import { resolveTheme } from "../three/envelope/themes";
import { Z } from "../three/envelope/framing";

// three.js loads on its own, after the page's text is already on screen
const EnvelopeCanvas = lazy(() => import("../three/envelope/EnvelopeCanvas"));

/* tablet's Figma Default sits the envelope 79.5 px higher than its keyframes */
const IDLE_SHIFT = { mobile: 0, tablet: (-79.5 / 1024) * 100, desktop: 0 };

/**
 * Scene 01 — Invitation entrance, in real 3D (prototype).
 *
 * The envelope, lace, wax seal, card, pearls and petals are built in code
 * (src/three/envelope) and coloured by the template theme, so the same
 * scene serves every template and a couple's own colours. The HTML around
 * it (heading, button, music, date) is the same as the image-based scene.
 *
 * Tap "Open your invitation": the seal is pressed and cracks, lifts off and
 * comes to rest on the satin; the flap hinges open; the card slides out of
 * the pocket, rises towards you and settles over the envelope; then the
 * first page.
 */
export function Scene01Entrance3D({ onOpened }) {
  const [phase, setPhase] = useState("idle");
  const [ready, setReady] = useState(false);
  const rootRef = useRef(null);
  const sectionRef = useRef(null);
  const holdRef = useRef(false);
  const tlRef = useRef(null);
  const partsRef = useRef(null);
  const reduced = useReducedMotion();
  const bp = useEntranceLayout();
  const G = bp === "desktop" ? WIDE : PORTRAIT;
  const layoutKey = bp === "desktop" ? "wide" : "portrait";
  const theme = useMemo(() => resolveTheme(wedding.template), []);
  const words = useMemo(
    () => ({
      initials: wedding.couple.initials,
      over: "Together with their families",
      names: [wedding.couple.first, `& ${wedding.couple.second}`],
      request: "request the pleasure of your company",
      date: wedding.dateShort,
    }),
    [],
  );

  // the card is printed with the site's fonts: wait for them
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    const loads = ['600 80px "Cormorant Garamond"', '400 80px "Cormorant Garamond"', 'italic 400 80px "Cormorant Garamond"', '500 40px "DM Sans"'].map(
      (f) => document.fonts?.load(f).catch(() => {}),
    );
    Promise.all(loads).then(() => setFontsReady(true));
  }, []);

  useEffect(() => () => tlRef.current?.kill(), []);
  const onReady = useCallback(() => setReady(true), []);
  // draw continuously while the scene settles in (fonts, textures, size), then
  // only on demand until the tap, to spare the battery
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setSettled(true), 1500);
    return () => clearTimeout(t);
  }, [ready]);

  const open = () => {
    const P = partsRef.current;
    if (phase !== "idle" || !P) return;
    setPhase("playing");
    document.body.style.cursor = "";
    void sound.startOnGesture();

    const { rig, f, d, flap, seal, flakes, card, gloss } = P;
    rig.started = true;
    const root = rootRef.current;
    const finish = () => {
      setPhase("open");
      onOpened();
    };

    const crack = () => {
      seal.whole.scale.setScalar(0.0001);
      seal.main.scale.setScalar(1);
      seal.chip.children[0].scale.setScalar(1);
    };
    const restZ = Z.satin; // the puddle comes to rest on the satin

    if (reduced) {
      const tl = gsap.timeline({ onComplete: finish });
      tl.call(() => {
        crack();
        flap.rotation.x = -Math.PI;
        seal.group.position.set(f.sealRest.x, f.sealRest.y, Z.satin);
        card.position.set(f.card.x, f.card.y, f.card.z);
        Object.assign(rig, { s: f.end.s, fx: f.end.fx, fy: f.end.fy, oy: 0 });
      })
        .to({}, { duration: 1.8 })
        .to(root, { autoAlpha: 0, duration: 0.3 });
      tlRef.current = tl;
      return;
    }

    const tl = gsap.timeline({ onComplete: finish });
    tlRef.current = tl;
    if (import.meta.env.DEV) window.__openingTimeline = tl;

    const R = d.sealR;
    tl
      /* 1 · the camera leans in; the seal is pressed and cracks ------------ */
      .to(rig, { oy: 0, duration: 1.1, ease: "sine.inOut" }, 0)
      .set(rig, { fx: 0, fy: d.sealY }, 0)
      .to(rig, { s: bp === "desktop" ? 1.07 : 1.12, duration: 1.15, ease: "sine.inOut" }, 0.05)
      .to(seal.group.scale, { x: 0.975, y: 0.975, z: 0.78, duration: 0.28, ease: "power2.out" }, 0.1)
      .call(crack, null, 0.66)
      .call(() => navigator.vibrate?.(10), null, 0.68)
      .to(seal.group.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: "back.out(2)" }, 0.68)
      .to(seal.chip.position, { x: 0.05 * R, y: 0.03 * R, z: 0.03, duration: 0.5, ease: "power2.out" }, 0.7)
      .to(seal.chip.rotation, { y: 0.35, z: -0.12, duration: 0.5, ease: "power2.out" }, 0.7)
      .fromTo(flakes, { t: 0 }, { t: 1, duration: 1.3, ease: "power1.out" }, 0.68)

      /* 2 · the camera eases back; the seal lifts off onto the satin ------- */
      .to(rig, { s: 1, duration: 1.0, ease: "sine.inOut" }, 1.2)
      .to(seal.group.position, { x: f.sealRest.x, y: f.sealRest.y, duration: 1.15, ease: "power2.inOut" }, 1.22)
      .to(seal.group.position, { keyframes: { z: [seal.group.position.z, 0.55, restZ] }, duration: 1.15, ease: "sine.inOut" }, 1.22)
      .to(seal.group.rotation, { keyframes: { x: [0, 0.35, 0], y: [0, -0.25, 0] }, z: 0.35, duration: 1.15, ease: "sine.inOut" }, 1.22)
      .to(seal.chip.position, { x: 0.5 * R, y: -0.16 * R, z: 0, duration: 1.15, ease: "power2.inOut" }, 1.22)
      .to(seal.chip.rotation, { y: 0, z: -0.45, duration: 1.15, ease: "power2.inOut" }, 1.22)

      /* 3 · the flap hinges open ------------------------------------------ */
      // (the paper's bend follows the angle: EnvelopeCanvas)
      .to(flap.rotation, { x: -Math.PI, duration: 1.6, ease: "power1.inOut" }, 1.35)

      /* 4 · the card slides up out of the pocket -------------------------- */
      .to(card.position, { y: P.cardYOut, duration: 1.45, ease: "sine.inOut" }, 2.6)
      .to(card.rotation, { z: -0.022, duration: 1.45, ease: "sine.inOut" }, 2.6)

      /* 5 · it lifts towards you and settles over the envelope ------------- */
      .set(rig, { fx: f.end.fx, fy: f.end.fy }, 4.05)
      .to(rig, { s: f.end.s, duration: 1.3, ease: "power2.inOut" }, 4.05)
      .to(card.position, { x: f.card.x, y: f.card.y, duration: 1.35, ease: "power2.inOut" }, 4.05)
      .to(card.position, { z: f.card.z, duration: 1.35, ease: "power2.inOut" }, 4.05)
      .to(card.rotation, { keyframes: { x: [0, -0.22, 0], y: [0, 0.08, 0] }, z: 0, duration: 1.35, ease: "sine.inOut" }, 4.05)

      /* 6 · a glint across the card, a moment to read, then the first page */
      .fromTo(gloss.uP, { value: -0.6 }, { value: 1.9, duration: 1.4, ease: "power1.inOut" }, 5.5)
      // the hold is marked on the element, not in React state: a re-render
      // here would cost a frame just as the card settles
      .call(
        () => {
          holdRef.current = true;
          const el = sectionRef.current;
          if (!el) return;
          el.dataset.phase = "hold";
          el.querySelector(".scene-entrance__skip")?.setAttribute("aria-hidden", "false");
        },
        null,
        5.5,
      )
      // the card has settled on the envelope at 5.4 s: two seconds to read it
      .add("out", 7.4)
      .call(() => setPhase("leaving"), null, "out")
      .to(root, { autoAlpha: 0, duration: 0.6, ease: "power1.in" }, "out");
  };

  // tapping the wax seal opens the envelope too
  const openRef = useRef(open);
  openRef.current = open;
  const onSealTap = useCallback(() => openRef.current(), []);

  const skipHold = () => {
    if (holdRef.current && phase === "playing") tlRef.current?.seek("out");
  };

  const musicLabel =
    bp === "desktop" ? `Opens with music  ·  ${wedding.dateFooter.replace(" · ", " ")}` : "Opens with music. Turn your sound up.";

  return (
    <section
      ref={sectionRef}
      className="scene scene-entrance scene-entrance--3d"
      aria-label="Invitation entrance"
      data-phase={phase}
      data-bp={bp}
      data-ready={ready || undefined}
      onClick={skipHold}
      style={{ "--e3d-satin": theme.satin[1] }}
    >
      <div ref={rootRef} className="env-stage">
        <div className="e3d-stage" aria-hidden="true">
          {fontsReady && (
            <Suspense fallback={null}>
              <EnvelopeCanvas
                key={layoutKey}
                G={G}
                layoutKey={layoutKey}
                theme={theme}
                words={words}
                idleShift={IDLE_SHIFT[bp]}
                partsRef={partsRef}
                onReady={onReady}
                onSealTap={onSealTap}
                playing={!settled || phase === "playing" || phase === "hold"}
              />
            </Suspense>
          )}
        </div>

        <div className="scene-entrance__light scene-entrance__light--top" aria-hidden="true" />
        <div className="scene-entrance__light scene-entrance__light--bottom" aria-hidden="true" />

        <MusicChip className="scene-entrance__chip" expandedLabel="Now playing · Our song" />

        <div className="scene-entrance__head">
          <p className="type-overline">You are invited to the wedding of</p>
          <h1 className="scene-entrance__names">
            {wedding.couple.first}
            <br className="br-mobile" /> &amp; {wedding.couple.second}
          </h1>
        </div>

        <div className="scene-entrance__cta">
          <p className="scene-entrance__prompt">An invitation awaits you</p>
          {phase === "idle" && (
            <motion.button
              type="button"
              className="vbtn vbtn--foil scene-entrance__open"
              onClick={open}
              disabled={!ready}
              whileTap={reduced ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 520, damping: 16 }}
            >
              Open your invitation
            </motion.button>
          )}
          <p className="scene-entrance__music">
            <span className="pill__bars" aria-hidden="true"><i /><i /><i /><i /></span>
            <span className="music-label">{musicLabel}</span>
          </p>
        </div>

        <p className="scene-entrance__date">{wedding.dateFooter}</p>
        <p className="scene-entrance__skip" aria-hidden="true">Tap to continue</p>
      </div>
    </section>
  );
}
