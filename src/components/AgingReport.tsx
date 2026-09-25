import { useMemo } from "react";
import { useStore } from "../store/useStore";
import { clients } from "../data";
import { AlertTriangle, Clock } from "lucide-react";

interface Bucket {
  label: string;
  minDays: number;
  maxDays: number;
  tone: "muted" | "info" | "warning" | "danger" | "critical";
}

const BUCKETS: Bucket[] = [
  { label: "Current", minDays: -9999, maxDays: 0, tone: "muted" },
  { label: "1–30 days", minDays: 1, maxDays: 30, tone: "info" },
  { label: "31–60 days", minDays: 31, maxDays: 60, tone: "warning" },
  { label: "61–90 days", minDays: 61, maxDays: 90, tone: "danger" },
  { label: "90+ days", minDays: 91, maxDays: 99999, tone: "critical" },
];

const toneClasses: Record<Bucket["tone"], string> = {
  muted: "bg-surface-hover text-muted",
  info: "bg-info-light text-info-ink",
  warning: "bg-warning-light text-warning-ink",
  danger: "bg-danger-light text-danger-ink",
  critical: "bg-danger text-white",
};

export default function AgingReport() {
  const invoices = useStore((s) => s.invoices);

  const { byClient, totals, grandTotal, totalUnpaid } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Only count unpaid invoices (Sent or Overdue)
    const unpaid = invoices.filter(
      (i) => i.status === "Sent" || i.status === "Overdue"
    );

    const byClientMap: Record<
      string,
      { clientName: string; buckets: Record<string, number>; total: number }
    > = {};
    const totals: Record<string, number> = {};
    let grandTotal = 0;

    unpaid.forEach((inv) => {
      const due = new Date(inv.dueDate);
      due.setHours(0, 0, 0, 0);
      const daysOverdue = Math.floor(
        (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
      );

      const bucket = BUCKETS.find(
        (b) => daysOverdue >= b.minDays && daysOverdue <= b.maxDays
      );
      if (!bucket) return;

      const client = clients.find((c) => c.id === inv.clientId);
      const key = inv.clientId;

      if (!byClientMap[key]) {
        byClientMap[key] = {
          clientName: client?.name ?? "Unknown",
          buckets: {},
          total: 0,
        };
      }

      byClientMap[key].buckets[bucket.label] =
        (byClientMap[key].buckets[bucket.label] ?? 0) + inv.amount;
      byClientMap[key].total += inv.amount;

      totals[bucket.label] = (totals[bucket.label] ?? 0) + inv.amount;
      grandTotal += inv.amount;
    });

    return {
      byClient: Object.entries(byClientMap).map(([id, data]) => ({ id, ...data })),
      totals,
      grandTotal,
      totalUnpaid: unpaid.length,
    };
  }, [invoices]);

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold flex items-center gap-2">
          <Clock size={16} className="text-brand" />
          Aging Receivables
        </h2>
        <p className="text-xs text-muted mt-1">
          {totalUnpaid} unpaid invoice{totalUnpaid === 1 ? "" : "s"} ·{" "}
          <strong className="text-text">
            ₱{grandTotal.toLocaleString()}
          </strong>{" "}
          outstanding
        </p>
      </div>

      {totalUnpaid === 0 ? (
        <div className="p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center mx-auto mb-2">
            <Clock size={20} className="text-success-ink" />
          </div>
          <p className="text-sm font-medium text-text">All caught up</p>
          <p className="text-xs text-muted mt-1">
            No unpaid invoices. Nice work.
          </p>
        </div>
      ) : (
        <>
          {/* Bucket totals row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-4 bg-surface/50 border-b border-border">
            {BUCKETS.map((b) => {
              const amt = totals[b.label] ?? 0;
              return (
                <div
                  key={b.label}
                  className={`rounded-lg p-2.5 border border-transparent ${
                    amt > 0 ? toneClasses[b.tone] : "bg-surface-hover text-muted"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider font-medium">
                    {b.label}
                  </p>
                  <p className="text-sm font-bold mt-1 tabular-nums">
                    ₱{amt.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Per-client breakdown */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-muted text-xs uppercase tracking-wider">
                  <th className="py-2.5 px-4">Client</th>
                  {BUCKETS.map((b) => (
                    <th key={b.label} className="py-2.5 px-3 text-right">
                      {b.label}
                    </th>
                  ))}
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {byClient.map((row) => (
                  <tr key={row.id} className="border-b border-border">
                    <td className="py-2.5 px-4 font-medium truncate max-w-[200px]">
                      {row.clientName}
                    </td>
                    {BUCKETS.map((b) => {
                      const amt = row.buckets[b.label] ?? 0;
                      return (
                        <td
                          key={b.label}
                          className={`py-2.5 px-3 text-right tabular-nums text-xs ${
                            amt === 0 ? "text-muted" : ""
                          }`}
                        >
                          {amt === 0 ? "—" : `₱${amt.toLocaleString()}`}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-4 text-right font-semibold tabular-nums">
                      ₱{row.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-surface border-t-2 border-border">
                <tr>
                  <td className="py-3 px-4 font-semibold">Grand Total</td>
                  {BUCKETS.map((b) => (
                    <td
                      key={b.label}
                      className="py-3 px-3 text-right font-semibold tabular-nums text-xs"
                    >
                      ₱{(totals[b.label] ?? 0).toLocaleString()}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right font-bold text-primary tabular-nums">
                    ₱{grandTotal.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Alert footer if overdue buckets have balance */}
          {(totals["61–90 days"] > 0 || totals["90+ days"] > 0) && (
            <div className="p-3 bg-danger-light border-t border-danger/20 flex items-start gap-2">
              <AlertTriangle size={14} className="text-danger-ink shrink-0 mt-0.5" />
              <p className="text-xs text-danger-ink">
                <strong>Escalation recommended.</strong> ₱
                {(
                  (totals["61–90 days"] ?? 0) + (totals["90+ days"] ?? 0)
                ).toLocaleString()}{" "}
                is more than 60 days overdue. Consider sending a demand letter.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}