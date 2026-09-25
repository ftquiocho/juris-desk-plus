import { useParams, Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { clients, users } from "../data";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../components/Toast";
import { can } from "../lib/permissions";
import { useState, useRef } from "react";
import { Upload, UserCheck } from "lucide-react";
import DelegateModal from "../components/DelegateModal";
import NewMatterModal from "../components/NewMatterModal";
import TemplatePickerModal from "../components/TemplatePickerModal";
import { Pencil } from "lucide-react";
import { X, CheckCircle2, History, Upload as UploadIcon, Printer, FileText } from "lucide-react";
import { printWindow } from "../lib/printWindow";
import type { LegalDocument } from "../types";

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
  const [showClose, setShowClose] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [versioningDoc, setVersioningDoc] = useState<LegalDocument | null>(null);
  const [historyDoc, setHistoryDoc] = useState<LegalDocument | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const matter = matters.find((m) => m.id === id);

  if (!matter) {
    return <div className="card text-sm text-muted">Matter not found.</div>;
  }

  const client = clients.find((c) => c.id === matter.clientId);
  const documents = allDocuments.filter((d) => d.matterId === matter.id);
  const canDelegate = can(user.roles, "matter:delegate") && matter.attorneyId === user.id;
  const canClose = can(user.roles, "matter:close") && matter.status !== "Closed";

  const time = allTime.filter((t) => t.matterId === matter.id);
  const matterDelegations = delegations.filter((d) => d.matterId === matter.id);
  const canUpload = can(user.roles, "document:upload");
    const handlePrint = () => {
    const client = clients.find((c) => c.id === matter.clientId);
    const atty = users.find((u) => u.id === matter.attorneyId);
    const para = matter.paralegalId
      ? users.find((u) => u.id === matter.paralegalId)
      : null;

    const docRows = documents
      .map(
        (d) => `
        <tr>
          <td>${d.title}</td>
          <td class="right">v${d.version}</td>
          <td>${d.status}</td>
          <td>${new Date(d.createdAt).toLocaleDateString()}</td>
        </tr>`
      )
      .join("");

    const timeRows = time
      .map((t) => {
        const owner = users.find((u) => u.id === t.userId);
        return `
          <tr>
            <td>${t.date}</td>
            <td>${t.activity}</td>
            <td>${owner?.name ?? "—"}</td>
            <td class="right">${t.duration}h</td>
            <td class="right">${t.billable ? "₱" + (t.duration * t.rate).toLocaleString() : "—"}</td>
          </tr>`;
      })
      .join("");

    const totalHours = time.reduce((s, t) => s + t.duration, 0);
    const totalBillable = time
      .filter((t) => t.billable)
      .reduce((s, t) => s + t.duration * t.rate, 0);

    const html = `
      <h2>${matter.title}</h2>
      <p class="muted">${matter.id} · ${client?.name ?? "—"} · ${matter.matterType}</p>

      <div class="grid-2" style="margin-top:16px">
        <div class="card">
          <h3>Case Information</h3>
          <p><span class="label">Client</span><br/>${client?.name ?? "—"}</p>
          <p><span class="label">Court</span><br/>${matter.court ?? "—"}</p>
          <p><span class="label">Status</span><br/>${matter.status}</p>
          <p><span class="label">Billing Type</span><br/>${matter.billingType}</p>
        </div>
        <div class="card">
          <h3>Key Dates &amp; Team</h3>
          <p><span class="label">Opened</span><br/>${matter.openedAt}</p>
          <p><span class="label">Next Hearing</span><br/>${matter.nextHearing ?? "—"}</p>
          <p><span class="label">Attorney</span><br/>${atty?.name ?? "—"}</p>
          <p><span class="label">Paralegal</span><br/>${para?.name ?? "—"}</p>
        </div>
      </div>

      <h2>Documents (${documents.length})</h2>
      ${
        documents.length
          ? `<table>
              <thead><tr><th>Title</th><th class="right">Ver.</th><th>Status</th><th>Uploaded</th></tr></thead>
              <tbody>${docRows}</tbody>
            </table>`
          : '<p class="muted">No documents uploaded.</p>'
      }

      <h2>Time Entries (${time.length})</h2>
      ${
        time.length
          ? `<table>
              <thead><tr><th>Date</th><th>Activity</th><th>User</th><th class="right">Hours</th><th class="right">Amount</th></tr></thead>
              <tbody>${timeRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="right"><strong>Totals</strong></td>
                  <td class="right"><strong>${totalHours.toFixed(1)}h</strong></td>
                  <td class="right"><strong>₱${totalBillable.toLocaleString()}</strong></td>
                </tr>
              </tfoot>
            </table>`
          : '<p class="muted">No time logged.</p>'
      }`;

    printWindow(`Matter Summary — ${matter.id}`, html);
  };

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
        <Link to="/" className="text-xs text-muted hover:underline no-print">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <h1 className="text-xl md:text-2xl font-bold">{matter.title}</h1>
          <StatusBadge status={matter.status} />
          <button
            onClick={() => setShowEdit(true)}
            className="btn-secondary flex items-center gap-1 text-xs py-1 px-2"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={handlePrint}
            className="btn-secondary flex items-center gap-1 text-xs py-1 px-2 no-print"
          >
            <Printer size={14} />
            Print
          </button>
          {canDelegate && (
            <button
              onClick={() => setShowDelegate(true)}
              className="btn-secondary flex items-center gap-1 text-xs py-1 px-2"
            >
              <UserCheck size={14} />
              Delegate
            </button>
          )}
          {canClose && (
            <button
              onClick={() => setShowClose(true)}
              className="btn-secondary flex items-center gap-1 text-xs py-1 px-2"
            >
              <CheckCircle2 size={14} />
              Close Matter
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
                ? "border-brand text-text font-semibold"
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
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowTemplates(true)}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                New from Template
              </button>
            </div>
          )}
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
                className="flex items-center justify-between py-3 text-sm gap-3 flex-wrap"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    {d.title}{" "}
                    <span className="text-muted text-xs">v{d.version}</span>
                  </p>
                  <p className="text-xs text-muted truncate">
                    Uploaded {new Date(d.createdAt).toLocaleDateString()}
                    {d.confidential && " · Confidential"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <StatusBadge status={d.status} />
                  <button
                    onClick={() => setHistoryDoc(d)}
                    className="icon-btn icon-btn-sm"
                    title="Version history"
                    aria-label="Version history"
                  >
                    <History size={14} />
                  </button>
                  {canUpload && (
                    <button
                      onClick={() => setVersioningDoc(d)}
                      className="icon-btn icon-btn-primary icon-btn-sm"
                      title="Upload new version"
                      aria-label="Upload new version"
                    >
                      <UploadIcon size={14} />
                    </button>
                  )}
                </div>
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
      {showTemplates && (
        <TemplatePickerModal
          matter={matter}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {versioningDoc && (
        <UploadVersionModal
          doc={versioningDoc}
          onClose={() => setVersioningDoc(null)}
        />
      )}

      {historyDoc && (
        <VersionHistoryModal
          doc={historyDoc}
          onClose={() => setHistoryDoc(null)}
        />
      )}

      {showEdit && (
        <NewMatterModal
          editing={matter}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showDelegate && (
        <DelegateModal
          matterId={matter.id}
          onClose={() => setShowDelegate(false)}
        />
      )}

      {showClose && (
        <CloseMatterModal
          matterId={matter.id}
          onClose={() => setShowClose(false)}
        />
      )}
    </div>
  );
}

function UploadVersionModal({
  doc,
  onClose,
}: {
  doc: LegalDocument;
  onClose: () => void;
}) {
  const uploadNewVersion = useStore((s) => s.uploadNewVersion);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const [notes, setNotes] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const submit = () => {
    if (!fileName) {
      push("Please select a file.", "error");
      return;
    }
    uploadNewVersion(doc.id, user.id, notes);
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: "Uploaded new document version",
      target: doc.id,
      timestamp: new Date().toISOString(),
    });
    push(`New version of "${doc.title}" submitted for review.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-lg rounded-t-2xl md:rounded-2xl border border-border shadow-modal max-h-[85dvh] flex flex-col overflow-hidden">
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
              <UploadIcon size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold truncate">
                Upload New Version (v{doc.version + 1})
              </h2>
              <p className="text-xs text-muted truncate">{doc.title}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-muted">
            Uploading a new version of <strong>{doc.title}</strong> will set
            its status back to <strong>Pending Review</strong>.
          </p>

          <div
            onClick={() => fileInput.current?.click()}
            className="card border-2 border-dashed border-border hover:border-primary/40 cursor-pointer flex flex-col items-center justify-center py-6 text-center transition"
          >
            <UploadIcon size={24} className="text-muted mb-2" />
            <p className="text-sm font-medium">
              {fileName || "Click to select a file"}
            </p>
            <p className="text-xs text-muted mt-1">
              PDF, DOCX, XLSX, JPG, PNG
            </p>
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFileName(f.name);
              }}
            />
          </div>

          <div>
            <label className="label">Version Notes (optional)</label>
            <textarea
              rows={2}
              className="input"
              placeholder="e.g., Revised per client feedback"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-3">
          <button onClick={submit} className="btn-primary flex-1">
            Upload v{doc.version + 1}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function VersionHistoryModal({
  doc,
  onClose,
}: {
  doc: LegalDocument;
  onClose: () => void;
}) {
  const users = useStore((s) => s.users);
  const versions =
    doc.versions ??
    [
      {
        version: doc.version,
        uploadedBy: doc.uploadedBy,
        uploadedAt: doc.createdAt,
        status: doc.status,
      },
    ];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-lg rounded-t-2xl md:rounded-2xl border border-border shadow-modal max-h-[80dvh] flex flex-col overflow-hidden">
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
              <History size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold truncate">{doc.title}</h2>
              <p className="text-xs text-muted">
                Version history · {versions.length} version{versions.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs uppercase tracking-wider text-muted mb-3">
            Version History ({versions.length})
          </p>
          <ul className="space-y-2">
            {[...versions].reverse().map((v) => {
              const uploader = users.find((u) => u.id === v.uploadedBy);
              return (
                <li key={v.version} className="card !p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">
                        Version {v.version}
                        {v.version === doc.version && (
                          <span className="ml-2 text-xs text-primary">
                            (current)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {uploader?.name ?? "—"} ·{" "}
                        {new Date(v.uploadedAt).toLocaleString()}
                      </p>
                      {v.notes && (
                        <p className="text-xs text-muted mt-1 italic">
                          "{v.notes}"
                        </p>
                      )}
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CloseMatterModal({
  matterId,
  onClose,
}: {
  matterId: string;
  onClose: () => void;
}) {
  const storeMatters = useStore((s) => s.matters);
  const trustTransactions = useStore((s) => s.trustTransactions);
  const invoices = useStore((s) => s.invoices);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  // Use a direct setter via useStore API — no dedicated action needed
  const setState = useStore.setState;

  const matter = storeMatters.find((m) => m.id === matterId);
  const clientId = matter?.clientId;

  const trustBalance = trustTransactions
    .filter((t) => t.clientId === clientId)
    .reduce((s, t) => s + t.credit - t.debit, 0);

  const unpaid = invoices.filter(
    (i) =>
      i.clientId === clientId &&
      (i.status === "Draft" || i.status === "Sent" || i.status === "Overdue")
  ).length;

  const [notes, setNotes] = useState("");

  const close = () => {
    setState((s) => ({
      matters: s.matters.map((m) =>
        m.id === matterId ? { ...m, status: "Closed" as const } : m
      ),
    }));
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: "Closed matter",
      target: matterId,
      timestamp: new Date().toISOString(),
    });
    push(`Matter ${matterId} closed.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-md rounded-t-2xl md:rounded-2xl border border-border shadow-modal max-h-[85dvh] flex flex-col overflow-hidden">
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
              <CheckCircle2 size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold truncate">Close Matter</h2>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-muted">
            Closing this matter will mark it as <strong>Closed</strong> and
            archive it read-only. This action is audit-logged.
          </p>

          {(trustBalance > 0 || unpaid > 0) && (
            <div className="card bg-warning-light/20 border-warning/30 !p-3">
              <p className="text-sm font-medium text-warning-ink mb-1">
                Heads up — outstanding items
              </p>
              <ul className="text-xs text-muted space-y-1">
                {trustBalance > 0 && (
                  <li>
                    • Unapplied trust balance: ₱
                    {trustBalance.toLocaleString()} — return to client or apply
                    before closing
                  </li>
                )}
                {unpaid > 0 && (
                  <li>
                    • {unpaid} unpaid invoice{unpaid === 1 ? "" : "s"} — collect
                    or write off first
                  </li>
                )}
              </ul>
            </div>
          )}

          <div>
            <label className="label">Closing Notes (optional)</label>
            <textarea
              className="input"
              rows={3}
              placeholder="e.g., Case settled. Final invoice sent."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={close} className="btn-primary flex-1">
              Close Matter
            </button>
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}