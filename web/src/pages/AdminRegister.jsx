import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet, apiSend } from "../api";
import { useAuth } from "../auth";
import { Banner, Loading, PrimaryButton } from "../components/Ui";

export default function AdminRegister() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const token = searchParams.get("token");

  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState("");
  const [invitationValid, setInvitationValid] = useState(false);
  const [intendedEmail, setIntendedEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    display_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!token) {
      setValidationError("No invitation token provided.");
      setValidating(false);
      return;
    }

    apiGet(`/api/auth/admin-invitation/validate?token=${encodeURIComponent(token)}`)
      .then((response) => {
        if (response.valid) {
          setInvitationValid(true);
          setIntendedEmail(response.intended_email || "");
        } else {
          setValidationError(response.detail || "Invalid invitation.");
        }
      })
      .catch((err) => {
        setValidationError(err.message);
      })
      .finally(() => {
        setValidating(false);
      });
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Validate password strength
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setSaving(true);
    try {
      await apiSend("POST", "/api/auth/register-admin", {
        token,
        username: form.username,
        password: form.password,
        display_name: form.display_name,
        email: form.email,
        phone: form.phone,
      });

      // Auto-login after successful registration
      await login(form.username, form.password);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (validating) {
    return (
      <div className="center-box">
        <Loading label="Validating invitation…" />
      </div>
    );
  }

  if (!invitationValid || validationError) {
    return (
      <div className="center-box">
        <div className="card" style={{ maxWidth: "500px" }}>
          <h2>Invalid Invitation</h2>
          <Banner tone="bad">{validationError}</Banner>
          <p className="muted" style={{ marginTop: "1rem" }}>
            This invitation may have expired, been used already, or been revoked. Please contact your administrator for a
            new invitation.
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{ marginTop: "1rem" }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="center-box">
      <div className="card" style={{ maxWidth: "600px", width: "100%" }}>
        <h2>Admin Registration</h2>
        <p className="muted" style={{ marginBottom: "1.5rem" }}>
          You've been invited to register as an administrator.
          {intendedEmail && ` This invitation was created for ${intendedEmail}.`}
        </p>

        {error && <Banner tone="bad">{error}</Banner>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="username">
              Username <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="username"
              type="text"
              required
              minLength={3}
              maxLength={80}
              pattern="[a-zA-Z0-9_-]+"
              placeholder="admin_username"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            />
            <small className="muted">Alphanumeric, underscore, and hyphen only</small>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="display_name">
              Display Name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="display_name"
              type="text"
              required
              minLength={2}
              maxLength={120}
              placeholder="Full Name"
              value={form.display_name}
              onChange={(e) => setForm((prev) => ({ ...prev, display_name: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email">
              Email <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="admin@example.com"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="phone">
              Phone <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              minLength={10}
              pattern="[0-9+\-\s()]+"
              placeholder="+91 1234567890"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="password">
              Password <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              placeholder="Strong password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            <small className="muted">At least 8 characters, include uppercase, lowercase, number, and special character</small>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="confirmPassword">
              Confirm Password <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </div>

          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Registering…" : "Register as Admin"}
          </PrimaryButton>
        </form>

        <p className="muted" style={{ marginTop: "1.5rem", fontSize: "0.85rem" }}>
          This invitation is single-use and expires after the specified time. Once you complete registration, you'll be
          automatically signed in as an administrator.
        </p>
      </div>
    </div>
  );
}
