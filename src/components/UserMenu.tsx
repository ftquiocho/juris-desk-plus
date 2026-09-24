import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Check, User, LogOut } from "lucide-react";
import { useStore } from "../store/useStore";
import { users } from "../data";
import { APP_CONFIG } from "../config";

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter((p) => !p.includes("."))
    .map((p) => p[0])
    .slice(-2)
    .join("");
}

export default function UserMenu() {
  const currentUser = useStore((s) => s.currentUser)!;
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = initialsOf(currentUser.name);

  const switchTo = (userId: string) => {
    const u = users.find((x) => x.id === userId);
    if (u) {
      setCurrentUser(u);
      setOpen(false);
      navigate("/");
    }
  };

  const signOut = () => {
    setCurrentUser(null);
    setOpen(false);
    navigate("/login");
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 md:gap-3 px-1.5 py-1.5 rounded-lg hover:bg-surface-hover active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-label="User menu"
      >
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-text leading-tight">
            {currentUser.name}
          </p>
          <p className="text-xs text-muted leading-tight">{currentUser.title}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-semibold text-xs shadow-glow">
          {initials}
        </div>
        <ChevronDown
          size={14}
          className={`text-muted transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-elevated border border-border rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Signed in as */}
          <div className="p-3 border-b border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted mb-2 px-2">
              Signed in as
            </p>
            <div className="flex items-center gap-3 px-2 py-1.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-semibold text-xs shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-muted truncate">
                  {currentUser.title}
                </p>
              </div>
            </div>
          </div>

          {/* Switch role */}
          <div className="p-3 border-b border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted mb-2 px-2">
              Switch role
            </p>
            <div className="max-h-72 overflow-y-auto space-y-0.5">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => !isCurrent && switchTo(u.id)}
                    className={`w-full flex items-center justify-between gap-2 px-2 py-2 rounded-lg text-left transition-colors ${
                      isCurrent ? "bg-primary-light" : "hover:bg-surface-hover"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full text-[10px] font-semibold flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? "bg-primary text-white"
                            : "bg-surface-hover text-muted"
                        }`}
                      >
                        {initialsOf(u.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-text truncate">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-muted truncate">
                          {u.title}
                        </p>
                      </div>
                    </div>
                    {isCurrent && (
                      <Check size={14} className="text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              onClick={() => {
                setOpen(false);
                navigate("/profile");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text hover:bg-surface-hover transition-colors"
            >
              <User size={16} className="text-muted" />
              My Profile
            </button>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text hover:bg-surface-hover transition-colors"
            >
              <LogOut size={16} className="text-muted" />
              Sign Out
            </button>
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-border">
            <p className="text-[10px] text-muted text-center truncate">
              {APP_CONFIG.firmName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}