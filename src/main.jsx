import React from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/scenes.css";
import "./styles/marketing.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </MotionConfig>
  </React.StrictMode>
);
