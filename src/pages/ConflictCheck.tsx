import { useState } from "react";
import { useStore } from "../store/useStore";
import { clients } from "../data";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { useToast } from "../components/Toast";

export default function ConflictCheck() {
  const [name, setName] = useState("");
  const [opposing, setOpposing] = useState("");
  const [result, setResult] = useState<null | { status: "clear" | "potential"; matches: string[] }>(null);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    const query = name.toLowerCase().trim();
    const matches = clients
      .filter((c) => c.name.toLowerCase().includes(query) || query.includes(c.name.toLowerCase()))
      .map((c) => c.name);

    const status = matches.length > 0 ? "potential" : "clear";
    setResult({ status, matches });
    push(
      status === "clear" ? "No conflicts found." : "Potential conflict detected.",
      status === "clear" ? "success" : "info"
    );
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: `Ran conflict check (${status})`,
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
          <div className="flex items-center gap-3">
            {result.status === "clear" ? (
              <ShieldCheck className="text-success" size={22} />
            ) : (
              <ShieldAlert className="text-warning" size={22} />
            )}
            <div>
              <p className="font-semibold">
                {result.status === "clear" ? "No conflicts found" : "Potential conflict detected"}
              </p>
              {result.matches.length > 0 && (
                <p className="text-sm text-muted mt-1">
                  Matches: {result.matches.join(", ")} — written informed consent required.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}