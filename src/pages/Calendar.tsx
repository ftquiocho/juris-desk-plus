import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { clients } from "../data";
import StatusBadge from "../components/StatusBadge";
import type { Matter } from "../types";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonList } from "../components/Skeleton";
import {
  Calendar as CalIcon,
  List as ListIcon,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  X,
  Gavel,
  Briefcase,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";

type ViewMode = "list" | "calendar";
type EventType = "hearing" | "opened" | "task";

interface CalEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  subtitle: string;
  type: EventType;
  link: string;
  status?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const typeStyles: Record<EventType, { chip: string; dot: string; icon: LucideIcon }> = {
  hearing: { chip: "bg-primary/15 text-primary border-primary/30", dot: "bg-primary", icon: Gavel },
  opened: { chip: "bg-info-light text-info border-info/30", dot: "bg-info", icon: Briefcase },
  task: { chip: "bg-warning-light text-warning border-warning/30", dot: "bg-warning", icon: CheckSquare },
};

export default function Calendar() {
  const matters = useStore((s) => s.matters);
  const tasks = useStore((s) => s.tasks);
  const loading = useDelayedLoading();

  const [view, setView] = useState<ViewMode>("list");
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Build all events
  const events: CalEvent[] = useMemo(() => {
    const list: CalEvent[] = [];

    matters.forEach((m) => {
      const client = clients.find((c) => c.id === m.clientId);
      if (m.nextHearing) {
        list.push({
          id: `H-${m.id}`,
          date: m.nextHearing,
          title: `Hearing — ${m.title}`,
          subtitle: `${m.court ?? "Court TBD"} · ${client?.name ?? ""}`,
          type: "hearing",
          link: `/matters/${m.id}`,
          status: m.status,
        });
      }
      if (m.openedAt) {
        list.push({
          id: `O-${m.id}`,
          date: m.openedAt,
          title: `Opened — ${m.title}`,
          subtitle: `${m.matterType} · ${client?.name ?? ""}`,
          type: "opened",
          link: `/matters/${m.id}`,
        });
      }
    });

    tasks.forEach((t) => {
      const matter = matters.find((m) => m.id === t.matterId);
      list.push({
        id: `T-${t.id}`,
        date: t.dueDate,
        title: `Due — ${t.title}`,
        subtitle: `${matter?.title ?? ""} · ${t.priority} priority`,
        type: "task",
        link: "/tasks",
        status: t.status,
      });
    });

    return list;
  }, [matters, tasks]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const upcoming = useMemo(
    () =>
      matters
        .filter((m) => m.nextHearing)
        .sort((a, b) => (a.nextHearing! > b.nextHearing! ? 1 : -1)),
    [matters]
  );

  // Calendar grid builder
  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { date: Date; inMonth: boolean; iso: string }[] = [];

    // Leading days from previous month
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      cells.push({ date: d, inMonth: false, iso: toISO(d) });
    }

    // Days in month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      cells.push({ date: d, inMonth: true, iso: toISO(d) });
    }

    // Trailing days to fill to 42 (6 weeks)
    while (cells.length < 42) {
      const lastDate = cells[cells.length - 1].date;
      const d = new Date(lastDate);
      d.setDate(d.getDate() + 1);
      cells.push({ date: d, inMonth: false, iso: toISO(d) });
    }

    return cells;
  }, [cursor]);

  const todayISO = toISO(new Date());

  const monthEvents = events.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === cursor.getMonth() && d.getFullYear() === cursor.getFullYear();
  });

  const goPrev = () =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const goNext = () =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  const goToday = () => {
    const d = new Date();
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start md:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Calendar & Deadlines</h1>
          <p className="text-sm text-muted">
            {view === "list"
              ? `${upcoming.length} upcoming hearing${upcoming.length === 1 ? "" : "s"}`
              : `${monthEvents.length} event${monthEvents.length === 1 ? "" : "s"} this month`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {view === "calendar" && (
            <div className="flex items-center gap-1 border border-border rounded-lg px-1">
              <button
                onClick={goPrev}
                className="icon-btn"
                aria-label="Previous month"
                title="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToday}
                className="px-3 py-1 text-xs font-medium text-muted hover:text-text transition-colors"
              >
                Today
              </button>
              <button
                onClick={goNext}
                className="icon-btn"
                aria-label="Next month"
                title="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center border border-border rounded-lg p-0.5">
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-md transition ${
                view === "list" ? "bg-primary text-white" : "text-muted hover:text-text"
              }`}
              aria-label="List view"
              title="List view"
            >
              <ListIcon size={14} />
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`p-1.5 rounded-md transition ${
                view === "calendar" ? "bg-primary text-white" : "text-muted hover:text-text"
              }`}
              aria-label="Calendar view"
              title="Calendar view"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      {view === "calendar" && (
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted">Hearings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-info" />
            <span className="text-muted">Matters Opened</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warning" />
            <span className="text-muted">Task Deadlines</span>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonList rows={6} />
      ) : view === "list" ? (
        <ListView matters={upcoming} />
      ) : (
        <CalendarGrid
          cursor={cursor}
          grid={grid}
          eventsByDate={eventsByDate}
          todayISO={todayISO}
          onSelectDay={setSelectedDay}
        />
      )}

      {selectedDay && (
        <DayDrawer
          isoDate={selectedDay}
          events={eventsByDate[selectedDay] ?? []}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ListView({ matters }: { matters: Matter[] }) {
  if (matters.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-12 text-center">
        <CalIcon size={40} className="text-muted mb-3" />
        <p className="font-medium">No upcoming hearings</p>
        <p className="text-sm text-muted mt-1">
          Hearings will appear here when scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matters.map((m) => {
        const client = clients.find((c) => c.id === m.clientId);
        const d = new Date(m.nextHearing!);
        return (
          <Link
            key={m.id}
            to={`/matters/${m.id}`}
            className="card card-hover flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary text-white flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] md:text-xs uppercase">
                  {d.toLocaleString("en", { month: "short" })}
                </span>
                <span className="text-base md:text-lg font-bold leading-none">
                  {d.getDate()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{m.title}</p>
                <p className="text-xs text-muted truncate">
                  {m.court ?? "No court"} · {client?.name}
                </p>
              </div>
            </div>
            <span className="text-xs md:text-sm text-muted shrink-0">
              {m.nextHearing}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function CalendarGrid({
  cursor,
  grid,
  eventsByDate,
  todayISO,
  onSelectDay,
}: {
  cursor: Date;
  grid: { date: Date; inMonth: boolean; iso: string }[];
  eventsByDate: Record<string, CalEvent[]>;
  todayISO: string;
  onSelectDay: (iso: string) => void;
}) {
  return (
    <div className="card !p-0 overflow-hidden">
      {/* Month title */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </h2>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] md:text-xs uppercase tracking-wider text-muted font-medium"
          >
            <span className="hidden md:inline">{d}</span>
            <span className="md:hidden">{d[0]}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {grid.map((cell, i) => {
          const dayEvents = eventsByDate[cell.iso] ?? [];
          const isToday = cell.iso === todayISO;
          const isFirstOfMonth = cell.date.getDate() === 1;
          return (
            <button
              key={i}
              onClick={() => onSelectDay(cell.iso)}
              className={`relative min-h-[80px] md:min-h-[110px] p-1.5 md:p-2 border-b border-r border-border text-left transition-colors hover:bg-surface-hover ${
                !cell.inMonth ? "opacity-40" : ""
              } ${isToday ? "bg-primary-light/20" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs md:text-sm font-medium ${
                    isToday
                      ? "bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center"
                      : "text-text"
                  }`}
                >
                  {cell.date.getDate()}
                </span>
                {isFirstOfMonth && (
                  <span className="hidden md:inline text-[9px] uppercase tracking-wider text-muted">
                    {MONTHS[cell.date.getMonth()].slice(0, 3)}
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((e) => {
                  const style = typeStyles[e.type];
                  return (
                    <div
                      key={e.id}
                      className={`text-[9px] md:text-[10px] truncate px-1.5 py-0.5 rounded border ${style.chip}`}
                      title={e.title}
                    >
                      <span className="hidden md:inline">{e.title}</span>
                      <span className="md:hidden">
                        {e.type === "hearing" ? "H" : e.type === "task" ? "T" : "O"}
                      </span>
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <div className="text-[9px] md:text-[10px] text-muted px-1.5">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayDrawer({
  isoDate,
  events,
  onClose,
}: {
  isoDate: string;
  events: CalEvent[];
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const d = new Date(isoDate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-elevated w-full md:max-w-lg rounded-t-2xl md:rounded-2xl border border-border shadow-modal max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">
              {d.toLocaleString("en", { weekday: "long" })}
            </p>
            <h2 className="font-semibold text-lg">
              {d.toLocaleString("en", { month: "long", day: "numeric", year: "numeric" })}
            </h2>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <CalIcon size={32} className="text-muted mx-auto mb-2" />
              <p className="text-sm text-text font-medium">No events</p>
              <p className="text-xs text-muted mt-1">
                Nothing scheduled for this day.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {events.map((e) => {
                const style = typeStyles[e.type];
                const Icon = style.icon;
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => {
                        onClose();
                        navigate(e.link);
                      }}
                      className="w-full text-left card card-hover !p-3 flex items-start gap-3"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.chip}`}
                      >
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{e.title}</p>
                        <p className="text-xs text-muted truncate">
                          {e.subtitle}
                        </p>
                        {e.status && (
                          <div className="mt-1.5">
                            <StatusBadge status={e.status} />
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}