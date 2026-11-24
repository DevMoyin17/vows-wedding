import { lazy, Suspense, useEffect } from "react";
import { LandingPage } from "./marketing/LandingPage";
import { StartPage } from "./marketing/StartPage";
import { SimplePage } from "./marketing/SimplePage";
import { INVITATION_BASE } from "./lib/routes";

const InvitationApp = lazy(() =>
  import("./InvitationApp").then((module) => ({ default: module.InvitationApp })),
);

function InvitationFallback() {
  return (
    <main className="invite-loading" aria-busy="true">
      <span className="invite-loading__mark">VOWS.</span>
      <span className="invite-loading__line" aria-hidden="true" />
      <p>Opening the invitation…</p>
    </main>
  );
}

const LEGACY_INVITATION_PATHS = {
  "/the-couple": "the-couple",
  "/save-the-date": "save-the-date",
  "/our-story": "our-story",
  "/wedding-details": "wedding-details",
  "/photographs": "photographs",
  "/rsvp": "rsvp",
  "/with-love": "with-love",
};

const MARKETING_SECTIONS = {
  "/experience": "experience",
  "/templates": "templates",
  "/how-it-works": "how-it-works",
  "/pricing": "pricing",
  "/faq": "faq",
};

function Redirect({ to }) {
  useEffect(() => {
    window.location.replace(to + window.location.search);
  }, [to]);
  return null;
}

function ScrollToSection({ id }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `/#${id}`);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [id]);
  return null;
}

/**
 * VOWS has two public experiences:
 * - `/` and the marketing pages sell the platform.
 * - `/i/simeon-janet` is the real invitation experience.
 */
export default function App() {
  const path = decodeURIComponent(window.location.pathname).replace(/\/+$/, "") || "/";

  if (path === "/start") return <StartPage />;

  if (path === "/privacy") {
    return (
      <SimplePage
        title="Privacy policy"
        intro="We only collect the details needed to create and manage your invitation, reply to enquiries and process payments. Your guest list and RSVP data stay private to you and VOWS."
        note="The full policy is being prepared for launch. For any privacy request, message us on WhatsApp."
      />
    );
  }

  if (path === "/terms") {
    return (
      <SimplePage
        title="Terms of service"
        intro="VOWS creates digital wedding invitations. Each invitation is licensed for one wedding and one couple. Payments are one-time unless an additional service is agreed separately."
        note="The full terms are being prepared for launch. For questions about an order, message us on WhatsApp."
      />
    );
  }

  if (path === "/preview") return <Redirect to={INVITATION_BASE} />;

  // Old personalised links used the root with ?guest=...; keep them working
  // while the root itself becomes the VOWS marketing site.
  if (path === "/" && new URLSearchParams(window.location.search).has("guest")) {
    return <Redirect to={INVITATION_BASE} />;
  }

  if (LEGACY_INVITATION_PATHS[path]) {
    return <Redirect to={`${INVITATION_BASE}/${LEGACY_INVITATION_PATHS[path]}`} />;
  }

  if (path.startsWith("/i/")) {
    return (
      <Suspense fallback={<InvitationFallback />}>
        <InvitationApp />
      </Suspense>
    );
  }

  if (MARKETING_SECTIONS[path]) {
    return (
      <>
        <LandingPage />
        <ScrollToSection id={MARKETING_SECTIONS[path]} />
      </>
    );
  }

  return <LandingPage />;
}
