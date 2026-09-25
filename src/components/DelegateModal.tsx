
import { useState } from "react";
import { X, UserCheck } from "lucide-react";
import { useStore } from "../store/useStore";
import { users } from "../data";
import { useToast } from "./Toast";

export default function DelegateModal({
  matterId,
  onClose,
}: {
  matterId: string;
  onClose: () => void;
}) {
  const currentUser = useStore((s) => s.currentUser)!;
  const addDelegation = useStore((s) => s.addDelegation);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const push = useToast((s) => s.push);

  const today = new Date().toISOString().slice(0, 10);
  const [delegateId, setDelegateId] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [scope, setScope] = useState<"matter" | "firm">("matter");

  // Eligible delegates: attorneys (not self)
  const eligible = users.filter(
    (u) =>
      u.id !== currentUser.id &&
      (u.roles.includes("ATTORNEY") || u.roles.includes("MNG_PARTNER"))
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateId) return;

    const delegate = users.find((u) => u.id === delegateId);
    addDelegation({
      id: `DEL-${Date.now()}`,
      matterId,
      delegatorId: currentUser.id,
      delegateId,
      startDate,
      endDate,
      scope,
      createdAt: new Date().toISOString(),
    });

    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: currentUser.id,
      action: `Delegated matter to ${delegate?.name ?? delegateId}`,
      target: matterId,
      timestamp: new Date().toISOString(),
    });

    push(`Delegated to ${delegate?.name ?? "attorney"}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-md rounded-t-2xl md:rounded-2xl border border-border shadow-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-brand" />
            <h2 className="font-semibold">Delegate Matter</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-4 space-y-4">
          <div>
            <label className="label">Delegate To *</label>
            <select
              required
              className="input"
              value={delegateId}
              onChange={(e) => setDelegateId(e.target.value)}
            >
              <option value="">Select an attorney...</option>
              {eligible.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start *</label>
              <input
                required
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label">End *</label>
              <input
                required
                type="date"
                className="input"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Scope</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={scope === "matter"}
                  onChange={() => setScope("matter")}
                />
                This matter only
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={scope === "firm"}
                  onChange={() => setScope("firm")}
                />
                All my matters
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              Confirm Delegation
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}