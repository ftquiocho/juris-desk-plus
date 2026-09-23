import type { Invoice } from "../types";

export const invoices: Invoice[] = [
  {
    id: "INV-001",
    clientId: "CL-001",
    matterIds: ["M-2025-001"],
    amount: 175000,
    status: "Sent",
    trustApplied: 100000,
    dueDate: "2025-03-15",
  },
  {
    id: "INV-002",
    clientId: "CL-005",
    matterIds: ["M-2025-005"],
    amount: 50000,
    status: "Paid",
    trustApplied: 50000,
    dueDate: "2025-03-01",
  },
  {
    id: "INV-003",
    clientId: "CL-006",
    matterIds: ["M-2025-006"],
    amount: 14000,
    status: "Draft",
    trustApplied: 0,
    dueDate: "2025-03-20",
  },
  {
    id: "INV-004",
    clientId: "CL-007",
    matterIds: ["M-2025-007"],
    amount: 25000,
    status: "Sent",
    trustApplied: 0,
    dueDate: "2025-03-10",
  },
  {
    id: "INV-005",
    clientId: "CL-011",
    matterIds: ["M-2025-011"],
    amount: 12000,
    status: "Unpaid" as any,
    trustApplied: 0,
    dueDate: "2025-03-25",
  },
];