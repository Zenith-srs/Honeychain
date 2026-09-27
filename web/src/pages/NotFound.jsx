import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PrimaryButton, SectionHeading } from "../components/Ui";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div>
      <SectionHeading kicker={t("notFound.kicker")} title={t("notFound.title")} purpose={t("notFound.purpose")} />
      <Link to="/">
        <PrimaryButton>{t("notFound.backHome")}</PrimaryButton>
      </Link>
    </div>
  );
}
