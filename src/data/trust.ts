import type { TrustTransaction } from "../types";

export const trustTransactions: TrustTransaction[] = [
  // Union Allied — retainer trust
  { id: "TR-001", clientId: "CL-001", date: "2025-02-01", reference: "TR-001", description: "Initial retainer deposit", debit: 0, credit: 300000 },
  { id: "TR-002", clientId: "CL-001", date: "2025-02-15", reference: "TR-002", description: "Applied to INV-001", debit: 100000, credit: 0 },

  // Josie's Bar — retainer trust
  { id: "TR-003", clientId: "CL-005", date: "2025-02-02", reference: "TR-003", description: "Monthly retainer deposit", debit: 0, credit: 50000 },
  { id: "TR-004", clientId: "CL-005", date: "2025-02-28", reference: "TR-004", description: "Applied to INV-002", debit: 50000, credit: 0 },

  // Marianna Art Gallery — flat fee trust
  { id: "TR-005", clientId: "CL-007", date: "2025-02-06", reference: "TR-005", description: "Flat fee advance", debit: 0, credit: 25000 },

  // Vistain Estate — retainer trust
  { id: "TR-006", clientId: "CL-011", date: "2025-02-18", reference: "TR-006", description: "Estate planning deposit", debit: 0, credit: 30000 },
  { id: "TR-007", clientId: "CL-011", date: "2025-02-25", reference: "TR-007", description: "Applied to estate work", debit: 12000, credit: 0 },
];