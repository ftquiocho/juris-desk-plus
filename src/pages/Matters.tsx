import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { clients, users } from "../data";
import StatusBadge from "../components/StatusBadge";
import NewMatterModal from "../components/NewMatterModal";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonList } from "../components/Skeleton";
import {
  Search,
  Briefcase,
  Plus,
  X,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const statusFilters = ["All", "Open", "On Hold", "Closed"] as const;

type SortKey = "title" | "client" | "attorney" | "nextHearing" | "openedAt";
type SortDir = "asc" | "desc";

export default function Matters() {
  const matters = useStore((s) => s.matters);
  const currentUser = useStore((s) => s.currentUser)!;
  const loading = useDelayedLoading();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("All");
  const [sortKey, setSortKey] = useState<SortKey>("nextHearing");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [showNew, setShowNew] = useState(false);

  const canCreate =
    currentUser.roles.includes("ATTORNEY") ||
    currentUser.roles.includes("MNG_PARTNER") ||
    currentUser.roles.includes("PARALEGAL");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = matters.filter((m) => {
      const client = clients.find((c) => c.id === m.clientId);
      const matchesQuery =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        (client?.name ?? "").toLowerCase().includes(q);
      const matchesStatus = status === "All" || m.status === status;
      return matchesQuery && matchesStatus;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "client") {
        const ca = clients.find((c) => c.id === a.clientId)?.name ?? "";
        const cb = clients.find((c) => c.id === b.clientId)?.name ?? "";
        cmp = ca.localeCompare(cb);
      } else if (sortKey === "attorney") {
        const ua = users.find((u) => u.id === a.attorneyId)?.name ?? "";
        const ub = users.find((u) => u.id === b.attorneyId)?.name ?? "";
        cmp = ua.localeCompare(ub);
      } else if (sortKey === "nextHearing") {
        cmp = (a.nextHearing ?? "").localeCompare(b.nextHearing ?? "");
      } else if (sortKey === "openedAt") {
        cmp = a.openedAt.localeCompare(b.openedAt);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [matters, query, status, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageClamped = Math.min(page, totalPages);
  const paged = filtered.slice((pageClamped - 1) * perPage, pageClamped * perPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return <ArrowUpDown size={12} className="text-muted/50 ml-1 inline" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-primary ml-1 inline" />
    ) : (
      <ChevronDown size={12} className="text-primary ml-1 inline" />
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start md:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Matters</h1>
          <p className="text-sm text-muted">
            {matters.length} total · {filtered.length} shown
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowNew(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            New Matter
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 bg-surface border border-border rounded-lg px-3 py-2 focus-within:border-primary/50 transition-colors">
        <Search size={16} className="text-muted shrink-0" />
        <input
          className="w-full bg-transparent outline-none text-sm text-text placeholder:text-muted"
          placeholder="Search matters by title, ID, or client..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-muted hover:text-text"
            aria-label="Clear"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-1">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
              status === s
                ? "bg-brand text-white border-brand"
                : "bg-surface text-muted border-border hover:bg-surface-hover hover:border-edge"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList rows={6} />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase size={40} className="text-muted mx-auto mb-3" />
          <p className="font-medium">No matters match your search</p>
          <p className="text-sm text-muted mt-1">
            Try a different search term or filter.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface border-b border-border">
                  <tr className="text-left text-muted text-xs uppercase tracking-wider">
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-text select-none"
                      onClick={() => handleSort("title")}
                    >
                      Matter <SortIcon col="title" />
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-text select-none"
                      onClick={() => handleSort("client")}
                    >
                      Client <SortIcon col="client" />
                    </th>
                    <th className="py-3 px-4">Court</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-text select-none"
                      onClick={() => handleSort("attorney")}
                    >
                      Attorney <SortIcon col="attorney" />
                    </th>
                    <th className="py-3 px-4">Billing</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-text select-none"
                      onClick={() => handleSort("nextHearing")}
                    >
                      Next <SortIcon col="nextHearing" />
                    </th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((m) => {
                    const client = clients.find((c) => c.id === m.clientId);
                    const attorney = users.find((u) => u.id === m.attorneyId);
                    return (
                      <tr
                        key={m.id}
                        className="border-b border-border hover:bg-surface-hover transition-colors"
                      >
                        <td className="py-3 px-4">
                          <Link
                            to={`/matters/${m.id}`}
                            className="block min-w-0"
                          >
                            <p className="font-medium truncate">{m.title}</p>
                            <p className="text-xs text-muted font-mono truncate">
                              {m.id} · {m.matterType}
                            </p>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-xs truncate max-w-[200px]">
                          {client?.name ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-xs truncate max-w-[160px]">
                          {m.court ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-xs truncate max-w-[160px]">
                          {attorney?.name ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-xs">{m.billingType}</td>
                        <td className="py-3 px-4 text-xs">
                          {m.nextHearing ?? "—"}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={m.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {paged.map((m) => {
              const client = clients.find((c) => c.id === m.clientId);
              return (
                <Link
                  key={m.id}
                  to={`/matters/${m.id}`}
                  className="card block text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{m.title}</p>
                      <p className="text-xs text-muted truncate">
                        {m.id} · {client?.name ?? "—"}
                      </p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                    <span>{m.matterType}</span>
                    <span>·</span>
                    <span>{m.nextHearing ?? "No hearing"}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-muted text-xs">
                Showing{" "}
                <strong className="text-text">
                  {(pageClamped - 1) * perPage + 1}–
                  {Math.min(pageClamped * perPage, filtered.length)}
                </strong>{" "}
                of <strong className="text-text">{filtered.length}</strong>
              </span>
              <select
                className="input !w-auto !py-1 !text-xs"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={pageClamped === 1}
                className="btn-secondary !py-1 !px-2 text-xs disabled:opacity-30"
              >
                «
              </button>
              <button
                onClick={() => setPage(pageClamped - 1)}
                disabled={pageClamped === 1}
                className="btn-secondary !py-1 !px-2 text-xs disabled:opacity-30"
              >
                ‹
              </button>
              <span className="px-3 text-xs text-muted">
                Page <strong className="text-text">{pageClamped}</strong> of{" "}
                {totalPages}
              </span>
              <button
                onClick={() => setPage(pageClamped + 1)}
                disabled={pageClamped === totalPages}
                className="btn-secondary !py-1 !px-2 text-xs disabled:opacity-30"
              >
                ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={pageClamped === totalPages}
                className="btn-secondary !py-1 !px-2 text-xs disabled:opacity-30"
              >
                »
              </button>
            </div>
          </div>
        </>
      )}

      {showNew && <NewMatterModal onClose={() => setShowNew(false)} />}
    </div>
  );
}