import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { Search, Building2, User, Upload, ArrowUpDown, ChevronDown, ChevronUp, X } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ImportClientsModal from "../components/ImportClientsModal";
import NewMatterModal from "../components/NewMatterModal";
import EditClientModal from "../components/EditClientModal";
import { Plus, Pencil } from "lucide-react";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonList } from "../components/Skeleton";

const caseTypes = [
  "All",
  "Family Law",
  "Criminal",
  "Civil",
  "Corporate",
  "Labor",
  "Notarial",
];

type SortKey = "name" | "caseType" | "matters" | "createdAt";
type SortDir = "asc" | "desc";

export default function Clients() {
  const clients = useStore((s) => s.clients);
  const matters = useStore((s) => s.matters);
  const loading = useDelayedLoading();

  const [query, setQuery] = useState("");
  const [caseType, setCaseType] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [newMatterForClient, setNewMatterForClient] = useState<string | null>(null);
  const [editClientId, setEditClientId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = clients.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.fileNumber ?? "").toLowerCase().includes(q) ||
        (c.clientNumber ?? "").toLowerCase().includes(q);
      const matchesType = caseType === "All" || c.caseType === caseType;
      return matchesQuery && matchesType;
    });

    const matterCount = (id: string) =>
      matters.filter((m) => m.clientId === id).length;

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "caseType") cmp = a.caseType.localeCompare(b.caseType);
      else if (sortKey === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt);
      else if (sortKey === "matters")
        cmp = matterCount(a.id) - matterCount(b.id);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [clients, matters, query, caseType, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageClamped = Math.min(page, totalPages);
  const paged = filtered.slice(
    (pageClamped - 1) * perPage,
    pageClamped * perPage
  );

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
          <h1 className="text-xl md:text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted">
            {clients.length} total · {filtered.length} shown
          </p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <Upload size={16} />
          Import CSV
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-surface border border-border rounded-lg px-3 py-2 focus-within:border-primary/50 transition-colors">
        <Search size={16} className="text-muted shrink-0" />
        <input
          className="w-full bg-transparent outline-none text-sm text-text placeholder:text-muted"
          placeholder="Search by name, email, file number, or client number..."
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

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-1">
        {caseTypes.map((t) => (
          <button
            key={t}
            onClick={() => {
              setCaseType(t);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
              caseType === t
                ? "bg-brand text-white border-brand"
                : "bg-surface text-muted border-border hover:bg-surface-hover hover:border-edge"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Loading / empty / data */}
      {loading ? (
        <SkeletonList rows={6} />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <User size={40} className="text-muted mx-auto mb-3" />
          <p className="font-medium">No clients match your search</p>
          <p className="text-sm text-muted mt-1">
            Try a different name or filter.
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
                      onClick={() => handleSort("name")}
                    >
                      Client <SortIcon col="name" />
                    </th>
                    <th className="py-3 px-4">Type</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-text select-none"
                      onClick={() => handleSort("caseType")}
                    >
                      Case Type <SortIcon col="caseType" />
                    </th>
                    <th className="py-3 px-4">File No.</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-text select-none text-right"
                      onClick={() => handleSort("matters")}
                    >
                      Matters <SortIcon col="matters" />
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-text select-none"
                      onClick={() => handleSort("createdAt")}
                    >
                      Since <SortIcon col="createdAt" />
                    </th>
                    <th className="py-3 px-4">Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c) => {
                    const matterCount = matters.filter(
                      (m) => m.clientId === c.id
                    ).length;
                    const Icon = c.type === "Corporation" ? Building2 : User;
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-border hover:bg-surface-hover transition-colors cursor-pointer"
                        onClick={() => setExpandedId(c.id)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                              <Icon size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{c.name}</p>
                              <p className="text-xs text-muted truncate">
                                {c.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs">{c.type}</td>
                        <td className="py-3 px-4 text-xs">{c.caseType}</td>
                        <td className="py-3 px-4 text-xs font-mono">
                          {c.fileNumber || "—"}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {matterCount}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted">
                          {c.createdAt}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              c.urgency === "High"
                                ? "bg-danger-light text-danger"
                                : c.urgency === "Medium"
                                ? "bg-warning-light text-warning"
                                : "bg-surface-hover text-muted"
                            }`}
                          >
                            {c.urgency}
                          </span>
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
            {paged.map((c) => {
              const matterCount = matters.filter(
                (m) => m.clientId === c.id
              ).length;
              const Icon = c.type === "Corporation" ? Building2 : User;
              return (
                <button
                  key={c.id}
                  onClick={() => setExpandedId(c.id)}
                  className="w-full card text-left flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <p className="text-xs text-muted truncate">
                      {c.fileNumber || c.id} · {c.caseType} · {matterCount}{" "}
                      matter{matterCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${
                      c.urgency === "High"
                        ? "bg-danger-light text-danger"
                        : c.urgency === "Medium"
                        ? "bg-warning-light text-warning"
                        : "bg-surface-hover text-muted"
                    }`}
                  >
                    {c.urgency}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Pagination bar */}
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

      {/* Expanded detail drawer (shared for table + cards) */}
      {expandedId && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4"
          onClick={() => setExpandedId(null)}
        >
          <div
            className="bg-elevated w-full md:max-w-2xl rounded-t-2xl md:rounded-2xl border border-border shadow-modal max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const c = clients.find((x) => x.id === expandedId);
              if (!c) return null;
              const clientMatters = matters.filter((m) => m.clientId === c.id);
              const Icon = c.type === "Corporation" ? Building2 : User;
              return (
                <>
                  <div className="flex items-start justify-between p-4 border-b border-border gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{c.name}</p>
                        <p className="text-xs text-muted truncate">
                          {c.type} · {c.caseType} · Since {c.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditClientId(c.id)}
                        className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => setExpandedId(null)}
                        className="text-muted hover:text-text p-1"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <Section title="Contact">
                      <Row label="Email" value={c.email} />
                      <Row label="Phone" value={c.phone} />
                      <Row label="Address" value={c.address} />
                      <Row label="Nationality" value={c.nationality} />
                    </Section>

                    <Section title="Engagement Details">
                      <Row label="Client No." value={c.clientNumber} />
                      <Row label="File No." value={c.fileNumber} />
                      <Row label="Contact Officer" value={c.contactOfficer} />
                      <Row label="Date Accepted" value={c.dateAccepted} />
                      <Row
                        label="Nature of Case"
                        value={c.natureOfCase || c.caseType}
                      />
                      <Row label="Brief Title" value={c.briefFilingTitle} />
                      <Row
                        label="Nature of Engagement"
                        value={c.natureOfEngagement}
                        full
                      />
                    </Section>

                    <Section title="Team & Billing">
                      <Row
                        label="Partner(s) in Charge"
                        value={c.partnersInCharge}
                      />
                      <Row label="Associate(s)" value={c.associatesAssigned} />
                      <Row label="Fee Arrangement" value={c.feeArrangement} />
                      <Row
                        label="Filing Instruction"
                        value={c.filingInstruction}
                      />
                    </Section>

                    <Section title="Referral">
                      <Row
                        label="Referred By"
                        value={
                          c.referredBy
                            ? `${c.referredBy}${
                                c.referredByName ? ` — ${c.referredByName}` : ""
                              }`
                            : undefined
                        }
                      />
                      <Row label="Referred To" value={c.referredTo} />
                    </Section>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted">
                          Matters ({clientMatters.length})
                        </p>
                        <button
                          onClick={() => setNewMatterForClient(c.id)}
                          className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"
                        >
                          <Plus size={12} />
                          New Matter
                        </button>
                      </div>
                      {clientMatters.length === 0 ? (
                        <p className="text-sm text-muted">No matters yet.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {clientMatters.map((m) => (
                            <li key={m.id}>
                              <Link
                                to={`/matters/${m.id}`}
                                onClick={() => setExpandedId(null)}
                                className="flex items-center justify-between text-sm gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors"
                              >
                                <span className="truncate">
                                  <span className="text-muted font-mono text-xs mr-2">
                                    {m.id}
                                  </span>
                                  {m.title}
                                </span>
                                <StatusBadge status={m.status} />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {showImport && (
        <ImportClientsModal onClose={() => setShowImport(false)} />
      )}

      {newMatterForClient && (
        <NewMatterModal
          preselectedClientId={newMatterForClient}
          onClose={() => setNewMatterForClient(null)}
        />
      )}

      {editClientId && (() => {
        const c = clients.find((x) => x.id === editClientId);
        if (!c) return null;
        return (
          <EditClientModal
            client={c}
            onClose={() => setEditClientId(null)}
          />
        );
      })()}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted mb-2">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  full,
}: {
  label: string;
  value?: string;
  full?: boolean;
}) {
  return (
    <div
      className={`grid ${full ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-[180px_1fr]"} gap-1 text-sm`}
    >
      <span className="text-muted">{label}</span>
      <span className={value ? "" : "text-muted"}>{value || "—"}</span>
    </div>
  );
}