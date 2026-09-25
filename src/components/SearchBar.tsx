import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Briefcase,
  User,
  FileText,
  CheckSquare,
  Receipt,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { useStore } from "../store/useStore";
import StatusBadge from "./StatusBadge";

type ResultKind =
  | "matter"
  | "client"
  | "document"
  | "task"
  | "contact"
  | "invoice"
  | "user";

interface SearchResult {
  type: ResultKind;
  id: string;
  title: string;
  subtitle: string;
  status?: string;
  link: string;
}

export default function SearchBar({ onNavigate }: { onNavigate?: () => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const matters = useStore((s) => s.matters);
  const clients = useStore((s) => s.clients);
  const documents = useStore((s) => s.documents);
  const tasks = useStore((s) => s.tasks);
  const contacts = useStore((s) => s.contacts);
  const invoices = useStore((s) => s.invoices);
  const users = useStore((s) => s.users);

  // ⌘K / Ctrl+K focuses
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Click outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const q = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  if (q.length >= 2) {
    matters
      .filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.matterType.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .forEach((m) => {
        const client = clients.find((c) => c.id === m.clientId);
        results.push({
          type: "matter",
          id: m.id,
          title: m.title,
          subtitle: `${m.id} · ${client?.name ?? "Unknown client"}`,
          status: m.status,
          link: `/matters/${m.id}`,
        });
      });

    clients
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.fileNumber ?? "").toLowerCase().includes(q) ||
          (c.clientNumber ?? "").toLowerCase().includes(q)
      )
      .slice(0, 3)
      .forEach((c) => {
        results.push({
          type: "client",
          id: c.id,
          title: c.name,
          subtitle: `${c.id} · ${c.caseType}`,
          link: "/clients",
        });
      });

    documents
      .filter(
        (d) =>
          d.title.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .forEach((d) => {
        const matter = matters.find((m) => m.id === d.matterId);
        results.push({
          type: "document",
          id: d.id,
          title: d.title,
          subtitle: `${d.id} · ${matter?.title ?? "Unknown matter"}`,
          status: d.status,
          link: `/matters/${d.matterId}`,
        });
      });

    tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((t) => {
        const matter = matters.find((m) => m.id === t.matterId);
        results.push({
          type: "task",
          id: t.id,
          title: t.title,
          subtitle: `${matter?.title ?? "—"} · Due ${t.dueDate}`,
          status: t.status,
          link: "/tasks",
        });
      });

    contacts
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.organization ?? "").toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q)
      )
      .slice(0, 3)
      .forEach((c) => {
        results.push({
          type: "contact",
          id: c.id,
          title: c.name,
          subtitle: `${c.type}${c.organization ? ` · ${c.organization}` : ""}`,
          link: "/contacts",
        });
      });

    invoices
      .filter((i) => i.id.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((i) => {
        const client = clients.find((c) => c.id === i.clientId);
        results.push({
          type: "invoice",
          id: i.id,
          title: i.id,
          subtitle: `${client?.name ?? "—"} · ₱${i.amount.toLocaleString()}`,
          status: i.status,
          link: "/billing",
        });
      });

    users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
      .slice(0, 2)
      .forEach((u) => {
        results.push({
          type: "user",
          id: u.id,
          title: u.name,
          subtitle: u.title,
          link: "/admin",
        });
      });
  }

  const iconFor = (type: ResultKind) => {
    if (type === "matter") return Briefcase;
    if (type === "client") return User;
    if (type === "document") return FileText;
    if (type === "task") return CheckSquare;
    if (type === "contact") return UsersIcon;
    if (type === "invoice") return Receipt;
    return User;
  };

  const labelFor = (type: ResultKind) => {
    if (type === "matter") return "Matters";
    if (type === "client") return "Clients";
    if (type === "document") return "Documents";
    if (type === "task") return "Tasks";
    if (type === "contact") return "Contacts";
    if (type === "invoice") return "Invoices";
    return "Users";
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  const go = (link: string) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    navigate(link);
    onNavigate?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[focusIndex].link);
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-md">
      <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-2 focus-within:border-primary/50 transition-colors">
        <Search size={16} className="text-muted shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setFocusIndex(0);
          }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent outline-none text-sm text-text placeholder:text-muted"
          placeholder="Search anything... (⌘K)"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="text-muted hover:text-text shrink-0"
            aria-label="Clear"
          >
            <X size={14} />
          </button>
        )}
        {!query && (
          <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] text-muted border border-border rounded px-1.5 py-0.5 shrink-0">
            ⌘K
          </kbd>
        )}
      </div>

      {open && q.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-elevated border border-border rounded-xl shadow-modal overflow-hidden z-50 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-6 text-center">
              <Search size={24} className="text-muted mx-auto mb-2" />
              <p className="text-sm text-text font-medium">No results found</p>
              <p className="text-xs text-muted mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="py-2">
              {(
                [
                  "matter",
                  "client",
                  "document",
                  "task",
                  "contact",
                  "invoice",
                  "user",
                ] as ResultKind[]
              ).map((type) => {
                const group = grouped[type];
                if (!group || group.length === 0) return null;
                const Icon = iconFor(type);
                return (
                  <div key={type} className="mb-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted px-3 py-1">
                      {labelFor(type)}
                    </p>
                    {group.map((r) => {
                      const idx = results.indexOf(r);
                      return (
                        <button
                          key={`${r.type}-${r.id}`}
                          onClick={() => go(r.link)}
                          onMouseEnter={() => setFocusIndex(idx)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                            focusIndex === idx ? "bg-surface-hover" : ""
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center shrink-0">
                            <Icon size={14} className="text-muted" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-text truncate">
                              {r.title}
                            </p>
                            <p className="text-xs text-muted truncate">
                              {r.subtitle}
                            </p>
                          </div>
                          {r.status && <StatusBadge status={r.status} />}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}