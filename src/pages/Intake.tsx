import { useState } from "react";
import { useStore } from "../store/useStore";
import { useToast } from "../components/Toast";
import { users } from "../data";
import type { Client } from "../types";
import { FileText, User, Briefcase, Users as UsersIcon, Receipt, type LucideIcon } from "lucide-react";
import MultiSelect from "../components/MultiSelect";

const natureOfCaseOptions = [
  { code: "1", label: "Litigation" },
  { code: "2", label: "Retainer" },
  { code: "3", label: "Labor" },
  { code: "4", label: "Special Project" },
] as const;

const filingInstructionOptions = [
  "Client's General File",
  "Separate File",
  "Existing File",
] as const;

const feeArrangements = [
  "Regular Rate",
  "Discounted Rate",
  "Dollar Rate",
  "Flat Fee",
  "Pro Bono",
  "Others",
];

const referralSources = [
  "Walk-in",
  "Existing Client",
  "Client Referral",
  "Word of Mouth",
  "Website",
  "Social Media",
  "Marketing Event",
  "Other",
];

type FormState = Partial<Client> & {
  feeArrangements?: string[];
  partnersList?: string[];
  associatesList?: string[];
};

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card space-y-4">
      <div className="flex items-start gap-3 pb-3 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
          <Icon size={16} />
        </div>
        <div>
          <h2 className="font-semibold text-sm">{title}</h2>
          {description && (
            <p className="text-xs text-muted mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Intake() {
  const addClient = useStore((s) => s.addClient);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const [form, setForm] = useState<FormState>({
    type: "Individual",
    urgency: "Medium",
    feeArrangements: [],
    partnersList: [],
    associatesList: [],
    referredByName: "",
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleFee = (fee: string) => {
    const current = form.feeArrangements ?? [];
    set(
      "feeArrangements",
      current.includes(fee) ? current.filter((f) => f !== fee) : [...current, fee]
    );
  };

  const eligiblePartners = users.filter((u) => u.roles.includes("MNG_PARTNER"));
  const eligibleAssociates = users.filter((u) => u.roles.includes("ATTORNEY"));
  const eligibleReferredTo = users.filter(
    (u) => u.roles.includes("ATTORNEY") || u.roles.includes("MNG_PARTNER")
  );

  const clearForm = () => {
    setForm({
      type: "Individual",
      urgency: "Medium",
      feeArrangements: [],
      partnersList: [],
      associatesList: [],
      referredByName: "",
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const client: Client = {
      id: `CL-${String(Date.now()).slice(-4)}`,
      name: form.name ?? "",
      type: (form.type as "Individual" | "Corporation") ?? "Individual",
      email: form.email ?? "",
      phone: form.phone ?? "",
      caseType: form.natureOfCase ?? form.caseType ?? "Unspecified",
      urgency: form.urgency ?? "Medium",
      createdAt: new Date().toISOString().slice(0, 10),
      clientNumber: form.clientNumber,
      fileNumber: form.fileNumber,
      address: form.address,
      nationality: form.nationality,
      contactOfficer: form.contactOfficer,
      dateAccepted: form.dateAccepted,
      natureOfCase: form.natureOfCase,
      natureOfEngagement: form.natureOfEngagement,
      partnersInCharge: (form.partnersList ?? []).join(", "),
      associatesAssigned: (form.associatesList ?? []).join(", "),
      briefFilingTitle: form.briefFilingTitle,
      feeArrangement: (form.feeArrangements ?? []).join(", "),
      filingInstruction: form.filingInstruction,
      referredBy: form.referredBy,
      referredByName: form.referredByName,
      referredTo: form.referredTo,
    };

    addClient(client);
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: "Created client engagement",
      target: client.id,
      timestamp: new Date().toISOString(),
    });
    push(`Client engagement ${client.id} saved.`);
    clearForm();
  };

  return (
    <div className="max-w-3xl pb-24">
      <div className="flex items-center gap-3 mb-1">
        <FileText size={22} className="text-brand" />
        <h1 className="text-xl md:text-2xl font-bold">
          Form No. 9 — Client Engagement
        </h1>
      </div>
      <p className="text-sm text-muted mb-6">
        Fill in the details below to register a new client engagement.
      </p>

      <form onSubmit={submit} className="space-y-4">
        {/* SECTION 1 — Client Info */}
        <Section
          icon={User}
          title="Client Information"
          description="Who is the client?"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Client Number</label>
              <input
                className="input"
                placeholder="e.g., 2025-001"
                value={form.clientNumber ?? ""}
                onChange={(e) => set("clientNumber", e.target.value)}
              />
            </div>
            <div>
              <label className="label">File Number</label>
              <input
                className="input"
                placeholder="e.g., M-2025-001"
                value={form.fileNumber ?? ""}
                onChange={(e) => set("fileNumber", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Client Name *</label>
            <input
              required
              className="input"
              placeholder="Individual or company name"
              value={form.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Client Type</label>
              <div className="flex gap-4 text-sm pt-2">
                {(["Individual", "Corporation"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={form.type === t}
                      onChange={() => set("type", t)}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Nationality</label>
              <input
                className="input"
                placeholder="e.g., Filipino"
                value={form.nationality ?? ""}
                onChange={(e) => set("nationality", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Client Address</label>
            <input
              className="input"
              placeholder="Full address"
              value={form.address ?? ""}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Officer at Client</label>
              <input
                className="input"
                placeholder="Name and position"
                value={form.contactOfficer ?? ""}
                onChange={(e) => set("contactOfficer", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Date Accepted</label>
              <input
                type="date"
                className="input"
                value={form.dateAccepted ?? ""}
                onChange={(e) => set("dateAccepted", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Email *</label>
              <input
                required
                type="email"
                className="input"
                value={form.email ?? ""}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input
                required
                className="input"
                value={form.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          </div>
        </Section>

        {/* SECTION 2 — Nature of Engagement */}
        <Section
          icon={Briefcase}
          title="Nature of Engagement"
          description="What kind of work is this?"
        >
          <div>
            <label className="label">Nature of Case</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {natureOfCaseOptions.map((opt) => {
                const selected = form.natureOfCase === opt.label;
                return (
                  <label
                    key={opt.code}
                    className={`flex items-center gap-3 border rounded-lg px-3 py-2 text-sm cursor-pointer transition ${
                      selected
                        ? "border-primary bg-primary-light"
                        : "border-border hover:bg-surface-hover hover:border-edge"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        set("natureOfCase", selected ? undefined : opt.label)
                      }
                    />
                    <span className="font-mono text-xs text-muted">
                      ({opt.code})
                    </span>
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">Nature of Engagement</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Describe the engagement"
              value={form.natureOfEngagement ?? ""}
              onChange={(e) => set("natureOfEngagement", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Brief Filing / Accounting Title</label>
            <input
              className="input"
              placeholder='e.g., "Fisk-Libel"'
              value={form.briefFilingTitle ?? ""}
              onChange={(e) => set("briefFilingTitle", e.target.value)}
            />
          </div>
        </Section>

        {/* SECTION 3 — Team Assignment */}
        <Section
          icon={UsersIcon}
          title="Team Assignment"
          description="Who will handle this engagement?"
        >
          <div>
            <label className="label">Partner(s) in Charge / Of Counsel</label>
            <MultiSelect
              placeholder="Search and select partners..."
              options={eligiblePartners.map((u) => ({
                value: u.name,
                label: u.name,
                sublabel: u.title,
              }))}
              selected={form.partnersList ?? []}
              onChange={(vals) => set("partnersList", vals)}
            />
          </div>

          <div>
            <label className="label">Associate(s) Assigned</label>
            <MultiSelect
              placeholder="Search and select associates..."
              options={eligibleAssociates.map((u) => ({
                value: u.name,
                label: u.name,
                sublabel: u.title,
              }))}
              selected={form.associatesList ?? []}
              onChange={(vals) => set("associatesList", vals)}
            />
          </div>
        </Section>

        {/* SECTION 4 — Billing & Referral */}
        <Section
          icon={Receipt}
          title="Billing & Referral"
          description="How will the client be billed, and who referred them?"
        >
          <div>
            <label className="label">Fee Arrangement</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {feeArrangements.map((fee) => {
                const selected = (form.feeArrangements ?? []).includes(fee);
                return (
                  <label
                    key={fee}
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition ${
                      selected
                        ? "border-primary bg-primary-light"
                        : "border-border hover:bg-surface-hover hover:border-edge"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleFee(fee)}
                    />
                    <span>{fee}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">Filing Instructions</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {filingInstructionOptions.map((opt) => {
                const selected = form.filingInstruction === opt;
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition ${
                      selected
                        ? "border-primary bg-primary-light"
                        : "border-border hover:bg-surface-hover hover:border-edge"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selected}
                      onChange={() => set("filingInstruction", opt)}
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Referred By (source)</label>
              <select
                className="input"
                value={form.referredBy ?? ""}
                onChange={(e) => set("referredBy", e.target.value)}
              >
                <option value="">Select source...</option>
                {referralSources.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">
                Who Referred?{" "}
                <span className="text-muted text-xs font-normal">
                  (optional)
                </span>
              </label>
              <input
                className="input"
                placeholder="Name of referrer"
                value={form.referredByName ?? ""}
                onChange={(e) => set("referredByName", e.target.value)}
                disabled={!form.referredBy || form.referredBy === "Walk-in"}
              />
              {form.referredBy === "Walk-in" && (
                <p className="text-xs text-muted mt-1">
                  Not applicable — client walked in.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Referred To</label>
            <select
              className="input"
              value={form.referredTo ?? ""}
              onChange={(e) => set("referredTo", e.target.value)}
            >
              <option value="">Select attorney...</option>
              {eligibleReferredTo.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name} — {u.title}
                </option>
              ))}
            </select>
          </div>
        </Section>

        {/* Consent */}
        <div className="card flex items-start gap-2 text-sm">
          <input required type="checkbox" className="mt-1" />
          <span>
            I consent to the processing of personal data in accordance with RA
            10173 (Data Privacy Act of 2012).
          </span>
        </div>
      </form>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-elevated/95 backdrop-blur-md border-t border-border p-3 md:p-4 z-30">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button onClick={submit} className="btn-primary flex-1">
            Save Engagement
          </button>
          <button
            type="button"
            onClick={clearForm}
            className="btn-secondary flex-1 md:flex-none md:px-6"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}