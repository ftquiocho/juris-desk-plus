import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { users as seedUsers } from "../data";
import {
  FileText,
  CheckCircle,
  Clock,
  UserPlus,
  Briefcase,
  DollarSign,
  Shield,
  Receipt,
  User,
  Pencil,
  type LucideIcon,
} from "lucide-react";

function pickIcon(action: string): LucideIcon {
  const a = action.toLowerCase();
  if (a.includes("document") || a.includes("draft")) return FileText;
  if (a.includes("approved") || a.includes("closed")) return CheckCircle;
  if (a.includes("time") || a.includes("logged")) return Clock;
  if (a.includes("created client") || a.includes("engagement")) return UserPlus;
  if (a.includes("matter")) return Briefcase;
  if (a.includes("invoice") || a.includes("payment")) return DollarSign;
  if (a.includes("conflict") || a.includes("consent")) return Shield;
  if (a.includes("expense")) return Receipt;
  if (a.includes("user")) return User;
  if (a.includes("updated") || a.includes("edited")) return Pencil;
  return CheckCircle;
}

function pickLink(action: string, target: string): string {
  const a = action.toLowerCase();
  if (a.includes("invoice") || a.includes("payment") || a.includes("trust"))
    return "/billing";
  if (a.includes("conflict")) return "/conflict";
  if (a.includes("task")) return "/tasks";
  if (a.includes("client") || a.includes("engagement")) return "/clients";
  if (a.includes("matter") || target.startsWith("M-")) return "/matters";
  if (a.includes("document")) return "/matters";
  if (a.includes("expense") || a.includes("time")) return "/time";
  if (a.includes("user")) return "/admin";
  return "/";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ActivityFeed({ limit = 12 }: { limit?: number }) {
  const auditLog = useStore((s) => s.auditLog);
  const storeUsers = useStore((s) => s.users);
  const users = storeUsers.length > 0 ? storeUsers : seedUsers;

  const events = auditLog.slice(0, limit);

  if (events.length === 0) {
    return (
      <div className="card">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Recent Activity</h2>
        </div>
        <div className="p-6 text-center">
          <Clock size={28} className="text-muted mx-auto mb-2" />
          <p className="text-sm text-text font-medium">No activity yet</p>
          <p className="text-xs text-muted mt-1">
            Actions across the firm will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-sm">Recent Activity</h2>
        <Link
          to="/audit"
          className="text-xs text-primary hover:text-brand-hover font-medium"
        >
          View all →
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {events.map((e) => {
          const Icon = pickIcon(e.action);
          const user = users.find((u) => u.id === e.userId);
          const link = pickLink(e.action, e.target);
          return (
            <li key={e.id}>
              <Link
                to={link}
                className="flex items-start gap-3 p-3 md:px-4 hover:bg-surface-hover transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-surface-hover flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={13} className="text-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text truncate">{e.action}</p>
                  <p className="text-xs text-muted truncate">
                    {user?.name ?? e.userId}
                    {e.target && e.target !== "—" && (
                      <span className="text-muted"> · {e.target}</span>
                    )}
                  </p>
                </div>
                <span className="text-[10px] text-muted shrink-0 mt-1">
                  {timeAgo(e.timestamp)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}