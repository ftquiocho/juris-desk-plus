import { AlertTriangle, X } from "lucide-react";

export default function BulkDeleteConfirm({
  count,
  entityLabel,
  onConfirm,
  onCancel,
}: {
  count: number;
  entityLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-md rounded-t-2xl md:rounded-2xl border border-border shadow-modal">
        <div className="relative border-b border-border">
          <button
            onClick={onCancel}
            className="icon-btn absolute top-2.5 right-2.5 z-10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 p-4 pr-14">
            <div className="w-8 h-8 rounded-lg bg-danger-light text-danger-ink flex items-center justify-center shrink-0">
              <AlertTriangle size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold truncate">Confirm Delete</h2>
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm text-text">
            Delete <strong>{count}</strong> {entityLabel}
            {count === 1 ? "" : "s"}?
          </p>
          <p className="text-xs text-muted mt-2">
            This action cannot be undone. Related records will be unlinked.
          </p>
        </div>

        <div className="p-3 border-t border-border flex gap-2">
          <button onClick={onConfirm} className="btn-danger flex-1">
            Delete {count}
          </button>
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}