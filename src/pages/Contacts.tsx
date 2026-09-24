import { useMemo, useState } from "react";
import { useStore } from "../store/useStore";
import { Search, Users, Plus, Pencil, Trash2, Mail, Phone, Building2, X } from "lucide-react";
import ContactModal from "../components/ContactModal";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonList } from "../components/Skeleton";
import type { Contact, ContactType } from "../types";

const typeFilters: ("All" | ContactType)[] = [
  "All",
  "Opposing Party",
  "Opposing Counsel",
  "Court",
  "Prosecutor",
  "Expert Witness",
  "Process Server",
  "Notary Public",
  "Witness",
];

const typeColors: Record<ContactType, string> = {
  "Opposing Party": "bg-danger-light text-danger",
  "Opposing Counsel": "bg-warning-light text-warning",
  Court: "bg-info-light text-info",
  Prosecutor: "bg-warning-light text-warning",
  "Expert Witness": "bg-primary-light text-primary",
  "Process Server": "bg-surface-hover text-muted",
  "Notary Public": "bg-success-light text-success",
  Witness: "bg-surface-hover text-muted",
};

export default function Contacts() {
  const contacts = useStore((s) => s.contacts);
  const removeContact = useStore((s) => s.removeContact);
  const loading = useDelayedLoading();

  const [query, setQuery] = useState("");
  const [type, setType] = useState<"All" | ContactType>("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return contacts.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.organization ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q);
      const matchesType = type === "All" || c.type === type;
      return matchesQuery && matchesType;
    });
  }, [contacts, query, type]);

  const editingContact = editingId
    ? contacts.find((c) => c.id === editingId)
    : undefined;

  return (
    <div className="space-y-5">
      <div className="flex items-start md:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Contacts</h1>
          <p className="text-sm text-muted">
            {contacts.length} total · {filtered.length} shown
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          New Contact
        </button>
      </div>

      <div className="flex items-center gap-3 bg-surface border border-border rounded-lg px-3 py-2 focus-within:border-primary/50 transition-colors">
        <Search size={16} className="text-muted shrink-0" />
        <input
          className="w-full bg-transparent outline-none text-sm text-text placeholder:text-muted"
          placeholder="Search by name, organization, or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="icon-btn icon-btn-sm"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-1">
        {typeFilters.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
              type === t
                ? "bg-primary text-white border-primary"
                : "bg-surface text-muted border-border hover:bg-surface-hover hover:border-edge"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList rows={6} />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={40} className="text-muted mx-auto mb-3" />
          <p className="font-medium">No contacts match</p>
          <p className="text-sm text-muted mt-1">
            Try a different search or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="card card-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{c.name}</p>
                  <span
                    className={`badge ${typeColors[c.type] ?? "bg-surface-hover text-muted"} mt-1`}
                  >
                    {c.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditingId(c.id)}
                    className="icon-btn icon-btn-primary icon-btn-sm"
                    title="Edit"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${c.name}?`)) {
                        removeContact(c.id);
                      }
                    }}
                    className="icon-btn icon-btn-danger icon-btn-sm"
                    title="Delete"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-muted">
                {c.organization && (
                  <p className="flex items-center gap-1.5 truncate">
                    <Building2 size={12} className="shrink-0" />
                    {c.organization}
                  </p>
                )}
                {c.email && (
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail size={12} className="shrink-0" />
                    {c.email}
                  </p>
                )}
                {c.phone && (
                  <p className="flex items-center gap-1.5 truncate">
                    <Phone size={12} className="shrink-0" />
                    {c.phone}
                  </p>
                )}
              </div>

              {c.notes && (
                <p className="text-xs text-muted mt-3 pt-3 border-t border-border line-clamp-2">
                  {c.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && <ContactModal onClose={() => setShowForm(false)} />}
      {editingContact && (
        <ContactModal
          editing={editingContact}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}