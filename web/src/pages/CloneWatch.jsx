import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiGet } from "../api";
import { Banner, DataTable, Loading, Metric, PageHeader } from "../components/Ui";

export default function CloneWatch() {
  const { t } = useTranslation();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const fetchData = async () => {
      try {
        const cloneData = await apiGet("/api/clonewatch").catch(() => ({
          flagged_items: [],
          oracle_failures: 0,
          flagged_scans: 0
        }));
        setReport(cloneData);
      } catch (err) {
        setError(err.message || "Failed to load CloneWatch data");
        setReport({ flagged_items: [], oracle_failures: 0, flagged_scans: 0 });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }

  useEffect(() => {
    load();
  }, []);

  const rows = (report?.flagged_items || []).map((item) => ({
    ...item,
    ...item.extra,
  }));

  return (
    <div data-tour="clonewatch">
      <PageHeader
        kicker={t("clone.kicker")}
        title={t("clone.title")}
        purpose={t("clone.purpose")}
      />
      {loading && <Loading label={t("clonewatch.loadingFlags")} />}
      {error && (
        <Banner tone="bad">
          {t("common.error")} — {error}{" "}
          <button className="ghost" type="button" onClick={load}>
            {t("common.retry")}
          </button>
        </Banner>
      )}
      {report && (
        <>
          <div className="grid-3">
            <Metric label={t("clonewatch.flaggedItems")} value={report.flagged_items.length} />
            <Metric label={t("clonewatch.oracleFailures")} value={report.oracle_failures} />
            <Metric label={t("clonewatch.anomalousScans")} value={report.flagged_scans} />
          </div>
          {rows.length === 0 ? (
            <Banner tone="info">
              {t("clonewatch.noFlags")}
            </Banner>
          ) : (
            <DataTable
              rows={rows}
              columns={[
                { key: "kind", label: t("clonewatch.kind") },
                { key: "reference_id", label: t("clonewatch.reference") },
                { key: "reason", label: t("clonewatch.reason") },
                { key: "recorded_at", label: t("clonewatch.recorded") },
              ]}
            />
          )}
        </>
      )}
    </div>
  );
}
