import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { clients as allClients } from "../data";
import {
  AlertTriangle,
  Calendar,
  FileWarning,
  Wallet,
  CheckSquare,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Item {
  icon: LucideIcon;
  tone: "danger" | "warning" | "info" | "primary";
  title: string;
  subtitle: string;
  to: string;
}

export default function NeedsAttention() {
  const matters = useStore((s) => s.matters);
  const tasks = useStore((s) => s.tasks);
  const invoices = useStore((s) => s.invoices);
  const trustTransactions = useStore((s) => s.trustTransactions);
  const trustThreshold = useStore((s) => s.trustThreshold);
  const currentUser = useStore((s) => s.currentUser)!;

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Overdue tasks
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "Done") return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    });
    if (overdueTasks.length > 0) {
      list.push({
        icon: CheckSquare,
        tone: "danger",
        title: `${overdueTasks.length} overdue task${overdueTasks.length === 1 ? "" : "s"}`,
        subtitle: overdueTasks
          .slice(0, 2)
          .map((t) => t.title)
          .join(", ") + (overdueTasks.length > 2 ? ` +${overdueTasks.length - 2}` : ""),
        to: "/tasks",
      });
    }

    // 2. Hearings in next 7 days
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcoming = matters.filter((m) => {
      if (m.status === "Closed" || !m.nextHearing) return false;
      const h = new Date(m.nextHearing);
      h.setHours(0, 0, 0, 0);
      return h >= today && h <= nextWeek;
    });
    if (upcoming.length > 0) {
      list.push({
        icon: Calendar,
        tone: "warning",
        title: `${upcoming.length} hearing${upcoming.length === 1 ? "" : "s"} in next 7 days`,
        subtitle:
          upcoming
            .slice(0, 2)
            .map((m) => m.title)
            .join(", ") + (upcoming.length > 2 ? ` +${upcoming.length - 2}` : ""),
        to: "/calendar",
      });
    }

    // 3. Overdue invoices (Sent + past dueDate)
    const overdueInvoices = invoices.filter((i) => {
      if (i.status !== "Sent") return false;
      const due = new Date(i.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    });
    if (overdueInvoices.length > 0) {
      const total = overdueInvoices.reduce((s, i) => s + i.amount, 0);
      list.push({
        icon: FileWarning,
        tone: "danger",
        title: `${overdueInvoices.length} overdue invoice${overdueInvoices.length === 1 ? "" : "s"}`,
        subtitle: `₱${total.toLocaleString()} outstanding`,
        to: "/billing",
      });
    }

    // 4. Low trust balances
    const clientBalances = allClients
      .map((c) => ({
        client: c,
        balance: trustTransactions
          .filter((t) => t.clientId === c.id)
          .reduce((s, t) => s + t.credit - t.debit, 0),
      }))
      .filter((x) => x.balance > 0 && x.balance < trustThreshold);

    if (clientBalances.length > 0) {
      list.push({
        icon: Wallet,
        tone: "warning",
        title: `${clientBalances.length} client${clientBalances.length === 1 ? "" : "s"} with low trust`,
        subtitle: `Below ₱${trustThreshold.toLocaleString()} — request top-up`,
        to: "/billing",
      });
    }

    return list;
  }, [matters, tasks, invoices, trustTransactions, trustThreshold]);

  // Hide for roles that don't need it (Secretary, Paralegal, Attorney)
  const rolesToShow = ["MNG_PARTNER", "SYS_ADMIN", "BILLING"];
  if (!currentUser.roles.some((r) => rolesToShow.includes(r))) return null;

  if (items.length === 0) {
    return (
      <div className="card border-l-4 border-l-success bg-success-light/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success-light flex items-center justify-center shrink-0">
            <CheckSquare size={18} className="text-success-ink" />
          </div>
          <div>
            <p className="font-semibold text-sm text-success-ink">
              You're all caught up
            </p>
            <p className="text-xs text-muted mt-0.5">
              No urgent items today.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const toneClasses: Record<Item["tone"], { card: string; icon: string; text: string }> = {
    danger: {
      card: "border-l-danger bg-danger-light/20",
      icon: "bg-danger-light text-danger-ink",
      text: "text-danger-ink",
    },
    warning: {
      card: "border-l-warning bg-warning-light/30",
      icon: "bg-warning-light text-warning-ink",
      text: "text-warning-ink",
    },
    info: {
      card: "border-l-info bg-info-light/20",
      icon: "bg-info-light text-info-ink",
      text: "text-info-ink",
    },
    primary: {
      card: "border-l-primary bg-primary-light/20",
      icon: "bg-primary-light text-primary-ink",
      text: "text-primary-ink",
    },
  };

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <AlertTriangle size={16} className="text-warning-ink" />
        <h2 className="font-semibold text-sm">Needs Attention</h2>
        <span className="text-xs text-muted">
          · {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item, i) => {
          const Icon = item.icon;
          const tone = toneClasses[item.tone];
          return (
            <li key={i}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 p-3 md:px-4 hover:bg-surface-hover transition-colors border-l-4 ${tone.card}`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tone.icon}`}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium text-sm ${tone.text}`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {item.subtitle}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}