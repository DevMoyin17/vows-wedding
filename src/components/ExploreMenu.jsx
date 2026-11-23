import { useEffect, useRef } from "react";
import { wedding } from "../lib/wedding";
import { pathFor } from "../lib/routes";

const ITEMS = [
  { scene: 2, num: "02", name: "The couple", note: "Invitation card" },
  { scene: 3, num: "03", name: "Save the date", note: "20 · 02 · 2027" },
  { scene: 4, num: "04", name: "Our story", note: "Letters" },
  { scene: 5, num: "05", name: "Countdown", note: "Calendar" },
  { scene: 6, num: "06", name: "Wedding details", note: "Ceremony & reception" },
  { scene: 7, num: "07", name: "Photographs", note: "Keepsakes" },
  { scene: 8, num: "08", name: "RSVP", note: `The favour of a reply by ${wedding.rsvpBy}` },
  { scene: 9, num: "09", name: "With gratitude", note: "Closing" },
];

/** Explore drawer — direct access to key sections. */
export function ExploreMenu({ open, currentScene, onClose, onNavigate }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector("button, a")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`menu-scrim${open ? " is-open" : ""}`} onClick={onClose} aria-hidden="true" />
      <nav
        ref={panelRef}
        className={`menu-panel${open ? " is-open" : ""}`}
        aria-label="Explore the invitation"
        aria-hidden={!open}
        inert={!open || undefined}
      >
        <div className="menu-panel__head">
          <span className="type-overline text-accent">Explore</span>
          <button type="button" className="pill" onClick={onClose} aria-label="Close menu">
            Close ✕
          </button>
        </div>
        <ul className="menu-list">
          {ITEMS.map((it) => (
            <li key={it.scene}>
              <a
                href={pathFor(it.scene)}
                aria-current={currentScene === it.scene || undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(it.scene);
                }}
              >
                <span className="num">{it.num}</span>
                <span className="name">{it.name}</span>
                <span className="type-small text-secondary">{it.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
