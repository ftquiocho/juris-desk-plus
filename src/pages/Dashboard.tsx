import { useStore } from "../store/useStore";
import KpiCard from "../components/KpiCard";
import MatterCard from "../components/MatterCard";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonKpiGrid, SkeletonCards } from "../components/Skeleton";

export default function Dashboard() {
  const user = useStore((s) => s.currentUser)!;
  const matters = useStore((s) => s.matters);
  const invoices = useStore((s) => s.invoices);
  const timeEntries = useStore((s) => s.timeEntries);
  const loading = useDelayedLoading();

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

  const revenue = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const unpaid = invoices.filter((i) => i.status === "Sent" || i.status === "Overdue").length;
  const hours = timeEntries.reduce((s, t) => s + t.duration, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user.name.split(" ").slice(-1)[0]}</h1>
        <p className="text-sm text-muted">Here's what's happening today.</p>
      </div>

      {loading ? (
        <SkeletonKpiGrid />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Active Matters" value={String(visibleMatters.length)} />
          <KpiCard label="Revenue (Paid)" value={`₱${revenue.toLocaleString()}`} accent="text-success" />
          <KpiCard label="Unpaid Invoices" value={String(unpaid)} accent="text-warning" />
          <KpiCard label="Hours Logged" value={`${hours}h`} />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">
          {seesAllMatters ? "All Active Matters" : "My Matters"}
        </h2>
        {loading ? (
          <SkeletonCards count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleMatters.map((m) => <MatterCard key={m.id} matter={m} />)}
          </div>
        )}
      </div>
    </div>
  );
}