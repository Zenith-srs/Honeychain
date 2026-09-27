import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth";
import { LANGUAGES } from "../i18n";

export default function LanguageSelect({ id = "lang" }) {
  const { t, i18n } = useTranslation();
  const { setLanguage } = useAuth();
  
  // Update HTML lang attribute when language changes
  useEffect(() => {
    const currentLang = i18n.resolvedLanguage || i18n.language || "en";
    document.documentElement.lang = currentLang;
  }, [i18n.resolvedLanguage, i18n.language]);
  
  return (
    <label className="lang-select" htmlFor={id}>
      <span className="sr-only">{t("nav.language")}</span>
      <select 
        id={id} 
        value={i18n.resolvedLanguage || i18n.language} 
        onChange={(event) => setLanguage(event.target.value)}
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
