import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./style.css";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Fast LGTM popup root was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
