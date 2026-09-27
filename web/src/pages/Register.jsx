import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiPost } from "../api";
import { useAuth } from "../auth";
import AuthShell, { FieldError, PasswordField } from "../components/AuthShell";
import { Banner } from "../components/Ui";

export default function Register() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", display_name: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validate() {
    const next = {};
    
    // Username validation
    if (!form.username.trim()) {
      next.username = t("register.userRequired");
    } else if (form.username.length < 3) {
      next.username = "Username must be at least 3 characters long.";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) {
      next.username = "Username can only contain letters, numbers, underscore, and hyphen.";
    } else if (["abc", "test", "admin", "user", "demo", "guest", "root", "default"].includes(form.username.toLowerCase())) {
      next.username = "Username is too common. Please choose a more unique username.";
    }
    
    // Password validation
    if (form.password.length < 8) {
      next.password = t("register.passRequired");
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"|,.<>/?])/.test(form.password)) {
      next.password = "Password must contain: uppercase, lowercase, number, and special character.";
    } else if (/(.)\1{2,}/.test(form.password)) {
      next.password = "Password cannot have repeated characters (e.g., 'aaa').";
    }
    
    // Name validation
    if (!form.display_name.trim()) {
      next.display_name = t("register.nameRequired");
    } else if (form.display_name.trim().length < 2) {
      next.display_name = "Name must be at least 2 characters long.";
    }
    
    // Email validation
    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      next.email = "Please enter a valid email address.";
    }
    
    // Phone validation
    if (!form.phone.trim()) {
      next.phone = "Phone number is required.";
    } else {
      const cleanPhone = form.phone.replace(/[\s\-()]/g, "");
      if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
        next.phone = "Please enter a valid phone number (10-15 digits).";
      }
    }
    
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiPost("/api/auth/register", {
        username: form.username.trim(),
        password: form.password,
        display_name: form.display_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      await login(form.username.trim(), form.password);
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      kicker={t("register.kicker")}
      title={t("register.title")}
      lead={t("register.lead")}
    >
      <form className="card auth-card" onSubmit={onSubmit} noValidate>
        {error && <Banner tone="bad">{error}</Banner>}
        <label htmlFor="username">{t("register.username")}</label>
        <input
          id="username"
          value={form.username}
          autoComplete="username"
          placeholder="e.g. dhruv"
          onChange={(event) => setField("username", event.target.value)}
        />
        <p className="muted">This is what you type at Sign in. Avoid spaces.</p>
        <FieldError message={fieldErrors.username} />
        <label htmlFor="display_name">{t("register.name")}</label>
        <input
          id="display_name"
          value={form.display_name}
          onChange={(event) => setField("display_name", event.target.value)}
        />
        <FieldError message={fieldErrors.display_name} />
        <label htmlFor="email">{t("register.email")}</label>
        <input 
          id="email" 
          type="email"
          value={form.email} 
          placeholder="e.g. user@example.com"
          required
          onChange={(event) => setField("email", event.target.value)} 
        />
        <FieldError message={fieldErrors.email} />
        
        <label htmlFor="phone">{t("register.phone")}</label>
        <input 
          id="phone" 
          type="tel"
          value={form.phone} 
          placeholder="e.g. +91 98765 43210"
          required
          onChange={(event) => setField("phone", event.target.value)} 
        />
        <FieldError message={fieldErrors.phone} />
        <PasswordField
          id="password"
          value={form.password}
          label={t("register.password")}
          autoComplete="new-password"
          onChange={(event) => setField("password", event.target.value)}
        />
        <FieldError message={fieldErrors.password} />
        <button className="primary" type="submit" disabled={busy}>
          {busy ? t("register.submitting") : t("register.submit")}
        </button>
      </form>
      <p className="muted">
        {t("register.already")} <Link to="/login">{t("nav.login")}</Link>
      </p>
    </AuthShell>
  );
}
