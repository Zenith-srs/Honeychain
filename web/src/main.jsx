import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth";
import { TourProvider } from "./components/GuidedTour";
import "./i18n";
import "./styles.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      registration.update().catch(() => {
        // Service worker update failed - silent failure
      });
    }).catch(() => {
      // Service worker registration failed - silent failure
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TourProvider>
          <App />
        </TourProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
