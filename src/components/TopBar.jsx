import { useEffect, useState } from "react";
import { SECTIONS } from "../lib/sections";
import { MusicChip } from "./MusicChip";

const LINKS = SECTIONS.filter((section) => section.n >= 2 && section.n <= 9);

/**
 * Fixed top bar. It stays out of the way on the opening screen, then appears
 * once the guest starts reading and carries the section shortcuts + RSVP.
 */
export function TopBar({ active, showRsvp, onExplore, onNavigate, onRsvp }) {
  const [stuck, setStuck] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setStuck(window.scrollY > 8);
      setScrolled(window.scrollY > window.innerHeight * 0.55);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const visible = scrolled || active > 1;

  return (
    <header
      className={`topbar${visible ? "" : " is-hidden"}${stuck ? " is-stuck" : ""}`}
      inert={!visible || undefined}
    >
      <a
        href="/"
        className="mono"
        aria-label="Back to the beginning"
        onClick={(event) => {
          event.preventDefault();
          onNavigate?.(1);
        }}
      >
        D <span className="mono__amp">&amp;</span> M
      </a>

      <nav className="topnav" aria-label="Invitation sections">
        {LINKS.map((section) => (
          <button
            key={section.n}
            type="button"
            className="topnav__link"
            aria-current={active === section.n ? "true" : undefined}
            onClick={() => onNavigate?.(section.n)}
          >
            {section.short}
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
