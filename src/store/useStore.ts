import { create } from "zustand";
import {
  clients,
  matters,
  documents,
  timeEntries,
  invoices,
  trustTransactions,
  tasks,
  users as seedUsers,
  contacts as seedContacts,
} from "../data";
import type {
  User,
  Client,
  Matter,
  LegalDocument,
  TimeEntry,
  Invoice,
  TrustTransaction,
  AuditEvent,
  Delegation,
  Reconciliation,
  Task,
  Expense,
  AppNotification,
  Contact,
} from "../types";

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
  tasks: Task[];
  expenses: Expense[];
  billedExpenseIds: string[];
  users: User[];
  notifications: AppNotification[];
  contacts: Contact[];

  setCurrentUser: (user: User | null) => void;
  addClient: (client: Client) => void;
  addClients: (clients: Client[]) => void;
  addMatter: (matter: Matter) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  approveDocument: (docId: string, userId: string) => void;
  rejectDocument: (docId: string) => void;
  addDocument: (doc: LegalDocument) => void;
  addAuditEvent: (event: AuditEvent) => void;
  addDelegation: (delegation: Delegation) => void;
  removeDelegation: (id: string) => void;
  addReconciliation: (rec: Reconciliation) => void;
  createInvoice: (
    invoice: Invoice,
    billedEntryIds: string[],
    billedExpenseIds: string[]
  ) => void;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  addTrustTransaction: (txn: TrustTransaction) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (id: string, status: Task["status"]) => void;
  addExpense: (expense: Expense) => void;
  updateUserRate: (userId: string, rate: number) => void;
  updateClient: (client: Client) => void;
  updateMatter: (matter: Matter) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  removeTask: (id: string) => void;
  removeExpense: (id: string) => void;
  addNotification: (notif: AppNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  clearNotifications: (userId: string) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deactivateUser: (userId: string) => void;
  reactivateUser: (userId: string) => void;
  addContact: (contact: Contact) => void;
  updateContact: (contact: Contact) => void;
  removeContact: (id: string) => void;
  uploadNewVersion: (
    docId: string,
    userId: string,
    notes?: string
  ) => void;
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
  tasks: tasks,
  expenses: [],
  billedExpenseIds: [],
  users: seedUsers,
  notifications: [],
  contacts: seedContacts,

  setCurrentUser: (user) => set({ currentUser: user }),
  addClient: (client) => set((s) => ({ clients: [...s.clients, client] })),
  addClients: (list) => set((s) => ({ clients: [...s.clients, ...list] })),
  addMatter: (matter) => set((s) => ({ matters: [...s.matters, matter] })),
  addTimeEntry: (entry) =>
    set((s) => ({ timeEntries: [...s.timeEntries, entry] })),
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
  addDocument: (doc) => set((s) => ({ documents: [...s.documents, doc] })),
  addAuditEvent: (event) =>
    set((s) => ({ auditLog: [event, ...s.auditLog] })),
  addDelegation: (delegation) =>
    set((s) => ({ delegations: [...s.delegations, delegation] })),
  removeDelegation: (id) =>
    set((s) => ({ delegations: s.delegations.filter((d) => d.id !== id) })),
  addReconciliation: (rec) =>
    set((s) => ({ reconciliations: [rec, ...s.reconciliations] })),
  createInvoice: (invoice, billedEntryIds, newBilledExpenseIds) =>
    set((s) => ({
      invoices: [invoice, ...s.invoices],
      billedTimeEntryIds: [...s.billedTimeEntryIds, ...billedEntryIds],
      billedExpenseIds: [...s.billedExpenseIds, ...newBilledExpenseIds],
    })),
  updateInvoiceStatus: (id, status) =>
    set((s) => ({
      invoices: s.invoices.map((i) => (i.id === id ? { ...i, status } : i)),
    })),
  addTrustTransaction: (txn) =>
    set((s) => ({ trustTransactions: [...s.trustTransactions, txn] })),
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTaskStatus: (id, status) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
  addExpense: (expense) =>
    set((s) => ({ expenses: [expense, ...s.expenses] })),
  updateUserRate: (userId, rate) =>
    set((s) => ({
      users: s.users.map((u) =>
        u.id === userId ? { ...u, defaultRate: rate } : u
      ),
    })),
  updateClient: (client) =>
    set((s) => ({
      clients: s.clients.map((c) => (c.id === client.id ? client : c)),
    })),
  updateMatter: (matter) =>
    set((s) => ({
      matters: s.matters.map((m) => (m.id === matter.id ? matter : m)),
    })),
  updateTask: (id, patch) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  updateExpense: (id, patch) =>
    set((s) => ({
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),
  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  removeExpense: (id) =>
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
  addNotification: (notif) =>
    set((s) => ({ notifications: [notif, ...s.notifications] })),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsRead: (userId) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.userId === userId ? { ...n, read: true } : n
      ),
    })),
  clearNotifications: (userId) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.userId !== userId),
    })),
  addUser: (user) => set((s) => ({ users: [...s.users, user] })),
  updateUser: (user) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === user.id ? user : u)),
    })),
  deactivateUser: (userId) =>
    set((s) => ({
      users: s.users.map((u) =>
        u.id === userId ? { ...u, active: false } : u
      ),
    })),
  reactivateUser: (userId) =>
    set((s) => ({
      users: s.users.map((u) =>
        u.id === userId ? { ...u, active: true } : u
      ),
    })),
  addContact: (contact) =>
    set((s) => ({ contacts: [contact, ...s.contacts] })),
  updateContact: (contact) =>
    set((s) => ({
      contacts: s.contacts.map((c) => (c.id === contact.id ? contact : c)),
    })),
  removeContact: (id) =>
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
  uploadNewVersion: (docId, userId, notes) =>
    set((s) => ({
      documents: s.documents.map((d) => {
        if (d.id !== docId) return d;
        const prevVersions = d.versions ?? [
          {
            version: d.version,
            uploadedBy: d.uploadedBy,
            uploadedAt: d.createdAt,
            status: d.status,
          },
        ];
        return {
          ...d,
          version: d.version + 1,
          status: "Pending Review" as const,
          versions: [
            ...prevVersions,
            {
              version: d.version + 1,
              uploadedBy: userId,
              uploadedAt: new Date().toISOString(),
              status: "Pending Review" as const,
              notes,
            },
          ],
        };
      }),
    })),
}));