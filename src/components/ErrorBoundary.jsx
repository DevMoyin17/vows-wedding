import { Component } from "react";

/**
 * Keeps a broken scene from taking the whole invitation with it.
 * A failed render shows the couple's date and a single reload action.
 */
export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error("Invitation error", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="error-page">
        <p className="type-overline text-accent">Simeon &amp; Janet</p>
        <h1 className="type-display">The invitation needs a moment</h1>
        <p className="type-body-lg text-secondary">
          Something interrupted the page. Reload to pick up where you left off.
        </p>
        <button type="button" className="vbtn vbtn--foil" onClick={() => window.location.reload()}>
          Reload the invitation
        </button>
      </main>
    );
  }
}
