import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BeeDoodle, Sprig } from "./Decor";

export default function AuthShell({ kicker, title, lead, children }) {
  const { t } = useTranslation();
  
  return (
    <div className="auth-shell">
      <aside className="auth-panel">
        <Sprig className="auth-sprig" />
        <p className="brand">{t("brand.name")}</p>
        <h2>{t("brand.tagline")}</h2>
        <p>{t("home.footerCredibility")}</p>
        <BeeDoodle className="auth-bee" />
      </aside>
      <div className="auth-form">
        <p className="page-kicker">{kicker}</p>
        <h1>{title}</h1>
        <p className="purpose">{lead}</p>
        {children}
      </div>
    </div>
  );
}

export function FieldError({ message }) {
  if (!message) {
    return null;
  }
  return <p className="field-error">{message}</p>;
}

export function PasswordField({ id, value, onChange, label, autoComplete = "current-password" }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input id={id} type={show ? "text" : "password"} value={value} onChange={onChange} autoComplete={autoComplete} />
        <button type="button" className="ghost" onClick={() => setShow((v) => !v)}>
          {show ? t("common.hide") : t("common.show")}
        </button>
      </div>
    </div>
  );
}
