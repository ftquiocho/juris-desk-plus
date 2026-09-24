import { useStore } from "../store/useStore";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../components/Toast";
import { Check, X } from "lucide-react";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonList } from "../components/Skeleton";

export default function Approvals() {
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);
  const documents = useStore((s) => s.documents);
  const approveDocument = useStore((s) => s.approveDocument);
  const rejectDocument = useStore((s) => s.rejectDocument);
  const addAuditEvent = useStore((s) => s.addAuditEvent);

  const pending = documents.filter((d) => d.status === "Pending Review");
  const loading = useDelayedLoading();

  const addNotification = useStore((s) => s.addNotification);

  const handleApprove = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    approveDocument(id, user.id);
    addAuditEvent({ id: `LOG-${Date.now()}`, userId: user.id, action: "Approved document", target: id, timestamp: new Date().toISOString() });
    push("Document approved and saved to matter.");
    if (doc) {
      addNotification({
        id: `NOT-${Date.now()}`,
        userId: doc.uploadedBy,
        title: "Document approved",
        body: `"${doc.title}" was approved by ${user.name}.`,
        link: `/matters/${doc.matterId}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleReject = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    rejectDocument(id);
    addAuditEvent({ id: `LOG-${Date.now()}`, userId: user.id, action: "Rejected document", target: id, timestamp: new Date().toISOString() });
    push("Document rejected. Submitter notified.", "info");
    if (doc) {
      addNotification({
        id: `NOT-${Date.now()}`,
        userId: doc.uploadedBy,
        title: "Document rejected",
        body: `"${doc.title}" was rejected by ${user.name}. Please review and resubmit.`,
        link: `/matters/${doc.matterId}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-1">Approvals Inbox</h1>
      <p className="text-sm text-muted mb-6">{pending.length} document(s) pending review.</p>

      {loading ? (
        <SkeletonList rows={3} />
      ) : (
      <div className="space-y-3">
        {pending.length === 0 && <div className="card text-sm text-muted">You're all caught up.</div>}
        {pending.map((d) => (
          <div key={d.id} className="card card-hover flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-medium">{d.title} <span className="text-muted text-xs">v{d.version}</span></p>
              <p className="text-xs text-muted mt-1">{d.id} · {d.matterId} · Confidential: {d.confidential ? "Yes" : "No"}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={d.status} />
              <button onClick={() => handleApprove(d.id)} className="btn-primary flex items-center gap-1 text-sm">
                <Check size={16} /> Approve
              </button>
              <button onClick={() => handleReject(d.id)} className="btn-danger flex items-center gap-1 text-sm">
                <X size={16} /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}