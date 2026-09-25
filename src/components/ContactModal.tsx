import { useState } from "react";
import { X, UserPlus, UserCog } from "lucide-react";
import { useStore } from "../store/useStore";
import { useToast } from "./Toast";
import type { Contact, ContactType } from "../types";

const contactTypes: ContactType[] = [
  "Opposing Party",
  "Opposing Counsel",
  "Court",
  "Prosecutor",
  "Expert Witness",
  "Process Server",
  "Notary Public",
  "Witness",
];

export default function ContactModal({
  editing,
  onClose,
}: {
  editing?: Contact;
  onClose: () => void;
}) {
  const addContact = useStore((s) => s.addContact);
  const updateContact = useStore((s) => s.updateContact);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const [form, setForm] = useState<Partial<Contact>>(
    editing ?? { type: "Opposing Counsel" }
  );

  const set = <K extends keyof Contact>(key: K, value: Contact[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;

    if (editing) {
      const updated = { ...editing, ...form } as Contact;
      updateContact(updated);
      addAuditEvent({
        id: `LOG-${Date.now()}`,
        userId: user.id,
        action: "Updated contact",
        target: editing.id,
        timestamp: new Date().toISOString(),
      });
      push(`Contact ${editing.id} updated.`);
    } else {
      const id = `CON-${String(Date.now()).slice(-4)}`;
      const contact: Contact = {
        id,
        name: form.name!.trim(),
        type: form.type as ContactType,
        email: form.email,
        phone: form.phone,
        address: form.address,
        organization: form.organization,
        notes: form.notes,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      addContact(contact);
      addAuditEvent({
        id: `LOG-${Date.now()}`,
        userId: user.id,
        action: "Created contact",
        target: id,
        timestamp: new Date().toISOString(),
      });
      push(`Contact ${contact.name} added.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-lg rounded-t-2xl md:rounded-2xl border border-border shadow-modal max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {editing ? (
              <UserCog size={18} className="text-brand" />
            ) : (
              <UserPlus size={18} className="text-brand" />
            )}
            <h2 className="font-semibold">
              {editing ? "Edit Contact" : "Add Contact"}
            </h2>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              required
              className="input"
              value={form.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g., Atty. Benjamin Donovan"
            />
          </div>

          <div>
            <label className="label">Contact Type *</label>
            <select
              required
              className="input"
              value={form.type ?? "Opposing Counsel"}
              onChange={(e) => set("type", e.target.value as ContactType)}
            >
              {contactTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={form.email ?? ""}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Organization</label>
            <input
              className="input"
              value={form.organization ?? ""}
              onChange={(e) => set("organization", e.target.value)}
              placeholder="e.g., Donovan & Associates"
            />
          </div>

          <div>
            <label className="label">Address</label>
            <input
              className="input"
              value={form.address ?? ""}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              rows={2}
              className="input"
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </form>

        <div className="p-4 border-t border-border flex gap-3 shrink-0">
          <button onClick={submit} className="btn-primary flex-1">
            {editing ? "Save Changes" : "Create Contact"}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}