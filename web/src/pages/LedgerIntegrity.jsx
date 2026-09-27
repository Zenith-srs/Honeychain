import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";
import { useAuth } from "../auth";
import { Banner, DataTable, Loading, SectionHeading } from "../components/Ui";

function shortHash(value) {
  if (!value) {
    return "";
  }
  return `${value.slice(0, 12)}…${value.slice(-8)}`;
}

export default function LedgerIntegrity() {
  const { role } = useAuth();
  const [chain, setChain] = useState([]);
  const [integrity, setIntegrity] = useState(null);
  const [tamper, setTamper] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    const fetchData = async () => {
      try {
        const chainPromise = apiGet("/api/ledger/chain").catch(() => []);
        const integrityPromise = apiGet("/api/ledger/integrity").catch(() => null);
        
        const [nextChain, nextIntegrity] = await Promise.all([chainPromise, integrityPromise]);
        
        setChain(nextChain);
        setIntegrity(nextIntegrity);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load ledger data");
        setChain([]);
        setIntegrity(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }

  useEffect(() => {
    load();
  }, []);

  async function runTamper(path) {
    setBusy(true);
    try {
      const result = await apiPost(path, {}).catch(() => ({
        action: "Failed",
        integrity: { valid: false },
        batch_id: "",
        stored_weight_kg: 0,
        committed_weight_kg: 0,
        note: "Unable to perform tamper operation"
      }));
      setTamper(result);
      setIntegrity(result.integrity);
      const nextChain = await apiGet("/api/ledger/chain").catch(() => []);
      setChain(nextChain);
    } catch (err) {
      setError(err.message || "Tamper operation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-tour="ledger">
      <SectionHeading
        kicker="LEDGER INTEGRITY"
        title="Live hash-chain verification"
        purpose="Integrity is recomputed from the stored blocks and the live batch row every time this page loads. It is never a stored tick."
      />
      {loading && <Loading label="Recomputing ledger…" />}
      {error && (
        <Banner tone="bad">
          Couldn't load ledger — {error}{" "}
          <button className="ghost" type="button" onClick={load}>
            Retry
          </button>
        </Banner>
      )}
      {integrity && <Banner tone={integrity.valid ? "good" : "bad"}>{integrity.detail}</Banner>}
      {integrity?.broken_indexes?.length > 0 && (
        <Banner tone="bad">Broken from block {integrity.broken_indexes.join(", ")} onward.</Banner>
      )}
      {role === "admin" && (
        <div className="row">
          <button className="primary" type="button" disabled={busy} onClick={() => runTamper("/api/ledger/tamper-test")}>
            Tamper with first block
          </button>
          <button className="ghost" type="button" disabled={busy} onClick={() => runTamper("/api/ledger/tamper-reset")}>
            Reset tamper
          </button>
        </div>
      )}
      {tamper && (
        <Banner tone={tamper.integrity.valid ? "good" : "warn"}>
          {tamper.action}: {tamper.batch_id} stored {tamper.stored_weight_kg} kg vs committed {tamper.committed_weight_kg} kg. {tamper.note}
        </Banner>
      )}
      {chain.length === 0 && !loading ? (
        <Banner tone="info">Ledger is empty until a batch passes the oracle and is committed.</Banner>
      ) : (
        <DataTable
          rows={chain.map((row) => ({
            ...row,
            broken: integrity?.broken_indexes?.includes(row.index) ? "broken" : "ok",
            payload: row.payload_json,
          }))}
          columns={[
            { key: "index", label: "Index" },
            { key: "batch_id", label: "Batch" },
            { key: "previous_hash", label: "Previous hash", render: (row) => shortHash(row.previous_hash) },
            { key: "block_hash", label: "Block hash", render: (row) => shortHash(row.block_hash) },
            { key: "created_at", label: "Timestamp" },
            { key: "broken", label: "Status" },
            { key: "payload", label: "Payload" },
          ]}
        />
      )}
    </div>
  );
}
