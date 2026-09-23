import { users } from "../data";

export default function Admin() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Admin Console</h1>

      <div className="card">
        <h2 className="font-semibold mb-3">Users & Roles</h2>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Roles</th>
              <th className="py-2">Title</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border">
                <td className="py-2 font-medium">{u.name}</td>
                <td className="py-2">{u.email}</td>
                <td className="py-2">
                  <div className="flex gap-1 flex-wrap">
                    {u.roles.map((r) => (
                      <span key={r} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{r}</span>
                    ))}
                  </div>
                </td>
                <td className="py-2">{u.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3">Firm Settings</h2>
        <p className="text-sm text-muted">Firm name, branding, and integrations are configured here.</p>
      </div>
    </div>
  );
}