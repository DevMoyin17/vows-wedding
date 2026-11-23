import { useEffect, useRef } from "react";
import { pathFor } from "../lib/routes";
import { MAIN_SECTIONS } from "../lib/sections";

/** Quick-jump drawer. The invitation itself is a single scrolling page. */
export function ExploreMenu({ open, active, onClose, onNavigate }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector("button, a")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
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
          {MAIN_SECTIONS.map((section) => (
            <li key={section.n}>
              <a
                href={pathFor(section.n)}
                aria-current={active === section.n || undefined}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  onNavigate(section.n);
                }}
              >
                <span className="num">{String(section.n).padStart(2, "0")}</span>
                <span className="name">{section.label}</span>
                <span className="type-small text-secondary">{section.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
