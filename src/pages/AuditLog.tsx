import { useStore } from "../store/useStore";
import { users } from "../data";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonList } from "../components/Skeleton";
import { printWindow } from "../lib/printWindow";
import { Printer } from "lucide-react";

export default function AuditLog() {
  const auditLog = useStore((s) => s.auditLog);
  const loading = useDelayedLoading();
  const handlePrint = () => {
    const rows = auditLog
      .map((e) => {
        const u = users.find((x) => x.id === e.userId);
        return `
          <tr>
            <td>${new Date(e.timestamp).toLocaleString()}</td>
            <td>${u?.name ?? e.userId}</td>
            <td>${e.action}</td>
            <td>${e.target}</td>
          </tr>`;
      })
      .join("");

    const html = `
      <h2>Audit Log — ${auditLog.length} event${auditLog.length === 1 ? "" : "s"}</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Target</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="4" class="muted">No events recorded.</td></tr>'}
        </tbody>
      </table>`;

    printWindow("Audit Log Report", html);
  };

  return (
    <div>
      <div className="flex items-start md:items-center justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">Audit Log</h1>
          <p className="text-sm text-muted">All sensitive actions are recorded here.</p>
        </div>
        <button
          onClick={handlePrint}
          className="btn-secondary flex items-center gap-2 no-print"
        >
          <Printer size={16} />
          Print Report
        </button>
      </div>

      {loading ? (
        <SkeletonList rows={5} />
      ) : auditLog.length === 0 ? (
        <div className="card text-sm text-muted">
          No audit events yet. Try approving a document or creating a client.
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="py-2">Time</th>
                <th className="py-2">User</th>
                <th className="py-2">Action</th>
                <th className="py-2">Target</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((e) => (
                <tr key={e.id} className="border-b border-border">
                  <td className="py-2">{new Date(e.timestamp).toLocaleString()}</td>
                  <td className="py-2">{users.find((u) => u.id === e.userId)?.name ?? e.userId}</td>
                  <td className="py-2">{e.action}</td>
                  <td className="py-2 font-mono text-xs">{e.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}