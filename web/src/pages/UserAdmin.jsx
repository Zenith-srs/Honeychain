import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";
import { Banner, DataTable, Loading, PrimaryButton, SectionHeading } from "../components/Ui";

export default function UserAdmin() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [inviteForm, setInviteForm] = useState({
    intended_email: "",
    expires_in_hours: 24,
  });
  const [invitationUrl, setInvitationUrl] = useState("");
  const [form, setForm] = useState({
    username: "officer2",
    password: "Officer123!",
    display_name: "Field Officer 2",
    role: "officer",
    region: "West Bengal",
    cluster: "West Bengal Producer Cluster",
    email: "",
    phone: "",
  });

  async function refresh() {
    setRows(await apiGet("/api/admin/users"));
  }

  async function refreshInvitations() {
    try {
      const invites = await apiGet("/api/admin/invitations");
      setInvitations(invites);
    } catch (err) {
      // Ignore errors - invitations might not be available
      console.warn("Could not load invitations:", err);
    }
  }

  async function createInvitation() {
    setSaving(true);
    setError("");
    setNotice("");
    setInvitationUrl("");
    try {
      const response = await apiSend("POST", "/api/admin/invitations", inviteForm);
      setInvitationUrl(response.invitation_url);
      setNotice("Invitation created successfully! Copy the link below.");
      await refreshInvitations();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function revokeInvitation(tokenHash) {
    try {
      await apiSend("DELETE", `/api/admin/invitations/${tokenHash}`, undefined);
      setNotice("Invitation revoked successfully.");
      await refreshInvitations();
    } catch (err) {
      setError(err.message);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      setNotice("Invitation link copied to clipboard!");
    });
  }

  useEffect(() => {
    refresh()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    refreshInvitations();
  }, []);

  return (
    <div>
      <SectionHeading
        kicker="USER MANAGEMENT"
        title="Create and deactivate staff accounts"
        purpose="Officers, lab inspectors, and admins are created here. Beekeeper self-registration cannot pick these roles."
      />
      {loading && <Loading label="Loading users…" />}
      {error && <Banner tone="bad">Couldn't update users — {error}</Banner>}
      {notice && <Banner tone="good">{notice}</Banner>}

      {/* Admin Invitation Section */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>Admin Invitations</h3>
        <p className="muted" style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
          Create secure, single-use invitations for new administrators. Each invitation expires after the specified time
          and can only be used once.
        </p>

        {!showInviteModal ? (
          <PrimaryButton onClick={() => setShowInviteModal(true)}>Invite Admin</PrimaryButton>
        ) : (
          <div>
            <div className="grid-2" style={{ marginBottom: "1rem" }}>
              <div>
                <label htmlFor="intended_email">Intended Email (optional)</label>
                <input
                  id="intended_email"
                  type="email"
                  placeholder="admin@example.com"
                  value={inviteForm.intended_email}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, intended_email: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="expires_in_hours">Expires In (hours)</label>
                <input
                  id="expires_in_hours"
                  type="number"
                  min="1"
                  max="168"
                  value={inviteForm.expires_in_hours}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, expires_in_hours: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            {invitationUrl && (
              <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f0f7ff", borderRadius: "8px" }}>
                <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold", color: "#0066cc" }}>
                  ⚠️ Copy this invitation link now — it will only be shown once!
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    background: "white",
                    padding: "0.75rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <input
                    type="text"
                    readOnly
                    value={invitationUrl}
                    style={{ flex: 1, border: "none", background: "transparent" }}
                  />
                  <button type="button" className="ghost" onClick={() => copyToClipboard(invitationUrl)}>
                    Copy
                  </button>
                </div>
              </div>
            )}

            <div className="row" style={{ gap: "0.5rem" }}>
              <PrimaryButton onClick={createInvitation} disabled={saving}>
                {saving ? "Creating…" : "Create Invitation"}
              </PrimaryButton>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setShowInviteModal(false);
                  setInvitationUrl("");
                  setInviteForm({ intended_email: "", expires_in_hours: 24 });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* List existing invitations */}
        {invitations.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <h4>Active Invitations</h4>
            <DataTable
              rows={invitations.filter((inv) => inv.is_valid)}
              columns={[
                {
                  key: "intended_email",
                  label: "Intended Email",
                  render: (row) => row.intended_email || <span className="muted">—</span>,
                },
                {
                  key: "created_by",
                  label: "Created By",
                },
                {
                  key: "expires_at",
                  label: "Expires",
                  render: (row) => new Date(row.expires_at).toLocaleString(),
                },
                {
                  key: "actions",
                  label: "",
                  render: (row) => (
                    <button type="button" className="ghost" onClick={() => revokeInvitation(row.token_hash)}>
                      Revoke
                    </button>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>

      <form
        className="card"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          setError("");
          setNotice("");
          try {
            const created = await apiSend("POST", "/api/admin/users", form);
            await refresh();
            setNotice(`Created ${created.username} as ${created.role}.`);
          } catch (err) {
            setError(err.message);
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="grid-2">
          {["username", "password", "display_name", "region", "cluster", "email", "phone"].map((key) => (
            <div key={key}>
              <label htmlFor={key}>{key.replaceAll("_", " ")}</label>
              <input
                id={key}
                type={key === "password" ? "password" : "text"}
                value={form[key]}
                onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
              />
            </div>
          ))}
          <div>
            <label htmlFor="role">Role</label>
            <select id="role" value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}>
              <option value="officer">officer</option>
              <option value="lab">lab</option>
              <option value="admin">admin</option>
              <option value="beekeeper">beekeeper</option>
            </select>
          </div>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Creating…" : "Create account"}
          </PrimaryButton>
        </div>
      </form>

      {rows.length === 0 && !loading ? (
        <Banner tone="info">No users found.</Banner>
      ) : (
        <DataTable
          rows={rows}
          columns={[
            { key: "username", label: "Username" },
            { key: "display_name", label: "Name" },
            { key: "role", label: "Role" },
            { key: "region", label: "Region" },
            { key: "active", label: "Active" },
            {
              key: "toggle",
              label: "",
              render: (row) => (
                <button
                  className="ghost"
                  type="button"
                  onClick={() =>
                    apiSend("PATCH", `/api/admin/users/${row.username}`, { active: !row.active })
                      .then(refresh)
                      .catch((err) => setError(err.message))
                  }
                >
                  {row.active ? "Deactivate" : "Reactivate"}
                </button>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
