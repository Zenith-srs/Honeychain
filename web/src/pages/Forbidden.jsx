import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth";
import { ROLE_HOME } from "../navConfig";
import { PrimaryButton, SectionHeading } from "../components/Ui";

export default function Forbidden() {
  const { t } = useTranslation();
  const { role } = useAuth();
  return (
    <div>
      <SectionHeading
        kicker={t("forbidden.kicker")}
        title={t("forbidden.title")}
        purpose={t("forbidden.purpose")}
      />
      <Link to={ROLE_HOME[role] || "/"}>
        <PrimaryButton>{t("forbidden.backDashboard")}</PrimaryButton>
      </Link>
    </div>
  );
}
