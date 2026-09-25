import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Timer as TimerIcon,
  Play,
  Pause,
  Square,
  X,
  UserPlus,
  Briefcase,
  CheckSquare,
  Receipt,
  FileText,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { can } from "../lib/permissions";
import { useToast } from "./Toast";
import NewMatterModal from "./NewMatterModal";
import TaskModal from "./TaskModal";
import InvoiceModal from "./InvoiceModal";
import type { LucideIcon } from "lucide-react";

type Action = "client" | "matter" | "task" | "expense" | "invoice";
type Panel = null | "create" | "timer";

function fmt(ms: number) {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FloatingActions() {
  const currentUser = useStore((s) => s.currentUser)!;
  const matters = useStore((s) => s.matters);
  const timer = useStore((s) => s.timer);
  const startTimer = useStore((s) => s.startTimer);
  const pauseTimer = useStore((s) => s.pauseTimer);
  const resumeTimer = useStore((s) => s.resumeTimer);
  const stopTimer = useStore((s) => s.stopTimer);
  const discardTimer = useStore((s) => s.discardTimer);
  const navigate = useNavigate();
  const push = useToast((s) => s.push);

  const [panel, setPanel] = useState<Panel>(null);
  const [modal, setModal] = useState<Action | null>(null);
  const [matterId, setMatterId] = useState("");
  const [activity, setActivity] = useState("");
  const [now, setNow] = useState(Date.now());
  const wrapRef = useRef<HTMLDivElement>(null);

  // Timer tick
  useEffect(() => {
    if (!timer.active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timer.active]);

  // Click outside closes panel
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setPanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Actions available
  const canBill =
    currentUser.roles.includes("ATTORNEY") ||
    currentUser.roles.includes("MNG_PARTNER") ||
    currentUser.roles.includes("PARALEGAL") ||
    currentUser.roles.includes("SECRETARY");

  type ActionItem = { id: Action; label: string; icon: LucideIcon; show: boolean };
  const allActions: ActionItem[] = [
    { id: "client", label: "New Client", icon: UserPlus, show: can(currentUser.roles, "intake:create") },
    { id: "matter", label: "New Matter", icon: Briefcase, show: can(currentUser.roles, "matter:create") },
    {
      id: "task",
      label: "New Task",
      icon: CheckSquare,
      show:
        can(currentUser.roles, "matter:read") &&
        (currentUser.roles.includes("ATTORNEY") ||
          currentUser.roles.includes("MNG_PARTNER") ||
          currentUser.roles.includes("PARALEGAL") ||
          currentUser.roles.includes("SECRETARY")),
    },
    {
      id: "expense",
      label: "Log Expense",
      icon: Receipt,
      show:
        currentUser.roles.includes("ATTORNEY") ||
        currentUser.roles.includes("MNG_PARTNER") ||
        currentUser.roles.includes("PARALEGAL") ||
        currentUser.roles.includes("SECRETARY") ||
        currentUser.roles.includes("BILLING"),
    },
    { id: "invoice", label: "New Invoice", icon: FileText, show: can(currentUser.roles, "invoice:create") },
  ];
  const actions = allActions.filter((a) => a.show);

  const showCreate = actions.length > 0;
  const showTimer = canBill;

  if (!showCreate && !showTimer) return null;

  const elapsed = (() => {
    if (!timer.active || !timer.startedAt) return 0;
    const extra = timer.pausedAt ? now - timer.pausedAt : 0;
    return now - timer.startedAt - timer.pausedMs - extra;
  })();
  const paused = !!timer.pausedAt;

  const visibleMatters = matters.filter(
    (m) =>
      m.status !== "Closed" &&
      (currentUser.roles.includes("MNG_PARTNER") ||
        currentUser.roles.includes("SYS_ADMIN") ||
        m.attorneyId === currentUser.id ||
        m.paralegalId === currentUser.id ||
        m.secretaryId === currentUser.id)
  );

  const triggerCreate = (a: Action) => {
    setPanel(null);
    if (a === "client") navigate("/intake");
    else if (a === "expense") navigate("/time");
    else setModal(a);
  };

  const start = () => {
    if (!matterId) {
      push("Pick a matter first.", "error");
      return;
    }
    startTimer(matterId, activity.trim() || "Tracked via timer");
    setPanel(null);
    setActivity("");
    setMatterId("");
  };

  const handleStop = () => {
    const m = matters.find((x) => x.id === timer.matterId);
    stopTimer();
    push(`Timer saved to ${m?.title ?? "matter"}.`);
  };

  const handleDiscard = () => {
    if (!confirm("Discard this timer without saving?")) return;
    discardTimer();
  };

  return (
    <>
      <div
        ref={wrapRef}
        className="no-print fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex flex-col items-end gap-2"
      >
        {/* ═══ PANEL ═══ */}
        {panel === "create" && (
          <div className="w-56 bg-elevated border border-border rounded-xl shadow-modal overflow-hidden animate-fade-in">
            <div className="p-2 border-b border-border flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted px-2">
                Create
              </p>
              <button
                onClick={() => setPanel(null)}
                className="icon-btn icon-btn-sm"
                aria-label="Close"
              >
                <X size={12} />
              </button>
            </div>
            <ul className="p-1.5">
              {actions.map((a) => {
                const Icon = a.icon;
                return (
                  <li key={a.id}>
                    <button
                      onClick={() => triggerCreate(a.id)}
                      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-text hover:bg-surface-hover transition-colors"
                    >
                      <Icon size={16} className="text-muted shrink-0" />
                      <span className="truncate">{a.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {panel === "timer" && !timer.active && (
          <div className="w-72 max-w-[calc(100vw-2rem)] bg-elevated border border-border rounded-xl shadow-modal overflow-hidden animate-fade-in">
            <div className="p-2 border-b border-border flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted px-2">
                Start Timer
              </p>
              <button
                onClick={() => setPanel(null)}
                className="icon-btn icon-btn-sm"
                aria-label="Close"
              >
                <X size={12} />
              </button>
            </div>
            <div className="p-3 space-y-3">
              <div>
                <label className="label text-xs">Matter</label>
                <select
                  className="input !text-sm"
                  value={matterId}
                  onChange={(e) => setMatterId(e.target.value)}
                >
                  <option value="">Select...</option>
                  {visibleMatters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} — {m.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Activity</label>
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

        {panel === "timer" && timer.active && (
          <div
            className={`w-72 max-w-[calc(100vw-2rem)] bg-elevated border rounded-xl shadow-modal overflow-hidden animate-fade-in ${
              paused ? "border-warning/40" : "border-primary/40"
            }`}
          >
            <div className="p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    paused ? "bg-warning" : "bg-white animate-pulse"
                  }`}
                />
                <p className="text-xs text-muted truncate flex-1">
                  {matters.find((m) => m.id === timer.matterId)?.title ?? "Matter"}
                </p>
                <button
                  onClick={() => setPanel(null)}
                  className="icon-btn icon-btn-sm"
                  aria-label="Collapse"
                  title="Collapse"
                >
                  <X size={12} />
                </button>
              </div>

              <p className="font-mono text-2xl font-semibold tabular-nums text-text text-center py-1">
                {fmt(elapsed)}
              </p>

              {timer.activity && (
                <p className="text-[10px] text-muted text-center truncate mb-2">
                  {timer.activity}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-2">
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
            </div>
          </div>
        )}

        {/* ═══ BUTTONS ═══ */}
        <div className="flex flex-col items-end gap-2">
          {/* Timer button */}
          {showTimer && (
            <button
              onClick={() => setPanel(panel === "timer" ? null : "timer")}
              className={`relative h-11 px-3 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 ${
                timer.active
                  ? paused
                    ? "bg-warning-light border border-warning text-warning-ink"
                    : "bg-brand text-white shadow-glow"
                  : "bg-surface border border-border text-muted hover:text-text hover:border-edge"
              }`}
              aria-label={timer.active ? "Timer running" : "Start timer"}
              title={timer.active ? "Timer running" : "Start timer"}
            >
              {timer.active ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white/80 shrink-0" />
                  <span className="font-mono text-xs tabular-nums font-semibold">
                    {fmt(elapsed)}
                  </span>
                </>
              ) : (
                <TimerIcon size={18} />
              )}
            </button>
          )}

          {/* Create button */}
          {showCreate && (
            <button
              onClick={() => setPanel(panel === "create" ? null : "create")}
              className="w-14 h-14 rounded-full bg-brand text-white flex items-center justify-center shadow-glow hover:bg-brand-hover active:scale-95 transition-all"
              aria-label="Create"
              title="Create"
            >
              <Plus
                size={24}
                className={`transition-transform duration-200 ${
                  panel === "create" ? "rotate-45" : ""
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Full-screen modals (outside the floating container) */}
      {modal === "matter" && <NewMatterModal onClose={() => setModal(null)} />}
      {modal === "task" && <TaskModal onClose={() => setModal(null)} />}
      {modal === "invoice" && <InvoiceModal onClose={() => setModal(null)} />}
    </>
  );
}