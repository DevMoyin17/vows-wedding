import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { wedding } from "../lib/wedding";
import { sound } from "../lib/sound";
import { useEntranceLayout } from "../lib/useEntranceLayout";
import { MusicChip } from "../components/MusicChip";
import * as G from "../lib/openingGeometry";

const DIR = "/assets/heirloom/opening/stage";
const WIDE = "/assets/heirloom/opening/desktop";
const SPARKLE = "/assets/heirloom/opening/sparkle.svg";
const LAYERS = [
  "plate-default", "plate-start", "plate-reveal", "flap", "flap-inside", "seal-main", "seal-chip", "card", "pocket",
  "world-blur", "reveal-blur",
];

/* All geometry is in px of the 864×1536 Figma render. The plate is that
   render object-cover'd onto its stage — the whole screen on mobile and
   tablet, the centred 746×900 "Stage" on desktop — so % of the plate is %
   of the render on every breakpoint. */
const W = G.IMG.w;
const H = G.IMG.h;
const pctX = (x) => `${(x / W) * 100}%`;
const pctY = (y) => `${(y / H) * 100}%`;
const rect = (l, t, w, h) => ({ left: pctX(l), top: pctY(t), width: pctX(w), height: pctY(h) });
/** clip-path polygon from render px, relative to a box (default: the plate) */
const poly = (pts, box = { l: 0, t: 0, w: W, h: H }) =>
  `polygon(${pts.map(([x, y]) => `${((x - box.l) / box.w) * 100}% ${((y - box.t) / box.h) * 100}%`).join(", ")})`;

const { ENV, FLAP, FLAP_BOX, POCKET_APEX, POCKET_BOX, SEAL, SEAL_BOX, CARD, END, SEAL_REST, FLAP_INSIDE } = G;
// inside of the envelope above the pocket V (the open mouth)
const MOUTH = [[ENV.l, ENV.t], [ENV.r, ENV.t], POCKET_APEX];
const mouthShade = `linear-gradient(180deg, ${G.MOUTH_SHADE.map(
  ([o, c]) => `${c} ${((ENV.t + o * (POCKET_APEX[1] - ENV.t)) / H) * 100}%`,
).join(", ")})`;
// the card shows only above the pocket's V while it is inside
const CARD_CLIP = [[ENV.l, -H], [ENV.r, -H], [ENV.r, ENV.t], POCKET_APEX, [ENV.l, ENV.t]];

/* flap: hinged on the envelope's top edge; its inside face (cut from "Flap
   opens") is laid out above the hinge so it reads upright at 180° */
const FB = { l: FLAP_BOX.l, t: FLAP_BOX.t, w: FLAP_BOX.r - FLAP_BOX.l, h: FLAP_BOX.b - FLAP_BOX.t };
const HINGE = ENV.t - FLAP_BOX.t;
const flapInside = {
  left: `${((FLAP_INSIDE.l - FB.l) / FB.w) * 100}%`,
  width: `${(FLAP_INSIDE.w / FB.w) * 100}%`,
  top: `${((FLAP_INSIDE.t - FB.t) / FB.h) * 100}%`,
  height: `${(FLAP_INSIDE.h / FB.h) * 100}%`,
  transformOrigin: "50% 100%",
};

/* card path: inside the envelope at 72% → risen clear of the pocket →
   settled exactly on the card of the Figma "Card reveal" frame */
const CARD_W = CARD.r - CARD.l;
const CARD_H = CARD.b - CARD.t;
const CARD_CY = (CARD.t + CARD.b) / 2;
const CARD_IN = 0.72;
const cardStartY = ((ENV.t + 22 + (CARD_H * CARD_IN) / 2 - CARD_CY) / CARD_H) * 100;
const pocketAt = (x) => ENV.t + ((x - ENV.l) / (POCKET_APEX[0] - ENV.l)) * (POCKET_APEX[1] - ENV.t);
const cardPeakY =
  ((pocketAt(POCKET_APEX[0] - (CARD_W * CARD_IN) / 2) - 6 - (CARD_H * CARD_IN) / 2 - CARD_CY) / CARD_H) * 100;

const sealRest = {
  xPercent: ((SEAL_REST.cx - SEAL.cx) / SEAL_BOX.w) * 100,
  yPercent: ((SEAL_REST.cy - SEAL.cy) / SEAL_BOX.h) * 100,
  scaleX: SEAL_REST.sx,
  scaleY: SEAL_REST.sy,
};

const sparkleStyle = ([x, y, size, rot]) => {
  const [ix, iy] = G.fromFrame(x, y);
  const s = size / (844 / 1536);
  return { ...rect(ix - s / 2, iy - s / 2, s, s), "--rot": rot };
};
const DUST = Array.from({ length: 16 }, (_, i) => i);
const rotOf = (el) => Number(el.style.getPropertyValue("--rot")) || 0;

/* Per-breakpoint framing from the Figma frames */
const FRAMING = {
  // 184:3388 — render object-cover'd on 390×844
  mobile: { idleShift: 0 },
  // 184:3795 sits the render 79.5 px higher than the keyframes (225:5564…)
  tablet: { idleShift: -79.5 / 1024 },
  // 184:4007 is the wide render; keyframes put the portrait render in the
  // 746×900 stage — at the tap the stage starts matched to the wide envelope
  desktop: { idleShift: 0, morph: { scaleX: 623 / 549.2, scaleY: 383 / 379.9, yPercent: (8.75 / 900) * 100 } },
};

/**
 * Scene 01 — Invitation entrance · Heirloom Lace.
 * Figma: mobile 184:3388 → 184:3438, tablet 184:3795 → 225:5597,
 * desktop 184:4007 → 225:5547.
 *
 * The Figma renders are cut into real layers (scripts/build-opening-layers):
 * the lace flap, the wax seal, the inside of the opened flap and the card.
 * One GSAP timeline moves them in 3D: the seal cracks, the flap hinges open,
 * the card slides out and comes forward while the background racks out of
 * focus, and focus returns on the exact "Card reveal" frame.
 */
export function Scene01Entrance({ onOpened }) {
  const [phase, setPhase] = useState("idle");
  const rootRef = useRef(null);
  const tlRef = useRef(null);
  const reduced = useReducedMotion();
  // the Figma layout (mobile / tablet / desktop) this screen's shape matches
  const bp = useEntranceLayout();

  useEffect(() => () => tlRef.current?.kill(), []);

  // idle framing per breakpoint (tablet's Default sits higher than its keyframes)
  useLayoutEffect(() => {
    const camera = rootRef.current?.querySelector(".op-camera");
    if (camera && phase === "idle") gsap.set(camera, { yPercent: FRAMING[bp].idleShift * 100 });
  }, [bp, phase]);

  // decode every layer up front so no frame waits on an image
  useEffect(() => {
    const list = LAYERS.map((n) => `${DIR}/${n}.webp`);
    if (bp === "desktop") list.push(`${WIDE}/wide.webp`, `${WIDE}/wide-blur.webp`);
    list.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.decode?.().catch(() => {});
    });
  }, [bp]);

  const open = () => {
    if (phase !== "idle") return;
    setPhase("playing");
    void sound.startOnGesture();

    const root = rootRef.current;
    const q = gsap.utils.selector(root);
    const one = (sel) => q(sel)[0];
    const stage = one(".op-stage");
    const camera = one(".op-camera");
    const wideBlur = one(".op-wide--blur");
    const world = one(".op-world");
    const idle = one(".op-idle");
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
    const framing = FRAMING[bp];

    const finish = () => {
      setPhase("open");
      onOpened();
    };

    gsap.set(idle, { autoAlpha: 0 });
    gsap.set(flap, { transformPerspective: 1800, transformOrigin: `50% ${(HINGE / FB.h) * 100}%` });
    gsap.set(card, { transformPerspective: 1600, yPercent: cardStartY, scale: CARD_IN, opacity: 0 });

    if (reduced) {
      const tl = gsap.timeline({ onComplete: finish });
      tl.set(stage, { opacity: 1 })
        .set(camera, { yPercent: 0 })
        .set(card, { yPercent: 0, scale: 1, opacity: 1 })
        .set(clip, { clipPath: "none" })
        .fromTo(reveal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        .to({}, { duration: 1.6 })
        .to(root, { autoAlpha: 0, duration: 0.3 });
      tlRef.current = tl;
      return;
    }

    const tl = gsap.timeline({ onComplete: finish });
    tlRef.current = tl;
    if (import.meta.env.DEV) window.__openingTimeline = tl; // dev only: lets QA scrub the opening

    /* 0 · desktop: the wide render softens into the satin fill and the
       stage takes over, starting matched to the wide envelope ---------- */
    let t0 = 0;
    if (bp === "desktop") {
      tl.to(wideBlur, { opacity: 1, duration: 0.6, ease: "sine.inOut" }, 0)
        .fromTo(stage, { opacity: 0, ...framing.morph }, { opacity: 1, scaleX: 1, scaleY: 1, yPercent: 0, duration: 0.75, ease: "power2.inOut" }, 0);
      t0 = 0.45;
    }
    const at = (t) => t0 + t;

    /* the hand-off to "Card reveal" (starts at 3.6 s, as the card leaves the
       pocket). Mobile and tablet rack the focus to the card and back; the
       desktop frames keep the satin as designed, so there the envelope just
       settles into "Card reveal" underneath the landing card. */
    const handOff = gsap.timeline();
    if (bp === "desktop") {
      handOff
        .set(reveal, { visibility: "visible" }, 0)
        .to(reveal, { opacity: 1, duration: 0.6, ease: "sine.inOut" }, 0.75)
        .to(cardShadow, { opacity: 0, duration: 0.6, ease: "sine.inOut" }, 0.8)
        .set(world, { autoAlpha: 0 }, 1.5);
    } else {
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
      .to(camera, { yPercent: 0, duration: 1.1, ease: "sine.inOut" }, at(0))
      .set(world, { transformOrigin: `${(SEAL.cx / W) * 100}% ${(SEAL.cy / H) * 100}%` }, at(0))
      .to(world, { scale: 1.1, duration: 1.15, ease: "sine.inOut" }, at(0.05))
      .to(seal, { scale: 0.955, duration: 0.28, ease: "power2.out" }, at(0.1))
      .fromTo(crack, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: "power1.in" }, at(0.3))
      .call(() => navigator.vibrate?.(10), null, at(0.68))
      .to(seal, { scale: 1, duration: 0.3, ease: "back.out(2)" }, at(0.68))
      .to(crack, { autoAlpha: 0, duration: 0.15 }, at(0.75))
      .to(sealChip, { xPercent: 16, yPercent: -20, rotation: 22, rotationY: 28, duration: 0.55, ease: "power2.out" }, at(0.7))
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
        at(0.68),
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
        at(0.66),
      )

      /* 2 · camera eases back; the broken seal slides off onto the satin --- */
      .to(world, { scale: 1, duration: 1.0, ease: "sine.inOut" }, at(1.2))
      .to(seal, { ...sealRest, duration: 1.1, ease: "power2.inOut" }, at(1.25))
      .to(
        sealChip,
        { xPercent: SEAL_REST.chip.x * 100, yPercent: SEAL_REST.chip.y * 100, rotation: SEAL_REST.chip.rot, rotationY: 0, duration: 1.1, ease: "power2.inOut" },
        at(1.25),
      )

      /* 3 · the flap hinges open in 3D (01b) ------------------------------ */
      .to(flap, { rotationX: 180, duration: 1.55, ease: "power1.inOut" }, at(1.35))
      .fromTo(shade, { opacity: 0 }, { opacity: 0.4, duration: 0.75, ease: "power1.in" }, at(1.35))
      .set(shade, { opacity: 0 }, at(2.12))
      .set(card, { opacity: 1 }, at(2.15))

      /* 4 · the card slides up out of the pocket (01c) --------------------- */
      .to(card, { yPercent: cardPeakY, rotation: -1.5, duration: 1.45, ease: "sine.inOut" }, at(2.6))
      .fromTo(
        cardSparks,
        { scale: 0, rotation: -45 },
        { keyframes: { scale: [0, 1, 0] }, rotation: 45, duration: 1.2, ease: "sine.inOut", stagger: 0.12 },
        at(3.0),
      )
      .to(vshadow, { autoAlpha: 0, duration: 0.3 }, at(3.8))

      /* 5 · it comes forward; focus racks to the card, the scene settles on
         the "Card reveal" frame and focus comes back (01d) ---------------- */
      .set(clip, { clipPath: "none" }, at(4.05))
      .set(world, { transformOrigin: `${(END.ox / W) * 100}% ${(END.oy / H) * 100}%` }, at(4.05))
      .to(world, { scaleX: END.sx, scaleY: END.sy, duration: 1.2, ease: "power2.inOut" }, at(4.05))
      .to(card, { yPercent: 0, rotation: 0, duration: 1.3, ease: "power2.inOut" }, at(4.05))
      .to(card, { keyframes: { scale: [CARD_IN, 1.07, 1] }, duration: 1.3, ease: "sine.inOut" }, at(4.05))
      .fromTo(card, { rotationX: 0 }, { keyframes: { rotationX: [0, -8, 0] }, duration: 1.3, ease: "sine.inOut" }, at(4.05))
      .add(handOff, at(3.6))
      // let the settled card re-rasterise crisply at its final size
      .set(card, { willChange: "auto" }, at(5.45))

      /* 6 · the card rests for a moment, then the first page --------------- */
      .fromTo(sheen, { xPercent: -60, opacity: 1 }, { xPercent: 60, opacity: 1, duration: 1.3, ease: "power1.inOut", immediateRender: false }, at(5.6))
      .set(sheen, { opacity: 0 }, at(6.9))
      .call(() => setPhase("hold"), null, at(5.5))
      .add("out", at(7.8))
      .call(() => setPhase("leaving"), null, "out")
      .to(root, { autoAlpha: 0, duration: 0.6, ease: "power1.in" }, "out");
  };

  // during the hold a tap goes straight on to the first page
  const skipHold = () => {
    if (phase === "hold") tlRef.current?.seek("out");
  };

  const musicLabel =
    bp === "desktop"
      ? `Opens with music  ·  ${wedding.dateFooter.replace(" · ", " ")}`
      : "Opens with music. Turn your sound up.";

  return (
    <section
      className="scene scene-entrance"
      aria-label="Invitation entrance"
      data-phase={phase}
      data-bp={bp}
      onClick={skipHold}
    >
      <div ref={rootRef} className="env-stage">
        {bp === "desktop" && (
          <>
            <img className="op-wide" src={`${WIDE}/wide.webp`} alt="" aria-hidden="true" draggable={false} />
            <img className="op-wide op-wide--blur" src={`${WIDE}/wide-blur.webp`} alt="" aria-hidden="true" draggable={false} />
          </>
        )}

        <div className="op-stage" aria-hidden="true">
          <div className="op-camera">
            <div className="op-plate">
              {/* the camera's subject: everything that belongs to the envelope */}
              <div className="op-world">
                <img className="op-fill" src={`${DIR}/plate-start.webp`} alt="" draggable={false} />
                <div className="op-fill op-mouth" style={{ clipPath: poly(MOUTH), background: mouthShade }} />
                <img
                  className="op-pocket"
                  src={`${DIR}/pocket.webp`}
                  alt=""
                  draggable={false}
                  style={rect(POCKET_BOX.l, POCKET_BOX.t, POCKET_BOX.r - POCKET_BOX.l, POCKET_BOX.b - POCKET_BOX.t)}
                />

                <div className="op-flap" style={rect(FB.l, FB.t, FB.w, FB.h)}>
                  <div className="op-flap__face">
                    <img src={`${DIR}/flap.webp`} alt="" draggable={false} />
                    <div className="op-flap__shade" style={{ clipPath: poly(FLAP, FB) }} />
                  </div>
                  <div className="op-flap__face op-flap__face--in" style={flapInside}>
                    <img src={`${DIR}/flap-inside.webp`} alt="" draggable={false} />
                  </div>
                </div>

                <div className="op-seal" style={rect(SEAL_BOX.l, SEAL_BOX.t, SEAL_BOX.w, SEAL_BOX.h)}>
                  <img className="op-seal__main" src={`${DIR}/seal-main.webp`} alt="" draggable={false} />
                  <img className="op-seal__chip" src={`${DIR}/seal-chip.webp`} alt="" draggable={false} />
                  <svg className="op-seal__crack" viewBox={`0 0 ${SEAL_BOX.w} ${SEAL_BOX.h}`}>
                    <polyline points={G.CRACK.map((p) => p.join(",")).join(" ")} pathLength="1" />
                  </svg>
                  <span className="op-dust">
                    {DUST.map((i) => (
                      <i key={i} style={{ left: `${62 + (i % 5) * 4}%`, top: `${44 + ((i * 7) % 30)}%` }} />
                    ))}
                  </span>
                </div>

                <div className="op-sparkles op-sparkles--seal">
                  {G.SPARKLES_SEAL.map((s, i) => (
                    <span key={i} className="op-sparkle" style={sparkleStyle(s)}>
                      <img src={SPARKLE} alt="" draggable={false} />
                    </span>
                  ))}
                </div>

                {/* the same world, out of focus, for the rack focus */}
                <img className="op-fill op-world-blur" src={`${DIR}/world-blur.webp`} alt="" draggable={false} />
              </div>

              {/* "Card reveal": out of focus first, then sharp under the card */}
              <img className="op-fill op-reveal-blur" src={`${DIR}/reveal-blur.webp`} alt="" draggable={false} />
              <img className="op-fill op-reveal" src={`${DIR}/plate-reveal.webp`} alt="" draggable={false} />

              <div className="op-fill op-cardclip" style={{ clipPath: poly(CARD_CLIP) }}>
                <div className="op-card" style={rect(CARD.l, CARD.t, CARD_W, CARD_H)}>
                  <div className="op-card__shadow" />
                  <img src={`${DIR}/card.webp`} alt="" draggable={false} />
                  <div className="op-card__text">
                    <p className="op-card__over">Together with their families</p>
                    <p className="op-card__names">
                      {wedding.couple.first}
                      <br />
                      &amp; {wedding.couple.second}
                    </p>
                    <p className="op-card__request">request the pleasure of your company</p>
                    <p className="op-card__date">{wedding.dateShort}</p>
                  </div>
                  <div className="op-card__gloss">
                    <div className="op-card__sheen" />
                  </div>
                </div>
                <svg className="op-fill op-vshadow" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                  <polyline points={`${ENV.l},${ENV.t} ${POCKET_APEX.join(",")} ${ENV.r},${ENV.t}`} />
                </svg>
              </div>

              <div className="op-sparkles op-sparkles--card">
                {G.SPARKLES_CARD.map((s, i) => (
                  <span key={i} className="op-sparkle" style={sparkleStyle(s)}>
                    <img src={SPARKLE} alt="" draggable={false} />
                  </span>
                ))}
              </div>

              {/* the Default frame exactly as designed, until the tap */}
              <img className="op-fill op-idle" src={`${DIR}/plate-default.webp`} alt="" draggable={false} />
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

        <p className="scene-entrance__date">{wedding.dateFooter}</p>
        <p className="scene-entrance__skip" aria-hidden={phase !== "hold"}>Tap to continue</p>
      </div>
    </section>
  );
}
