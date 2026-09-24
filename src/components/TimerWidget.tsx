import { useEffect, useMemo, useState } from "react";
import { Play, Pause, Square, X, Timer as TimerIcon } from "lucide-react";
import { useStore } from "../store/useStore";
import { useToast } from "./Toast";

function fmt(ms: number) {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TimerWidget() {
  const timer = useStore((s) => s.timer);
  const matters = useStore((s) => s.matters);
  const currentUser = useStore((s) => s.currentUser)!;
  const startTimer = useStore((s) => s.startTimer);
  const pauseTimer = useStore((s) => s.pauseTimer);
  const resumeTimer = useStore((s) => s.resumeTimer);
  const stopTimer = useStore((s) => s.stopTimer);
  const discardTimer = useStore((s) => s.discardTimer);
  const push = useToast((s) => s.push);

  const [open, setOpen] = useState(false);
  const [matterId, setMatterId] = useState("");
  const [activity, setActivity] = useState("");
  const [now, setNow] = useState(Date.now());

  // Tick every second when active
  useEffect(() => {
    if (!timer.active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timer.active]);

  const elapsed = useMemo(() => {
    if (!timer.active || !timer.startedAt) return 0;
    const extraPause = timer.pausedAt ? now - timer.pausedAt : 0;
    return now - timer.startedAt - timer.pausedMs - extraPause;
  }, [timer, now]);

  const canBill =
    currentUser.roles.includes("ATTORNEY") ||
    currentUser.roles.includes("MNG_PARTNER") ||
    currentUser.roles.includes("PARALEGAL") ||
    currentUser.roles.includes("SECRETARY");

  if (!canBill) return null;

  const visibleMatters = matters.filter(
    (m) =>
      m.status !== "Closed" &&
      (currentUser.roles.includes("MNG_PARTNER") ||
        currentUser.roles.includes("SYS_ADMIN") ||
        m.attorneyId === currentUser.id ||
        m.paralegalId === currentUser.id ||
        m.secretaryId === currentUser.id)
  );

  const start = () => {
    if (!matterId) {
      push("Pick a matter first.", "error");
      return;
    }
    startTimer(matterId, activity.trim() || "Tracked via timer");
    setOpen(false);
    setActivity("");
  };

  const handleStop = () => {
    const matter = matters.find((m) => m.id === timer.matterId);
    stopTimer();
    push(`Timer saved to ${matter?.title ?? "matter"}.`);
  };

  const handleDiscard = () => {
    if (!confirm("Discard this timer without saving?")) return;
    discardTimer();
  };

  const running = timer.active;
  const paused = !!timer.pausedAt;

  return (
    <div className="no-print fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40">
      {/* Collapsed trigger (no timer running) */}
      {!running && !open && (
        <button
          onClick={() => setOpen(true)}
          className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-glow hover:bg-primary-hover active:scale-95 transition-all"
          aria-label="Start timer"
          title="Start timer"
        >
          <TimerIcon size={20} />
        </button>
      )}

      {/* Start form */}
      {!running && open && (
        <div className="w-80 bg-elevated border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <TimerIcon size={16} className="text-primary" />
              <p className="font-semibold text-sm">Start Timer</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="icon-btn icon-btn-sm"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-3 space-y-3">
            <div>
              <label className="label">Matter</label>
              <select
                className="input !text-sm"
                value={matterId}
                onChange={(e) => setMatterId(e.target.value)}
              >
                <option value="">Select matter...</option>
                {visibleMatters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Activity</label>
              <input
                className="input !text-sm"
                placeholder="e.g., Client call"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && start()}
              />
            </div>

            <button
              onClick={start}
              disabled={!matterId}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Play size={14} />
              Start
            </button>
          </div>
        </div>
      )}

      {/* Running pill */}
      {running && (
        <div
          className={`w-72 md:w-80 bg-elevated border rounded-xl shadow-2xl overflow-hidden transition-colors ${
            paused ? "border-warning/40" : "border-primary/40"
          }`}
        >
          <div className="flex items-center justify-between p-3 gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  paused ? "bg-warning" : "bg-primary animate-pulse"
                }`}
              />
              <p className="text-xs text-muted truncate">
                {matters.find((m) => m.id === timer.matterId)?.title ??
                  "Matter"}
              </p>
            </div>
            <p className="font-mono text-sm font-semibold tabular-nums text-text shrink-0">
              {fmt(elapsed)}
            </p>
          </div>

          <div className="px-3 pb-3 flex items-center gap-1.5">
            {!paused ? (
              <button
                onClick={pauseTimer}
                className="icon-btn"
                aria-label="Pause"
                title="Pause"
              >
                <Pause size={14} />
              </button>
            ) : (
              <button
                onClick={resumeTimer}
                className="icon-btn icon-btn-primary"
                aria-label="Resume"
                title="Resume"
              >
                <Play size={14} />
              </button>
            )}
            <button
              onClick={handleStop}
              className="btn-primary flex-1 text-xs py-1.5 flex items-center justify-center gap-1"
            >
              <Square size={12} />
              Save & Stop
            </button>
            <button
              onClick={handleDiscard}
              className="icon-btn icon-btn-danger"
              aria-label="Discard"
              title="Discard"
            >
              <X size={14} />
            </button>
          </div>

          {timer.activity && (
            <div className="px-3 pb-3 text-[10px] text-muted truncate">
              {timer.activity}
            </div>
          )}
        </div>
      )}
    </div>
  );
}