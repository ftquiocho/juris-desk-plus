import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useStore } from "../store/useStore";

export default function NotificationBell() {
  const currentUser = useStore((s) => s.currentUser)!;
  const notifications = useStore((s) => s.notifications);
  const markAllRead = useStore((s) => s.markAllNotificationsRead);
  const markRead = useStore((s) => s.markNotificationRead);
  const clearAll = useStore((s) => s.clearNotifications);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const mine = notifications.filter((n) => n.userId === currentUser.id);
  const unread = mine.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = (id: string, link?: string) => {
    markRead(id);
    if (link) {
      navigate(link);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative icon-btn"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-elevated border border-border rounded-xl shadow-modal overflow-hidden z-50 max-w-[calc(100vw-2rem)]">
          <div className="p-3 border-b border-border flex items-center justify-between gap-2">
            <p className="font-semibold text-sm">
              Notifications{" "}
              {unread > 0 && (
                <span className="text-primary text-xs ml-1">
                  ({unread} new)
                </span>
              )}
            </p>
            {mine.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => markAllRead(currentUser.id)}
                  className="icon-btn icon-btn-sm"
                  title="Mark all read"
                  aria-label="Mark all read"
                >
                  <CheckCheck size={14} />
                </button>
                <button
                  onClick={() => clearAll(currentUser.id)}
                  className="icon-btn icon-btn-danger icon-btn-sm"
                  title="Clear all"
                  aria-label="Clear all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {mine.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={28} className="text-muted mx-auto mb-2" />
                <p className="text-sm text-text font-medium">
                  You're all caught up
                </p>
                <p className="text-xs text-muted mt-1">
                  No new notifications.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {mine.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => handleClick(n.id, n.link)}
                      className={`w-full text-left p-3 hover:bg-surface-hover transition-colors ${
                        !n.read ? "bg-primary-light/30" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm ${
                              !n.read ? "font-semibold" : "font-medium"
                            } text-text truncate`}
                          >
                            {n.title}
                          </p>
                          <p className="text-xs text-muted mt-0.5 line-clamp-2">
                            {n.body}
                          </p>
                          <p className="text-[10px] text-muted mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}