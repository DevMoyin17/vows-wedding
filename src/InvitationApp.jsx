import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { pathFor, sceneFromPath } from "./lib/routes";
import { MAIN_SECTIONS, sectionFor } from "./lib/sections";
import { wedding } from "./lib/wedding";
import { TopBar } from "./components/TopBar";
import { ExploreMenu } from "./components/ExploreMenu";
import { ScrollProgress } from "./components/ScrollProgress";
import { RsvpDock } from "./components/RsvpDock";
import { Scene01Entrance } from "./scenes/Scene01Entrance";
import { Scene02Card } from "./scenes/Scene02Card";
import { Scene03SaveDate } from "./scenes/Scene03SaveDate";
import { Scene04Letters } from "./scenes/Scene04Letters";
import { Scene06Details } from "./scenes/Scene06Details";
import { Scene07Gallery } from "./scenes/Scene07Gallery";
import { Scene08Rsvp } from "./scenes/Scene08Rsvp";
import { Scene09Closing } from "./scenes/Scene09Closing";

/**
 * The invitation experience for one couple.
 * - `/i/simeon-janet` is the opening envelope.
 * - Opening it moves to the invitation itself, a single continuous page
 *   starting at `/i/simeon-janet/the-couple` and ending at `/with-love`.
 * Direct section URLs (e.g. `/i/simeon-janet/rsvp`) land on the invitation
 * page without the envelope, so reminder links stay frictionless.
 */
export function InvitationApp() {
  const reduced = useReducedMotion();
  const [initial] = useState(() => sceneFromPath());
  const [pendingTarget] = useState(() => {
    if (initial <= 1 || initial === 8) return 0;
    try {
      if (window.sessionStorage.getItem("vows:opened") === "1") return 0;
    } catch {
      /* storage blocked — still show the envelope first */
    }
    return initial;
  });
  const [mode, setMode] = useState(
    initial === 1 || pendingTarget > 0 ? "opening" : "invitation",
  );
  const [active, setActive] = useState(
    pendingTarget > 0 ? pendingTarget : initial === 1 ? 2 : initial,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const activeRef = useRef(active);
  const ready = useRef(initial > 1);
  const initialised = useRef(false);
  const suppressSpy = useRef(false);
  const settling = useRef(initial > 1);
  const navigated = useRef(false);
  const scrollRaf = useRef(0);

  // Keep the date out of the tab title until the invitation is opened.
  useEffect(() => {
    const names = `${wedding.couple.first} & ${wedding.couple.second}`;
    document.title =
      mode === "opening"
        ? `${names} · You are invited`
        : `${names} · ${wedding.dateLong.replace(/^[A-Za-z]+, /, "")}`;
  }, [mode]);

  const stopScroll = useCallback(() => {
    if (scrollRaf.current) window.cancelAnimationFrame(scrollRaf.current);
    scrollRaf.current = 0;
    suppressSpy.current = false;
  }, []);

  /** A short, consistent glide — native smooth scrolling is too slow over long pages. */
  const glideTo = useCallback(
    (targetY) => {
      window.cancelAnimationFrame(scrollRaf.current);
      if (reduced) {
        window.scrollTo(0, targetY);
        return;
      }

      const startY = window.scrollY;
      const distance = targetY - startY;
      if (Math.abs(distance) < 2) {
        window.scrollTo(0, targetY);
        return;
      }

      suppressSpy.current = true;
      const started = performance.now();
      const duration = 680;

      const tick = (now) => {
        const t = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        window.scrollTo(0, startY + distance * eased);
        if (t < 1) {
          scrollRaf.current = window.requestAnimationFrame(tick);
        } else {
          scrollRaf.current = 0;
          suppressSpy.current = false;
        }
      };

      scrollRaf.current = window.requestAnimationFrame(tick);
    },
    [reduced],
  );

  /** Move to the opening envelope page. */
  const showEnvelope = useCallback(() => {
    const path = pathFor(1);
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path + window.location.search);
    }
    setMenuOpen(false);
    stopScroll();
    setMode("opening");
    setActive(2);
    activeRef.current = 2;
    ready.current = true;
    settling.current = false;
    window.scrollTo(0, 0);
  }, [stopScroll]);

  /** Leave the envelope for the invitation page. */
  const openInvitation = useCallback(() => {
    const target = pendingTarget > 0 && !initialised.current ? pendingTarget : 2;
    try {
      window.sessionStorage.setItem("vows:opened", "1");
    } catch {
      /* storage blocked — the page still opens */
    }

    const path = pathFor(target);
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path + window.location.search);
    }

    setMenuOpen(false);
    stopScroll();
    setMode("invitation");
    activeRef.current = target;
    setActive(target);
    navigated.current = false;
    suppressSpy.current = false;
    window.scrollTo(0, 0);
  }, [pendingTarget, stopScroll]);

  const go = useCallback(
    (n, { push = false, smooth = true } = {}) => {
      if (n === 1) {
        showEnvelope();
        return;
      }

      const section = sectionFor(n);
      if (!section) return;
      navigated.current = true;
      settling.current = false;
      setMenuOpen(false);
      activeRef.current = n;
      setActive(n);

      const path = pathFor(n);
      if (window.location.pathname !== path) {
        window.history[push ? "pushState" : "replaceState"](null, "", path + window.location.search);
      }

      const el = document.getElementById(section.id);
      if (!el) return;
      const targetY = el.getBoundingClientRect().top + window.scrollY;
      if (smooth) glideTo(targetY);
      else {
        stopScroll();
        window.scrollTo(0, targetY);
      }
    },
    [glideTo, showEnvelope, stopScroll],
  );

  /* Stop an in-flight glide if the guest takes over. */
  useEffect(() => {
    const cancel = () => {
      if (scrollRaf.current) stopScroll();
    };
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", cancel);
    return () => {
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, [stopScroll]);

  useEffect(() => () => {
    if (scrollRaf.current) window.cancelAnimationFrame(scrollRaf.current);
  }, []);

  /* A shared /our-story or /the-couple link still opens the envelope first for
     a new guest session; the requested section is restored after opening. */
  useEffect(() => {
    if (pendingTarget > 0 && window.location.pathname !== pathFor(1)) {
      window.history.replaceState(null, "", pathFor(1) + window.location.search);
    }
  }, [pendingTarget]);

  /* Land on the right section when opening a shared /our-story or /rsvp link.
     Re-align once fonts/dynamic sections settle, unless the guest takes over. */
  useEffect(() => {
    if (mode !== "invitation") return undefined;
    if (initialised.current) {
      ready.current = true;
      return undefined;
    }
    initialised.current = true;

    if (initial <= 1) {
      ready.current = true;
      return undefined;
    }

    const section = sectionFor(initial);
    let userMoved = false;
    const markMoved = () => {
      userMoved = true;
      settling.current = false;
    };

    const jump = () => {
      if (userMoved || navigated.current || !section) return;
      const el = document.getElementById(section.id);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
    };

    const first = window.setTimeout(() => {
      jump();
      ready.current = true;
    }, 120);
    const settle = window.setTimeout(jump, 700);
    const finish = window.setTimeout(() => {
      if (userMoved || navigated.current) return;
      jump();
      settling.current = false;
      window.dispatchEvent(new Event("scroll"));
    }, 1200);

    // Images, fonts and the RSVP card can change the page height after the
    // first jump. Re-align until the guest starts interacting.
    const observer =
      "ResizeObserver" in window
        ? new ResizeObserver(() => {
            if (!userMoved && !navigated.current) jump();
          })
        : null;
    const pageEl = document.querySelector(".page");
    if (observer && pageEl) observer.observe(pageEl);

    const options = { passive: true, once: true };
    window.addEventListener("wheel", markMoved, options);
    window.addEventListener("touchstart", markMoved, options);
    window.addEventListener("keydown", markMoved, { once: true });
    window.addEventListener("pointerdown", markMoved, { once: true });
    document.fonts?.ready.then(jump);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(settle);
      window.clearTimeout(finish);
      observer?.disconnect();
      window.removeEventListener("wheel", markMoved);
      window.removeEventListener("touchstart", markMoved);
      window.removeEventListener("keydown", markMoved);
      window.removeEventListener("pointerdown", markMoved);
    };
  }, [initial, mode]);

  /* Scroll spy: keep the URL and navigation in sync with the invitation page. */
  useEffect(() => {
    if (mode !== "invitation") return undefined;

    let frame = 0;
    let timer = 0;

    const update = () => {
      if (!ready.current || suppressSpy.current || settling.current) return;
      const marker = window.innerHeight * 0.4;
      let current = 2;

      for (const section of MAIN_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= marker) current = section.n;
      }

      if (current === activeRef.current) return;
      activeRef.current = current;
      setActive(current);

      const path = pathFor(current);
      if (window.location.pathname !== path) {
        window.history.replaceState(null, "", path + window.location.search);
      }
    };

    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    timer = window.setTimeout(update, 250);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mode]);

  /* Back / forward between the envelope and invitation sections. */
  useEffect(() => {
    const onPop = () => {
      const n = sceneFromPath();
      navigated.current = true;
      settling.current = false;
      stopScroll();

      if (n === 1) {
        setMode("opening");
        activeRef.current = 2;
        setActive(2);
        ready.current = true;
        window.scrollTo(0, 0);
        return;
      }

      const section = sectionFor(n);
      if (!section) return;
      setMode("invitation");
      activeRef.current = n;
      setActive(n);
      ready.current = true;

      // Wait for the invitation page to mount when coming from the envelope.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const el = document.getElementById(section.id);
          if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
        });
      });
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [stopScroll]);

  const details = useCallback(() => go(6), [go]);
  const rsvp = useCallback(() => go(8, { push: true }), [go]);
  const replay = useCallback(() => showEnvelope(), [showEnvelope]);

  if (mode === "opening") {
    return (
      <main className="opening-page">
        <Scene01Entrance onOpened={openInvitation} />
      </main>
    );
  }

  return (
    <>
      <ScrollProgress />

      <TopBar
        active={active}
        showRsvp={active !== 8}
        onExplore={() => setMenuOpen(true)}
        onNavigate={(n) => go(n, { push: true })}
        onRsvp={rsvp}
      />

      <main className="page">
        <div id={sectionFor(2).id} data-section="2" className="page-section">
          <Scene02Card onNext={details} />
        </div>

        <div id={sectionFor(3).id} data-section="3" className="page-section">
          <Scene03SaveDate />
        </div>

        <div id={sectionFor(4).id} data-section="4" className="page-section">
          <Scene04Letters />
        </div>

        <div id={sectionFor(6).id} data-section="6" className="page-section">
          <Scene06Details />
        </div>

        <div id={sectionFor(7).id} data-section="7" className="page-section">
          <Scene07Gallery />
        </div>

        <div id={sectionFor(8).id} data-section="8" className="page-section">
          <Scene08Rsvp onDetails={details} onNext={details} />
        </div>

        <div id={sectionFor(9).id} data-section="9" className="page-section">
          <Scene09Closing onDetails={details} onReplay={replay} />
        </div>
      </main>

      <ExploreMenu
        open={menuOpen}
        active={active}
        onClose={() => setMenuOpen(false)}
        onNavigate={(n) => go(n, { push: true })}
      />

      <RsvpDock visible={active > 1 && active !== 8} onRsvp={rsvp} />
    </>
  );
}
