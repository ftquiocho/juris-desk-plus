import { useState } from "react";
import { X, CheckSquare } from "lucide-react";
import { useStore } from "../store/useStore";
import { users } from "../data";
import { useToast } from "./Toast";
import type { Task } from "../types";

export default function TaskModal({
  onClose,
  editing,
}: {
  onClose: () => void;
  editing?: Task;
}) {
  const matters = useStore((s) => s.matters);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const [matterId, setMatterId] = useState(editing?.matterId ?? "");
  const [title, setTitle] = useState(editing?.title ?? "");
  const [assignedTo, setAssignedTo] = useState(editing?.assignedTo ?? user.id);
  const [dueDate, setDueDate] = useState(editing?.dueDate ?? "");
  const [priority, setPriority] = useState<Task["priority"]>(editing?.priority ?? "Medium");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matterId || !title.trim() || !assignedTo) return;

    if (editing) {
      updateTask(editing.id, {
        matterId,
        title: title.trim(),
        assignedTo,
        dueDate: dueDate || editing.dueDate,
        priority,
      });
      addAuditEvent({
        id: `LOG-${Date.now()}`,
        userId: user.id,
        action: "Updated task",
        target: editing.id,
        timestamp: new Date().toISOString(),
      });
      push("Task updated.");
    } else {
      const task: Task = {
        id: `TSK-${String(Date.now()).slice(-6)}`,
        matterId,
        title: title.trim(),
        assignedTo,
        dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        status: "To Do",
        priority,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      addTask(task);
      addAuditEvent({
        id: `LOG-${Date.now()}`,
        userId: user.id,
        action: "Created task",
        target: task.id,
        timestamp: new Date().toISOString(),
      });
      push(`Task assigned to ${users.find((u) => u.id === assignedTo)?.name}.`);
      if (assignedTo !== user.id) {
        useStore.getState().addNotification({
          id: `NOT-${Date.now()}`,
          userId: assignedTo,
          title: "New task assigned",
          body: `"${title.trim()}" — due ${task.dueDate}`,
          link: "/tasks",
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-lg rounded-t-2xl md:rounded-2xl border border-border shadow-modal">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <CheckSquare size={18} className="text-brand" />
            <h2 className="font-semibold">{editing ? "Edit Task" : "New Task"}</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-4 space-y-4">
          <div>
            <label className="label">Matter *</label>
            <select required className="input" value={matterId} onChange={(e) => setMatterId(e.target.value)}>
              <option value="">Select matter...</option>
              {matters.map((m) => (
                <option key={m.id} value={m.id}>{m.id} — {m.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Task *</label>
            <input required className="input" placeholder="e.g., Draft position paper" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Assign To *</label>
              <select required className="input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Low", "Medium", "High"] as const).map((p) => {
                const selected = priority === p;
                return (
                  <label key={p} className={`flex items-center justify-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition ${selected ? "border-primary bg-primary-light text-primary font-medium" : "border-border hover:bg-surface-hover"}`}>
                    <input type="radio" className="hidden" checked={selected} onChange={() => setPriority(p)} />
                    {p}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editing ? "Save Changes" : "Create Task"}</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}