import { CONTACT_WHATSAPP } from "./content";

export function SimplePage({ title, intro, note }) {
  return (
    <div className="mkt mkt-legal">
      <header className="mkt-start__nav">
        <a className="mkt-wordmark" href="/">
          VOWS<span>.</span>
        </a>
        <a className="mkt-start__back" href="/">
          Back to VOWS
        </a>
      </header>
      <main className="mkt-legal__main">
        <p className="mkt-kicker">VOWS</p>
        <h1 className="mkt-title">{title}</h1>
        <p className="mkt-lede">{intro}</p>
        <p className="mkt-legal__note">{note}</p>
        <div className="mkt-actions">
          <a className="mkt-btn mkt-btn--ink" href={CONTACT_WHATSAPP} target="_blank" rel="noreferrer">
            Message us on WhatsApp
          </a>
          <a className="mkt-btn mkt-btn--ghost" href="/">
            Back to the beginning
          </a>
        </div>
      </main>
    </div>
  );
}
