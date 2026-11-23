import { useEffect, useRef } from "react";
import { pathFor } from "../lib/routes";
import { MAIN_SECTIONS } from "../lib/sections";

/** Quick-jump drawer. The invitation itself is a single scrolling page. */
export function ExploreMenu({ open, active, onClose, onNavigate }) {
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    returnFocusRef.current = document.activeElement;

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.getClientRects().length > 0);

    const onKey = (event) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    focusables()[0]?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      const target = returnFocusRef.current;
      if (target instanceof HTMLElement) target.focus();
    };
  }, [open]);

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
          {MAIN_SECTIONS.map((section, index) => (
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
                <span className="num">{String(index + 2).padStart(2, "0")}</span>
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
