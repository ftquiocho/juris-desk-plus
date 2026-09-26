import { useCallback, useState } from "react";

export function useRowSelection(visibleIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const allSelected = visibleIds.length > 0 && visibleIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(visibleIds);
    });
  }, [visibleIds]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const isSelected = useCallback((id: string) => selected.has(id), [selected]);

  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const someSelected = selected.size > 0 && !allSelected;

  return {
    selected,
    count: selected.size,
    toggle,
    toggleAll,
    clear,
    isSelected,
    allSelected,
    someSelected,
  };
}