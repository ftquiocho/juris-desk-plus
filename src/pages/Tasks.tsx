import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { users } from "../data";
import { CheckSquare, Clock, AlertCircle, Plus, Search, Check } from "lucide-react";
import TaskModal from "../components/TaskModal";
import { Pencil, Trash2 } from "lucide-react";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonList } from "../components/Skeleton";
import type { Task } from "../types";

const statuses = ["All", "To Do", "In Progress", "Done", "Blocked"] as const;

const priorityColor: Record<Task["priority"], string> = {
  High: "text-danger",
  Medium: "text-warning",
  Low: "text-muted",
};

export default function Tasks() {
  const currentUser = useStore((s) => s.currentUser)!;
  const tasks = useStore((s) => s.tasks);
  const matters = useStore((s) => s.matters);
  const updateTaskStatus = useStore((s) => s.updateTaskStatus);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const loading = useDelayedLoading();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [scope, setScope] = useState<"mine" | "all">(
    currentUser.roles.includes("MNG_PARTNER") || currentUser.roles.includes("SYS_ADMIN")
      ? "all"
      : "mine"
  );
  const [showNew, setShowNew] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return tasks.filter((t) => {
      const matter = matters.find((m) => m.id === t.matterId);
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (matter?.title ?? "").toLowerCase().includes(q);
      const matchesStatus = status === "All" || t.status === status;
      const matchesScope = scope === "all" || t.assignedTo === currentUser.id;
      return matchesQuery && matchesStatus && matchesScope;
    });
  }, [tasks, matters, query, status, scope, currentUser.id]);

  const toggleComplete = (task: Task) => {
    const next = task.status === "Done" ? "To Do" : "Done";
    updateTaskStatus(task.id, next);
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: currentUser.id,
      action: `${next === "Done" ? "Completed" : "Reopened"} task`,
      target: task.id,
      timestamp: new Date().toISOString(),
    });
  };

  const canCreate =
    currentUser.roles.includes("ATTORNEY") ||
    currentUser.roles.includes("MNG_PARTNER") ||
    currentUser.roles.includes("PARALEGAL") ||
    currentUser.roles.includes("SECRETARY");

  return (
    <div className="space-y-5">
      <div className="flex items-start md:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted">
            {filtered.length} {filtered.length === 1 ? "task" : "tasks"}
          </p>
        </div>
        {canCreate && (
          <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 bg-surface border border-border rounded-lg px-3 py-2 focus-within:border-primary/50 transition-colors">
        <Search size={16} className="text-muted shrink-0" />
        <input
          className="w-full bg-transparent outline-none text-sm text-text placeholder:text-muted"
          placeholder="Search tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-1">
        {(currentUser.roles.includes("MNG_PARTNER") || currentUser.roles.includes("SYS_ADMIN")) && (
          <div className="flex gap-1 border border-border rounded-full p-0.5 shrink-0">
            <button
              onClick={() => setScope("mine")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${scope === "mine" ? "bg-primary text-white" : "text-muted hover:text-text"}`}
            >
              Mine
            </button>
            <button
              onClick={() => setScope("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${scope === "all" ? "bg-primary text-white" : "text-muted hover:text-text"}`}
            >
              All
            </button>
          </div>
        )}
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
              status === s
                ? "bg-primary text-white border-primary"
                : "bg-surface text-muted border-border hover:bg-surface-hover hover:border-edge"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList rows={5} />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <CheckSquare size={40} className="text-muted mx-auto mb-3" />
          <p className="font-medium">No tasks match</p>
          <p className="text-sm text-muted mt-1">Try a different filter or search.</p>
        </div>
      ) : (
        <div className="card !p-0 divide-y divide-border overflow-hidden">
          {filtered.map((t) => {
            const matter = matters.find((m) => m.id === t.matterId);
            const assignee = users.find((u) => u.id === t.assignedTo);
            const isDone = t.status === "Done";
            return (
              <div key={t.id} className="flex items-start justify-between py-3 px-4 gap-3 hover:bg-surface-hover transition-colors">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleComplete(t)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                      isDone ? "bg-primary border-primary" : "border-border-light hover:border-primary"
                    }`}
                    aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                  >
                    {isDone && <Check size={12} className="text-white" />}
                  </button>
                  <div className="min-w-0">
                    <p className={`font-medium ${isDone ? "line-through text-muted" : ""}`}>
                      {t.title}
                    </p>
                    <p className="text-xs text-muted">
                      <Link to={`/matters/${t.matterId}`} className="hover:text-primary transition-colors">
                        {matter?.title ?? "Unknown"}
                      </Link>{" "}
                      · {assignee?.name ?? "—"} · Due {t.dueDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.status === "Blocked" && <AlertCircle size={14} className="text-danger" />}
                  {t.status === "In Progress" && <Clock size={14} className="text-info" />}
                  <span className={`text-xs font-semibold ${priorityColor[t.priority]}`}>
                    {t.priority}
                  </span>
                  <button
                    onClick={() => setEditingTask(t)}
                    className="icon-btn icon-btn-primary icon-btn-sm"
                    aria-label="Edit task"
                    title="Edit task"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete task "${t.title}"?`)) {
                        useStore.getState().removeTask(t.id);
                      }
                    }}
                    className="icon-btn icon-btn-danger icon-btn-sm"
                    aria-label="Delete task"
                    title="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNew && <TaskModal onClose={() => setShowNew(false)} />}
      {editingTask && (
        <TaskModal
          editing={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}