import { useEffect, useState } from "react";

/**
 * Simulates a brief loading state on first mount.
 * Used in the demo to show skeleton loaders.
 * In production, replace with real data-fetching state.
 */
export function useDelayedLoading(delayMs: number = 250): boolean {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  return loading;
}