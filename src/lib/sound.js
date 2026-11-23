import { wedding } from "./wedding";

/**
 * Music: starts only after the guest taps "Open your invitation"
 * (browsers allow sound after a user gesture). Always-visible mute chip.
 * The invitation stays complete with audio off or the file missing.
 */
class SoundController {
  constructor() {
    this.el = null;
    this.listeners = new Set();
    this.started = false;
  }

  ensureEl() {
    if (!this.el) {
      this.el = new Audio(wedding.music.src);
      this.el.loop = true;
      this.el.volume = 0.55;
      this.el.preload = "auto";
      this.el.addEventListener("error", () => this.notify());
    }
    return this.el;
  }

  notify() {
    const available = this.isAvailable();
    const playing = this.isPlaying();
    this.listeners.forEach((fn) => fn(playing, available));
  }

  isAvailable() {
    return !this.el || this.el.error === null;
  }

  isPlaying() {
    return !!this.el && !this.el.paused && this.el.error === null;
  }

  async startOnGesture() {
    this.started = true;
    try {
      await this.ensureEl().play();
    } catch {
      /* blocked or missing — stay silent */
    }
    this.notify();
  }

  toggle() {
    const el = this.ensureEl();
    if (el.paused) el.play().catch(() => {});
    else el.pause();
    this.notify();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    fn(this.isPlaying(), this.isAvailable());
    return () => this.listeners.delete(fn);
  }
}

export const sound = new SoundController();
