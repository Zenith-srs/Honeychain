import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet } from "../api";
import { useAuth } from "../auth";
import { ROLE_HOME } from "../navConfig";
import { Banner, PrimaryButton } from "./Ui";

export default function DemoLoginPanel() {
  const { t } = useTranslation();
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(null); // null | "admin" | "officer" | "lab"
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, loginDemo } = useAuth();

  useEffect(() => {
    // Don't show if user is already logged in
    if (user) {
      setLoading(false);
      return;
    }

    // Check if demo mode is enabled
    apiGet("/api/auth/status")
      .then((status) => {
        setDemoModeEnabled(status.demo_mode === true);
      })
      .catch(() => {
        // If status endpoint fails, assume demo mode is disabled
        setDemoModeEnabled(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  async function handleDemoLogin(role) {
    setError("");
    setLoggingIn(role);

    try {
      const me = await loginDemo(role);
      const destination = ROLE_HOME[me.role] || "/app/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoggingIn(null);
    }
  }

  // Don't render if not in demo mode, loading, or user already logged in
  if (loading || !demoModeEnabled || user) {
    return null;
  }

  return (
    <div className="card" style={{ marginTop: "1rem", padding: "1rem", background: "#fffbea", border: "1px solid #f59e0b" }}>
      <div>
        <h4 style={{ margin: "0 0 0.5rem 0", color: "#92400e" }}>
          🔓 {t("demo.title")}
        </h4>
        <p style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#78350f" }}>
          {t("demo.description")}
        </p>
        {error && (
          <Banner tone="bad" style={{ marginBottom: "1rem" }}>
            {error}
          </Banner>
        )}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <PrimaryButton
            onClick={() => handleDemoLogin("admin")}
            disabled={loggingIn !== null}
            style={{ flex: "1 1 auto", minWidth: "140px" }}
          >
            {loggingIn === "admin" ? t("demo.buttonLoading") : t("demo.adminButton")}
          </PrimaryButton>
          <PrimaryButton
            onClick={() => handleDemoLogin("officer")}
            disabled={loggingIn !== null}
            style={{ flex: "1 1 auto", minWidth: "140px" }}
          >
            {loggingIn === "officer" ? t("demo.buttonLoading") : t("demo.officerButton")}
          </PrimaryButton>
          <PrimaryButton
            onClick={() => handleDemoLogin("lab")}
            disabled={loggingIn !== null}
            style={{ flex: "1 1 auto", minWidth: "140px" }}
          >
            {loggingIn === "lab" ? t("demo.buttonLoading") : t("demo.labButton")}
          </PrimaryButton>
        </div>
      </div>
      <p style={{ margin: "0.75rem 0 0 0", fontSize: "0.75rem", color: "#78350f" }}>
        ⚠️ {t("demo.warning")}
      </p>
    </div>
  );
}
