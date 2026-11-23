import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { wedding } from "../lib/wedding";
import { guest } from "../lib/guest";
import { getRsvp, isRsvpClosed, submitRsvp, clearLocalRsvp } from "../lib/rsvp";
import { downloadWeddingIcs } from "../lib/ics";
import { inView, riseChild, reducedChild } from "../lib/motion";
import { FloralEdge } from "../components/FloralEdge";
import { WaxSeal } from "../components/WaxSeal";
import { PearlDivider } from "../components/PearlDivider";
import { Sparkles } from "../components/Sparkles";

/**
 * Scene 08 — Reply card · Heirloom Lace.
 * Supabase-backed RSVP (RPC) with full state coverage: validation,
 * sending, network error (entries kept), success, already responded, closed.
 */
export function Scene08Rsvp({ onNext, onDetails }) {
  const reduced = useReducedMotion();
  const child = reduced ? reducedChild : riseChild;

  const closed = useMemo(() => isRsvpClosed(), []);
  const [status, setStatus] = useState(
    closed ? "closed" : guest.name ? "loading" : "form",
  ); // loading|form|success|already|closed
  const [saved, setSaved] = useState(null);
  const [name, setName] = useState(guest.name);
  const [choice, setChoice] = useState(null);
  const [guests, setGuests] = useState(Math.max(1, guest.seats));
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(false);
  const nameRef = useRef(null);
  const choiceRef = useRef(null);
  const sectionRef = useRef(null);
  const checked = useRef(false);
  // Only fetch a saved reply once the RSVP section is approached, so the
  // single-page invite can defer Supabase until it is actually needed.
  const nearViewport = useInView(sectionRef, { once: true, margin: "400px 0px 400px 0px" });

  useEffect(() => {
    let alive = true;
    if (!nearViewport || checked.current) return () => { alive = false; };
    checked.current = true;
    if (!guest.name) {
      setStatus(closed ? "closed" : "form");
      return () => { alive = false; };
    }
    getRsvp(guest.name)
      .then((row) => {
        if (!alive) return;
        if (row) {
          setSaved(row);
          setName(row.name ?? guest.name);
          setChoice(row.choice ?? null);
          setGuests(Math.max(1, row.guests ?? guest.seats));
          setNote(row.note ?? "");
          setStatus(closed ? "closed" : "already");
        } else {
          setStatus(closed ? "closed" : "form");
        }
      })
      .catch(() => alive && setStatus(closed ? "closed" : "form"));
    return () => { alive = false; };
  }, [closed, nearViewport]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = "Please enter your full name.";
    if (!choice) errs.choice = "Please choose whether you can attend.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      (errs.name ? nameRef : choiceRef).current?.focus();
      return;
    }
    setSending(true);
    const result = await submitRsvp({
      name: name.trim(),
      choice,
      guests: choice === "accepts" ? guests : 0,
      note: note.trim() || undefined,
      at: Date.now(),
    });
    setSending(false);
    if (result.ok) setStatus("success");
    else setToast(true);
  };

  const changeResponse = () => {
    clearLocalRsvp();
    setStatus("form");
  };

  /* ------------------------------------------------------------ loading -- */
  if (status === "loading") {
    return (
      <section
        ref={sectionRef}
        className="scene scene-reply scene-reply--loading"
        aria-label="RSVP"
        aria-busy="true"
      >
        <FloralEdge corner="tl" size={130} />
        <FloralEdge corner="br" size={150} />
        <div className="reply-loading">
          <span className="vbtn__spinner" aria-hidden="true" />
          <p className="type-body text-secondary">Checking your reply…</p>
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------- success -- */
  if (status === "success") {
    const summary = choice === "accepts"
      ? `Joyfully accepts · ${guests} ${guests === 1 ? "guest" : "guests"}`
      : "Regretfully declines";
    return (
      <section className="scene scene-reply-done" aria-label="Reply received">
        <Sparkles />
        <FloralEdge corner="tl" size={130} />
        <FloralEdge corner="br" size={150} />

        <motion.div className="reply-done__card" initial="initial" whileInView="animate" viewport={inView} variants={riseChild}>
          <span className="reply-done__stitch" aria-hidden="true" />
          <WaxSeal size={72} className="reply-done__seal" />
          <p className="type-overline text-accent">Reply received</p>
          <p className="type-script-gold reply-done__thanks">Thank you, {name.trim().split(/\s+/)[0] || "friend"}</p>
          <p className="type-subheading-italic text-secondary reply-done__line">
            Your reply card is on its way to {wedding.couple.first} &amp; {wedding.couple.second}.
          </p>
          <PearlDivider />
          <p className="type-body-strong reply-done__summary">{summary}</p>
        </motion.div>

        <div className="reply-done__actions">
          <button type="button" className="vbtn vbtn--foil reply-done__cta" onClick={downloadWeddingIcs}>
            Add to calendar
          </button>
          <button type="button" className="vbtn vbtn--white reply-done__cta" onClick={onDetails}>
            View the programme
          </button>
          <button type="button" className="vbtn vbtn--ghost" onClick={() => setStatus("form")}>
            Change my reply
          </button>
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------- already/closed -- */
  if (status === "already" && saved) {
    return (
      <section className="scene scene-reply-done" aria-label="Already responded">
        <FloralEdge corner="tl" size={130} />
        <FloralEdge corner="br" size={150} />
        <motion.div className="reply-done__card" initial="initial" whileInView="animate" viewport={inView} variants={riseChild}>
          <span className="reply-done__stitch" aria-hidden="true" />
          <WaxSeal size={64} className="reply-done__seal" />
          <p className="type-title">You’ve already replied</p>
          <p className="type-body-lg text-secondary reply-done__line">
            {guest.firstName}, we have your reply:{" "}
            <strong>
              {saved.choice === "accepts" ? "Joyfully accepts" : "Regretfully declines"}
              {saved.guests ? ` · ${saved.guests} guests` : ""}
            </strong>
            . You can update it until {wedding.rsvpByFull}.
          </p>
        </motion.div>
        <div className="reply-done__actions">
          <button type="button" className="vbtn vbtn--white reply-done__cta" onClick={changeResponse}>
            Update my reply
          </button>
        </div>
      </section>
    );
  }

  if (status === "closed") {
    return (
      <section className="scene scene-reply-done" aria-label="RSVPs closed">
        <FloralEdge corner="tl" size={130} />
        <FloralEdge corner="br" size={150} />
        <motion.div className="reply-done__card" initial="initial" whileInView="animate" viewport={inView} variants={riseChild}>
          <span className="reply-done__stitch" aria-hidden="true" />
          <WaxSeal size={64} className="reply-done__seal" />
          <p className="type-title">RSVPs are now closed</p>
          <p className="type-body-lg text-secondary reply-done__line">
            The couple are finalising numbers with the venue. If you need to reach them, message
            the couple on WhatsApp.
          </p>
        </motion.div>
        <div className="reply-done__actions">
          <a className="vbtn vbtn--white reply-done__cta" href="https://wa.me/2349035517399" target="_blank" rel="noreferrer">
            Message on WhatsApp
          </a>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- form -- */
  const initial = (name.trim()[0] || guest.firstName[0] || "G").toUpperCase();

  return (
    <section className="scene scene-reply" aria-label="RSVP">
      <FloralEdge corner="tl" size={130} />
      <FloralEdge corner="br" size={150} />

      <motion.header className="scene-head" variants={riseChild} initial="initial" whileInView="animate" viewport={inView}>
        <p className="kicker">The favour of a reply</p>
        <h1>by {wedding.rsvpBy}</h1>
      </motion.header>

      <motion.form
        className="reply-card"
        variants={riseChild}
        initial="initial"
        whileInView="animate"
        viewport={inView}
        onSubmit={submit}
        noValidate
      >
        <span className="reply-card__stitch" aria-hidden="true" />

        <div className="reply-name">
          <span className="reply-name__initial" aria-hidden="true">{initial}</span>
          <div className="reply-name__field">
            <label className="visually-hidden" htmlFor="rsvp-name">Your full name</label>
            <input
              id="rsvp-name"
              ref={nameRef}
              type="text"
              value={name}
              placeholder="Your full name"
              autoComplete="name"
              aria-required="true"
              aria-invalid={!!errors.name || undefined}
              aria-describedby={errors.name ? "rsvp-name-err" : undefined}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="reply-error type-small" id="rsvp-name-err" role="alert">{errors.name}</p>}
          </div>
        </div>

        <div className="reply-choices" ref={choiceRef} tabIndex={-1}>
          {[
            ["accepts", "Joyfully accepts"],
            ["declines", "Regretfully declines"],
          ].map(([value, label]) => (
            <label key={value} className={`reply-choice${choice === value ? " is-selected" : ""}`}>
              <input
                type="radio"
                name="attending"
                value={value}
                checked={choice === value}
                onChange={() => setChoice(value)}
              />
              <span className="reply-choice__box" aria-hidden="true" />
              <span className="reply-choice__label">{label}</span>
            </label>
          ))}
          {errors.choice && <p className="reply-error type-small" role="alert">{errors.choice}</p>}
        </div>

        {choice === "accepts" && (
          <div className="reply-guests">
            <span className="reply-guests__label">Guests</span>
            <div className="reply-stepper" role="group" aria-label="Number of guests">
              <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label="Fewer guests">−</button>
              <output aria-live="polite">{guests}</output>
              <button type="button" onClick={() => setGuests((g) => Math.min(10, g + 1))} disabled={guests >= 10} aria-label="More guests">+</button>
            </div>
          </div>
        )}

        <div className="reply-note">
          <label className="type-gold-italic" htmlFor="rsvp-note">
            A note for {wedding.couple.first} <span className="amp">&amp;</span> {wedding.couple.second}
          </label>
          <textarea
            id="rsvp-note"
            rows={2}
            placeholder="Write a few words…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button type="submit" className="vbtn vbtn--foil reply-card__submit" disabled={sending} aria-busy={sending || undefined}>
          {sending && <span className="vbtn__spinner" aria-hidden="true" />}
          <span>{sending ? "Sending…" : "Send my reply"}</span>
        </button>
      </motion.form>

      <div className={`toast${toast ? " is-open" : ""}`} role="alert" aria-live="assertive">
        <span className="toast__dot" aria-hidden="true" />
        <span>
          We couldn’t send your reply. Check your connection and try again. Nothing you typed has been lost.
        </span>
      </div>
    </section>
  );
}
