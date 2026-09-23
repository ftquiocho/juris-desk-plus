import { Link } from "react-router-dom";
import type { Matter } from "../types";
import { useStore } from "../store/useStore";
import { clients } from "../data";
import StatusBadge from "./StatusBadge";
import { Calendar, Clock } from "lucide-react";

export default function MatterCard({ matter }: { matter: Matter }) {
  const timeEntries = useStore((s) => s.timeEntries);
  const client = clients.find((c) => c.id === matter.clientId);
  const entries = timeEntries.filter((t) => t.matterId === matter.id);
  const hours = entries.reduce((sum, t) => sum + t.duration, 0);
  const billable = entries.filter((t) => t.billable).reduce((sum, t) => sum + t.duration * t.rate, 0);

  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted">{matter.id}</p>
          <h3 className="font-semibold">{matter.title}</h3>
          <p className="text-sm text-muted">{client?.name}</p>
        </div>
        <StatusBadge status={matter.status} />
      </div>
      <div className="mt-4 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1"><Calendar size={14} /> {matter.nextHearing ?? "No hearing"}</span>
        <span className="flex items-center gap-1"><Clock size={14} /> {hours}h logged</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted">{matter.matterType} · {matter.billingType}</span>
        <span className="text-sm font-semibold text-primary">₱{billable.toLocaleString()}</span>
      </div>
      <Link to={`/matters/${matter.id}`} className="btn-primary block text-center mt-4 text-sm">
        Open Matter
      </Link>
    </div>
  );
}