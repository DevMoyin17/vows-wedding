import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "./Icons";
import {
  CONTACT_WHATSAPP,
  experience,
  faqs,
  features,
  navLinks,
  packages,
  steps,
  templates,
} from "./content";
import { INVITATION_BASE } from "../lib/routes";

function Reveal({ children, className = "", delay = 0 }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 26 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Wordmark({ light = false }) {
  return (
    <a className={`mkt-wordmark${light ? " mkt-wordmark--light" : ""}`} href="/" aria-label="VOWS home">
      VOWS<span>.</span>
    </a>
  );
}

function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`mkt-nav${scrolled ? " is-scrolled" : ""}`}>
      <Wordmark />
      <nav className="mkt-nav__links" aria-label="VOWS">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="mkt-nav__actions">
        <a className="mkt-nav__preview" href={INVITATION_BASE}>
          Live invitation
        </a>
        <a className="mkt-btn mkt-btn--ink mkt-nav__cta" href="/start">
          Create invitation
        </a>
        <button
          type="button"
          className="mkt-nav__menu"
          aria-expanded={open}
          aria-controls="vows-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? "close" : "menu"} size={22} />
        </button>
      </div>

      {open && (
        <div className="mkt-mobile-menu" id="vows-mobile-menu">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href={INVITATION_BASE} onClick={() => setOpen(false)}>
            Live invitation
          </a>
          <a className="mkt-btn mkt-btn--ink" href="/start" onClick={() => setOpen(false)}>
            Create invitation
          </a>
        </div>
      )}
    </header>
  );
}

function PhoneMockup({ image, alt, className = "", compact = false, href }) {
  const phone = (
    <div className={`mkt-phone${compact ? " mkt-phone--compact" : ""}${className ? ` ${className}` : ""}`}>
      <div className="mkt-phone__screen">
        <img src={image} alt={alt} loading={compact ? "lazy" : "eager"} />
        <span className="mkt-phone__shade" aria-hidden="true" />
        <div className="mkt-phone__status">
          <span className="mkt-phone__mono">S &amp; J</span>
          <span>20 · 02 · 27</span>
        </div>
        <div className="mkt-phone__card">
          <p>Together with their families</p>
          <p className="mkt-phone__names">
            Simeon <em>&amp;</em> Janet
          </p>
          <p className="mkt-phone__date">Saturday, 20 February 2027 · Ibadan</p>
          <span className="mkt-phone__pill">
            Open invitation <Icon name="arrow" size={14} />
          </span>
        </div>
      </div>
      <span className="mkt-phone__notch" aria-hidden="true" />
    </div>
  );

  if (!href) return phone;
  return (
    <a className="mkt-phone-link" href={href} aria-label="Open the live VOWS invitation">
      {phone}
    </a>
  );
}

function Hero() {
  return (
    <section className="mkt-hero" aria-labelledby="vows-hero-title">
      <div className="mkt-hero__floral" aria-hidden="true">
        <img src="/assets/heirloom/floral-tl.webp" alt="" />
      </div>
      <div className="mkt-hero__glow" aria-hidden="true" />

      <div className="mkt-wrap mkt-hero__inner">
        <div className="mkt-hero__copy">
          <p className="mkt-eyebrow">
            <span className="mkt-eyebrow__rule" aria-hidden="true" />
            Digital wedding invitations
          </p>
          <h1 id="vows-hero-title">
            Every love story deserves an <em>extraordinary</em> invitation.
          </h1>
          <p className="mkt-lede">
            VOWS turns your wedding into a cinematic digital experience — an invitation your guests will
            remember, with every detail, photograph and reply in one beautiful link.
          </p>
          <div className="mkt-actions">
            <a className="mkt-btn mkt-btn--ink" href="/start">
              Create your invitation <Icon name="arrow" size={17} />
            </a>
            <a className="mkt-btn mkt-btn--ghost" href={INVITATION_BASE}>
              Open the live invitation
            </a>
          </div>
          <p className="mkt-hero__note">No apps for guests. One link for every detail.</p>
          <div className="mkt-hero__proof">
            <span className="mkt-hero__proof-mark">01</span>
            <span>The first VOWS invitation · Simeon &amp; Janet</span>
          </div>
        </div>

        <div className="mkt-hero__visual">
          <div className="mkt-hero__ring" aria-hidden="true" />
          <PhoneMockup
            image="/assets/photos/prewedding-black-cream.jpg"
            alt="A VOWS invitation featuring Simeon and Janet in black and cream"
            href={INVITATION_BASE}
          />
          <div className="mkt-hero__seal" aria-hidden="true">
            <img src="/assets/marketing/seal-sj.png" alt="" />
          </div>
          <div className="mkt-hero__badge">
            <span />
            A real VOWS invitation
          </div>
        </div>
      </div>

      <div className="mkt-ticker" aria-label="What every VOWS invitation includes">
        <div className="mkt-ticker__track">
          {[
            "Animated envelope",
            "Live countdown",
            "Love story",
            "Photo gallery",
            "Music",
            "RSVP",
            "Directions",
            "One link",
            "Animated envelope",
            "Live countdown",
            "Love story",
            "Photo gallery",
            "Music",
            "RSVP",
            "Directions",
            "One link",
          ].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHead({ kicker, title, lede, align = "left", id }) {
  return (
    <Reveal className={`mkt-section-head mkt-section-head--${align}`}>
      <p className="mkt-kicker">{kicker}</p>
      <h2 className="mkt-title" id={id}>{title}</h2>
      {lede && <p className="mkt-lede">{lede}</p>}
    </Reveal>
  );
}

function Experience() {
  return (
    <section className="mkt-section" id="experience" aria-labelledby="vows-experience-title">
      <div className="mkt-wrap">
        <SectionHead
          id="vows-experience-title"
          kicker="The experience"
          title={
            <>
              More than an invitation. <em>A feeling.</em>
            </>
          }
          lede="Every VOWS invitation is built like a short film — paced, intimate and designed to be opened on a phone."
        />

        <div className="mkt-experience-grid">
          {experience.map((item, index) => (
            <Reveal key={item.title} className="mkt-experience-card" delay={index * 0.06}>
              <div className="mkt-experience-card__top">
                <span>{item.number}</span>
                <p>{item.title}</p>
              </div>
              {item.countdown ? (
                <div className="mkt-mini-countdown" aria-hidden="true">
                  <p className="mkt-mini-countdown__label">The Countdown</p>
                  <div className="mkt-mini-countdown__row">
                    {[
                      ["88", "days"],
                      ["06", "hours"],
                      ["24", "min"],
                      ["12", "sec"],
                    ].map(([value, label]) => (
                      <span key={label}>
                        <strong>{value}</strong>
                        <small>{label}</small>
                      </span>
                    ))}
                  </div>
                  <p className="mkt-mini-countdown__date">Saturday, 20 February 2027</p>
                </div>
              ) : (
                <div className="mkt-experience-card__media">
                  <img src={item.image} alt={item.alt} loading="lazy" />
                </div>
              )}
              <p className="mkt-experience-card__copy">{item.copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplateVisual({ template }) {
  if (template.image) {
    return (
      <div className="mkt-template__visual mkt-template__visual--photo">
        <img src={template.image} alt={template.alt} loading="lazy" />
        <span className="mkt-template__live">Live preview</span>
      </div>
    );
  }

  return (
    <div
      className={`mkt-template__visual${template.floral ? " mkt-template__visual--floral" : ""}`}
      style={{
        background: template.floral
          ? "linear-gradient(135deg, #f4e4e3, #f8f2eb)"
          : `linear-gradient(145deg, ${template.palette[0]}, ${template.palette[2]})`,
      }}
    >
      {template.floral && <img src="/assets/heirloom/floral-tl.webp" alt="" aria-hidden="true" />}
      <div
        className="mkt-template__sample"
        style={{
          color: template.slug === "minimalist-elegance" ? "#1f1c19" : template.palette[1],
        }}
      >
        <span className="mkt-template__sample-mono">V</span>
        <span className="mkt-template__sample-script">{template.name}</span>
        <span className="mkt-template__sample-rule" />
        <span className="mkt-template__sample-names">Simeon &amp; Janet</span>
      </div>
      <span className="mkt-template__soon">Coming soon</span>
    </div>
  );
}

function Templates() {
  return (
    <section className="mkt-section mkt-section--blush" id="templates" aria-labelledby="vows-templates-title">
      <div className="mkt-wrap">
        <SectionHead
          id="vows-templates-title"
          kicker="Invitation designs"
          title={
            <>
              Choose the world your <em>story</em> lives in.
            </>
          }
          lede="A growing collection of invitation designs, each built with the same care as the wedding itself. Traditional Luxury is live today."
          align="center"
        />

        <div className="mkt-templates-grid">
          {templates.map((template, index) => (
            <Reveal key={template.slug} className="mkt-template" delay={index * 0.05}>
              <TemplateVisual template={template} />
              <div className="mkt-template__body">
                <p className="mkt-template__style">{template.style}</p>
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                <div className="mkt-template__footer">
                  <div className="mkt-palette" aria-label={`${template.name} colour palette`}>
                    {template.palette.map((colour) => (
                      <span key={colour} style={{ background: colour }} />
                    ))}
                  </div>
                  {template.status === "live" ? (
                    <a className="mkt-template__link" href={INVITATION_BASE}>
                      View it live <Icon name="arrow" size={14} />
                    </a>
                  ) : (
                    <a className="mkt-template__link" href={`/start?template=${template.slug}`}>
                      Join the waitlist <Icon name="arrow" size={14} />
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="mkt-section" id="how-it-works" aria-labelledby="vows-how-title">
      <div className="mkt-wrap">
        <SectionHead
          id="vows-how-title"
          kicker="How it works"
          title={
            <>
              From <em>yes</em> to the guest list, in four steps.
            </>
          }
          lede="You choose the design and send us your story. We build the invitation, and you share one link with everyone you love."
        />

        <div className="mkt-steps">
          {steps.map((step, index) => (
            <Reveal key={step.number} className="mkt-step" delay={index * 0.07}>
              <span className="mkt-step__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mkt-inline-cta">
          <p>Want to see the finish line first?</p>
          <a className="mkt-link" href={INVITATION_BASE}>
            Open a real VOWS invitation <Icon name="arrow" size={15} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="mkt-section mkt-section--dark" id="features" aria-labelledby="vows-features-title">
      <div className="mkt-wrap">
        <SectionHead
          id="vows-features-title"
          kicker="Everything included"
          title={
            <>
              Everything your day needs, in <em>one link.</em>
            </>
          }
          lede="No separate website, no paper inserts, no spreadsheets. VOWS brings the invitation and the guest list together."
          align="center"
        />

        <div className="mkt-features-grid">
          {features.map((feature, index) => (
            <Reveal key={feature.title} className="mkt-feature" delay={index * 0.04}>
              <span className="mkt-feature__icon">
                <Icon name={feature.icon} size={24} />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function LivePreview() {
  return (
    <section className="mkt-section mkt-section--preview" id="live-preview" aria-labelledby="vows-preview-title">
      <div className="mkt-wrap mkt-preview">
        <Reveal className="mkt-preview__copy">
          <p className="mkt-kicker">Live invitation preview</p>
          <h2 className="mkt-title" id="vows-preview-title">
            See it before you <em>choose it.</em>
          </h2>
          <p className="mkt-lede">
            Step inside the real VOWS invitation built for Simeon &amp; Janet — open the envelope, hear the
            music and walk through every chapter.
          </p>
          <div className="mkt-actions">
            <a className="mkt-btn mkt-btn--ink" href={INVITATION_BASE}>
              Open the live invitation <Icon name="arrow" size={17} />
            </a>
            <a className="mkt-btn mkt-btn--ghost" href="/start">
              Create yours
            </a>
          </div>
          <p className="mkt-hero__note">Free to explore. No account needed.</p>
        </Reveal>

        <Reveal className="mkt-preview__visual" delay={0.08}>
          <div className="mkt-preview__glow" aria-hidden="true" />
          <PhoneMockup
            compact
            image="/assets/photos/prewedding-green.jpg"
            alt="A VOWS invitation preview featuring Simeon and Janet in green"
            href={INVITATION_BASE}
          />
          <div className="mkt-preview__note">
            <span className="mkt-preview__dot" />
            A live VOWS invitation
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="mkt-section mkt-section--blush" id="pricing" aria-labelledby="vows-pricing-title">
      <div className="mkt-wrap">
        <SectionHead
          id="vows-pricing-title"
          kicker="Pricing"
          title={
            <>
              Simple pricing. <em>One beautiful link.</em>
            </>
          }
          lede="Pay once, keep your invitation. No subscriptions and no hidden platform fees."
          align="center"
        />

        <div className="mkt-pricing-grid">
          {packages.map((pkg, index) => (
            <Reveal
              key={pkg.slug}
              className={`mkt-price-card${pkg.slug === "signature" ? " mkt-price-card--featured" : ""}`}
              delay={index * 0.06}
            >
              {pkg.badge && <span className="mkt-price-card__badge">{pkg.badge}</span>}
              <p className="mkt-price-card__name">{pkg.name}</p>
              <p className="mkt-price-card__price">{pkg.price}</p>
              <p className="mkt-price-card__description">{pkg.description}</p>
              <ul className="mkt-price-card__list">
                {pkg.features.map((feature) => (
                  <li key={feature}>
                    <Icon name="check" size={15} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                className={`mkt-btn ${pkg.slug === "signature" ? "mkt-btn--gold" : "mkt-btn--ghost"} mkt-price-card__cta`}
                href={`/start?package=${pkg.slug}`}
              >
                {pkg.cta}
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mkt-pricing-note">
          <p>Prices are in Nigerian Naira. Custom domains and bespoke designs are available separately.</p>
          <a className="mkt-link" href={`${CONTACT_WHATSAPP}?text=${encodeURIComponent("Hello VOWS, I'd like to ask about a custom invitation.")}`} target="_blank" rel="noreferrer">
            Ask about a custom design <Icon name="arrow" size={15} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function FoundingInvitation() {
  return (
    <section className="mkt-section" id="founding-invitation" aria-labelledby="vows-founding-title">
      <div className="mkt-wrap mkt-founding">
        <Reveal className="mkt-founding__visual">
          <img
            src="/assets/photos/prewedding-burgundy-traditional.jpg"
            alt="Simeon and Janet in burgundy traditional wedding attire"
            loading="lazy"
          />
          <span className="mkt-founding__stamp">The first invitation</span>
        </Reveal>
        <Reveal className="mkt-founding__copy" delay={0.06}>
          <p className="mkt-kicker">Made for real love</p>
          <h2 className="mkt-title" id="vows-founding-title">
            Built for a <em>real celebration.</em>
          </h2>
          <p className="mkt-lede">
            Simeon &amp; Janet&apos;s wedding in Ibadan was the first VOWS invitation — the envelope, the
            story, the countdown and every reply in one link.
          </p>
          <p className="mkt-founding__note">
            Every VOWS invitation starts with a story like theirs. Yours is next.
          </p>
          <a className="mkt-link" href={INVITATION_BASE}>
            View their invitation <Icon name="arrow" size={15} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="mkt-section" id="faq" aria-labelledby="vows-faq-title">
      <div className="mkt-wrap mkt-faq-wrap">
        <SectionHead
          id="vows-faq-title"
          kicker="Questions"
          title={
            <>
              A few things you might be <em>wondering.</em>
            </>
          }
          lede="If your question is not here, message us on WhatsApp and we will answer it personally."
        />
        <div className="mkt-faq">
          {faqs.map((faq) => (
            <details key={faq.q} className="mkt-faq__item">
              <summary>
                <span>{faq.q}</span>
                <span className="mkt-faq__mark" aria-hidden="true" />
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
        <Reveal className="mkt-inline-cta">
          <p>Still deciding?</p>
          <a className="mkt-link" href={CONTACT_WHATSAPP} target="_blank" rel="noreferrer">
            Message VOWS on WhatsApp <Icon name="whatsapp" size={16} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mkt-final" aria-labelledby="vows-final-title">
      <div className="mkt-final__floral" aria-hidden="true">
        <img src="/assets/heirloom/floral-tl.webp" alt="" />
      </div>
      <div className="mkt-wrap mkt-final__inner">
        <Reveal>
          <p className="mkt-kicker mkt-kicker--light">The next chapter</p>
          <h2 id="vows-final-title">
            Your wedding deserves more than an <em>ordinary</em> invitation.
          </h2>
          <p className="mkt-lede mkt-lede--light">
            Give your guests something they will remember. Start with the invitation, and let the rest of the
            day follow.
          </p>
          <div className="mkt-actions">
            <a className="mkt-btn mkt-btn--gold" href="/start">
              Create your invitation <Icon name="arrow" size={17} />
            </a>
            <a className="mkt-btn mkt-btn--light-ghost" href={INVITATION_BASE}>
              View a live invitation
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MarketingFooter() {
  return (
    <footer className="mkt-footer">
      <div className="mkt-wrap mkt-footer__top">
        <div className="mkt-footer__brand">
          <Wordmark light />
          <p>Digital wedding invitations for modern love.</p>
          <a href={CONTACT_WHATSAPP} target="_blank" rel="noreferrer">
            WhatsApp VOWS <Icon name="arrow" size={14} />
          </a>
        </div>
        <div className="mkt-footer__col">
          <p>Explore</p>
          <a href="/#experience">Experience</a>
          <a href="/#templates">Templates</a>
          <a href="/#pricing">Pricing</a>
          <a href={INVITATION_BASE}>Live invitation</a>
        </div>
        <div className="mkt-footer__col">
          <p>Company</p>
          <a href="/#founding-invitation">About VOWS</a>
          <a href="/#how-it-works">How it works</a>
          <a href="/#faq">FAQ</a>
          <a href={CONTACT_WHATSAPP} target="_blank" rel="noreferrer">
            Contact
          </a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>
      <div className="mkt-wrap mkt-footer__bottom">
        <span>© {new Date().getFullYear()} VOWS. Made for modern love.</span>
        <span>Ibadan · Nigeria</span>
      </div>
    </footer>
  );
}

export function LandingPage() {
  useEffect(() => {
    document.title = "VOWS · Every love story deserves an extraordinary invitation";
    return undefined;
  }, []);

  return (
    <div className="mkt">
      <MarketingNav />
      <main>
        <Hero />
        <Experience />
        <Templates />
        <HowItWorks />
        <Features />
        <LivePreview />
        <Pricing />
        <FoundingInvitation />
        <Faq />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
