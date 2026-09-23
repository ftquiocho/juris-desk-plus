import { useStore } from "../store/useStore";
import { users } from "../data";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonList } from "../components/Skeleton";

export default function AuditLog() {
  const auditLog = useStore((s) => s.auditLog);
  const loading = useDelayedLoading();

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-1">Audit Log</h1>
      <p className="text-sm text-muted mb-6">All sensitive actions are recorded here.</p>

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