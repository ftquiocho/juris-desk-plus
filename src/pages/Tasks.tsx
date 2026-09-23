import { useStore } from "../store/useStore";
import { users } from "../data";
import { CheckSquare, Clock, AlertCircle } from "lucide-react";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonList } from "../components/Skeleton";

interface Task {
  id: string;
  matterId: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: "To Do" | "In Progress" | "Done" | "Blocked";
  priority: "Low" | "Medium" | "High";
}

const seedTasks: Task[] = [
  { id: "TSK-001", matterId: "M-2025-001", title: "Draft judicial affidavit", assignedTo: "USR-003", dueDate: "2025-03-01", status: "In Progress", priority: "High" },
  { id: "TSK-002", matterId: "M-2025-002", title: "File motion for reconsideration", assignedTo: "USR-002", dueDate: "2025-03-05", status: "To Do", priority: "High" },
  { id: "TSK-003", matterId: "M-2025-003", title: "Prepare position paper", assignedTo: "USR-003", dueDate: "2025-03-10", status: "To Do", priority: "Medium" },
  { id: "TSK-004", matterId: "M-2025-001", title: "Client interview follow-up", assignedTo: "USR-004", dueDate: "2025-03-02", status: "Done", priority: "Low" },
];

const priorityColor: Record<Task["priority"], string> = {
  High: "text-danger",
  Medium: "text-warning",
  Low: "text-muted",
};

export default function Tasks() {
  const currentUser = useStore((s) => s.currentUser)!;
  const matters = useStore((s) => s.matters);
  const loading = useDelayedLoading();

  const canSeeAll = currentUser.roles.includes("MNG_PARTNER") || currentUser.roles.includes("SYS_ADMIN");
  const visibleTasks = canSeeAll ? seedTasks : seedTasks.filter((t) => t.assignedTo === currentUser.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Tasks</h1>
        <p className="text-sm text-muted">
          {canSeeAll ? "All tasks across the firm." : "Tasks assigned to you."}
        </p>
      </div>

      {loading ? (
        <SkeletonList rows={4} />
      ) : visibleTasks.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <CheckSquare size={40} className="text-muted mb-3" />
          <p className="font-medium">No tasks</p>
          <p className="text-sm text-muted mt-1">You're all caught up.</p>
        </div>
      ) : (
        <div className="card divide-y divide-border">
          {visibleTasks.map((t) => {
            const matter = matters.find((m) => m.id === t.matterId);
            const assignee = users.find((u) => u.id === t.assignedTo);
            return (
              <div key={t.id} className="flex items-start md:items-center justify-between py-3 gap-3">
                <div className="flex items-start md:items-center gap-3 min-w-0">
                  {t.status === "Done" ? (
                    <CheckSquare className="text-success" size={18} />
                  ) : t.status === "Blocked" ? (
                    <AlertCircle className="text-danger" size={18} />
                  ) : (
                    <Clock className="text-muted" size={18} />
                  )}
                  <div className="min-w-0">
                    <p className={`font-medium ${t.status === "Done" ? "line-through text-muted" : ""}`}>
                      {t.title}
                    </p>
                    <p className="text-xs text-muted">
                      {matter?.title} · {assignee?.name ?? "—"} · Due {t.dueDate}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold shrink-0 ${priorityColor[t.priority]}`}>
                  {t.priority}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}