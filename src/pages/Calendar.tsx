import { useStore } from "../store/useStore";
import { clients } from "../data";
import { Calendar as CalIcon } from "lucide-react";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonList } from "../components/Skeleton";

export default function Calendar() {
  const matters = useStore((s) => s.matters);
  const loading = useDelayedLoading();
  const withHearings = matters
    .filter((m) => m.nextHearing)
    .sort((a, b) => (a.nextHearing! > b.nextHearing! ? 1 : -1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Calendar & Deadlines</h1>
        <p className="text-sm text-muted">Upcoming hearings and court dates across all matters.</p>
      </div>

      {loading ? (
        <SkeletonList rows={4} />
      ) : withHearings.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <CalIcon size={40} className="text-muted mb-3" />
          <p className="font-medium">No upcoming hearings</p>
          <p className="text-sm text-muted mt-1">Hearings will appear here when scheduled.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {withHearings.map((m) => {
            const client = clients.find((c) => c.id === m.clientId);
            const d = new Date(m.nextHearing!);
            return (
              <div key={m.id} className="card flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-md bg-primary text-white flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs uppercase">
                      {d.toLocaleString("en", { month: "short" })}
                    </span>
                    <span className="text-lg font-bold leading-none">{d.getDate()}</span>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}