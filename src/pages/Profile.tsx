import { useStore } from "../store/useStore";
import { Mail, Shield, Briefcase, User as UserIcon, type LucideIcon } from "lucide-react";

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <Icon size={16} className="text-muted shrink-0" />
      <span className="text-xs uppercase tracking-wider text-muted w-24 shrink-0">
        {label}
      </span>
      <span className="text-sm text-text truncate">{value}</span>
    </div>
  );
}

export default function Profile() {
  const user = useStore((s) => s.currentUser)!;

  const initials = user.name
    .split(" ")
    .filter((p) => !p.includes("."))
    .map((p) => p[0])
    .slice(-2)
    .join("");

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">My Profile</h1>

      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-xl shadow-glow shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-text truncate">
              {user.name}
            </p>
            <p className="text-sm text-muted truncate">{user.title}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">Account Details</h2>
        <div>
          <Row icon={UserIcon} label="User ID" value={user.id} />
          <Row icon={Mail} label="Email" value={user.email} />
          <Row icon={Briefcase} label="Title" value={user.title} />
          <Row icon={Shield} label="Roles" value={user.roles.join(" · ")} />
        </div>
      </div>
    </div>
  );
}