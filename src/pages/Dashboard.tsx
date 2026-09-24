import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { clients } from "../data";
import KpiCard from "../components/KpiCard";
import MatterCard from "../components/MatterCard";
import StatusBadge from "../components/StatusBadge";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonKpiGrid, SkeletonCards } from "../components/Skeleton";
import {
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Calendar,
  Clock,
} from "lucide-react";

type SortKey = "opened" | "title" | "client" | "hearing" | "status";
type SortDir = "asc" | "desc";
type ViewMode = "grid" | "list";

export default function Dashboard() {
  const user = useStore((s) => s.currentUser)!;
  const matters = useStore((s) => s.matters);
  const invoices = useStore((s) => s.invoices);
  const timeEntries = useStore((s) => s.timeEntries);
  const loading = useDelayedLoading();

  const [view, setView] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("opened");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const seesAllMatters =
    user.roles.includes("SYS_ADMIN") ||
    user.roles.includes("MNG_PARTNER") ||
    user.roles.includes("BILLING");

  const visibleMatters = seesAllMatters
    ? matters
    : matters.filter(
        (m) =>
          m.attorneyId === user.id ||
          m.paralegalId === user.id ||
          m.secretaryId === user.id
      );

  const sortedMatters = useMemo(() => {
    const list = [...visibleMatters];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "opened") cmp = a.openedAt.localeCompare(b.openedAt);
      else if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "client") {
        const ca = clients.find((c) => c.id === a.clientId)?.name ?? "";
        const cb = clients.find((c) => c.id === b.clientId)?.name ?? "";
        cmp = ca.localeCompare(cb);
      } else if (sortKey === "hearing") {
        cmp = (a.nextHearing ?? "9999-12-31").localeCompare(
          b.nextHearing ?? "9999-12-31"
        );
      } else if (sortKey === "status") {
        cmp = a.status.localeCompare(b.status);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [visibleMatters, sortKey, sortDir]);

  const revenue = invoices
    .filter((i) => i.status === "Paid")
    .reduce((s, i) => s + i.amount, 0);
  const unpaid = invoices.filter(
    (i) => i.status === "Sent" || i.status === "Overdue"
  ).length;
  const hours = timeEntries.reduce((s, t) => s + t.duration, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">
          Welcome, {user.name.split(" ").slice(-1)[0]}
        </h1>
        <p className="text-sm text-muted">
          Here's what's happening today.
        </p>
      </div>

      {loading ? (
        <SkeletonKpiGrid />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Active Matters"
            value={String(visibleMatters.length)}
          />
          <KpiCard
            label="Revenue (Paid)"
            value={`₱${revenue.toLocaleString()}`}
            accent="text-success"
          />
          <KpiCard
            label="Unpaid Invoices"
            value={String(unpaid)}
            accent="text-warning"
          />
          <KpiCard label="Hours Logged" value={`${hours}h`} />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {seesAllMatters ? "All Active Matters" : "My Matters"}
        </h2>
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-2.5 py-1.5">
            <ArrowUpDown size={14} className="text-muted shrink-0" />
            <select
              className="bg-transparent outline-none text-xs text-text cursor-pointer pr-1"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="opened">Date Opened</option>
              <option value="title">Matter Name</option>
              <option value="client">Client</option>
              <option value="hearing">Next Hearing</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
              className="text-muted hover:text-text transition-colors"
              aria-label="Toggle sort direction"
              title={sortDir === "asc" ? "Ascending" : "Descending"}
            >
              {sortDir === "asc" ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-border rounded-lg p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-md transition ${
                view === "grid"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-text"
              }`}
              aria-label="Grid view"
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-md transition ${
                view === "list"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-text"
              }`}
              aria-label="List view"
              title="List view"
            >
              <ListIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Matter list */}
      {loading ? (
        <SkeletonCards count={4} />
      ) : sortedMatters.length === 0 ? (
        <div className="card text-center py-12">
          <p className="font-medium text-text">No matters yet</p>
          <p className="text-sm text-muted mt-1">
            {seesAllMatters
              ? "Create a matter to get started."
              : "You'll see matters here once assigned."}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMatters.map((m) => (
            <MatterCard key={m.id} matter={m} />
          ))}
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <div className="divide-y divide-border">
            {sortedMatters.map((m) => {
              const client = clients.find((c) => c.id === m.clientId);
              const entries = timeEntries.filter(
                (t) => t.matterId === m.id
              );
              const hours = entries.reduce((s, t) => s + t.duration, 0);
              return (
                <Link
                  key={m.id}
                  to={`/matters/${m.id}`}
                  className="flex items-center justify-between gap-3 p-3 md:px-4 hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="hidden md:flex w-10 h-10 rounded-lg bg-primary-light text-primary items-center justify-center shrink-0">
                      <span className="font-mono text-xs">
                        {m.id.split("-").pop()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{m.title}</p>
                      <p className="text-xs text-muted truncate">
                        {m.id} · {client?.name ?? "—"} · {m.matterType}
                      </p>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center gap-4 text-xs text-muted shrink-0">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {m.nextHearing ?? "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {hours}h
                    </span>
                  </div>
                  <StatusBadge status={m.status} />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}