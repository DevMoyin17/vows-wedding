import { useEffect, useState } from "react";
import { MusicChip } from "./MusicChip";

/** Fixed top bar: monogram, music chip, Explore (mobile), section nav (desktop), RSVP. */
export function TopBar({ visible, showRsvp, onExplore, onNavigate, onRsvp }) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const layers = Array.from(document.querySelectorAll(".scene-view__layer"));
    const el = layers[layers.length - 1];
    if (!el) return;
    const onScroll = () => setStuck(el.scrollTop > 8);
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [visible]);

  const links = [
    [2, "Couple"],
    [3, "Date"],
    [4, "Story"],
    [5, "Countdown"],
    [6, "Details"],
    [7, "Photos"],
    [8, "RSVP"],
  ];
  return (
    <header className={`topbar${visible ? "" : " is-hidden"}${stuck ? " is-stuck" : ""}`}>
      <a href="/" className="mono" aria-label="Back to the beginning">
        D <span className="mono__amp">&amp;</span> M
      </a>
      <nav className="topnav" aria-label="Invitation sections">
        {links.map(([n, label]) => (
          <button key={n} type="button" className="topnav__link" onClick={() => onNavigate?.(n)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="topbar__right">
        <MusicChip expandedLabel="Now playing · Our song" className="topbar__music" />
        <button type="button" className="pill topbar__explore" onClick={onExplore}>
          Explore
          <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
            <path d="M1 1h16M1 5h16M1 9h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          </svg>
        </button>
        {showRsvp && (
          <button type="button" className="topbar-rsvp topbar-rsvp--ink topbar__rsvp" onClick={onRsvp}>
            RSVP
          </button>
        )}
      </div>
    </header>
  );
}
