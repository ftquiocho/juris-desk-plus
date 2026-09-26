import { X } from "lucide-react";
import type { ReactNode } from "react";

export default function BulkActionBar({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children: ReactNode;
}) {
  if (count === 0) return null;

  return (
    <div className="no-print fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100vw-2rem)] max-w-3xl animate-fade-in">
      <div className="bg-elevated border border-brand/40 rounded-2xl shadow-modal px-3 py-2.5 md:px-4 md:py-3 flex items-center gap-2 md:gap-3 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-7 h-7 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center">
            {count}
          </span>
          <span className="text-sm font-medium text-text hidden sm:inline">
            selected
          </span>
        </div>

        <div className="w-px h-6 bg-border hidden md:block" />

        <div className="flex items-center gap-1.5 flex-1 flex-wrap">
          {children}
        </div>

        <button
          onClick={onClear}
          className="icon-btn icon-btn-sm shrink-0"
          aria-label="Clear selection"
          title="Clear selection"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}