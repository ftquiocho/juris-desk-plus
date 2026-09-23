import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";

export interface MultiSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
}: {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      o.sublabel?.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="input min-h-[42px] flex items-center gap-2 cursor-pointer flex-wrap py-2 hover:border-primary/40"
      >
        {selected.length === 0 && (
          <span className="text-muted text-sm">{placeholder}</span>
        )}
        {selected.map((val) => {
          const opt = options.find((o) => o.value === val);
          return (
            <span
              key={val}
              className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs px-2 py-1 rounded"
            >
              {opt?.label ?? val}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(val);
                }}
                className="hover:text-danger"
                aria-label="Remove"
              >
                <X size={12} />
              </button>
            </span>
          );
        })}
        <ChevronDown size={16} className="text-muted ml-auto shrink-0" />
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-elevated border border-edge rounded-lg shadow-lg max-h-64 overflow-auto">
          <div className="p-2 border-b border-border sticky top-0 bg-elevated">
            <input
              autoFocus
              className="input text-sm"
              placeholder="Type to search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted p-3 text-center">No matches.</p>
          ) : (
            <ul>
              {filtered.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => toggle(opt.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-surface-hover text-left transition-colors ${
                        isSelected ? "bg-primary-light" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{opt.label}</p>
                        {opt.sublabel && (
                          <p className="text-xs text-muted truncate">
                            {opt.sublabel}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Check size={14} className="text-primary shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}