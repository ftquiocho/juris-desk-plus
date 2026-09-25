import { useState } from "react";
import { clients } from "../data";
import { useStore } from "../store/useStore";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export default function ConflictCheck() {
  const [name, setName] = useState("");
  const [opposing, setOpposing] = useState("");
  const [result, setResult] = useState<null | { status: "clear" | "potential"; matches: string[] }>(null);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const contacts = useStore((s) => s.contacts);
  const matters = useStore((s) => s.matters);

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    const client = name.toLowerCase().trim();
    const opp = opposing.toLowerCase().trim();

    const matches: string[] = [];

    // 1. Match against existing clients
    clients.forEach((c) => {
      const n = c.name.toLowerCase();
      if (
        (client && (n.includes(client) || client.includes(n))) ||
        (opp && (n.includes(opp) || opp.includes(n)))
      ) {
        matches.push(`${c.name} — existing client (${c.id})`);
      }
    });

    // 2. Match against contacts (opposing party, counsel, etc.)
    contacts.forEach((ct) => {
      const n = ct.name.toLowerCase();
      const org = (ct.organization ?? "").toLowerCase();
      if (
        (client && (n.includes(client) || client.includes(n))) ||
        (opp && (n.includes(opp) || opp.includes(n))) ||
        (opp && org && (org.includes(opp) || opp.includes(org)))
      ) {
        matches.push(
          `${ct.name}${ct.organization ? ` (${ct.organization})` : ""} — ${ct.type}`
        );
      }
    });

    // 3. Match against matters by title
    matters.forEach((m) => {
      const t = m.title.toLowerCase();
      if (
        (client && t.includes(client)) ||
        (opp && t.includes(opp))
      ) {
        matches.push(`${m.title} — existing matter (${m.id})`);
      }
    });

    const status = matches.length > 0 ? "potential" : "clear";
    setResult({ status, matches });
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: `Ran conflict check (${status}) — ${matches.length} match${matches.length === 1 ? "" : "es"}`,
      target: name || "unnamed",
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl md:text-2xl font-bold mb-1">Conflict Check</h1>
      <p className="text-sm text-muted mb-6">
        Search existing clients before taking on a new matter (CPRA Rule 15.03).
      </p>

      <form onSubmit={run} className="card space-y-4">
        <div>
          <label className="label">Client / Party Name *</label>
          <input required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Try: Juan or ABC" />
        </div>
        <div>
          <label className="label">Opposing Party (optional)</label>
          <input className="input" value={opposing} onChange={(e) => setOpposing(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary">Run Conflict Check</button>
      </form>

      {result && (
        <div className={`card mt-4 border-l-4 ${result.status === "clear" ? "border-l-success" : "border-l-warning"}`}>
          <div className="flex items-start gap-3">
            {result.status === "clear" ? (
              <ShieldCheck className="text-success-ink" size={22} />
            ) : (
              <ShieldAlert className="text-warning-ink" size={22} />
            )}
            <div className="min-w-0">
              <p className={`font-semibold ${result.status === "clear" ? "text-success-ink" : "text-warning-ink"}`}>
                {result.status === "clear"
                  ? "No conflicts found"
                  : `Potential conflict — ${result.matches.length} match${result.matches.length === 1 ? "" : "es"}`}
              </p>
              {result.status !== "clear" && (
                <>
                  <ul className="text-sm text-muted mt-2 space-y-1">
                    {result.matches.map((m, i) => (
                      <li key={i}>• {m}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted mt-2 italic">
                    Written informed consent from all parties required before proceeding (CPRA Rule 15.03).
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}