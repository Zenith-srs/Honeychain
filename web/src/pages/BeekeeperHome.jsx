import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet } from "../api";
import { useAuth } from "../auth";
import TourOffer from "../components/TourOffer";
import { Banner, Loading, StatCard } from "../components/Ui";
import { welcomeLine } from "../greeting";

export default function BeekeeperHome() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [hives, setHives] = useState([]);
  const [summary, setSummary] = useState(null);
  const [harvests, setHarvests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hivesPromise = apiGet("/api/auth/me/hives").catch(() => []);
        const harvestsPromise = apiGet("/api/auth/me/harvests").catch(() => []);
        
        const [nextHives, nextHarvests] = await Promise.all([hivesPromise, harvestsPromise]);
        
        setHives(nextHives);
        setHarvests(nextHarvests);
        
        if (nextHives[0]) {
          const summaryData = await apiGet(`/api/hives/${nextHives[0].hive_id}/summary`).catch(() => null);
          setSummary(summaryData);
        }
      } catch (err) {
        setError(err.message || t("common.error"));
        setHives([]);
        setHarvests([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [t]);

  const latest = summary?.latest;
  const pending = harvests.filter((row) => row.status === "pending").length;

  return (
    <div className="role-home">
      <p className="page-kicker">{t("beekeeper.kicker")}</p>
      <h1 data-tour="dash-welcome">{welcomeLine(user?.display_name, t("beekeeper.welcomeDetail"), t)}</h1>
      <p className="purpose">{t("beekeeper.purpose")}</p>
      <TourOffer />
      {loading && <Loading label={t("beekeeper.loadingHives")} />}
      {error && <Banner tone="bad">{t("common.error")} — {error}</Banner>}
      <div className="grid-3">
        <StatCard label={t("nav.harvests")} value={hives.length} />
        <StatCard label={t("harvests.pending")} value={pending} />
        <StatCard label={t("hiveMonitor.hiveWeight")} value={latest ? `${Number(latest.weight_kg).toFixed(2)} kg` : t("beekeeper.noDataYet")} />
      </div>
      {latest ? (
        <div className="card lift-card">
          <p className="page-kicker">{hives[0]?.hive_id}</p>
          <strong>{t("beekeeper.liveReading")}</strong>
          <p>
            {Number(latest.inside_temperature_c).toFixed(1)} {t("beekeeper.degreesCelsius")} · {Number(latest.humidity_pct).toFixed(1)}% {t("beekeeper.humidity")} ·{" "}
            {Number(latest.weight_kg).toFixed(2)} kg
          </p>
        </div>
      ) : (
        !loading && <Banner tone="info">{t("beekeeper.noDataYet")}</Banner>
      )}
      <div className="row" style={{ marginTop: 16 }}>
        <Link className="primary" to="/app/harvests">
          {t("harvests.title")}
        </Link>
        <Link className="ghost" to="/app/monitor">
          {t("nav.monitor")}
        </Link>
        <Link className="ghost" to="/app/market">
          {t("nav.market")}
        </Link>
      </div>
    </div>
  );
}
