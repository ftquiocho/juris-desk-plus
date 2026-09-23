import { useState } from "react";
import { useStore } from "../store/useStore";
import { Clock, Plus } from "lucide-react";
import { users } from "../data";

export default function TimeTracker() {
  const currentUser = useStore((s) => s.currentUser)!;
  const matters = useStore((s) => s.matters);
  const timeEntries = useStore((s) => s.timeEntries);
  const addTimeEntry = useStore((s) => s.addTimeEntry);
  const addAuditEvent = useStore((s) => s.addAuditEvent);

  const [matterId, setMatterId] = useState("");
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState("");
  const [billable, setBillable] = useState(true);
  const [rate, setRate] = useState("2500");

  // Only show matters assigned to the current user (or all for partners/admins)
  const canSeeAll =
    currentUser.roles.includes("MNG_PARTNER") || currentUser.roles.includes("SYS_ADMIN");
  const visibleMatters = canSeeAll
    ? matters
    : matters.filter(
        (m) =>
          m.attorneyId === currentUser.id ||
          m.paralegalId === currentUser.id ||
          m.secretaryId === currentUser.id
      );

  const myEntries = canSeeAll
    ? timeEntries
    : timeEntries.filter((t) => t.userId === currentUser.id);

  const totalHours = myEntries.reduce((s, t) => s + t.duration, 0);
  const billableAmount = myEntries
    .filter((t) => t.billable)
    .reduce((s, t) => s + t.duration * t.rate, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseFloat(duration);
    if (!matterId || !activity || !dur) return;

    addTimeEntry({
      id: `TE-${Date.now()}`,
      matterId,
      userId: currentUser.id,
      activity,
      duration: dur,
      billable,
      rate: billable ? parseFloat(rate) || 0 : 0,
      date: new Date().toISOString().slice(0, 10),
    });

    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: currentUser.id,
      action: "Logged time entry",
      target: matterId,
      timestamp: new Date().toISOString(),
    });

    setMatterId("");
    setActivity("");
    setDuration("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Time Tracker</h1>
        <p className="text-sm text-muted">
          Log your billable and non-billable hours.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-xs uppercase text-muted">Total Hours</p>
          <p className="text-2xl font-bold mt-2">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="card">
          <p className="text-xs uppercase text-muted">Billable Amount</p>
          <p className="text-2xl font-bold mt-2 text-success">
            ₱{billableAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="card space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Plus size={18} /> Log New Entry
        </h2>

        <div>
          <label className="label">Matter *</label>
          <select
            required
            className="input"
            value={matterId}
            onChange={(e) => setMatterId(e.target.value)}
          >
            <option value="">Select a matter...</option>
            {visibleMatters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} — {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Activity *</label>
          <input
            required
            className="input"
            placeholder="e.g., Client consultation, Legal research"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Duration (hours) *</label>
            <input
              required
              type="number"
              step="0.25"
              min="0.25"
              className="input"
              placeholder="1.5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Rate (₱/hour)</label>
            <input
              type="number"
              className="input"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              disabled={!billable}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={billable}
              onChange={() => setBillable(true)}
            />
            Billable
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={!billable}
              onChange={() => setBillable(false)}
            />
            Non-billable
          </label>
        </div>

        <button type="submit" className="btn-primary">
          Save Time Entry
        </button>
      </form>

      <div className="card">
        <h2 className="font-semibold mb-3">
          {canSeeAll ? "All Time Entries" : "My Time Entries"} ({myEntries.length})
        </h2>
        {myEntries.length === 0 ? (
          <p className="text-sm text-muted">No time entries yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {myEntries.map((t) => {
              const matter = matters.find((m) => m.id === t.matterId);
              const owner = users.find((u) => u.id === t.userId);
              return (
                <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-muted" />
                    <div>
                      <p className="font-medium">{t.activity}</p>
                      <p className="text-xs text-muted">
                        {matter?.title} · {owner?.name} · {t.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{t.duration}h</p>
                    {t.billable ? (
                      <p className="text-xs text-success">
                        ₱{(t.duration * t.rate).toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-xs text-muted">Non-billable</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}