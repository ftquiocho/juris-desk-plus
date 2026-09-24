import { create } from "zustand";
import { CheckCircle, X, AlertCircle } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastStore {
  toasts: Toast[];
  push: (message: string, type?: Toast["type"]) => void;
  remove: (id: number) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, type = "success") => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export default function ToastContainer() {
  const toasts = useToast((s) => s.toasts);
  const remove = useToast((s) => s.remove);

  return (
    <div className="no-print fixed bottom-4 left-4 md:bottom-6 md:left-6 space-y-2 z-50 max-w-[calc(100vw-2rem)] md:max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm animate-slide-in-right border ${
        t.type === "success"
          ? "bg-success-light border-success/40 text-success-ink"
          : t.type === "error"
          ? "bg-danger-light border-danger/40 text-danger-ink"
          : "bg-primary-light border-primary/40 text-primary-ink"
      }`}
      style={{
        boxShadow: "var(--shadow-modal)",
      }}
        >
          {t.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}