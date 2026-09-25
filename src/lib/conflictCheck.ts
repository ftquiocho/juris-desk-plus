import type { Client, Matter } from "../types";

export function checkConflicts({
  clientName,
  matterTitle,
  clients,
  matters,
}: {
  clientName: string;
  matterTitle: string;
  clients: Client[];
  matters: Matter[];
}): string[] {
  const cName = clientName.toLowerCase().trim();
  const mTitle = matterTitle.toLowerCase().trim();
  const matches: string[] = [];

  if (!cName && !mTitle) return matches;

  // Match against existing clients
  clients.forEach((c) => {
    const n = c.name.toLowerCase();
    if (
      (cName && (n.includes(cName) || cName.includes(n))) ||
      (mTitle && (n.length > 3 && mTitle.includes(n)))
    ) {
      matches.push(`${c.name} — existing client (${c.id})`);
    }
  });

  // Match against existing matter titles
  matters.forEach((m) => {
    const t = m.title.toLowerCase();
    if (
      (mTitle && (t.includes(mTitle) || mTitle.includes(t))) ||
      (cName && (t.includes(cName) || cName.includes(t)))
    ) {
      // Avoid duplicate if already listed for this matter
      const line = `${m.title} — existing matter (${m.id})`;
      if (!matches.includes(line)) matches.push(line);
    }
  });

  return matches;
}