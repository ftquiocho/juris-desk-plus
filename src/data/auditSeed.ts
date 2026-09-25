import type { AuditEvent } from "../types";

// Simulated audit trail — reads like a real firm's last 48 hours.
// Timestamps are relative (offset in minutes from "now") so the feed
// always looks recent when the demo loads.

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60 * 1000).toISOString();
}

export const seedAuditLog: AuditEvent[] = [
  { id: "SEED-001", userId: "USR-001", action: "Approved document", target: "DOC-001", timestamp: minutesAgo(8) },
  { id: "SEED-002", userId: "USR-003", action: "Uploaded new document version", target: "DOC-004", timestamp: minutesAgo(22) },
  { id: "SEED-003", userId: "USR-004", action: "Logged time entry", target: "M-2025-002", timestamp: minutesAgo(45) },
  { id: "SEED-004", userId: "USR-002", action: "Created task", target: "TSK-001", timestamp: minutesAgo(58) },
  { id: "SEED-005", userId: "USR-005", action: "Sent invoice", target: "INV-001", timestamp: minutesAgo(72) },
  { id: "SEED-006", userId: "USR-001", action: "Ran conflict check (clear)", target: "Elektra Natchios", timestamp: minutesAgo(95) },
  { id: "SEED-007", userId: "USR-007", action: "Reconciled trust accounts", target: "3-way", timestamp: minutesAgo(140) },
  { id: "SEED-008", userId: "USR-003", action: "Logged expense", target: "M-2025-001", timestamp: minutesAgo(168) },
  { id: "SEED-009", userId: "USR-006", action: "Created client engagement", target: "CL-010", timestamp: minutesAgo(210) },
  { id: "SEED-010", userId: "USR-002", action: "Closed matter", target: "M-2025-011", timestamp: minutesAgo(265) },
  { id: "SEED-011", userId: "USR-001", action: "Created matter", target: "M-2025-012", timestamp: minutesAgo(310) },
  { id: "SEED-012", userId: "USR-004", action: "Rejected document", target: "DOC-002", timestamp: minutesAgo(360) },
  { id: "SEED-013", userId: "USR-005", action: "Recorded payment", target: "INV-002", timestamp: minutesAgo(420) },
  { id: "SEED-014", userId: "USR-008", action: "Updated user", target: "USR-004", timestamp: minutesAgo(475) },
  { id: "SEED-015", userId: "USR-003", action: "Created draft from template: Judicial Affidavit", target: "DOC-004", timestamp: minutesAgo(540) },
  { id: "SEED-016", userId: "USR-001", action: "Delegated matter to Atty. Franklin Nelson", target: "M-2025-006", timestamp: minutesAgo(620) },
  { id: "SEED-017", userId: "USR-002", action: "Updated matter", target: "M-2025-005", timestamp: minutesAgo(700) },
  { id: "SEED-018", userId: "USR-006", action: "Logged time entry", target: "M-2025-001", timestamp: minutesAgo(780) },
  { id: "SEED-019", userId: "USR-007", action: "Created invoice", target: "INV-003", timestamp: minutesAgo(860) },
  { id: "SEED-020", userId: "USR-004", action: "Completed task", target: "TSK-007", timestamp: minutesAgo(940) },
];