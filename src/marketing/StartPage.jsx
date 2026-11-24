import { useMemo, useState } from "react";
import { CONTACT_WHATSAPP, packages, templates } from "./content";
import { Icon } from "./Icons";

const initialValue = (value, allowed, fallback) =>
  allowed.some((item) => item.slug === value) ? value : fallback;

export function StartPage() {
  const params = new URLSearchParams(window.location.search);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    template: initialValue(params.get("template"), templates, "traditional-luxury"),
    package: initialValue(params.get("package"), packages, "signature"),
    note: "",
  });
  const [sent, setSent] = useState(false);

  const selectedPackage = packages.find((pkg) => pkg.slug === form.package) ?? packages[1];
  const selectedTemplate = templates.find((template) => template.slug === form.template) ?? templates[0];

  const whatsappLink = useMemo(() => {
    const lines = [
      "Hello VOWS! I'd like to create an invitation.",
      "",
      `Name: ${form.name || "—"}`,
      `Email: ${form.email || "—"}`,
      `Phone: ${form.phone || "—"}`,
      `Wedding date: ${form.date || "not decided yet"}`,
      `Template: ${selectedTemplate.name}`,
      `Package: ${selectedPackage.name} (${selectedPackage.price})`,
      form.note ? `Note: ${form.note}` : "",
    ].filter(Boolean);
    return `${CONTACT_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [form, selectedPackage, selectedTemplate]);

  const update = (key) => (event) => {
    setForm((value) => ({ ...value, [key]: event.target.value }));
    if (sent) setSent(false);
  };

  const submit = (event) => {
    event.preventDefault();
    setSent(true);
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mkt mkt-start">
      <header className="mkt-start__nav">
        <a className="mkt-wordmark" href="/">
          VOWS<span>.</span>
        </a>
        <a className="mkt-start__back" href="/">
          Back to VOWS
        </a>
      </header>

      <main className="mkt-start__main">
        <section className="mkt-start__intro">
          <p className="mkt-kicker">Founding invitations</p>
          <h1>
            Let&apos;s create something <em>unforgettable.</em>
          </h1>
          <p className="mkt-lede">
            Tell us a little about your day. We&apos;ll reply on WhatsApp to confirm your design, package
            and the next steps.
          </p>

          <div className="mkt-start__steps">
            <div>
              <span>01</span>
              <p>Send your details</p>
            </div>
            <div>
              <span>02</span>
              <p>We confirm your design</p>
            </div>
            <div>
              <span>03</span>
              <p>Pay and share your link</p>
            </div>
          </div>

          <div className="mkt-start__note">
            <Icon name="whatsapp" size={18} />
            <span>We reply within 24 hours, Monday–Saturday.</span>
          </div>
        </section>

        <section className="mkt-start__form-wrap" aria-labelledby="vows-start-form-title">
          <h2 id="vows-start-form-title">Tell us about your wedding</h2>
          {sent ? (
            <div className="mkt-start__sent" role="status">
              <p className="mkt-start__sent-kicker">One more step</p>
              <p>
                Your message is ready. If WhatsApp did not open automatically, tap the button below to send it.
              </p>
              <a className="mkt-btn mkt-btn--ink" href={whatsappLink} target="_blank" rel="noreferrer">
                Send on WhatsApp <Icon name="whatsapp" size={17} />
              </a>
              <button type="button" className="mkt-link mkt-start__edit" onClick={() => setSent(false)}>
                Edit my details
              </button>
            </div>
          ) : (
            <form className="mkt-start__form" onSubmit={submit}>
              <div className="mkt-field">
                <label htmlFor="start-name">Your name</label>
                <input id="start-name" name="name" autoComplete="name" required value={form.name} onChange={update("name")} placeholder="Your full name" />
              </div>
              <div className="mkt-field-row">
                <div className="mkt-field">
                  <label htmlFor="start-email">Email</label>
                  <input id="start-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update("email")} placeholder="you@example.com" />
                </div>
                <div className="mkt-field">
                  <label htmlFor="start-phone">Phone / WhatsApp</label>
                  <input id="start-phone" name="phone" type="tel" autoComplete="tel" required value={form.phone} onChange={update("phone")} placeholder="0800 000 0000" />
                </div>
              </div>
              <div className="mkt-field">
                <label htmlFor="start-date">Wedding date</label>
                <input id="start-date" name="date" type="date" value={form.date} onChange={update("date")} />
              </div>
              <div className="mkt-field-row">
                <div className="mkt-field">
                  <label htmlFor="start-template">Design</label>
                  <select id="start-template" name="template" value={form.template} onChange={update("template")}>
                    {templates.map((template) => (
                      <option key={template.slug} value={template.slug}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mkt-field">
                  <label htmlFor="start-package">Package</label>
                  <select id="start-package" name="package" value={form.package} onChange={update("package")}>
                    {packages.map((pkg) => (
                      <option key={pkg.slug} value={pkg.slug}>
                        {pkg.name} · {pkg.price}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mkt-field">
                <label htmlFor="start-note">Anything we should know? <span>(optional)</span></label>
                <textarea id="start-note" name="note" rows={4} value={form.note} onChange={update("note")} placeholder="Tell us about your celebration, your colours, or the feeling you want." />
              </div>
              <button type="submit" className="mkt-btn mkt-btn--ink mkt-start__submit">
                Send my details on WhatsApp <Icon name="arrow" size={17} />
              </button>
              <p className="mkt-start__privacy">By sending your details you agree to be contacted about your VOWS invitation.</p>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
