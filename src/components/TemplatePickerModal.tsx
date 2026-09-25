import { useState, useMemo } from "react";
import { X, FileText, Search, Check } from "lucide-react";
import { useStore } from "../store/useStore";
import { clients } from "../data";
import { documentTemplates, type DocTemplate } from "../data/templates";
import { useToast } from "./Toast";
import type { LegalDocument, Matter } from "../types";

export default function TemplatePickerModal({
  matter,
  onClose,
}: {
  matter: Matter;
  onClose: () => void;
}) {
  const addDocument = useStore((s) => s.addDocument);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const [query, setQuery] = useState("");
  const [pickedId, setPickedId] = useState<string | null>(null);

  const client = clients.find((c) => c.id === matter.clientId);

  const filtered: DocTemplate[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return documentTemplates;
    return documentTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const acc: Record<string, DocTemplate[]> = {};
    filtered.forEach((t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
    });
    return acc;
  }, [filtered]);

  const submit = () => {
    if (!pickedId) return;
    const tpl = documentTemplates.find((t) => t.id === pickedId);
    if (!tpl) return;

    const title = `${tpl.name} — ${client?.name ?? "Client"}${
      matter.title ? ` (${matter.title})` : ""
    }`;

    const doc: LegalDocument = {
      id: `DOC-${Date.now()}`,
      matterId: matter.id,
      title,
      status: "Draft",
      uploadedBy: user.id,
      version: 1,
      confidential: false,
      createdAt: new Date().toISOString().slice(0, 10),
      versions: [
        {
          version: 1,
          uploadedBy: user.id,
          uploadedAt: new Date().toISOString(),
          status: "Draft",
          notes: `Generated from template: ${tpl.name}`,
        },
      ],
    };

    addDocument(doc);
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: `Created draft from template: ${tpl.name}`,
      target: doc.id,
      timestamp: new Date().toISOString(),
    });
    push(`Draft "${tpl.name}" added to documents.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full max-w-[calc(100vw-0px)] md:max-w-3xl rounded-t-2xl md:rounded-2xl border border-border shadow-modal max-h-[85dvh] flex flex-col overflow-hidden">
        {/* Header — absolute close button, grid layout */}
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
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold truncate">New from Template</h2>
              <p className="text-xs text-muted truncate">
                {client?.name ?? "Client"} · {matter.title}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-2 focus-within:border-primary/50 transition-colors">
            <Search size={16} className="text-muted shrink-0" />
            <input
              className="w-full bg-transparent outline-none text-sm text-text placeholder:text-muted"
              placeholder="Search templates..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-muted hover:text-text shrink-0"
                aria-label="Clear"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">
              No templates match "{query}".
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([category, list]) => (
                <div key={category}>
                  <p className="text-[10px] uppercase tracking-wider text-muted mb-2 px-1">
                    {category} ({list.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {list.map((t) => {
                      const selected = pickedId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setPickedId(t.id)}
                          className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 text-left text-sm transition ${
                            selected
                              ? "border-primary bg-primary-light text-primary font-medium"
                              : "border-border hover:bg-surface-hover"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              selected
                                ? "bg-primary border-primary"
                                : "border-edge"
                            }`}
                          >
                            {selected && (
                              <Check size={10} className="text-white" />
                            )}
                          </span>
                          <span className="truncate">{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border flex gap-2 shrink-0 bg-elevated">
          <button
            onClick={submit}
            disabled={!pickedId}
            className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pickedId
              ? `Create "${
                  documentTemplates.find((t) => t.id === pickedId)?.name
                }"`
              : "Pick a template"}
          </button>
          <button onClick={onClose} className="btn-secondary px-4">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}