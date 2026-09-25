# Juris Desk+ — Build Handoff

**Last updated:** 2026-09-23  
**Product:** Juris Desk+ — Enterprise Legal Practice Management  
**Demo Firm:** Nelson & Murdock Law Offices  
**Stack:** React 18 + Vite + TypeScript + TailwindCSS + Zustand + React Router + Recharts  
**Devices:** Mobile-first (phones → tablets → desktop)  
**Status:** Feature complete — A through 9 done. Building Tier 2 (Quick Create, Needs Attention, Extended Search) next.

---

## Live Deployment

**Production URL:** https://YOUR-URL.vercel.app
**Vercel Dashboard:** https://vercel.com/YOUR_USERNAME/juris-desk-plus
**GitHub Repo:** https://github.com/YOUR_USERNAME/juris-desk-plus

**Deploy workflow:**
1. Make changes locally
2. `git add . && git commit -m "message" && git push`
3. Vercel auto-deploys in ~30 seconds
4. Verify at the production URL

**SPA routing:** handled by `vercel.json` if present.

---


---

## How to Run

```bash
cd juris-desk-plus
npm install          # first time only
npm run dev          # opens http://localhost:5173
npx tsc --noEmit     # optional: type check
```

**After any `npm install`:** always restart the dev server (Vite caches deps and returns 504 on stale state).

**If styling breaks:** `rm -rf node_modules/.vite && npm run dev`

**If VS Code shows stale red squiggles:** `Cmd+Shift+P` → `TypeScript: Restart TS Server`.

---

## File Map

```
juris-desk-plus/
├── HANDOFF.md                    # This file
├── index.html                    # Browser tab title
├── package.json                  # Deps: react, zustand, react-router-dom, recharts, lucide-react
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json             # noUnusedLocals/Parameters/erasableSyntaxOnly = false
└── src/
    ├── config.ts                 # APP_CONFIG (branding)
    ├── types.ts                  # All TS interfaces
    ├── main.tsx                  # React entry
    ├── App.tsx                   # Routes
    ├── index.css                 # Tailwind + utility classes (.card, .btn-*, .input, .label)
    ├── store/
    │   └── useStore.ts           # Zustand store
    ├── lib/
    │   └── permissions.ts        # RBAC (can() function)
    │   └── csv.ts                # CSV parser + template download
    │   ├── printWindow.ts         # Reliable print via new-window HTML
    │   ├── conflictCheck.ts       # Shared conflict-check logic
    │   ├── trustAlerts.ts         # Trust balance utilities
    ├── hooks/
    │   └── useDelayedLoading.ts  # Simulated loading for demo
    ├── data/                     # Nelson & Murdock seed data
    │   ├── index.ts
    │   ├── users.ts              # 8 users
    │   ├── clients.ts            # 12 clients
    │   ├── matters.ts            # 12 matters
    │   ├── documents.ts          # 7 documents
    │   ├── timeEntries.ts        # 19 time entries
    │   ├── invoices.ts           # 5 invoices
    │   └── trust.ts              # 7 trust transactions
    │   ├── tasks.ts              # Seed tasks
    │   ├── templates.ts           # Document template catalog
    ├── components/
    │   ├── Layout.tsx            # Shell + mobile drawer + page transitions
    │   ├── Sidebar.tsx           # RBAC-aware nav (auto-closes on mobile tap)
    │   ├── TopBar.tsx            # Header + hamburger + bell
    │   ├── KpiCard.tsx
    │   ├── MatterCard.tsx
    │   ├── StatusBadge.tsx
    │   ├── Toast.tsx             # useToast() + ToastContainer
    │   ├── EmptyState.tsx
    │   ├── MultiSelect.tsx       # Searchable multi-select combobox
    │   ├── UserMenu.tsx          # Avatar dropdown: switch role, profile, sign out
    │   ├── SearchBar.tsx         # Global search with Cmd+K
    │   ├── DelegateModal.tsx     # Delegation form
    │   └── Skeleton.tsx          # Loading skeletons
    │   ├── ImportClientsModal.tsx # CSV import with preview
    │   ├── SearchBar.tsx
    │   ├── InvoiceModal.tsx
    │   ├── NewMatterModal.tsx    # Create matter
    │   ├── TaskModal.tsx          # Create task
    │   ├── TemplatePickerModal.tsx # Template picker
    │   ├── FloatingActions.tsx   # Unified floating stack (create + timer)
    └── pages/
        ├── Login.tsx             # Demo user picker
        ├── Dashboard.tsx         # Role-aware KPIs + matters
        ├── Intake.tsx            # Form No. 9 — Client Engagement Memorandum
        ├── ConflictCheck.tsx     # CPRA conflict search
        ├── MatterWorkspace.tsx   # 4 tabs + upload + delegate
        ├── Approvals.tsx         # Document approval inbox
        ├── Calendar.tsx          # Hearings & deadlines
        ├── Tasks.tsx             # Assigned tasks
        ├── TimeTracker.tsx       # Log billable hours
        ├── Billing.tsx           # 4 tabs: Overview, Invoices, Trust Ledger, Reconciliation
        ├── Reports.tsx           # Charts (Recharts)
        ├── Clients.tsx           # Client list with search + filter
        ├── Admin.tsx             # Users & roles
        ├── Profile.tsx           # User profile page
        ├── AuditLog.tsx          # Action history
        ├── Matters.tsx           # Matter list + new matter

```

---

## Feature Status

| # | Feature | File(s) | Status |
|---|---------|---------|--------|
| 1 | Login + role picker | `Login.tsx` | ✅ |
| 2 | Role-based dashboard | `Dashboard.tsx` | ✅ |
| 3 | Permission gating (RBAC) | `permissions.ts`, `Sidebar.tsx` | ✅ |
| 4 | Client intake — Form No. 9 | `Intake.tsx` | ✅ |
| 5 | Conflict check | `ConflictCheck.tsx` | ✅ |
| 6 | Matter workspace (tabs) | `MatterWorkspace.tsx` | ✅ |
| 7 | Document approvals | `Approvals.tsx` | ✅ |
| 8 | Calendar | `Calendar.tsx` | ✅ |
| 9 | Tasks | `Tasks.tsx` | ✅ |
| 10 | Time tracker | `TimeTracker.tsx` | ✅ |
| 11 | Billing center | `Billing.tsx` | ✅ |
| 12 | Admin console | `Admin.tsx` | ✅ |
| 13 | Audit log | `AuditLog.tsx` | ✅ |
| 14 | Toast notifications | `Toast.tsx` | ✅ |
| 15 | Centralized branding | `config.ts` | ✅ |
| 16 | Mobile shell (drawer) | `Layout`, `Sidebar`, `TopBar` | ✅ |
| 17 | **A. Document upload** | `MatterWorkspace.tsx` | ✅ RBAC-gated |
| 18 | Billing sees all matters | `Dashboard.tsx` | ✅ |
| 19 | **B. Trust reconciliation (3-way)** | `Billing.tsx` | ✅ |
| 20 | **C. Reports dashboard** | `Reports.tsx` | ✅ |
| 21 | **D. Delegation form** | `DelegateModal.tsx` | ✅ |
| 22 | **E. Client list page** | `Clients.tsx` | ✅ |
| 23 | **F1. Design system foundation** | `tailwind.config.js`, `index.css` | ✅ |
| 24 | **F2. Mobile retrofit** | All pages | ✅ |
| 25 | **F3. Skeleton loaders** | `Skeleton.tsx`, `useDelayedLoading.ts` | ✅ |
| 26 | **G. Form No. 9 intake** | `Intake.tsx` | ✅ |
| 27 | **G2. Dropdowns/multi-selects** | `MultiSelect.tsx` | ✅ |
| 28 | **G3. Referral detail + Client records** | `Intake.tsx`, `Clients.tsx` | ✅ |
| 29 | **H. Nelson & Murdock dataset** | `src/data/*` | ✅ |
| 30 | **J. User menu** (role switcher + profile + sign out) | `UserMenu.tsx`, `Profile.tsx` | ✅ |
| 31 | **K. Global search** (matters, clients, docs, ⌘K) | `SearchBar.tsx` | ✅ |
| 33 | **M. CSV import (Level 1)** | `ImportClientsModal.tsx`, `csv.ts` | ✅ |
| 34 | **N. Clients table (heavy data)** | `Clients.tsx` | ✅ |
| 35 | **O. Intake sectioned form** | `Intake.tsx` | ✅ |
| 36 | **P. New Matter** (modal + Matters page + client drawer button) | `NewMatterModal.tsx`, `Matters.tsx` | ✅ |
| 37 | **Q. Task creation** | `TaskModal.tsx`, `Tasks.tsx` | ✅ |
| 38 | **Q. Expense tracking** | `TimeTracker.tsx`, `InvoiceModal.tsx` | ✅ |
| 39 | **R. Per-user default rates** | `types.ts`, `users.ts`, `TimeTracker.tsx` | ✅ (foundation) |
| 40 | **S. Rates Management** | `Admin.tsx` (Rates tab), `Billing.tsx` (Rate Card tab) | ✅ |
| 41 | **T. Matter Closure** | `MatterWorkspace.tsx` | ✅ |
| 42 | **Dashboard sort + grid/list toggle** | `Dashboard.tsx` | ✅ |
| 43 | **V. Notifications** | `NotificationBell.tsx`, store | ✅ |
| 44 | **W. Admin user management** | `UserFormModal.tsx`, `Admin.tsx` | ✅ |
| 45 | **Button UI polish** | `index.css` (`.icon-btn`) | ✅ |
| 49 | **Z2. Reliable print** (new-tab HTML) | `printWindow.ts` | ✅ |
| 53 | **#7 Matter-level conflict check** | `ConflictCheck.tsx`, `NewMatterModal.tsx`, `conflictCheck.ts` | ✅ |
| 54 | **#8 Document templates** | `TemplatePickerModal.tsx`, `templates.ts` | ✅ |
| 55 | **#9 Trust account alerts** | `trustAlerts.ts`, `Billing.tsx`, `Admin.tsx` | ✅ |

---

## Known Gotchas

1. **Zustand selectors:** Never call `.filter()` / `.map()` / `.sort()` **inside** `useStore((s) => ...)`. Select the raw array, derive in the component body. Violation = infinite re-render loop.

2. **File casing:** All `.tsx` files are **PascalCase** (`Sidebar.tsx`, not `sidebar.tsx`). macOS hides mismatches; TS/Vite don't.

3. **tsconfig flags:** `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` must all be `false` in `tsconfig.app.json`.

4. **Vite cache (504 Outdated Optimize Dep):** After any `npm install`, stop the dev server, run `rm -rf node_modules/.vite`, then `npm run dev`. Hard refresh the browser (`Cmd+Shift+R`).

5. **Mac rename trick:** `mv a.tsx A.tsx` is a no-op on case-insensitive filesystems. Use two-step: `mv a.tsx a_tmp.tsx && mv a_tmp.tsx A.tsx`.

6. **Recharts + TS:** `KpiTile` icon prop must use `type LucideIcon` from `lucide-react`, not `React.ComponentType<{ size?: number }>`. Tooltip formatter takes `ValueType` — cast with `Number(value)`.

7. **Stale TS server:** If VS Code shows module-not-found for files that exist, restart the TS server. Not a real error.

8. **RoleSwitcher.tsx removed:** The demo role switcher now lives inside `UserMenu.tsx` (behind the avatar). Click the avatar in the top bar to switch users.

---

## Mobile-First Rules

Every component and page must:

- Stack vertically on phones (`grid-cols-1` first, then `sm:grid-cols-2`, `lg:grid-cols-4`)
- Use `p-4 md:p-6` for page padding
- Stack headers on narrow screens (`flex-wrap`)
- Use `overflow-x-auto` for tab bars and tables
- Hide non-essential chrome on mobile (`hidden md:block`)
- Close sidebar drawer on nav tap

---

## Seed Users — Nelson & Murdock Theme

| ID | Name | Roles | Title |
|----|------|-------|-------|
| USR-001 | Atty. Matt Murdock | `MNG_PARTNER` + `ATTORNEY` | Co-Founder / Managing Partner |
| USR-002 | Atty. Franklin Nelson | `MNG_PARTNER` + `ATTORNEY` | Co-Founder / Managing Partner |
| USR-003 | Karen Page | `PARALEGAL` | Office Manager / Paralegal |
| USR-004 | Atty. Marci Stahl | `ATTORNEY` | Senior Associate |
| USR-005 | Atty. Blake Tower | `ATTORNEY` | Of Counsel |
| USR-006 | Liza Cruz | `SECRETARY` | Legal Secretary |
| USR-007 | Carlo Garcia | `BILLING` | Billing Officer |
| USR-008 | Rafael Lim | `SYS_ADMIN` | IT Administrator |

---

## Seed Clients — 12 total

| # | Name | Type | Case Type | Billing |
|---|------|------|-----------|---------|
| 1 | Union Allied Construction Corp. | Corporation | Corporate | Retainer |
| 2 | Frank Castle | Individual | Criminal | Pro Bono |
| 3 | John Healy | Individual | Criminal | Flat Fee |
| 4 | Elena Cardenas | Individual | Civil | Pro Bono |
| 5 | Josie's Bar & Grill | Corporation | Corporate | Retainer |
| 6 | Elektra Natchios | Individual | Corporate | Hourly |
| 7 | Marianna Art Gallery | Corporation | Notarial | Flat Fee |
| 8 | Church of St. Agnes | Corporation | Notarial | Pro Bono |
| 9 | Turk Barrett | Individual | Criminal | Pro Bono |
| 10 | Ben Urich | Individual | Civil | Discounted Rate |
| 11 | Marlene Vistain | Individual | Civil | Hourly |
| 12 | Roscoe Sweeney | Individual | Criminal | Flat Fee |

---

## Seed Matters — 12 total

| ID | Title | Client | Court | Attorney | Billing |
|----|-------|--------|-------|----------|---------|
| M-2025-001 | Union Allied Construction Case | CL-001 | SEC - Taguig | USR-001 | Retainer |
| M-2025-002 | People v. Frank Castle | CL-002 | RTC Manila Br. 12 | USR-002 | Pro Bono |
| M-2025-003 | People v. Healy | CL-003 | MeTC Pasay Br. 5 | USR-001 | Flat Fee |
| M-2025-004 | Cardenas v. Vasquez | CL-004 | MeTC Manila Br. 8 | USR-001 | Pro Bono |
| M-2025-005 | Josie's Bar Retainer | CL-005 | BIR / City Hall Manila | USR-002 | Retainer |
| M-2025-006 | Natchios Estate | CL-006 | RTC Makati Br. 4 | USR-001 | Hourly |
| M-2025-007 | Marianna Notarials | CL-007 | — | USR-005 | Flat Fee |
| M-2025-008 | St. Agnes Deeds | CL-008 | Registry of Deeds Manila | USR-002 | Pro Bono |
| M-2025-009 | Barrett v. City of Manila | CL-009 | RTC Manila Br. 22 | USR-004 | Pro Bono |
| M-2025-010 | Urich Press Matter | CL-010 | RTC Manila Br. 30 | USR-001 | Hourly |
| M-2025-011 | Vistain Estate | CL-011 | RTC Makati Br. 9 | USR-005 | Hourly |
| M-2025-012 | People v. Sweeney | CL-012 | MeTC Pasay Br. 2 | USR-001 | Flat Fee |

---

## Permission Model

Defined in `src/lib/permissions.ts`:

```typescript
can(roles: Role[], permission: Permission): boolean
```

- Permissions use `resource:action` format (`matter:create`, `document:approve`)
- Roles: `SYS_ADMIN`, `MNG_PARTNER`, `ATTORNEY`, `PARALEGAL`, `SECRETARY`, `BILLING`
- Multi-role user = union of permissions

**Current Permission list:**
`user:manage`, `audit:read`, `matter:assign`, `matter:create`, `matter:read`, `matter:close`, `matter:delegate`, `document:upload`, `document:approve`, `time:create`, `time:approve`, `invoice:create`, `invoice:approve`, `billing:view`, `trust:read`, `report:financial`, `intake:create`, `conflict:run`, `client:read`

---

## RBAC Quick Reference

| Role | Dashboard | Intake | Clients | Approvals | Billing | Reports | Admin | Audit | Time |
|------|:---------:|:------:|:-------:|:---------:|:-------:|:-------:|:-----:|:-----:|:----:|
| `SYS_ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `MNG_PARTNER` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| `ATTORNEY` | ✅ | ✅ | ✅ | ✅ | — | — | — | — | ✅ |
| `PARALEGAL` | ✅ | ✅ | ✅ | — | — | — | — | — | ✅ |
| `SECRETARY` | ✅ | ✅ | ✅ | — | — | — | — | — | ✅ |
| `BILLING` | ✅ | — | ✅ | — | ✅ | ✅ | — | — | — |

Sidebar items are dimmed (not hidden) when permission is missing, with tooltip.
**Sidebar item order:** Dashboard · Client Intake · Clients · Matters · Conflict Check · Calendar · Tasks · Approvals · Time Tracker · Billing · Reports · Admin · Audit Log

---

## Billing Rates (Nelson & Murdock)

| Role | Rate | Note |
|------|------|------|
| Managing Partner | ₱3,500/hr | Matt, Foggy |
| Of Counsel | ₱4,000/hr | Blake Tower |
| Senior Associate | ₱2,500/hr | Marci Stahl |
| Paralegal | ₱1,500/hr | Karen Page |
| Secretary | Non-billable only | Liza Cruz |

---

## Billing Types Supported

| Type | Example |
|------|---------|
| Hourly | Regular Rate, Discounted Rate, Dollar Rate |
| Flat Fee | Notarial, SEC registration, contract drafting |
| Contingency | 25% cap (CPRA Rule 20) |
| Retainer | Monthly/annual (Union Allied, Josie's Bar) |
| Pro Bono | Free legal service (Castle, Cardenas, etc.) |

---

## PH Compliance Notes (Embedded in App)

| Rule | Feature |
|------|---------|
| **CPRA Rule 15.03** — Conflict check before new matters | `ConflictCheck.tsx` |
| **CPRA Canon 16** — Trust accounting separate from operating funds | `Billing.tsx` + Reconciliation tab |
| **RA 10173** — Data privacy consent | `Intake.tsx` consent checkbox |
| **Rule 22** — Deadline computation | `Calendar.tsx` hearing dates |

---

## Form No. 9 — Client Engagement Memorandum

The intake form captures:

- Client Number / File Number
- Client Name, Type, Address, Nationality
- Contact Officer at Client
- Date Accepted
- **Nature of Case** (Litigation / Retainer / Labor / Special Project)
- **Nature of Engagement** (free text)
- **Partner(s) in Charge** — multi-select from `MNG_PARTNER` users
- **Associate(s) Assigned** — multi-select from `ATTORNEY` users
- **Brief Filing / Accounting Title**
- **Fee Arrangement** — multi-checkbox (Regular, Discounted, Dollar, Flat, Pro Bono, Others)
- **Filing Instructions** — radio (Client's General File / Separate File / Existing File)
- **Referred By** — dropdown (Walk-in, Existing Client, Client Referral, Word of Mouth, Website, Social Media, Marketing Event, Other)
- **Who Referred?** — free text (disabled when "Walk-in")
- **Referred To** — dropdown of firm attorneys

All fields persist to the client record and display on the Clients page expansion.

---

## Demo Flows (Test Scripts)

### Flow 1 — Form No. 9 Intake
1. Login as **Liza Cruz (Secretary)** → Intake
2. Fill form — use MultiSelect for Partners/Associates
3. Set Referral to **Client Referral** → fill "Who Referred"
4. Save → toast + audit entry
5. Go to **Clients** → expand → verify all sections show

### Flow 2 — Conflict Check
1. Login as **Matt Murdock** → Conflict Check
2. Type "Castle" → Run → potential conflict found
3. Type "Nobody" → Run → clear

### Flow 3 — Document Upload + Approval
1. As **Matt** → open M-2025-002 → Documents tab → upload a file
2. As **Foggy** → Approvals → approve it
3. Toast + audit entry

### Flow 4 — Delegation
1. As **Matt** → M-2025-001 → Delegate button → select **Foggy**
2. Set dates → Confirm
3. Overview tab shows Active Delegations card

### Flow 5 — Time → Billing → Trust
1. As **Matt** → Time Tracker → log 2h billable on M-2025-001
2. As **Carlo (Billing)** → Billing → Overview shows unbilled time
3. Go to **Reconciliation** tab → 3-way balance shown → Reconcile

### Flow 6 — Reports
1. As **Matt** → Reports → charts render
2. Hover tooltips work

### Flow 7 — RBAC Demo
1. As **Karen (Paralegal)** → sidebar shows dimmed items for Billing/Admin/Audit/Reports
2. As **Carlo (Billing)** → no Intake or Approvals

---

## Next Action

If resuming in a fresh chat, say:

> "Juris Desk+ demo. All features A–H complete. Here's HANDOFF.md:"

Then paste this file.

---

## Changelog

| Date | Change |
|------|--------|
| Initial | Feature build 1–10 (through Time Tracker) + Toasts + Branding |
| 2026-09-2X | Mobile shell retrofit + Feature A (document upload) |
| 2026-09-2X | Fix: Billing sees all matters; upload gated by RBAC |
| 2026-09-23 | Feature C — Reports Dashboard with Recharts |
| 2026-09-23 | Feature D — Delegation Form on Matter Workspace |
| 2026-09-23 | Feature B — Trust Reconciliation (3-way) |
| 2026-09-23 | Feature E — Client List with search + filter |
| 2026-09-23 | Feature F1 — Design system foundation |
| 2026-09-23 | Feature F2 — Mobile retrofit across all remaining pages |
| 2026-09-23 | Feature F3 — Skeleton loaders on all data-heavy pages |
| 2026-09-23 | Feature G — Form No. 9 (Client Engagement Memorandum) |
| 2026-09-23 | Feature G2 — Dropdowns + multi-selects for Partner/Associate/Referral |
| 2026-09-23 | Feature G3 — Referral detail + Form No. 9 shown on Clients page |
| 2026-09-23 | Feature H — Nelson & Murdock themed dataset |
| 2026-09-23 | Feature J — User menu dropdown: role switcher, My Profile, Sign Out |
| 2026-09-23 | Feature K — Working global search with ⌘K shortcut, grouped results, keyboard nav |
| 2026-09-23 | Feature M — CSV import with template download + duplicate detection |
| 2026-09-23 | Feature N — Clients list: paginated table, sortable columns, per-page selector, detail drawer |
| 2026-09-23 | Feature O — Intake form split into 4 sections with sticky action bar |
| 2026-09-23 | Feature P — New Matter: modal + Matters list page + Create-from-client drawer button |
| 2026-09-23 | Feature Q — Task creation + Expense tracking, invoice includes expenses |
| 2026-09-23 | Feature R — Per-user default rates (auto-fill in Time Tracker) |
| 2026-09-23 | Feature S — Rates Management (Admin edit + Billing rate card + live auto-fill) |
| 2026-09-23 | Feature T — Matter Closure with trust/unpaid warnings |
| 2026-09-23 | Dashboard — Sort dropdown + grid/list toggle |
| 2026-09-24 | Feature V — Notifications with read/unread, mark-all, clear-all |
| 2026-09-24 | Feature W — Admin user CRUD: add, edit, deactivate, reactivate |
| 2026-09-24 | UI — `.icon-btn` classes for consistent icon-button affordance |
| 2026-09-24 | Fix Z — Print now opens a clean HTML page in a new tab (Chrome print preview fix) |
| 2026-09-24 | Deployed to Vercel via GitHub — live production URL |
| 2026-09-24 | Accessibility audit + light mode contrast fixes (WCAG AA) |
| 2026-09-24 | Shadows now theme-aware via CSS variables |
| 2026-09-25 | Feature 7 — Matter-level conflict check (clients + contacts + matters) with consent workflow |
| 2026-09-25 | Feature 8 — Document templates with auto-filled titles and version notes |
| 2026-09-25 | Feature 9 — Trust alerts with configurable threshold + Billing dashboard warning |
| 2026-09-25 | UI — Consolidated floating buttons into single right-side stack (create + timer) |
| 2026-09-25 | UI — Toasts moved to top-center to avoid floating action overlap |
| 2026-09-25 | Accessibility audit — fixed WCAG AA contrast failures in light + dark modes |
| 2026-09-25 | Accessibility — replaced all `bg-primary text-white` with proper fg or brand tokens |

---

## Remaining / Future Work

### Phase 2 (post-demo)
- Client portal
- E-signature (DocuSign / Adobe Sign)
- Payment gateway
- E-filing (eCourt / e-Subpoena)
- AI document review
- Native mobile app
- Advanced BI dashboards
- Workflow automation builder

### Polish (optional)
- Dark mode toggle
- Keyboard shortcuts (`Cmd+K` global search)
- Advanced sorting on tables
- Custom date range pickers
- Export to PDF for invoices
- Email integration (Outlook / Gmail API)
- Calendar sync (Outlook / Google)

### Data & Backend
- Real API (REST or GraphQL)
- PostgreSQL or Supabase
- Auth (JWT + 2FA)
- File storage (S3 / GCS)
- Multi-tenant isolation
- Audit log persistence
- Trust reconciliation with real bank feed 

- **Rates management tab** — Billing/Admin UI to edit per-user rates
- Task assignment notifications
- Recurring tasks
- Billable expense markup (%)

- Notifications system
- Admin user management (create/deactivate/reset)
- Contact management (opposing counsel, courts, experts)
- Document versioning UI
- PDF export
- Edit modes for clients/matters/tasks/expenses

---
### Design System 
### Semantic Color Pairs

Each semantic color has three tokens:

- `--success` — brand/vibrant, used for buttons and icons
- `--success-light` — pale background, used for badges and banners
- `--success-ink` — text-safe variant, MUST be used for text on `--success-light` backgrounds

**Dark mode:** `-ink` is a lighter shade (still passes on dark tints)  
**Light mode:** `-ink` is a darker shade (passes 4.5:1 on white and `-light` tints)

**Rule of thumb:** if you're putting text on a `-light` background, always use `-ink`.

### Shadows

All shadows are CSS variables set per theme:

- `--shadow-card` / `--shadow-card-hover` — subtle on light, stronger on dark
- `--shadow-glow` — red glow, softened in light mode
- `--shadow-btn` / `--shadow-btn-hover` — button elevation
- `--shadow-modal` — modal + dropdown elevation

Never use raw `shadow-2xl`, `shadow-lg`, or hard-coded shadow values in components. Use `shadow-modal`, `shadow-card`, or `shadow-glow`.

### Contrast Rules (WCAG 2.1 AA)

- **Text minimum:** 4.5:1 for body text, 3:1 for large text (≥18pt)
- **Icon minimum:** 3:1 against its background
- **Primary button text** uses `text-primary-fg` — never `text-white`
- **Brand button text** uses `text-white` — brand is always crimson and dark enough
- **Never** use `bg-primary text-white` — primary can be light (dark mode) so white text fails

**Semantic background + text pairing:**
| Background | Text |
|-----------|------|
| `bg-primary` | `text-primary-fg` |
| `bg-brand` | `text-white` |
| `bg-danger` | `text-white` |
| `bg-success-light` | `text-success-ink` |
| `bg-warning-light` | `text-warning-ink` |
| `bg-danger-light` | `text-danger-ink` |
| `bg-info-light` | `text-info-ink` |
| `bg-brand-light` | `text-brand` |