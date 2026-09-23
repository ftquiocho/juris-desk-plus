import { FileText, type LucideIcon } from "lucide-react";

export default function EmptyState({
  title,
  description,
  icon: Icon = FileText,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-12">
      <div className="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center mb-3">
        <Icon size={24} className="text-muted" />
      </div>
      <p className="font-medium text-text">{title}</p>
      {description && (
        <p className="text-sm text-muted mt-1 max-w-xs">{description}</p>
      )}
    </div>
  );
}