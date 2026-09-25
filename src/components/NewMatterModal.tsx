import { useState } from "react";
import { useStore } from "../store/useStore";
import { users } from "../data";
import { useToast } from "./Toast";
import { checkConflicts } from "../lib/conflictCheck";
import { ShieldAlert, ShieldCheck, X, Briefcase } from "lucide-react";
import type { Matter } from "../types";

const matterTypes = [
  "Civil Litigation",
  "Criminal Litigation",
  "Family Law",
  "Corporate",
  "Special Proceedings",
  "Labor",
  "Notarial",
  "Contract Review",
  "Legal Opinion",
  "Retainer",
];

const billingTypes: Matter["billingType"][] = [
  "Hourly",
  "Flat Fee",
  "Contingency",
  "Retainer",
  "Pro Bono",
];

const courts = [
  "Supreme Court",
  "Court of Appeals",
  "Sandiganbayan",
  "RTC Manila",
  "RTC Makati",
  "RTC Quezon City",
  "RTC Pasay",
  "MeTC Manila",
  "MeTC Makati",
  "MeTC Pasay",
  "NLRC",
  "SEC",
  "BIR",
  "Registry of Deeds",
  "—",
];

import type { Matter as MatterType } from "../types";

export default function NewMatterModal({
  onClose,
  preselectedClientId,
  editing,
}: {
  onClose: () => void;
  preselectedClientId?: string;
  editing?: MatterType;
}) {
  const clients = useStore((s) => s.clients);
  const matters = useStore((s) => s.matters);
  const addMatter = useStore((s) => s.addMatter);
  const updateMatter = useStore((s) => s.updateMatter);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);


  const attorneys = users.filter(
    (u) => u.roles.includes("ATTORNEY") || u.roles.includes("MNG_PARTNER")
  );
  const paralegals = users.filter((u) => u.roles.includes("PARALEGAL"));
  const secretaries = users.filter((u) => u.roles.includes("SECRETARY"));

  const nextMatterId = () => {
    const year = new Date().getFullYear();
    const existing = matters
      .filter((m) => m.id.startsWith(`M-${year}-`))
      .map((m) => parseInt(m.id.split("-")[2], 10))
      .filter((n) => !isNaN(n));
    const next = (existing.length ? Math.max(...existing) : 0) + 1;
    return `M-${year}-${String(next).padStart(3, "0")}`;
  };

  const [clientId, setClientId] = useState(editing?.clientId ?? preselectedClientId ?? "");
  const [title, setTitle] = useState(editing?.title ?? "");
  const [matterType, setMatterType] = useState(editing?.matterType ?? "Civil Litigation");
  const [attorneyId, setAttorneyId] = useState(editing?.attorneyId ?? "");
  const [paralegalId, setParalegalId] = useState(editing?.paralegalId ?? "");
  const [secretaryId, setSecretaryId] = useState(editing?.secretaryId ?? "");
  const [court, setCourt] = useState(editing?.court ?? "");
  const [nextHearing, setNextHearing] = useState(editing?.nextHearing ?? "");
  const [billingType, setBillingType] = useState<Matter["billingType"]>(editing?.billingType ?? "Hourly");
  const [contingencyPct, setContingencyPct] = useState("25");
  const runConflictCheck = () => {
    const matches = checkConflicts({
      clientName: selectedClient?.name ?? "",
      matterTitle: title,
      clients,
      matters,
    });
    setConflictMatches(matches);
    setConflictChecked(true);
  };

  const selectedClient = clients.find((c) => c.id === clientId);
  const [conflictMatches, setConflictMatches] = useState<string[]>([]);
  const [conflictChecked, setConflictChecked] = useState(false);
  const [consentNote, setConsentNote] = useState("");



  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title.trim() || !attorneyId) return;

    // CPRA Rule 20 — contingency fee cap 25%
    if (billingType === "Contingency") {
      const pct = parseFloat(contingencyPct) || 0;
      if (pct <= 0 || pct > 25) {
        push("Contingency fee must be between 1% and 25%.", "error");
        return;
      }
    }

    if (!editing && conflictMatches.length > 0 && !consentNote.trim()) {
      push(
        "Conflict detected — enter a consent note to proceed, or cancel.",
        "error"
      );
      return;
    }

    if (editing) {
      const updated: Matter = {
        ...editing,
        clientId,
        title: title.trim(),
        matterType,
        attorneyId,
        paralegalId: paralegalId || undefined,
        secretaryId: secretaryId || undefined,
        court: court && court !== "—" ? court : undefined,
        nextHearing: nextHearing || undefined,
        billingType,
      };
      updateMatter(updated);
      addAuditEvent({
        id: `LOG-${Date.now()}`,
        userId: user.id,
        action: "Updated matter",
        target: editing.id,
        timestamp: new Date().toISOString(),
      });
      push(`Matter ${editing.id} updated.`);
    } else {
      const matter: Matter = {
        id: nextMatterId(),
        clientId,
        title: title.trim(),
        matterType,
        status: "Open",
        attorneyId,
        paralegalId: paralegalId || undefined,
        secretaryId: secretaryId || undefined,
        court: court && court !== "—" ? court : undefined,
        nextHearing: nextHearing || undefined,
        billingType,
        openedAt: new Date().toISOString().slice(0, 10),
      };
      addMatter(matter);
      addAuditEvent({
        id: `LOG-${Date.now()}`,
        userId: user.id,
        action: "Created matter",
        target: matter.id,
        timestamp: new Date().toISOString(),
      });
      push(`Matter ${matter.id} created and assigned.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-3xl rounded-t-2xl md:rounded-2xl border border-border shadow-modal max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-brand" />
            <h2 className="font-semibold">{editing ? "Edit Matter" : "New Matter"}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          id="new-matter-form"
        >
          {/* Client */}
          <div>
            <label className="label">Client *</label>
            <select
              required
              className="input"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={!!preselectedClientId}
            >
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.caseType}
                </option>
              ))}
            </select>
            {preselectedClientId && selectedClient && (
              <p className="text-xs text-muted mt-1">
                Locked to {selectedClient.name}
              </p>
            )}
          </div>

          {/* Title + Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Matter Title *</label>
              <input
                required
                className="input"
                placeholder="e.g., Dela Cruz vs. Dela Cruz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {!title && selectedClient && matterType && (
                <button
                  type="button"
                  onClick={() =>
                    setTitle(
                      `${selectedClient.name} — ${matterType}`
                    )
                  }
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Use suggestion: "{selectedClient.name} — {matterType}"
                </button>
              )}
            </div>
            <div>
              <label className="label">Matter Type</label>
              <select
                className="input"
                value={matterType}
                onChange={(e) => setMatterType(e.target.value)}
              >
                {matterTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team */}
          <div>
            <label className="label">Assigned Attorney *</label>
            <select
              required
              className="input"
              value={attorneyId}
              onChange={(e) => setAttorneyId(e.target.value)}
            >
              <option value="">Select attorney...</option>
              {attorneys.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Paralegal (optional)</label>
              <select
                className="input"
                value={paralegalId}
                onChange={(e) => setParalegalId(e.target.value)}
              >
                <option value="">None</option>
                {paralegals.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Secretary (optional)</label>
              <select
                className="input"
                value={secretaryId}
                onChange={(e) => setSecretaryId(e.target.value)}
              >
                <option value="">None</option>
                {secretaries.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Court + Hearing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Court / Venue</label>
              <select
                className="input"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
              >
                <option value="">Select venue...</option>
                {courts.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Next Hearing (optional)</label>
              <input
                type="date"
                className="input"
                value={nextHearing}
                onChange={(e) => setNextHearing(e.target.value)}
              />
            </div>
          </div>

          {/* Billing */}
          <div>
            <label className="label">Billing Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {billingTypes.map((b) => {
                const selected = billingType === b;
                return (
                  <label
                    key={b}
                    className={`flex items-center justify-center gap-1.5 border rounded-lg px-3 py-2 text-xs cursor-pointer transition text-center ${
                      selected
                        ? "border-primary bg-primary-light text-primary font-medium"
                        : "border-border hover:bg-surface-hover"
                    }`}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      checked={selected}
                      onChange={() => setBillingType(b)}
                    />
                    {b}
                  </label>
                );
              })}
            </div>
          </div>

          {billingType === "Contingency" && (
            <div>
              <label className="label">
                Contingency % <span className="text-muted">(max 25)</span>
              </label>
              <input
                type="number"
                min="1"
                max="25"
                className="input"
                value={contingencyPct}
                onChange={(e) => setContingencyPct(e.target.value)}
              />
              <p className="text-xs text-muted mt-1">
                CPRA Rule 20 caps contingency fees at 25% of recovery.
              </p>
            </div>
          )}

          {/* Conflict check */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="font-medium text-sm">Conflict Check</p>
                <p className="text-xs text-muted">
                  CPRA Rule 15.03 — scan client + matter title against existing
                  clients, contacts, and matters.
                </p>
              </div>
              <button
                type="button"
                onClick={runConflictCheck}
                disabled={!clientId || !title.trim()}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
              >
                {conflictChecked ? "Re-run" : "Run Check"}
              </button>
            </div>

            {conflictChecked && conflictMatches.length === 0 && (
              <div className="flex items-center gap-2 text-xs text-success-ink bg-success-light border border-success/20 rounded-lg px-3 py-2">
                <ShieldCheck size={14} />
                No conflicts found. Safe to proceed.
              </div>
            )}

            {conflictChecked && conflictMatches.length > 0 && (
              <div className="bg-warning-light border border-warning/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <ShieldAlert size={14} className="text-warning-ink mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-warning-ink">
                      {conflictMatches.length} potential conflict{conflictMatches.length === 1 ? "" : "s"}
                    </p>
                    <ul className="text-xs text-muted mt-1 space-y-0.5">
                      {conflictMatches.map((m, i) => (
                        <li key={i}>• {m}</li>
                      ))}
                    </ul>
                    {!editing && (
                      <div className="mt-3">
                        <label className="label text-xs">
                          Consent Note *{" "}
                          <span className="text-muted font-normal">
                            — document why you're proceeding
                          </span>
                        </label>
                        <textarea
                          rows={2}
                          className="input text-xs"
                          placeholder="e.g., Written informed consent obtained from all parties on 2025-01-15"
                          value={consentNote}
                          onChange={(e) => setConsentNote(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="p-4 border-t border-border flex gap-3 shrink-0">
          <button
            type="submit"
            form="new-matter-form"
            disabled={!clientId || !title.trim() || !attorneyId}
            className="btn-primary flex-1 disabled:opacity-40"
          >
            {editing ? "Save Changes" : "Create Matter"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1 md:flex-none md:px-6"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}