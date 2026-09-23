import type { TimeEntry } from "../types";

export const timeEntries: TimeEntry[] = [
  // Matt Murdock — Partner ₱3,500/hr
  { id: "TE-001", matterId: "M-2025-001", userId: "USR-001", activity: "Client consultation", duration: 2.0, billable: true, rate: 3500, date: "2025-02-10" },
  { id: "TE-002", matterId: "M-2025-003", userId: "USR-001", activity: "Court appearance - arraignment", duration: 3.5, billable: true, rate: 3500, date: "2025-02-11" },
  { id: "TE-003", matterId: "M-2025-004", userId: "USR-001", activity: "Drafting complaint", duration: 2.5, billable: false, rate: 0, date: "2025-02-12" },
  { id: "TE-004", matterId: "M-2025-006", userId: "USR-001", activity: "Estate planning meeting", duration: 4.0, billable: true, rate: 3500, date: "2025-02-14" },
  { id: "TE-005", matterId: "M-2025-010", userId: "USR-001", activity: "Legal research - press freedom", duration: 3.0, billable: true, rate: 3500, date: "2025-02-17" },

  // Foggy Nelson — Partner ₱3,500/hr
  { id: "TE-006", matterId: "M-2025-002", userId: "USR-002", activity: "Client interview - Castle", duration: 2.5, billable: false, rate: 0, date: "2025-02-10" },
  { id: "TE-007", matterId: "M-2025-002", userId: "USR-002", activity: "Court appearance - preliminary", duration: 4.0, billable: false, rate: 0, date: "2025-02-13" },
  { id: "TE-008", matterId: "M-2025-005", userId: "USR-002", activity: "BIR compliance review", duration: 1.5, billable: true, rate: 3500, date: "2025-02-15" },
  { id: "TE-009", matterId: "M-2025-008", userId: "USR-002", activity: "Deed of donation drafting", duration: 2.0, billable: false, rate: 0, date: "2025-02-16" },

  // Marci Stahl — Associate ₱2,500/hr
  { id: "TE-010", matterId: "M-2025-001", userId: "USR-004", activity: "Contract review", duration: 5.0, billable: true, rate: 2500, date: "2025-02-11" },
  { id: "TE-011", matterId: "M-2025-009", userId: "USR-004", activity: "Drafting pleadings", duration: 3.0, billable: false, rate: 0, date: "2025-02-14" },
  { id: "TE-012", matterId: "M-2025-007", userId: "USR-004", activity: "Notarial work - deeds", duration: 1.5, billable: true, rate: 2500, date: "2025-02-15" },

  // Blake Tower — Of Counsel ₱4,000/hr
  { id: "TE-013", matterId: "M-2025-011", userId: "USR-005", activity: "Estate planning consultation", duration: 3.0, billable: true, rate: 4000, date: "2025-02-19" },
  { id: "TE-014", matterId: "M-2025-007", userId: "USR-005", activity: "Deed of sale notarization", duration: 1.0, billable: true, rate: 4000, date: "2025-02-10" },

  // Karen Page — Paralegal ₱1,500/hr
  { id: "TE-015", matterId: "M-2025-002", userId: "USR-003", activity: "Legal research", duration: 6.0, billable: false, rate: 0, date: "2025-02-12" },
  { id: "TE-016", matterId: "M-2025-003", userId: "USR-003", activity: "Document preparation", duration: 2.5, billable: true, rate: 1500, date: "2025-02-14" },
  { id: "TE-017", matterId: "M-2025-010", userId: "USR-003", activity: "Client file organization", duration: 3.0, billable: false, rate: 0, date: "2025-02-18" },

  // Liza Cruz — Secretary (non-billable only)
  { id: "TE-018", matterId: "M-2025-001", userId: "USR-006", activity: "Scheduling & calls", duration: 2.0, billable: false, rate: 0, date: "2025-02-13" },
  { id: "TE-019", matterId: "M-2025-005", userId: "USR-006", activity: "Client follow-ups", duration: 1.5, billable: false, rate: 0, date: "2025-02-17" },
];