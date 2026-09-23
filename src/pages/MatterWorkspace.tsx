import { useParams, Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { clients, users } from "../data";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../components/Toast";
import { can } from "../lib/permissions";
import { useState, useRef } from "react";
import { Upload, UserCheck } from "lucide-react";
import DelegateModal from "../components/DelegateModal";

const tabs = ["Overview", "Documents", "Time", "Billing"] as const;

export default function MatterWorkspace() {
  const { id } = useParams<{ id: string }>();
  const matters = useStore((s) => s.matters);
  const allDocuments = useStore((s) => s.documents);
  const allTime = useStore((s) => s.timeEntries);
  const delegations = useStore((s) => s.delegations);
  const addDocument = useStore((s) => s.addDocument);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [dragging, setDragging] = useState(false);
  const [showDelegate, setShowDelegate] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const matter = matters.find((m) => m.id === id);

  if (!matter) {
    return <div className="card text-sm text-muted">Matter not found.</div>;
  }

  const client = clients.find((c) => c.id === matter.clientId);
  const documents = allDocuments.filter((d) => d.matterId === matter.id);
  const time = allTime.filter((t) => t.matterId === matter.id);
  const matterDelegations = delegations.filter((d) => d.matterId === matter.id);

  const canUpload = can(user.roles, "document:upload");
  const canDelegate =
    can(user.roles, "matter:delegate") && matter.attorneyId === user.id;

  const handleUpload = (fileName: string) => {
    const cleanName = fileName.replace(/\.[^.]+$/, "");
    const doc = {
      id: `DOC-${Date.now()}`,
      matterId: matter.id,
      title: cleanName,
      status: "Pending Review" as const,
      uploadedBy: user.id,
      version: 1,
      confidential: false,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    addDocument(doc);
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: "Uploaded document",
      target: doc.id,
      timestamp: new Date().toISOString(),
    });
    push(`Document "${cleanName}" uploaded for review.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-xs text-muted hover:underline">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <h1 className="text-xl md:text-2xl font-bold">{matter.title}</h1>
          <StatusBadge status={matter.status} />
          {canDelegate && (
            <button
              onClick={() => setShowDelegate(true)}
              className="btn-secondary flex items-center gap-1 text-xs py-1 px-2"
            >
              <UserCheck size={14} />
              Delegate
            </button>
          )}
        </div>
        <p className="text-sm text-muted mt-1">
          {matter.id} · {client?.name} · {matter.matterType} ·{" "}
          {matter.court ?? "No court"}
        </p>
      </div>

      <div className="border-b border-border flex gap-1 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="card">
              <h3 className="font-semibold mb-3">Key Dates</h3>
              <p className="text-sm text-muted">Opened: {matter.openedAt}</p>
              <p className="text-sm text-muted">
                Next Hearing: {matter.nextHearing ?? "—"}
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-3">Billing</h3>
              <p className="text-sm text-muted">Type: {matter.billingType}</p>
            </div>
          </div>

          {matterDelegations.length > 0 && (
            <div className="card border-l-4 border-l-info bg-info-light/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <UserCheck size={16} className="text-info" />
                Active Delegations
              </h3>
              <ul className="space-y-2">
                {matterDelegations.map((d) => {
                  const delegate = users.find((u) => u.id === d.delegateId);
                  return (
                    <li key={d.id} className="text-sm text-muted">
                      <span className="font-medium text-text">
                        {delegate?.name}
                      </span>{" "}
                      — {d.startDate} to {d.endDate} (
                      {d.scope === "firm" ? "all matters" : "this matter"})
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === "Documents" && (
        <div className="space-y-4">
          {canUpload && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) handleUpload(files[0].name);
              }}
              onClick={() => fileInput.current?.click()}
              className={`card border-2 border-dashed cursor-pointer flex flex-col items-center justify-center py-8 text-center transition-all duration-150 ${
                dragging
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <Upload size={28} className="text-muted mb-2" />
              <p className="font-medium text-sm">
                Drag & drop a file, or tap to browse
              </p>
              <p className="text-xs text-muted mt-1">
                PDF, DOCX, XLSX, JPG, PNG (max 50 MB)
              </p>
              <input
                ref={fileInput}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f.name);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold mb-3">
              Documents ({documents.length})
            </h3>
            {documents.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">
                No documents yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {documents.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between py-3 text-sm gap-3"
                  >
                    <span className="truncate">
                      {d.title}{" "}
                      <span className="text-muted text-xs">v{d.version}</span>
                    </span>
                    <StatusBadge status={d.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "Time" && (
        <div className="card">
          <h3 className="font-semibold mb-3">
            Time Entries ({time.length})
          </h3>
          {time.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">
              No time logged.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {time.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span>
                    {t.activity} — {t.duration}h{" "}
                    {t.billable && (
                      <span className="text-success text-xs">(billable)</span>
                    )}
                  </span>
                  <span className="font-medium">
                    ₱{(t.duration * t.rate).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "Billing" && (
        <div className="card">
          <h3 className="font-semibold mb-3">Billing Summary</h3>
          <p className="text-sm text-muted">Type: {matter.billingType}</p>
          <p className="text-sm text-muted mt-2">
            Full invoicing is available in the Billing Center.
          </p>
        </div>
      )}

      {showDelegate && (
        <DelegateModal
          matterId={matter.id}
          onClose={() => setShowDelegate(false)}
        />
      )}
    </div>
  );
}