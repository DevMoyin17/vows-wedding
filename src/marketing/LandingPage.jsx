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
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.72, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Wordmark({ light = false }) {
  return (
    <a className={`lp-wordmark${light ? " lp-wordmark--light" : ""}`} href="/" aria-label="VOWS home">
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
    <header className={`lp-nav${scrolled ? " is-scrolled" : ""}`}>
      <Wordmark />
      <nav className="lp-nav__links" aria-label="VOWS">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="lp-nav__actions">
        <a className="lp-nav__preview" href={INVITATION_BASE}>
          Live invitation
        </a>
        <a className="lp-btn lp-btn--wine lp-nav__cta" href="/start">
          Create invitation
        </a>
        <button
          type="button"
          className="lp-nav__menu"
          aria-expanded={open}
          aria-controls="vows-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? "close" : "menu"} size={22} />
        </button>
      </div>

      {open && (
        <div className="lp-mobile-menu" id="vows-mobile-menu">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href={INVITATION_BASE} onClick={() => setOpen(false)}>
            Live invitation
          </a>
          <a className="lp-btn lp-btn--wine" href="/start" onClick={() => setOpen(false)}>
            Create invitation
          </a>
        </div>
      )}
    </header>
  );
}

function HeroInvitation() {
  return (
    <a className="lp-hero-invite" href={INVITATION_BASE} aria-label="Open the live VOWS invitation">
      <span className="lp-hero-invite__halo" aria-hidden="true" />
      <span className="lp-hero-invite__ring" aria-hidden="true" />
      <span className="lp-hero-invite__envelope" aria-hidden="true">
        <span className="lp-hero-invite__flap" />
        <span className="lp-hero-invite__body" />
        <img className="lp-hero-invite__seal" src="/assets/marketing/seal-sj.png" alt="" />
      </span>
      <span className="lp-hero-invite__card">
        <span className="lp-hero-invite__mono">S <em>&amp;</em> J</span>
        <span className="lp-hero-invite__over">Together with their families</span>
        <strong className="lp-hero-invite__names">
          Simeon <em>&amp;</em> Janet
        </strong>
        <span className="lp-hero-invite__date">20 February 2027 · Ibadan</span>
        <span className="lp-hero-invite__line" />
        <span className="lp-hero-invite__cta">
          Open invitation <Icon name="arrow" size={14} />
        </span>
      </span>
      <span className="lp-hero-invite__caption">The first VOWS invitation · Simeon &amp; Janet</span>
    </a>
  );
}

function Hero() {
  return (
    <section className="lp-hero" aria-labelledby="vows-hero-title">
      <div className="lp-hero__wash" aria-hidden="true" />
      <div className="lp-wrap lp-hero__inner">
        <div className="lp-hero__copy">
          <p className="lp-eyebrow">
            <span className="lp-eyebrow__rule" aria-hidden="true" />
            Digital wedding invitations
          </p>
          <h1 id="vows-hero-title">
            Every love story deserves an <em>extraordinary</em> invitation.
          </h1>
          <p className="lp-lede">
            VOWS turns your wedding into a cinematic digital experience — an invitation your guests will
            remember, with every detail, photograph and reply in one beautiful link.
          </p>
          <div className="lp-actions">
            <a className="lp-btn lp-btn--wine" href="/start">
              Create your invitation <Icon name="arrow" size={17} />
            </a>
            <a className="lp-btn lp-btn--outline" href={INVITATION_BASE}>
              Open the live invitation
            </a>
          </div>
          <p className="lp-hero__note">No apps for guests. One link for every detail.</p>
          <div className="lp-hero__proof">
            <span className="lp-hero__proof-dot" aria-hidden="true" />
            <span>The first VOWS invitation · Simeon &amp; Janet</span>
          </div>
        </div>
        <div className="lp-hero__visual">
          <HeroInvitation />
        </div>
      </div>
    </section>
  );
}

function SectionHead({ kicker, title, lede, align = "left", light = false, id }) {
  return (
    <Reveal className={`lp-section-head lp-section-head--${align}${light ? " lp-section-head--light" : ""}`}>
      <p className="lp-kicker">{kicker}</p>
      <h2 className="lp-title" id={id}>{title}</h2>
      {lede && <p className="lp-lede">{lede}</p>}
    </Reveal>
  );
}

function ExperienceVisual({ type, index }) {
  if (type === "envelope") {
    return (
      <div className="lp-exp-visual lp-exp-visual--envelope" aria-hidden="true">
        <span className="lp-mini-envelope">
          <span className="lp-mini-envelope__flap" />
          <span className="lp-mini-envelope__seal" />
        </span>
      </div>
    );
  }
  if (type === "monogram") {
    return (
      <div className="lp-exp-visual lp-exp-visual--monogram" aria-hidden="true">
        <span>S</span>
        <em>&amp;</em>
        <span>J</span>
      </div>
    );
  }
  if (type === "countdown") {
    return (
      <div className="lp-exp-visual lp-exp-visual--countdown" aria-hidden="true">
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
    );
  }
  return (
    <div className={`lp-exp-visual lp-exp-visual--gallery lp-exp-visual--gallery-${index}`} aria-hidden="true">
      {["#5b1f2d", "#c6a466", "#743c4b", "#1f1b18"].map((colour, i) => (
        <span key={colour} style={{ background: colour }} />
      ))}
    </div>
  );
}

function Experience() {
  return (
    <section className="lp-section lp-section--plum" id="experience" aria-labelledby="vows-experience-title">
      <div className="lp-wrap">
        <SectionHead
          id="vows-experience-title"
          kicker="The experience"
          title={
            <>
              Four moments your guests will <em>remember.</em>
            </>
          }
          lede="A VOWS invitation unfolds in four scenes, from the first tap to the reply. It feels like a short film, not a web page."
          light
        />

        <div className="lp-exp-grid">
          {experience.map((item, index) => (
            <Reveal key={item.title} className="lp-exp-card" delay={index * 0.06}>
              <div className="lp-exp-card__top">
                <span>{item.number}</span>
                <p>{item.title}</p>
              </div>
              <ExperienceVisual type={item.visual} index={index} />
              <p className="lp-exp-card__copy">{item.copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplateCover({ template }) {
  const [one, two, three] = template.palette;
  const isLight = template.slug === "minimalist-elegance";
  const isRomantic = template.slug === "romantic-garden";
  return (
    <div
      className={`lp-cover lp-cover--${template.slug}`}
      style={{
        background: one,
        color: isLight ? two : isRomantic ? two : three,
      }}
    >
      {template.floral && <img className="lp-cover__floral" src="/assets/heirloom/floral-tl.webp" alt="" aria-hidden="true" />}
      <div className="lp-cover__grain" aria-hidden="true" />
      <div className="lp-cover__card">
        <span className="lp-cover__mono">S <em>&amp;</em> J</span>
        <span className="lp-cover__rule" />
        <span className="lp-cover__names">Simeon <em>&amp;</em> Janet</span>
        <span className="lp-cover__date">20 · 02 · 2027</span>
      </div>
      {template.status === "live" ? (
        <span className="lp-cover__badge lp-cover__badge--live">Live</span>
      ) : (
        <span className="lp-cover__badge">Coming soon</span>
      )}
    </div>
  );
}

function Templates() {
  return (
    <section className="lp-section" id="templates" aria-labelledby="vows-templates-title">
      <div className="lp-wrap">
        <SectionHead
          id="vows-templates-title"
          kicker="Invitation designs"
          title={
            <>
              Pick the <em>mood</em> of your day.
            </>
          }
          lede="Each design is a complete invitation with its own type, colour and motion. Open one up before you choose."
        />

        <div className="lp-templates-grid">
          {templates.map((template, index) => (
            <Reveal key={template.slug} className={`lp-template${template.status === "live" ? " lp-template--live" : ""}`} delay={index * 0.04}>
              <TemplateCover template={template} />
              <div className="lp-template__body">
                <p className="lp-template__style">{template.style}</p>
                <h3>{template.name}</h3>
                <div className="lp-template__footer">
                  <div className="lp-palette" aria-label={`${template.name} colour palette`}>
                    {template.palette.map((colour) => (
                      <span key={colour} style={{ background: colour }} />
                    ))}
                  </div>
                  {template.status === "live" ? (
                    <a className="lp-template__link" href={INVITATION_BASE}>
                      Live preview <Icon name="arrow" size={14} />
                    </a>
                  ) : (
                    <a className="lp-template__link" href={`/start?template=${template.slug}`}>
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
    <section className="lp-section lp-section--wine" id="how-it-works" aria-labelledby="vows-how-title">
      <div className="lp-wrap">
        <SectionHead
          id="vows-how-title"
          kicker="How it works"
          title={
            <>
              From first idea to sent in <em>four steps.</em>
            </>
          }
          lede="Choose the design, send us your story, and share one link with everyone you love."
          light
        />

        <div className="lp-steps">
          {steps.map((step, index) => (
            <Reveal key={step.number} className="lp-step" delay={index * 0.06}>
              <span className="lp-step__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="lp-inline-cta lp-inline-cta--light">
          <p>Want the full experience before you commit?</p>
          <a className="lp-link lp-link--light" href={INVITATION_BASE}>
            Open a real VOWS invitation <Icon name="arrow" size={15} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="lp-section" id="features" aria-labelledby="vows-features-title">
      <div className="lp-wrap lp-features">
        <Reveal className="lp-features__intro">
          <p className="lp-kicker">What&apos;s included</p>
          <h2 className="lp-title" id="vows-features-title">
            Everything an invitation <em>needs to do.</em>
          </h2>
          <p className="lp-lede">
            One link, one guest list, one place for every detail. VOWS takes the scattered pieces of a wedding
            and makes them feel effortless.
          </p>
        </Reveal>

        <div className="lp-feature-list">
          {features.map((feature, index) => (
            <Reveal key={feature.title} className="lp-feature-row" delay={index * 0.035}>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PreviewPhone() {
  return (
    <div className="lp-phone">
      <div className="lp-phone__screen">
        <div className="lp-phone__top">
          <span className="lp-phone__mono">S &amp; J</span>
          <span className="lp-phone__topline">20 · 02 · 27</span>
        </div>
        <p className="lp-phone__over">You are invited to the wedding of</p>
        <p className="lp-phone__names">
          Simeon <em>&amp;</em> Janet
        </p>
        <p className="lp-phone__date">Saturday, 20 February 2027 · Ibadan</p>
        <div className="lp-phone__count">
          {[
            ["88", "days"],
            ["06", "hrs"],
            ["24", "min"],
            ["12", "sec"],
          ].map(([value, label]) => (
            <span key={label}>
              <strong>{value}</strong>
              <small>{label}</small>
            </span>
          ))}
        </div>
        <div className="lp-phone__card">
          <span className="lp-phone__card-top">Together with their families</span>
          <span className="lp-phone__card-names">Simeon &amp; Janet</span>
          <span className="lp-phone__card-date">20 February 2027</span>
        </div>
        <span className="lp-phone__open">Open invitation <Icon name="arrow" size={12} /></span>
      </div>
      <span className="lp-phone__price">
        <span>Signature</span>
        <strong>₦45,000</strong>
      </span>
      <span className="lp-phone__notch" aria-hidden="true" />
    </div>
  );
}

function LivePreview() {
  return (
    <section className="lp-section lp-section--plum" id="live-preview" aria-labelledby="vows-preview-title">
      <div className="lp-wrap lp-preview">
        <Reveal className="lp-preview__copy">
          <p className="lp-kicker lp-kicker--light">Live invitation preview</p>
          <h2 className="lp-title lp-title--light" id="vows-preview-title">
            Open one before you <em>build yours.</em>
          </h2>
          <p className="lp-lede lp-lede--light">
            The best way to understand VOWS is to step inside one. This is the real invitation built for Simeon
            &amp; Janet — open the envelope, hear the music and walk through every chapter.
          </p>
          <div className="lp-actions">
            <a className="lp-btn lp-btn--gold" href={INVITATION_BASE}>
              Open the live invitation <Icon name="arrow" size={17} />
            </a>
            <a className="lp-btn lp-btn--light-outline" href="/start">
              Explore the template
            </a>
          </div>
          <p className="lp-hero__note lp-hero__note--light">Free to explore. No account needed.</p>
        </Reveal>

        <Reveal className="lp-preview__visual" delay={0.06}>
          <span className="lp-preview__glow" aria-hidden="true" />
          <a className="lp-phone-link" href={INVITATION_BASE} aria-label="Open the live VOWS invitation">
            <PreviewPhone />
          </a>
          <span className="lp-preview__note">
            <span className="lp-preview__dot" />
            A live VOWS invitation
          </span>
        </Reveal>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="lp-section" id="pricing" aria-labelledby="vows-pricing-title">
      <div className="lp-wrap">
        <SectionHead
          id="vows-pricing-title"
          kicker="Pricing"
          title={
            <>
              Choose a package, then <em>check out.</em>
            </>
          }
          lede="Every package comes with one shareable invitation link. Pay once, keep your invitation."
          align="center"
        />

        <div className="lp-pricing-grid">
          {packages.map((pkg, index) => (
            <Reveal
              key={pkg.slug}
              className={`lp-price-card${pkg.slug === "signature" ? " lp-price-card--featured" : ""}`}
              delay={index * 0.05}
            >
              {pkg.badge && <span className="lp-price-card__badge">{pkg.badge}</span>}
              <p className="lp-price-card__name">{pkg.name}</p>
              <p className="lp-price-card__price">{pkg.price}</p>
              <p className="lp-price-card__description">{pkg.description}</p>
              <ul className="lp-price-card__list">
                {pkg.features.map((feature) => (
                  <li key={feature}>
                    <Icon name="check" size={14} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a className="lp-btn lp-btn--gold lp-price-card__cta" href={`/start?package=${pkg.slug}`}>
                {pkg.cta}
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="lp-pricing-note">
          <p>Prices are in Nigerian Naira. Custom domains and bespoke designs are available separately.</p>
          <a
            className="lp-link"
            href={`${CONTACT_WHATSAPP}?text=${encodeURIComponent("Hello VOWS, I'd like to ask about a custom invitation.")}`}
            target="_blank"
            rel="noreferrer"
          >
            Ask about a custom design <Icon name="arrow" size={15} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function FirstYes() {
  return (
    <section className="lp-section lp-section--blush" id="founding-invitation" aria-labelledby="vows-first-title">
      <div className="lp-wrap">
        <SectionHead
          id="vows-first-title"
          kicker="The first yes"
          title={
            <>
              A real celebration, <em>built here first.</em>
            </>
          }
          align="center"
        />

        <Reveal className="lp-first">
          <div className="lp-first__photo">
            <img
              src="/assets/photos/prewedding-burgundy-traditional.jpg"
              alt="Simeon and Janet in burgundy traditional wedding attire"
              loading="lazy"
            />
            <span className="lp-first__stamp">The founding invitation</span>
          </div>
          <div className="lp-first__copy">
            <p className="lp-first__names">Simeon &amp; Janet</p>
            <p className="lp-first__place">Ibadan · 20 February 2027</p>
            <p className="lp-first__story">
              The first VOWS invitation — the envelope, the story, the countdown and every reply in one
              beautiful link. Every VOWS invitation starts with a real story. Yours is next.
            </p>
            <a className="lp-link" href={INVITATION_BASE}>
              View their invitation <Icon name="arrow" size={15} />
            </a>
          </div>
          <div className="lp-first__cta">
            <p>Your names could be next.</p>
            <a className="lp-btn lp-btn--wine" href="/start">
              Create yours <Icon name="arrow" size={16} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="lp-section" id="faq" aria-labelledby="vows-faq-title">
      <div className="lp-wrap lp-faq-wrap">
        <SectionHead
          id="vows-faq-title"
          kicker="Questions"
          title={
            <>
              Questions couples <em>ask first.</em>
            </>
          }
          lede="If your question is not here, message us on WhatsApp. We answer personally."
        />
        <div className="lp-faq">
          {faqs.map((faq) => (
            <details key={faq.q} className="lp-faq__item">
              <summary>
                <span>{faq.q}</span>
                <span className="lp-faq__mark" aria-hidden="true" />
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
        <Reveal className="lp-inline-cta">
          <p>Still deciding?</p>
          <a className="lp-link" href={CONTACT_WHATSAPP} target="_blank" rel="noreferrer">
            Message VOWS on WhatsApp <Icon name="whatsapp" size={16} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="lp-final" aria-labelledby="vows-final-title">
      <div className="lp-final__watermark" aria-hidden="true">VOWS</div>
      <div className="lp-final__orb" aria-hidden="true" />
      <div className="lp-wrap lp-final__inner">
        <Reveal>
          <p className="lp-kicker lp-kicker--gold">The next chapter</p>
          <h2 id="vows-final-title">
            Your wedding deserves more than an <em>ordinary</em> invitation.
          </h2>
          <p className="lp-lede lp-lede--light">
            Give your guests something they will remember. Start with the invitation, and let the rest of the
            day follow.
          </p>
          <div className="lp-actions">
            <a className="lp-btn lp-btn--gold" href="/start">
              Create your invitation <Icon name="arrow" size={17} />
            </a>
            <a className="lp-btn lp-btn--light-outline" href={INVITATION_BASE}>
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
    <footer className="lp-footer">
      <div className="lp-wrap lp-footer__top">
        <div className="lp-footer__brand">
          <Wordmark light />
          <p>Digital wedding invitations for modern love.</p>
          <a href={CONTACT_WHATSAPP} target="_blank" rel="noreferrer">
            WhatsApp VOWS <Icon name="arrow" size={14} />
          </a>
        </div>
        <div className="lp-footer__col">
          <p>Explore</p>
          <a href="/#experience">Experience</a>
          <a href="/#templates">Templates</a>
          <a href="/#pricing">Pricing</a>
          <a href={INVITATION_BASE}>Live invitation</a>
        </div>
        <div className="lp-footer__col">
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
      <div className="lp-wrap lp-footer__bottom">
        <span>© {new Date().getFullYear()} VOWS. Made for modern love.</span>
        <span>Ibadan · Nigeria</span>
      </div>
    </footer>
  );
}

export function LandingPage() {
  useEffect(() => {
    document.title = "VOWS · Every love story deserves an extraordinary invitation";
  }, []);

  return (
    <div className="lp">
      <MarketingNav />
      <main>
        <Hero />
        <Experience />
        <Templates />
        <HowItWorks />
        <Features />
        <LivePreview />
        <Pricing />
        <FirstYes />
        <Faq />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
