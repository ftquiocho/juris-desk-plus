import { create } from "zustand";
import { clients, matters, documents, timeEntries, invoices, trustTransactions } from "../data";
import type { User, Client, Matter, LegalDocument, TimeEntry, Invoice, TrustTransaction, AuditEvent, Delegation, Reconciliation } from "../types";

interface StoreState {
  currentUser: User | null;
  clients: Client[];
  matters: Matter[];
  documents: LegalDocument[];
  timeEntries: TimeEntry[];
  invoices: Invoice[];
  trustTransactions: TrustTransaction[];
  auditLog: AuditEvent[];
  delegations: Delegation[];
  reconciliations: Reconciliation[];
  billedTimeEntryIds: string[];
  setCurrentUser: (user: User | null) => void;
  addClient: (client: Client) => void;
  addClients: (clients: Client[]) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  addDocument: (doc: LegalDocument) => void;
  approveDocument: (docId: string, userId: string) => void;
  rejectDocument: (docId: string) => void;
  addAuditEvent: (event: AuditEvent) => void;
  addDelegation: (delegation: Delegation) => void;
  removeDelegation: (id: string) => void;
  addReconciliation: (rec: Reconciliation) => void;
  createInvoice: (invoice: Invoice, billedEntryIds: string[]) => void;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  addTrustTransaction: (txn: TrustTransaction) => void;
}

export const useStore = create<StoreState>((set) => ({
  currentUser: null,
  clients,
  matters,
  documents,
  timeEntries,
  invoices,
  trustTransactions,
  auditLog: [],
  delegations: [],
  reconciliations: [],
  billedTimeEntryIds: [],
  setCurrentUser: (user) => set({ currentUser: user }),
  addClient: (client) => set((s) => ({ clients: [...s.clients, client] })),
  addClients: (list) => set((s) => ({ clients: [...s.clients, ...list] })),
  addTimeEntry: (entry) => set((s) => ({ timeEntries: [...s.timeEntries, entry] })),
  addDocument: (doc) => set((s) => ({ documents: [...s.documents, doc] })),
  approveDocument: (docId, userId) =>
    set((s) => ({
      documents: s.documents.map((d) =>
        d.id === docId ? { ...d, status: "Approved", approvedBy: userId } : d
      ),
    })),
  rejectDocument: (docId) =>
    set((s) => ({
      documents: s.documents.map((d) =>
        d.id === docId ? { ...d, status: "Rejected" } : d
      ),
    })),
  addAuditEvent: (event) => set((s) => ({ auditLog: [event, ...s.auditLog] })),
  addDelegation: (delegation) =>
    set((s) => ({ delegations: [...s.delegations, delegation] })),
  removeDelegation: (id) =>
    set((s) => ({ delegations: s.delegations.filter((d) => d.id !== id) })),
  addReconciliation: (rec) =>
    set((s) => ({ reconciliations: [rec, ...s.reconciliations] })),
  createInvoice: (invoice, billedEntryIds) =>
    set((s) => ({
      invoices: [invoice, ...s.invoices],
      billedTimeEntryIds: [...s.billedTimeEntryIds, ...billedEntryIds],
    })),
  updateInvoiceStatus: (id, status) =>
    set((s) => ({
      invoices: s.invoices.map((i) => (i.id === id ? { ...i, status } : i)),
    })),
  addTrustTransaction: (txn) =>
    set((s) => ({ trustTransactions: [...s.trustTransactions, txn] })),
}));