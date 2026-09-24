import type { Task } from "../types";

export const tasks: Task[] = [
  { id: "TSK-001", matterId: "M-2025-001", title: "Draft due diligence memo", assignedTo: "USR-003", dueDate: "2025-03-01", status: "In Progress", priority: "High", createdAt: "2025-02-10" },
  { id: "TSK-002", matterId: "M-2025-002", title: "File motion to dismiss", assignedTo: "USR-004", dueDate: "2025-03-05", status: "To Do", priority: "High", createdAt: "2025-02-11" },
  { id: "TSK-003", matterId: "M-2025-003", title: "Prepare judicial affidavit", assignedTo: "USR-003", dueDate: "2025-03-08", status: "To Do", priority: "High", createdAt: "2025-02-12" },
  { id: "TSK-004", matterId: "M-2025-005", title: "Renew business permits", assignedTo: "USR-002", dueDate: "2025-03-15", status: "To Do", priority: "Medium", createdAt: "2025-02-14" },
  { id: "TSK-005", matterId: "M-2025-010", title: "Interview Ben Urich", assignedTo: "USR-001", dueDate: "2025-03-02", status: "Done", priority: "Medium", createdAt: "2025-02-15" },
  { id: "TSK-006", matterId: "M-2025-006", title: "Draft deed of trust", assignedTo: "USR-001", dueDate: "2025-03-10", status: "In Progress", priority: "Medium", createdAt: "2025-02-16" },
  { id: "TSK-007", matterId: "M-2025-009", title: "Client interview follow-up", assignedTo: "USR-004", dueDate: "2025-03-04", status: "Done", priority: "Low", createdAt: "2025-02-17" },
  { id: "TSK-008", matterId: "M-2025-007", title: "Notarize deed of sale", assignedTo: "USR-005", dueDate: "2025-03-12", status: "To Do", priority: "Low", createdAt: "2025-02-18" },
];