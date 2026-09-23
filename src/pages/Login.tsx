import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { users } from "../data";
import { APP_CONFIG } from "../config";
import { Scale } from "lucide-react";

export default function Login() {
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-4 shadow-glow">
            <Scale size={28} />
          </div>
          <h1 className="text-2xl font-bold text-text">
            {APP_CONFIG.productName}
          </h1>
          <p className="text-sm text-muted mt-1">{APP_CONFIG.tagline}</p>
          <p className="text-xs text-primary mt-3 font-medium tracking-wider uppercase">
            {APP_CONFIG.firmName}
          </p>
        </div>

        {/* User picker */}
        <div className="card">
          <p className="text-xs uppercase tracking-wider text-muted mb-3">
            Select a demo user
          </p>
          <div className="space-y-1.5">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setCurrentUser(u);
                  navigate("/");
                }}
                className="w-full flex items-center justify-between border border-border rounded-lg px-3 py-2.5 hover:bg-surface-hover hover:border-primary/40 transition-all text-left group"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm text-text truncate">
                    {u.name}
                  </p>
                  <p className="text-xs text-muted truncate">{u.title}</p>
                </div>
                <span className="text-[10px] text-primary font-semibold shrink-0 ml-2 group-hover:text-primary-hover uppercase tracking-wide">
                  {u.roles
                    .map((r) => r.split("_")[0])
                    .join(" · ")}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Demo environment · No real data
        </p>
      </div>
    </div>
  );
}