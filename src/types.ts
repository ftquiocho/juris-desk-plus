export type Role =
  | "SYS_ADMIN"
  | "MNG_PARTNER"
  | "ATTORNEY"
  | "PARALEGAL"
  | "SECRETARY"
  | "BILLING";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  title: string;
  defaultRate?: number;
  active?: boolean;
}

export interface Client {
  id: string;
  name: string;
  type: "Individual" | "Corporation";
  email: string;
  phone: string;
  caseType: string;
  urgency: "Low" | "Medium" | "High";
  createdAt: string;

  // Form No. 9 — Client Engagement Memorandum fields
  clientNumber?: string;
  fileNumber?: string;
  address?: string;
  nationality?: string;
  contactOfficer?: string;
  dateAccepted?: string;
  natureOfCase?: "Litigation" | "Retainer" | "Labor" | "Special Project";
  natureOfEngagement?: string;
  partnersInCharge?: string;
  associatesAssigned?: string;
  briefFilingTitle?: string;
  feeArrangement?: string;
  filingInstruction?: "Client's General File" | "Separate File" | "Existing File";
  referredBy?: string;
  referredByName?: string;
  referredTo?: string;
}

export interface Matter {
  id: string;
  clientId: string;
  title: string;
  matterType: string;
  status: "Open" | "On Hold" | "Closed";
  attorneyId: string;
  paralegalId?: string;
  secretaryId?: string;
  court?: string;
  nextHearing?: string;
  billingType: "Hourly" | "Flat Fee" | "Contingency" | "Retainer" | "Pro Bono";
  openedAt: string;
}

export interface DocumentVersion {
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  status: "Draft" | "Pending Review" | "Approved" | "Rejected";
  notes?: string;
}

export interface LegalDocument {
  id: string;
  matterId: string;
  title: string;
  status: "Draft" | "Pending Review" | "Approved" | "Rejected";
  uploadedBy: string;
  version: number;
  approvedBy?: string;
  confidential: boolean;
  createdAt: string;
  versions?: DocumentVersion[];
}

export interface TimeEntry {
  id: string;
  matterId: string;
  userId: string;
  activity: string;
  duration: number;
  billable: boolean;
  rate: number;
  date: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  matterIds: string[];
  amount: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  trustApplied: number;
  dueDate: string;
}

export interface TrustTransaction {
  id: string;
  clientId: string;
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
}

export interface Reconciliation {
  id: string;
  bankStatement: number;
  trustLedger: number;
  clientLedgers: number;
  reconciledBy: string;
  reconciledAt: string;
  matched: boolean;
}

export interface AuditEvent {
  id: string;
  userId: string;
  action: string;
  target: string;
  timestamp: string;
}
export type ContactType =
  | "Opposing Party"
  | "Opposing Counsel"
  | "Court"
  | "Prosecutor"
  | "Expert Witness"
  | "Process Server"
  | "Notary Public"
  | "Witness";

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  email?: string;
  phone?: string;
  address?: string;
  organization?: string;
  notes?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  matterId: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: "To Do" | "In Progress" | "Done" | "Blocked";
  priority: "Low" | "Medium" | "High";
  createdAt: string;
}

export interface Expense {
  id: string;
  matterId: string;
  userId: string;
  date: string;
  category: string;
  amount: number;
  billable: boolean;
  notes?: string;
}

export interface Delegation {
  id: string;
  matterId: string;
  delegatorId: string;
  delegateId: string;
  startDate: string;
  endDate: string;
  scope: "matter" | "firm";
  createdAt: string;
}