import gsap from "gsap";

/** GSAP spring presets from the Figma motion notes. */
export const springs = {
  press: { type: "spring", stiffness: 520, damping: 16, mass: 1 },
  seal: { type: "spring", stiffness: 280, damping: 22, mass: 1 },
  reveal: { type: "spring", stiffness: 260, damping: 24, mass: 1 },
  toast: { type: "spring", stiffness: 420, damping: 32, mass: 1 },
};

export const easeCinematic = "power2.inOut";

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Shared Framer Motion variants (VOWS/Motion tokens). */
export const sceneVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.32, 0.72, 0, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.9, ease: [0.32, 0.72, 0, 1] } },
};

export const reducedSceneVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const riseChild = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] } },
};

export const reducedChild = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
};

export const gsapLib = gsap;
