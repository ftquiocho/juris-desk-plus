import { useStore } from "../store/useStore";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, Clock, Briefcase, Percent, type LucideIcon } from "lucide-react";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonKpiGrid } from "../components/Skeleton";
import AgingReport from "../components/AgingReport";

const COLORS = ["#DC2626", "#F59E0B", "#22C55E", "#3B82F6", "#A855F7", "#EC4899"];

// Demo data — replace with real aggregation when backend is ready
const revenueTrend = [
  { month: "Aug", revenue: 180000 },
  { month: "Sep", revenue: 245000 },
  { month: "Oct", revenue: 210000 },
  { month: "Nov", revenue: 298000 },
  { month: "Dec", revenue: 340000 },
  { month: "Jan", revenue: 392000 },
];

const hoursByAttorney = [
  { name: "Santos", hours: 52 },
  { name: "Rizal", hours: 68 },
  { name: "Cruz", hours: 34 },
  { name: "Torres", hours: 45 },
];

function KpiTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        <Icon size={16} className="text-muted" />
      </div>
      <p className={`text-2xl font-bold mt-2 ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

export default function Reports() {
  const invoices = useStore((s) => s.invoices);
  const timeEntries = useStore((s) => s.timeEntries);
  const matters = useStore((s) => s.matters);
    const loading = useDelayedLoading();

  const totalRevenue = invoices
    .filter((i) => i.status === "Paid" || i.status === "Sent")
    .reduce((s, i) => s + i.amount, 0);

  const totalHours = timeEntries.reduce((s, t) => s + t.duration, 0);
  const billableHours = timeEntries
    .filter((t) => t.billable)
    .reduce((s, t) => s + t.duration, 0);

  const activeMatters = matters.filter((m) => m.status === "Open").length;

  const realizationRate =
    totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;

  const matterTypes = matters.reduce(
    (acc: { name: string; value: number }[], m) => {
      const existing = acc.find((a) => a.name === m.matterType);
      if (existing) existing.value += 1;
      else acc.push({ name: m.matterType, value: 1 });
      return acc;
    },
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted">Firm performance at a glance.</p>
      </div>

      {/* KPIs */}
      {loading ? (
        <SkeletonKpiGrid />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile
            icon={TrendingUp}
            label="Total Revenue"
            value={`₱${totalRevenue.toLocaleString()}`}
            accent="text-success"
          />
          <KpiTile
            icon={Clock}
            label="Billable Hours"
            value={`${billableHours.toFixed(1)}h`}
          />
          <KpiTile
            icon={Briefcase}
            label="Active Matters"
            value={String(activeMatters)}
          />
          <KpiTile
            icon={Percent}
            label="Realization Rate"
            value={`${realizationRate}%`}
            accent="text-warning"
          />
        </div>
      )}

      {/* Revenue trend */}
      <div className="card">
        <h2 className="font-semibold mb-4">Revenue — Last 6 Months</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8B8B8B" }} stroke="#333333" />
              <YAxis
                tick={{ fontSize: 11, fill: "#8B8B8B" }}
                stroke="#333333"
                tickFormatter={(v: number) => `₱${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "#1A1A1A",
                  border: "1px solid #333333",
                  borderRadius: "8px",
                  color: "#FAFAFA",
                }}
                formatter={(value) => `₱${Number(value).toLocaleString()}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#DC2626"
                strokeWidth={2}
                dot={{ r: 4, fill: "#DC2626", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#DC2626" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two side-by-side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Hours by Attorney</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursByAttorney}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8B8B8B" }} stroke="#333333" />
                <YAxis tick={{ fontSize: 12, fill: "#8B8B8B" }} stroke="#333333" />
                <Tooltip
                  contentStyle={{
                    background: "#1A1A1A",
                    border: "1px solid #333333",
                    borderRadius: "8px",
                    color: "#FAFAFA",
                  }}
                />
                <Bar dataKey="hours" fill="#DC2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Matters by Type</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={matterTypes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={false}
                >
                  {matterTypes.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1A1A1A",
                    border: "1px solid #333333",
                    borderRadius: "8px",
                    color: "#FAFAFA",
                  }}
                />
                <Legend wrapperStyle={{ color: "#8B8B8B", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Aging Receivables */}
      <AgingReport />
    </div>
  );
}