import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { wedding } from "../lib/wedding";
import { sound } from "../lib/sound";
import { useEntranceLayout } from "../lib/useEntranceLayout";
import { MusicChip } from "../components/MusicChip";
import { PORTRAIT, WIDE } from "../lib/openingGeometry";

const SHARED = "/assets/heirloom/opening/stage"; // card + inside of the flap
const SPARKLE = "/assets/heirloom/opening/sparkle.svg";
const DUST = Array.from({ length: 16 }, (_, i) => i);
const rotOf = (el) => Number(el.style.getPropertyValue("--rot")) || 0;

/**
 * Everything the scene needs for one Figma render, as % of that render.
 * The plate is the render object-cover'd onto the screen exactly like the
 * Figma frames, so % of the plate is % of the render.
 */
function layout(G) {
  const W = G.IMG.w;
  const H = G.IMG.h;
  const pctX = (x) => `${(x / W) * 100}%`;
  const pctY = (y) => `${(y / H) * 100}%`;
  const rect = (l, t, w, h) => ({ left: pctX(l), top: pctY(t), width: pctX(w), height: pctY(h) });
  const poly = (pts, box = { l: 0, t: 0, w: W, h: H }) =>
    `polygon(${pts.map(([x, y]) => `${((x - box.l) / box.w) * 100}% ${((y - box.t) / box.h) * 100}%`).join(", ")})`;
  const { ENV, FLAP, FLAP_BOX, POCKET_APEX, SEAL, SEAL_BOX, CARD, SEAL_REST, FLAP_INSIDE } = G;

  // flap: hinged on the envelope's top edge; its inside face is laid out
  // above the hinge so it reads upright once turned 180°
  const FB = { l: FLAP_BOX.l, t: FLAP_BOX.t, w: FLAP_BOX.r - FLAP_BOX.l, h: FLAP_BOX.b - FLAP_BOX.t };
  const hinge = ((ENV.t - FLAP_BOX.t) / FB.h) * 100;

  // card: inside the envelope → risen clear of the pocket (leaning back on
  // the shallow wide envelope) → forward to its resting place
  const CW = CARD.r - CARD.l;
  const CH = CARD.b - CARD.t;
  const CY = (CARD.t + CARD.b) / 2;
  const inside = CH * G.CARD_IN;
  const tilt = (G.CARD_TILT * Math.PI) / 180;
  const half = (inside / 2) * Math.cos(tilt);
  const pocketAt = (x) => ENV.t + ((x - ENV.l) / (POCKET_APEX[0] - ENV.l)) * (POCKET_APEX[1] - ENV.t);
  const clear = 6 + (G.CARD_TILT ? 0.12 * (inside / 2) : 0); // perspective enlarges the near edge
  const peakCY = pocketAt(POCKET_APEX[0] - (CW * G.CARD_IN) / 2) - clear - half;

  const sparkle = ([x, y, s, rot]) => ({ ...rect(x - s / 2, y - s / 2, s, s), "--rot": rot });

  return {
    G,
    W,
    H,
    dir: G.dir,
    reveal: G.reveal,
    wide: G.key === "wide",
    rect,
    body: rect(ENV.l, ENV.t, ENV.r - ENV.l, ENV.b - ENV.t),
    flapBox: rect(FB.l, FB.t, FB.w, FB.h),
    flapOrigin: `50% ${hinge}%`,
    flapShade: poly(FLAP, FB),
    flapInside: {
      left: `${((FLAP_INSIDE.l - FB.l) / FB.w) * 100}%`,
      width: `${(FLAP_INSIDE.w / FB.w) * 100}%`,
      top: `${((FLAP_INSIDE.t - FB.t) / FB.h) * 100}%`,
      height: `${(FLAP_INSIDE.h / FB.h) * 100}%`,
      transformOrigin: "50% 100%",
    },
    sealBox: rect(SEAL_BOX.l, SEAL_BOX.t, SEAL_BOX.w, SEAL_BOX.h),
    sealOrigin: `${(SEAL.cx / W) * 100}% ${(SEAL.cy / H) * 100}%`,
    sealRest: {
      xPercent: ((SEAL_REST.cx - SEAL.cx) / SEAL_BOX.w) * 100,
      yPercent: ((SEAL_REST.cy - SEAL.cy) / SEAL_BOX.h) * 100,
      scaleX: SEAL_REST.sx,
      scaleY: SEAL_REST.sy,
    },
    // the card shows only above the pocket's V while it is inside
    cardClip: poly([[ENV.l, -H], [ENV.r, -H], [ENV.r, ENV.t], POCKET_APEX, [ENV.l, ENV.t]]),
    cardBox: rect(CARD.l, CARD.t, CW, CH),
    cardIn: G.CARD_IN,
    cardTilt: G.CARD_TILT,
    cardStartY: ((ENV.t + 14 + inside / 2 - CY) / CH) * 100,
    cardPeakY: ((peakCY - CY) / CH) * 100,
    vshadow: `${ENV.l},${ENV.t} ${POCKET_APEX.join(",")} ${ENV.r},${ENV.t}`,
    endOrigin: `${(G.END.ox / W) * 100}% ${(G.END.oy / H) * 100}%`,
    end: { scaleX: G.END.sx, scaleY: G.END.sy },
    sparklesSeal: G.SPARKLES_SEAL.map(sparkle),
    sparklesCard: G.SPARKLES_CARD.map(sparkle),
  };
}

const LAYOUTS = { portrait: layout(PORTRAIT), wide: layout(WIDE) };

/* tablet's Figma Default (184:3795) sits the render 79.5 px higher than its
   keyframes (225:5564…): the camera settles down as the opening starts */
const IDLE_SHIFT = { mobile: 0, tablet: (-79.5 / 1024) * 100, desktop: 0 };

/**
 * Scene 01 — Invitation entrance · Heirloom Lace.
 * Figma: mobile 184:3388 → 184:3438, tablet 184:3795 → 225:5597,
 * desktop 184:4007.
 *
 * The Figma renders are cut into real layers (scripts/build-opening-layers):
 * the lace flap, the wax seal, the envelope's body, the inside of the flap
 * and the card. One GSAP timeline moves them in 3D: the seal cracks, the
 * flap hinges open, the card slides out and settles on the envelope.
 * Mobile and tablet end on the exact "Card reveal" frame through a short
 * focus pull; desktop plays on its own wide photo, so the envelope never
 * leaves its place.
 */
export function Scene01Entrance({ onOpened }) {
  const [phase, setPhase] = useState("idle");
  const rootRef = useRef(null);
  const tlRef = useRef(null);
  const reduced = useReducedMotion();
  // the Figma layout (mobile / tablet / desktop) this screen's shape matches
  const bp = useEntranceLayout();
  const L = LAYOUTS[bp === "desktop" ? "wide" : "portrait"];
  const dir = L.dir;

  useEffect(() => () => tlRef.current?.kill(), []);

  useLayoutEffect(() => {
    const camera = rootRef.current?.querySelector(".op-camera");
    if (camera && phase === "idle") gsap.set(camera, { yPercent: IDLE_SHIFT[bp] });
  }, [bp, phase]);

  // decode every layer up front so no frame waits on an image
  useEffect(() => {
    const own = ["plate-default", "plate-start", "body", "flap", "seal-main", "seal-chip"].map((n) => `${dir}/${n}.webp`);
    const shared = ["card", "flap-inside"].map((n) => `${SHARED}/${n}.webp`);
    const end = L.reveal ? ["plate-reveal", "world-blur", "reveal-blur"].map((n) => `${SHARED}/${n}.webp`) : [];
    [...own, ...shared, ...end].forEach((src) => {
      const img = new Image();
      img.src = src;
      img.decode?.().catch(() => {});
    });
  }, [dir, L.reveal]);

  const open = () => {
    if (phase !== "idle") return;
    setPhase("playing");
    void sound.startOnGesture();

    const root = rootRef.current;
    const q = gsap.utils.selector(root);
    const one = (sel) => q(sel)[0];
    const camera = one(".op-camera");
    const world = one(".op-world");
    const idle = one(".op-idle");
    const body = one(".op-body");
    const flap = one(".op-flap");
    const shade = one(".op-flap__shade");
    const seal = one(".op-seal");
    const sealChip = one(".op-seal__chip");
    const crack = one(".op-seal__crack polyline");
    const dust = q(".op-dust i");
    const sealSparks = q(".op-sparkles--seal .op-sparkle");
    const cardSparks = q(".op-sparkles--card .op-sparkle");
    const clip = one(".op-cardclip");
    const vshadow = one(".op-vshadow");
    const card = one(".op-card");
    const cardShadow = one(".op-card__shadow");
    const sheen = one(".op-card__sheen");
    const worldBlur = one(".op-world-blur");
    const revealBlur = one(".op-reveal-blur");
    const reveal = one(".op-reveal");
    const { G } = L;

    const finish = () => {
      setPhase("open");
      onOpened();
    };

    gsap.set(idle, { autoAlpha: 0 });
    gsap.set(flap, { transformPerspective: 1800, transformOrigin: L.flapOrigin });
    gsap.set(card, { transformPerspective: 1600, yPercent: L.cardStartY, scale: L.cardIn, opacity: 0 });

    if (reduced) {
      const tl = gsap.timeline({ onComplete: finish });
      tl.set(camera, { yPercent: 0 })
        .set(flap, { rotationX: 180 })
        .set(seal, { autoAlpha: 0 })
        .set(body, { opacity: 1 })
        .set(card, { yPercent: 0, scale: 1, opacity: 1 })
        .set(clip, { clipPath: "none" });
      if (reveal) tl.fromTo(reveal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
      tl.to({}, { duration: 1.6 }).to(root, { autoAlpha: 0, duration: 0.3 });
      tlRef.current = tl;
      return;
    }

    const tl = gsap.timeline({ onComplete: finish });
    tlRef.current = tl;
    if (import.meta.env.DEV) window.__openingTimeline = tl; // dev only: lets QA scrub the opening

    /* the hand-off once the card has left the pocket (from 3.6 s). Mobile
       and tablet rack the focus to the card and back onto "Card reveal";
       desktop stays on its own photo, so the card simply settles. */
    const handOff = gsap.timeline();
    if (L.reveal) {
      handOff
        // rasterise the focus-pull frames a moment before they are needed
        .set([worldBlur, revealBlur, reveal], { visibility: "visible" }, 0)
        .to(worldBlur, { opacity: 1, duration: 0.4, ease: "sine.inOut" }, 0.65)
        .to(revealBlur, { opacity: 1, duration: 0.4, ease: "sine.inOut" }, 0.95)
        .to(reveal, { opacity: 1, duration: 0.5, ease: "sine.inOut" }, 1.3)
        .to(cardShadow, { opacity: 0, duration: 0.5, ease: "sine.inOut" }, 1.35)
        .set([world, revealBlur], { autoAlpha: 0 }, 2.0);
    }

    tl
      /* 1 · camera leans in; the seal is pressed and cracks (01a) --------- */
      .to(camera, { yPercent: 0, duration: 1.1, ease: "sine.inOut" }, 0)
      .set(world, { transformOrigin: L.sealOrigin }, 0)
      .to(world, { scale: L.wide ? 1.06 : 1.1, duration: 1.15, ease: "sine.inOut" }, 0.05)
      .to(seal, { scale: 0.955, duration: 0.28, ease: "power2.out" }, 0.1)
      .fromTo(crack, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: "power1.in" }, 0.3)
      .call(() => navigator.vibrate?.(10), null, 0.68)
      .to(seal, { scale: 1, duration: 0.3, ease: "back.out(2)" }, 0.68)
      .to(crack, { autoAlpha: 0, duration: 0.15 }, 0.75)
      .to(sealChip, { xPercent: 16, yPercent: -20, rotation: 22, rotationY: 28, duration: 0.55, ease: "power2.out" }, 0.7)
      .fromTo(
        dust,
        { x: 0, y: 0, scale: 1, autoAlpha: 0 },
        {
          keyframes: { autoAlpha: [0, 1, 1, 0] },
          x: () => gsap.utils.random(-30, 70),
          y: () => gsap.utils.random(10, 90),
          scale: 0.5,
          duration: 1.3,
          ease: "power2.out",
          stagger: 0.015,
        },
        0.68,
      )
      .fromTo(
        sealSparks,
        { scale: 0, rotation: (i, el) => rotOf(el) - 45 },
        {
          keyframes: { scale: [0, 1, 0] },
          rotation: (i, el) => rotOf(el) + 45,
          duration: 1.1,
          ease: "sine.inOut",
          stagger: 0.07,
        },
        0.66,
      )

      /* 2 · camera eases back; the broken seal slides off onto the satin --- */
      .to(world, { scale: 1, duration: 1.0, ease: "sine.inOut" }, 1.2)
      .to(seal, { ...L.sealRest, duration: 1.1, ease: "power2.inOut" }, 1.25)
      .to(
        sealChip,
        { xPercent: G.SEAL_REST.chip.x * 100, yPercent: G.SEAL_REST.chip.y * 100, rotation: G.SEAL_REST.chip.rot, rotationY: 0, duration: 1.1, ease: "power2.inOut" },
        1.25,
      )

      /* 3 · the flap hinges open in 3D (01b); the envelope's body (one whole
         piece) is under it, faded in just as the flap starts to lift ------- */
      .to(body, { opacity: 1, duration: 0.3, ease: "sine.inOut" }, 1.2)
      .to(flap, { rotationX: 180, duration: 1.55, ease: "power1.inOut" }, 1.35)
      .fromTo(shade, { opacity: 0 }, { opacity: 0.4, duration: 0.75, ease: "power1.in" }, 1.35)
      .set(shade, { opacity: 0 }, 2.12)
      .set(card, { opacity: 1 }, 2.15)

      /* 4 · the card slides up out of the pocket (01c) --------------------- */
      .to(card, { yPercent: L.cardPeakY, rotationX: L.cardTilt, rotation: -1.5, duration: 1.45, ease: "sine.inOut" }, 2.6)
      .fromTo(
        cardSparks,
        { scale: 0, rotation: -45 },
        { keyframes: { scale: [0, 1, 0] }, rotation: 45, duration: 1.2, ease: "sine.inOut", stagger: 0.12 },
        3.0,
      )
      .to(vshadow, { autoAlpha: 0, duration: 0.3 }, 3.8)

      /* 5 · it comes forward and settles on the envelope (01d) ------------- */
      .set(clip, { clipPath: "none" }, 4.05)
      .set(world, { transformOrigin: L.endOrigin }, 4.05)
      .to(world, { ...L.end, duration: 1.2, ease: "power2.inOut" }, 4.05)
      .to(card, { yPercent: 0, rotation: 0, duration: 1.3, ease: "power2.inOut" }, 4.05)
      .to(card, { keyframes: { scale: [L.cardIn, L.wide ? 1.015 : 1.05, 1] }, duration: 1.3, ease: "sine.inOut" }, 4.05)
      .to(card, { keyframes: { rotationX: [L.cardTilt, -8, 0] }, duration: 1.3, ease: "sine.inOut" }, 4.05)
      .add(handOff, 3.6)
      // let the settled card re-rasterise crisply at its final size
      .set(card, { willChange: "auto" }, 5.45)

      /* 6 · the card rests for a moment, then the first page --------------- */
      .fromTo(sheen, { xPercent: -60, opacity: 1 }, { xPercent: 60, opacity: 1, duration: 1.3, ease: "power1.inOut", immediateRender: false }, 5.6)
      .set(sheen, { opacity: 0 }, 6.9)
      .call(() => setPhase("hold"), null, 5.5)
      .add("out", 7.8)
      .call(() => setPhase("leaving"), null, "out")
      .to(root, { autoAlpha: 0, duration: 0.6, ease: "power1.in" }, "out");
  };

  // during the hold a tap goes straight on to the first page
  const skipHold = () => {
    if (phase === "hold") tlRef.current?.seek("out");
  };

  const musicLabel = "Opens with music. Turn your sound up.";

  return (
    <section
      className="scene scene-entrance"
      aria-label="Invitation entrance"
      data-phase={phase}
      data-bp={bp}
      onClick={skipHold}
    >
      <div ref={rootRef} className="env-stage">
        <div className="op-stage" aria-hidden="true">
          <div className="op-camera">
            <div className={`op-plate${L.wide ? " op-plate--wide" : ""}`}>
              {/* the camera's subject: everything that belongs to the envelope */}
              <div className="op-world">
                <img className="op-fill" src={`${dir}/plate-start.webp`} alt="" draggable={false} />
                {/* the open envelope's body, recreated as one whole piece */}
                <img className="op-body" src={`${dir}/body.webp`} alt="" draggable={false} style={L.body} />

                <div className="op-flap" style={L.flapBox}>
                  <div className="op-flap__face">
                    <img src={`${dir}/flap.webp`} alt="" draggable={false} />
                    <div className="op-flap__shade" style={{ clipPath: L.flapShade }} />
                  </div>
                  <div className="op-flap__face op-flap__face--in" style={L.flapInside}>
                    <img src={`${SHARED}/flap-inside.webp`} alt="" draggable={false} />
                  </div>
                </div>

                <div className="op-seal" style={L.sealBox}>
                  <img className="op-seal__main" src={`${dir}/seal-main.webp`} alt="" draggable={false} />
                  <img className="op-seal__chip" src={`${dir}/seal-chip.webp`} alt="" draggable={false} />
                  <svg className="op-seal__crack" viewBox={`0 0 ${L.G.SEAL_BOX.w} ${L.G.SEAL_BOX.h}`}>
                    <polyline points={L.G.CRACK.map((p) => p.join(",")).join(" ")} pathLength="1" />
                  </svg>
                  <span className="op-dust">
                    {DUST.map((i) => (
                      <i key={i} style={{ left: `${62 + (i % 5) * 4}%`, top: `${44 + ((i * 7) % 30)}%` }} />
                    ))}
                  </span>
                </div>

                <div className="op-sparkles op-sparkles--seal">
                  {L.sparklesSeal.map((style, i) => (
                    <span key={i} className="op-sparkle" style={style}>
                      <img src={SPARKLE} alt="" draggable={false} />
                    </span>
                  ))}
                </div>

                {/* the same world, out of focus, for the focus pull */}
                {L.reveal && <img className="op-fill op-world-blur" src={`${SHARED}/world-blur.webp`} alt="" draggable={false} />}
              </div>

              {/* "Card reveal": out of focus first, then sharp under the card */}
              {L.reveal && (
                <>
                  <img className="op-fill op-reveal-blur" src={`${SHARED}/reveal-blur.webp`} alt="" draggable={false} />
                  <img className="op-fill op-reveal" src={`${SHARED}/plate-reveal.webp`} alt="" draggable={false} />
                </>
              )}

              <div className="op-fill op-cardclip" style={{ clipPath: L.cardClip }}>
                <div className="op-card" style={L.cardBox}>
                  <div className="op-card__shadow" />
                  <img src={`${SHARED}/card.webp`} alt="" draggable={false} />
                  <div className="op-card__text">
                    <p className="op-card__over">Together with their families</p>
                    <p className="op-card__names">
                      {wedding.couple.first}
                      <br />
                      &amp; {wedding.couple.second}
                    </p>
                    <p className="op-card__request">request the pleasure of your company</p>
                    {phase !== "idle" && <p className="op-card__date">{wedding.dateShort}</p>}
                  </div>
                  <div className="op-card__gloss">
                    <div className="op-card__sheen" />
                  </div>
                </div>
                <svg className="op-fill op-vshadow" viewBox={`0 0 ${L.W} ${L.H}`} preserveAspectRatio="none">
                  <polyline points={L.vshadow} />
                </svg>
              </div>

              <div className="op-sparkles op-sparkles--card">
                {L.sparklesCard.map((style, i) => (
                  <span key={i} className="op-sparkle" style={style}>
                    <img src={SPARKLE} alt="" draggable={false} />
                  </span>
                ))}
              </div>

              {/* the Default frame exactly as designed, until the tap */}
              <img className="op-fill op-idle" src={`${dir}/plate-default.webp`} alt="" draggable={false} />
            </div>
          </div>
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

        <p className="scene-entrance__skip" aria-hidden={phase !== "hold"}>Tap to continue</p>
      </div>
    </section>
  );
}
