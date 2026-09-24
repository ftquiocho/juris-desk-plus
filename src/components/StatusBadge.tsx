import {
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Send,
  AlertTriangle,
  Pause,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, { cls: string; Icon: LucideIcon }> = {
  Draft: {
    cls: "bg-surface-hover text-muted border-edge",
    Icon: FileText,
  },
  Pending: {
    cls: "bg-warning-light text-warning-ink border-warning/20",
    Icon: Clock,
  },
  "Pending Review": {
    cls: "bg-warning-light text-warning-ink border-warning/20",
    Icon: Clock,
  },
  Approved: {
    cls: "bg-success-light text-success-ink border-success/20",
    Icon: CheckCircle,
  },
  Rejected: {
    cls: "bg-danger-light text-danger-ink border-danger/20",
    Icon: XCircle,
  },
  Open: {
    cls: "bg-primary-light text-primary-ink border-primary/30",
    Icon: Clock,
  },
  "On Hold": {
    cls: "bg-warning-light text-warning-ink border-warning/20",
    Icon: Pause,
  },
  Closed: {
    cls: "bg-surface-hover text-muted border-edge",
    Icon: CheckCircle,
  },
  Sent: {
    cls: "bg-info-light text-info-ink border-info/20",
    Icon: Send,
  },
  Paid: {
    cls: "bg-success-light text-success-ink border-success/20",
    Icon: CheckCircle,
  },
  Overdue: {
    cls: "bg-danger-light text-danger-ink border-danger/20",
    Icon: AlertTriangle,
  },
  Unpaid: {
    cls: "bg-warning-light text-warning-ink border-warning/20",
    Icon: AlertTriangle,
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg =
    map[status] ?? {
        cls: "bg-surface-hover text-muted border-edge",
      Icon: FileText,
    };
  const { Icon } = cfg;
  return (
    <span className={`badge ${cfg.cls}`}>
      <Icon size={12} />
      {status}
    </span>
  );
}