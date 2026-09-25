import { useState } from "react";
import { useStore } from "../store/useStore";
import { useToast } from "../components/Toast";
import { can } from "../lib/permissions";
import { Settings, DollarSign, Users as UsersIcon, Save, AlertCircle, Plus, Pencil, UserX, UserCheck } from "lucide-react";
import UserFormModal from "../components/UserFormModal";

export default function Admin() {
  const currentUser = useStore((s) => s.currentUser)!;
  const canManageUsers = can(currentUser.roles, "user:manage");
  const canManageRates = can(currentUser.roles, "rate:manage");

  const tabs = [
    ...(canManageUsers ? (["Users"] as const) : []),
    ...(canManageRates ? (["Rates"] as const) : []),
    ...(canManageUsers ? (["Firm Settings"] as const) : []),
  ];

  const [tab, setTab] = useState<string>(
    tabs[0] ?? "Rates"
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Admin Console</h1>

      <div className="border-b border-border flex gap-1 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              tab === t
                ? "border-brand text-text font-semibold"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Users" && <UsersTab />}
      {tab === "Rates" && <RatesTab />}
      {tab === "Firm Settings" && <FirmSettingsTab />}
    </div>
  );
}

function UsersTab() {
  const storeUsers = useStore((s) => s.users);
  const deactivateUser = useStore((s) => s.deactivateUser);
  const reactivateUser = useStore((s) => s.reactivateUser);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const currentUser = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const toggleActive = (id: string, active: boolean, name: string) => {
    if (active) {
      if (!confirm(`Deactivate ${name}? They won't be able to log in.`)) return;
      deactivateUser(id);
      addAuditEvent({
        id: `LOG-${Date.now()}`,
        userId: currentUser.id,
        action: "Deactivated user",
        target: id,
        timestamp: new Date().toISOString(),
      });
      push(`${name} deactivated.`);
    } else {
      reactivateUser(id);
      addAuditEvent({
        id: `LOG-${Date.now()}`,
        userId: currentUser.id,
        action: "Reactivated user",
        target: id,
        timestamp: new Date().toISOString(),
      });
      push(`${name} reactivated.`);
    }
  };

  const editingUser = editing ? storeUsers.find((u) => u.id === editing) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-muted">
          {storeUsers.length} user{storeUsers.length === 1 ? "" : "s"} in the
          firm
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold flex items-center gap-2">
            <UsersIcon size={16} className="text-brand" />
            Users & Roles
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left text-muted text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Roles</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Rate</th>
                <th className="py-3 px-4 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {storeUsers.map((u) => {
                const isActive = u.active !== false;
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-border ${
                      !isActive ? "opacity-50" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted">{u.title}</p>
                    </td>
                    <td className="py-3 px-4 text-xs">{u.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isActive ? (
                        <span className="text-xs text-success">Active</span>
                      ) : (
                        <span className="text-xs text-muted">Inactive</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-mono">
                      {u.defaultRate
                        ? `₱${u.defaultRate.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditing(u.id)}
                          className="icon-btn icon-btn-primary icon-btn-sm"
                          title="Edit user"
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() =>
                            toggleActive(u.id, isActive, u.name)
                          }
                          className={`icon-btn icon-btn-sm ${
                            isActive ? "icon-btn-danger" : "icon-btn-primary"
                          }`}
                          title={
                            isActive ? "Deactivate" : "Reactivate"
                          }
                          aria-label={
                            isActive ? "Deactivate" : "Reactivate"
                          }
                        >
                          {isActive ? (
                            <UserX size={14} />
                          ) : (
                            <UserCheck size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <UserFormModal onClose={() => setShowForm(false)} />
      )}

      {editingUser && (
        <UserFormModal
          editing={editingUser}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function RatesTab() {
  const storeUsers = useStore((s) => s.users);
  const updateUserRate = useStore((s) => s.updateUserRate);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const currentUser = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  // Local buffer for edits
  const [edits, setEdits] = useState<Record<string, string>>({});

  const setEdit = (id: string, value: string) =>
    setEdits((e) => ({ ...e, [id]: value }));

  const saveOne = (id: string) => {
    const raw = edits[id];
    if (raw === undefined) return;
    const rate = parseFloat(raw);
    if (isNaN(rate) || rate < 0) {
      push("Rate must be a positive number.", "error");
      return;
    }
    updateUserRate(id, rate);
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: currentUser.id,
      action: `Updated rate to ₱${rate.toLocaleString()}`,
      target: id,
      timestamp: new Date().toISOString(),
    });
    setEdits((e) => {
      const copy = { ...e };
      delete copy[id];
      return copy;
    });
    const u = storeUsers.find((x) => x.id === id);
    push(`Rate for ${u?.name ?? id} set to ₱${rate.toLocaleString()}/hr.`);
  };

  return (
    <div className="space-y-4">
      <div className="card bg-info-light/20 border-info/30">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-info-ink shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-info-ink">Default Billing Rates</p>
            <p className="text-xs text-muted mt-1">
              These rates auto-fill in the Time Tracker when a user logs time.
              Users can still override per entry. Changes are audit-logged.
            </p>
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold flex items-center gap-2">
            <DollarSign size={16} className="text-brand" />
            Rate Card
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left text-muted text-xs uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-right">Current Rate</th>
                <th className="py-3 px-4 text-right">New Rate (₱/hr)</th>
                <th className="py-3 px-4 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {storeUsers.map((u) => {
                const canBill =
                  u.roles.includes("ATTORNEY") ||
                  u.roles.includes("MNG_PARTNER") ||
                  u.roles.includes("PARALEGAL");
                const edited = edits[u.id] !== undefined;
                return (
                  <tr key={u.id} className="border-b border-border">
                    <td className="py-3 px-4">
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted">{u.title}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className="text-xs bg-surface-hover text-muted px-2 py-0.5 rounded"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm">
                      {u.defaultRate ? `₱${u.defaultRate.toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {canBill ? (
                        <input
                          type="number"
                          min="0"
                          className="input !py-1.5 !text-sm !w-32 text-right"
                          placeholder={String(u.defaultRate ?? 0)}
                          value={edits[u.id] ?? ""}
                          onChange={(e) => setEdit(u.id, e.target.value)}
                        />
                      ) : (
                        <span className="text-xs text-muted">
                          Non-billable role
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {canBill && edited && (
                        <button
                          onClick={() => saveOne(u.id)}
                          className="btn-primary !py-1 !px-3 text-xs flex items-center gap-1 ml-auto"
                        >
                          <Save size={12} />
                          Save
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FirmSettingsTab() {
  const firmName = "Nelson & Murdock Law Offices";
  const [name, setName] = useState(firmName);
  const [address, setAddress] = useState("42nd Floor, One Ayala Tower, Makati City");
  const [tin, setTin] = useState("000-123-456-000");

  const trustThreshold = useStore((s) => s.trustThreshold);
  const setState = useStore.setState;
  const [threshold, setThreshold] = useState(String(trustThreshold));

  const push = useToast((s) => s.push);

  const saveThreshold = () => {
    const v = parseFloat(threshold);
    if (isNaN(v) || v < 0) {
      push("Threshold must be a positive number.", "error");
      return;
    }
    setState({ trustThreshold: v });
    push(`Trust alert threshold set to ₱${v.toLocaleString()}.`);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="card space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Settings size={16} className="text-brand" />
          Firm Profile
        </h2>

        <div>
          <label className="label">Firm Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Address</label>
          <input
            className="input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="label">TIN</label>
          <input
            className="input"
            value={tin}
            onChange={(e) => setTin(e.target.value)}
          />
        </div>

        <button
          onClick={() => push("Firm profile saved (demo).")}
          className="btn-primary"
        >
          Save Changes
        </button>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <DollarSign size={16} className="text-brand" />
          Trust Alert Threshold
        </h2>
        <p className="text-xs text-muted">
          Alert the billing team when a client's trust balance drops below this
          amount. CPRA Canon 16 hygiene — keeps client funds topped up and
          avoids disputes.
        </p>

        <div>
          <label className="label">Threshold (₱)</label>
          <input
            type="number"
            min="0"
            className="input"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </div>

        <button onClick={saveThreshold} className="btn-primary">
          Save Threshold
        </button>
      </div>
    </div>
  );
}