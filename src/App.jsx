import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { sceneVariants, reducedSceneVariants } from "./lib/motion";
import { sceneFromPath, pathFor } from "./lib/routes";
import { TopBar } from "./components/TopBar";
import { SceneFooter } from "./components/SceneFooter";
import { ExploreMenu } from "./components/ExploreMenu";
import { Scene01Entrance } from "./scenes/Scene01Entrance";
import { Scene02Card } from "./scenes/Scene02Card";
import { Scene03SaveDate } from "./scenes/Scene03SaveDate";
import { Scene04Letters } from "./scenes/Scene04Letters";
import { Scene05Calendar } from "./scenes/Scene05Calendar";
import { Scene06Details } from "./scenes/Scene06Details";
import { Scene07Gallery } from "./scenes/Scene07Gallery";
import { Scene08Rsvp } from "./scenes/Scene08Rsvp";
import { Scene09Closing } from "./scenes/Scene09Closing";

const TOTAL = 9;

const LABELS = {
  2: "The couple",
  3: "The date",
  4: "Our story",
  5: "Countdown",
  6: "Details",
  7: "Photos",
  8: "RSVP",
  9: "With love",
};

function sceneFromHash() {
  return sceneFromPath();
}

function renderScene(scene, hooks) {
  switch (scene) {
    case 1: return <Scene01Entrance onOpened={hooks.opened} />;
    case 2: return <Scene02Card onNext={hooks.next} />;
    case 3: return <Scene03SaveDate />;
    case 4: return <Scene04Letters />;
    case 5: return <Scene05Calendar />;
    case 6: return <Scene06Details />;
    case 7: return <Scene07Gallery />;
    case 8: return <Scene08Rsvp onDetails={hooks.details} onNext={hooks.next} />;
    case 9: return <Scene09Closing onDetails={hooks.details} onReplay={hooks.replay} />;
    default: return null;
  }
}

export default function App() {
  const [scene, setScene] = useState(sceneFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = useReducedMotion();
  const timers = useRef([]);

  const go = useCallback((next) => {
    const clamped = Math.min(TOTAL, Math.max(1, next));
    setScene((cur) => {
      if (clamped === cur) return cur;
      window.history.pushState(null, "", pathFor(clamped));
      return clamped;
    });
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    const onHash = () => setScene(sceneFromPath());
    window.addEventListener("popstate", onHash);
    return () => {
      window.removeEventListener("popstate", onHash);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t?.closest?.("input, textarea, select") || menuOpen) return;
      if (e.key === "ArrowRight") go(scene + 1);
      if (e.key === "ArrowLeft") go(scene - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, scene, menuOpen]);

  const hooks = {
    opened: () => go(2),
    next: () => go(scene + 1),
    details: () => go(6),
    replay: () => go(1),
  };

  return (
    <>
      <main className="scene-view">
        <AnimatePresence initial={false}>
          <motion.div
            key={scene}
            className="scene-view__layer"
            variants={reduced ? reducedSceneVariants : sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderScene(scene, hooks)}
          </motion.div>
        </AnimatePresence>
      </main>

      <TopBar
        visible={scene >= 2}
        showRsvp={scene !== 8}
        onExplore={() => setMenuOpen(true)}
        onNavigate={(n) => go(n)}
        onRsvp={() => go(8)}
      />

      {scene !== 4 && (
        <SceneFooter
          scene={scene}
          label={LABELS[scene] ?? ""}
          showRsvp={scene !== 8}
          onRsvp={() => go(8)}
        />
      )}

      <ExploreMenu
        open={menuOpen}
        currentScene={scene}
        onClose={() => setMenuOpen(false)}
        onNavigate={(n) => go(n)}
      />
    </>
  );
}
