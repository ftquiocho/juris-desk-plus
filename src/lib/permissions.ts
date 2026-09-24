import type { Role } from "../types";

export type Permission =
  | "user:manage"
  | "audit:read"
  | "matter:assign"
  | "matter:create"
  | "matter:read"
  | "matter:close"
  | "matter:delegate"
  | "document:upload"
  | "document:approve"
  | "time:create"
  | "time:approve"
  | "invoice:create"
  | "invoice:approve"
  | "billing:view"
  | "trust:read"
  | "report:financial"
  | "intake:create"
  | "conflict:run"
  | "client:read"
  | "rate:manage";

const rolePermissions: Record<Role, Permission[]> = {
  SYS_ADMIN: [
    "user:manage",
    "rate:manage",
    "audit:read",
    "matter:read",
    "document:upload",
    "intake:create",
    "conflict:run",
    "billing:view",
    "trust:read",
    "report:financial",
    "client:read",
  ],
  MNG_PARTNER: [
    "audit:read",
    "matter:assign",
    "matter:create",
    "matter:read",
    "matter:close",
    "matter:delegate",
    "document:upload",
    "document:approve",
    "time:create",
    "time:approve",
    "invoice:approve",
    "billing:view",
    "rate:manage",
    "trust:read",
    "report:financial",
    "intake:create",
    "conflict:run",
    "client:read",
  ],
  ATTORNEY: [
    "matter:create",
    "matter:read",
    "matter:close",
    "matter:delegate",
    "document:upload",
    "document:approve",
    "time:create",
    "intake:create",
    "conflict:run",
    "client:read",
  ],
  PARALEGAL: [
    "matter:create",
    "matter:read",
    "document:upload",
    "time:create",
    "intake:create",
    "client:read",
  ],
  SECRETARY: [
    "matter:read",
    "document:upload",
    "intake:create",
    "time:create",
    "client:read",
  ],
  BILLING: [
    "invoice:create",
    "invoice:approve",
    "billing:view",
    "rate:manage",
    "trust:read",
    "report:financial",
    "matter:read",
    "client:read",
  ],
};

export function can(roles: Role[], permission: Permission): boolean {
  return roles.some((role) => rolePermissions[role]?.includes(permission));
}