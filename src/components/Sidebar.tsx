import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  CheckSquare,
  DollarSign,
  Settings,
  ScrollText,
  ShieldCheck,
  Calendar as CalIcon,
  Clock,
  X,
  BarChart3,
  Users,
  Briefcase,
  Contact as ContactIcon,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { can } from "../lib/permissions";
import { APP_CONFIG } from "../config";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const user = useStore((s) => s.currentUser)!;

  const items = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, perm: null },
    { to: "/intake", label: "Client Intake", icon: FilePlus2, perm: "intake:create" as const },
    { to: "/clients", label: "Clients", icon: Users, perm: "client:read" as const },
    { to: "/matters", label: "Matters", icon: Briefcase, perm: "matter:read" as const },
    { to: "/contacts", label: "Contacts", icon: ContactIcon, perm: null },
    { to: "/conflict", label: "Conflict Check", icon: ShieldCheck, perm: "conflict:run" as const },
    { to: "/calendar", label: "Calendar", icon: CalIcon, perm: null },
    { to: "/tasks", label: "Tasks", icon: CheckSquare, perm: null },
    { to: "/approvals", label: "Approvals", icon: CheckSquare, perm: "document:approve" as const },
    { to: "/time", label: "Time & Expenses", icon: Clock, perm: "time:create" as const },
    { to: "/billing", label: "Billing", icon: DollarSign, perm: "billing:view" as const },
    { to: "/reports", label: "Reports", icon: BarChart3, perm: "report:financial" as const },
    { to: "/admin", label: "Admin", icon: Settings, perm: "user:manage" as const },
    { to: "/audit", label: "Audit Log", icon: ScrollText, perm: "audit:read" as const },
  ];

  return (
    <aside className="h-full w-64 bg-bg border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0">
            {APP_CONFIG.logoInitials}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-text truncate">
              {APP_CONFIG.productName}
            </h1>
            <p className="text-[10px] text-muted uppercase tracking-wider truncate">
              Legal Practice
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden icon-btn"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {items.map((it) => {
          const allowed =
            it.to === "/admin"
              ? can(user.roles, "user:manage") || can(user.roles, "rate:manage")
              : !it.perm || can(user.roles, it.perm);
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-surface-hover text-text"
                    : "text-muted hover:bg-surface-hover hover:text-text"
                } ${!allowed ? "opacity-30 pointer-events-none" : ""}`
              }
              title={!allowed ? "You don't have permission for this" : ""}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand rounded-r-full" />
                  )}
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{it.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-muted text-center">
          © 2025 {APP_CONFIG.firmName}
        </p>
      </div>
    </aside>
  );
}