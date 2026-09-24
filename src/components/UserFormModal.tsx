import { useState } from "react";
import { X, UserPlus, UserCog } from "lucide-react";
import { useStore } from "../store/useStore";
import { useToast } from "./Toast";
import type { Role, User } from "../types";

const allRoles: { value: Role; label: string }[] = [
  { value: "SYS_ADMIN", label: "System Admin" },
  { value: "MNG_PARTNER", label: "Managing Partner" },
  { value: "ATTORNEY", label: "Attorney" },
  { value: "PARALEGAL", label: "Paralegal" },
  { value: "SECRETARY", label: "Legal Secretary" },
  { value: "BILLING", label: "Billing Staff" },
];

export default function UserFormModal({
  editing,
  onClose,
}: {
  editing?: User;
  onClose: () => void;
}) {
  const addUser = useStore((s) => s.addUser);
  const updateUser = useStore((s) => s.updateUser);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const currentUser = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const [name, setName] = useState(editing?.name ?? "");
  const [email, setEmail] = useState(editing?.email ?? "");
  const [title, setTitle] = useState(editing?.title ?? "");
  const [roles, setRoles] = useState<Role[]>(editing?.roles ?? []);
  const [defaultRate, setDefaultRate] = useState(
    editing?.defaultRate ? String(editing.defaultRate) : ""
  );

  const toggleRole = (r: Role) =>
    setRoles((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || roles.length === 0) {
      push("Fill in name, email, and at least one role.", "error");
      return;
    }

    if (editing) {
      updateUser({
        ...editing,
        name: name.trim(),
        email: email.trim(),
        title: title.trim(),
        roles,
        defaultRate: defaultRate ? parseFloat(defaultRate) : undefined,
      });
      addAuditEvent({
        id: `LOG-${Date.now()}`,
        userId: currentUser.id,
        action: "Updated user",
        target: editing.id,
        timestamp: new Date().toISOString(),
      });
      push(`Updated ${name}.`);
    } else {
      const id = `USR-${String(Date.now()).slice(-4)}`;
      addUser({
        id,
        name: name.trim(),
        email: email.trim(),
        title: title.trim(),
        roles,
        defaultRate: defaultRate ? parseFloat(defaultRate) : undefined,
        active: true,
      });
      addAuditEvent({
        id: `LOG-${Date.now()}`,
        userId: currentUser.id,
        action: "Created user",
        target: id,
        timestamp: new Date().toISOString(),
      });
      push(`${name} added to the firm.`);
    }
    onClose();
  };

  const canBill =
    roles.includes("ATTORNEY") ||
    roles.includes("MNG_PARTNER") ||
    roles.includes("PARALEGAL");

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-lg rounded-t-2xl md:rounded-2xl border border-border shadow-modal max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {editing ? (
              <UserCog size={18} className="text-primary" />
            ) : (
              <UserPlus size={18} className="text-primary" />
            )}
            <h2 className="font-semibold">
              {editing ? "Edit User" : "Add User"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          <div>
            <label className="label">Full Name *</label>
            <input
              required
              className="input"
              placeholder="e.g., Atty. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Email *</label>
            <input
              required
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Title</label>
            <input
              className="input"
              placeholder="e.g., Senior Associate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Roles * (select one or more)</label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {allRoles.map((r) => {
                const selected = roles.includes(r.value);
                return (
                  <label
                    key={r.value}
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition ${
                      selected
                        ? "border-primary bg-primary-light text-primary font-medium"
                        : "border-border hover:bg-surface-hover"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleRole(r.value)}
                    />
                    {r.label}
                  </label>
                );
              })}
            </div>
          </div>

          {canBill && (
            <div>
              <label className="label">
                Default Rate (₱/hr){" "}
                <span className="text-muted text-xs font-normal">
                  — auto-fills in Time Tracker
                </span>
              </label>
              <input
                type="number"
                min="0"
                className="input"
                placeholder="e.g., 2500"
                value={defaultRate}
                onChange={(e) => setDefaultRate(e.target.value)}
              />
            </div>
          )}
        </form>

        <div className="p-4 border-t border-border flex gap-3 shrink-0">
          <button onClick={submit} className="btn-primary flex-1">
            {editing ? "Save Changes" : "Create User"}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}