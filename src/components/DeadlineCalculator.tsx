import { useMemo, useState } from "react";
import { X, Calculator, Calendar as CalIcon } from "lucide-react";
import { useStore } from "../store/useStore";
import { useToast } from "./Toast";
import type { Task } from "../types";

interface Rule {
  id: string;
  trigger: string;
  description: string;
  days: number;
  basis: string;
}

const RULES: Rule[] = [
  { id: "R1", trigger: "Service of complaint / summons", description: "File Answer", days: 30, basis: "Rule 11, Rules of Court" },
  { id: "R2", trigger: "Service of Answer", description: "File Reply", days: 10, basis: "Rule 11, Rules of Court" },
  { id: "R3", trigger: "Notice of order / judgment", description: "File Motion for Reconsideration", days: 15, basis: "Rule 37, Rules of Court" },
  { id: "R4", trigger: "Notice of judgment (RTC)", description: "File Notice of Appeal", days: 15, basis: "Rule 41, Rules of Court" },
  { id: "R5", trigger: "Notice of CA decision", description: "File Petition for Review on Certiorari", days: 15, basis: "Rule 45, Rules of Court" },
  { id: "R6", trigger: "Notice of pre-trial", description: "File Pre-Trial Brief", days: -3, basis: "Rule 18 (3 days before)" },
  { id: "R7", trigger: "Termination of pre-trial", description: "File Formal Offer of Evidence", days: 30, basis: "Per court discretion" },
  { id: "R8", trigger: "Receipt of decision (Labor Arbiter)", description: "File Appeal to NLRC", days: 10, basis: "NLRC Rules" },
];

// PH Regular Holidays 2025-2026 (simplified)
const PH_HOLIDAYS = new Set([
  "2025-01-01", "2025-04-09", "2025-04-17", "2025-04-18", "2025-05-01",
  "2025-06-12", "2025-08-21", "2025-08-25", "2025-11-01", "2025-11-30",
  "2025-12-08", "2025-12-25", "2025-12-30", "2025-12-31",
  "2026-01-01", "2026-04-02", "2026-04-03", "2026-04-09", "2026-05-01",
  "2026-06-12", "2026-08-21", "2026-08-31", "2026-11-01", "2026-11-30",
  "2026-12-08", "2026-12-25", "2026-12-30", "2026-12-31",
]);

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computeDeadline(triggerDate: string, days: number): Date {
  const d = new Date(triggerDate);
  d.setHours(0, 0, 0, 0);

  // Rule 22: exclude the day of the event, count from next day
  d.setDate(d.getDate() + (days >= 0 ? days : days));

  // If falls on weekend or PH holiday, move to next working day
  while (isWeekend(d) || PH_HOLIDAYS.has(toISO(d))) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

export default function DeadlineCalculator({ onClose }: { onClose: () => void }) {
  const matters = useStore((s) => s.matters);
  const addTask = useStore((s) => s.addTask);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const [ruleId, setRuleId] = useState("");
  const [triggerDate, setTriggerDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [matterId, setMatterId] = useState("");
  const [createTask, setCreateTask] = useState(true);

  const rule = RULES.find((r) => r.id === ruleId);

  const deadline = useMemo(() => {
    if (!rule || !triggerDate) return null;
    return computeDeadline(triggerDate, rule.days);
  }, [rule, triggerDate]);

  const deadlineISO = deadline ? toISO(deadline) : "";
  const daysFromNow = deadline
    ? Math.floor(
        (deadline.getTime() - new Date().setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rule || !deadline || !matterId) return;

    if (createTask) {
      const task: Task = {
        id: `TSK-${String(Date.now()).slice(-6)}`,
        matterId,
        title: `${rule.description} (due ${deadlineISO})`,
        assignedTo: user.id,
        dueDate: deadlineISO,
        status: "To Do",
        priority: "High",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      addTask(task);
      addAuditEvent({
        id: `LOG-${Date.now()}`,
        userId: user.id,
        action: `Computed deadline: ${rule.description} → ${deadlineISO}`,
        target: task.id,
        timestamp: new Date().toISOString(),
      });
      push(
        `Deadline task created: ${rule.description} due ${deadline.toLocaleDateString()}.`
      );
    } else {
      addAuditEvent({
        id: `LOG-${Date.now()}`,
        userId: user.id,
        action: `Computed deadline (no task): ${rule.description} → ${deadlineISO}`,
        target: matterId,
        timestamp: new Date().toISOString(),
      });
      push(`Deadline computed: ${deadline.toLocaleDateString()}.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-xl rounded-t-2xl md:rounded-2xl border border-border shadow-modal max-h-[90dvh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative border-b border-border shrink-0">
          <button
            onClick={onClose}
            className="icon-btn absolute top-2.5 right-2.5 z-10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 p-4 pr-14">
            <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Calculator size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold truncate">Deadline Calculator</h2>
              <p className="text-xs text-muted truncate">
                Rule 22 — excludes trigger day, skips weekends & PH holidays
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="label">Trigger Event *</label>
            <select
              required
              className="input"
              value={ruleId}
              onChange={(e) => setRuleId(e.target.value)}
            >
              <option value="">Select trigger...</option>
              {RULES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.trigger} — {r.description}
                </option>
              ))}
            </select>
            {rule && (
              <p className="text-xs text-muted mt-1">
                {rule.days >= 0 ? `${rule.days} days` : `${Math.abs(rule.days)} days before`} · {rule.basis}
              </p>
            )}
          </div>

          <div>
            <label className="label">Trigger Date *</label>
            <input
              required
              type="date"
              className="input"
              value={triggerDate}
              onChange={(e) => setTriggerDate(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Attach to Matter *</label>
            <select
              required
              className="input"
              value={matterId}
              onChange={(e) => setMatterId(e.target.value)}
            >
              <option value="">Select matter...</option>
              {matters
                .filter((m) => m.status !== "Closed")
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.title}
                  </option>
                ))}
            </select>
          </div>

          {/* Result */}
          {deadline && rule && (
            <div className="rounded-xl border border-primary/30 bg-primary-light/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <CalIcon size={16} className="text-brand" />
                <p className="text-xs uppercase tracking-wider text-primary font-semibold">
                  Computed Deadline
                </p>
              </div>
              <p className="text-2xl font-bold text-text">
                {deadline.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-muted mt-1">
                {daysFromNow >= 0
                  ? `${daysFromNow} day${daysFromNow === 1 ? "" : "s"} from today`
                  : `Already ${Math.abs(daysFromNow)} day${Math.abs(daysFromNow) === 1 ? "" : "s"} past`}
              </p>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={createTask}
              onChange={(e) => setCreateTask(e.target.checked)}
            />
            <span>Create a task with this deadline</span>
          </label>
        </form>

        <div className="p-3 border-t border-border flex gap-2 shrink-0">
          <button
            onClick={submit}
            disabled={!rule || !deadline || !matterId}
            className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {createTask ? "Create Deadline Task" : "Log Computation"}
          </button>
          <button onClick={onClose} className="btn-secondary px-4">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}