import { useState } from "react";
import { X, User as UserIcon } from "lucide-react";
import { useStore } from "../store/useStore";
import { users } from "../data";
import { useToast } from "./Toast";
import MultiSelect from "./MultiSelect";
import type { Client } from "../types";

const natureOfCaseOptions = [
  "Litigation",
  "Retainer",
  "Labor",
  "Special Project",
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

export default function EditClientModal({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  const updateClient = useStore((s) => s.updateClient);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const [form, setForm] = useState<Client>({ ...client });
  const [feeList, setFeeList] = useState<string[]>(
    (client.feeArrangement ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const [partnersList, setPartnersList] = useState<string[]>(
    (client.partnersInCharge ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const [associatesList, setAssociatesList] = useState<string[]>(
    (client.associatesAssigned ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

  const set = <K extends keyof Client>(key: K, value: Client[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const eligiblePartners = users.filter((u) => u.roles.includes("MNG_PARTNER"));
  const eligibleAssociates = users.filter((u) => u.roles.includes("ATTORNEY"));
  const eligibleReferredTo = users.filter(
    (u) => u.roles.includes("ATTORNEY") || u.roles.includes("MNG_PARTNER")
  );

  const toggleFee = (fee: string) =>
    setFeeList((l) => (l.includes(fee) ? l.filter((x) => x !== fee) : [...l, fee]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Client = {
      ...form,
      caseType: form.natureOfCase ?? form.caseType ?? "Unspecified",
      feeArrangement: feeList.join(", "),
      partnersInCharge: partnersList.join(", "),
      associatesAssigned: associatesList.join(", "),
    };
    updateClient(updated);
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: "Updated client",
      target: client.id,
      timestamp: new Date().toISOString(),
    });
    push(`Client ${client.id} updated.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-3xl rounded-t-2xl md:rounded-2xl border border-border shadow-modal max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <UserIcon size={18} className="text-primary" />
            <h2 className="font-semibold">Edit Client</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Client Number</label>
              <input className="input" value={form.clientNumber ?? ""} onChange={(e) => set("clientNumber", e.target.value)} />
            </div>
            <div>
              <label className="label">File Number</label>
              <input className="input" value={form.fileNumber ?? ""} onChange={(e) => set("fileNumber", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Client Name *</label>
            <input required className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Client Type</label>
              <div className="flex gap-4 text-sm pt-2">
                {(["Individual", "Corporation"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-2">
                    <input type="radio" checked={form.type === t} onChange={() => set("type", t)} />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Nationality</label>
              <input className="input" value={form.nationality ?? ""} onChange={(e) => set("nationality", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <input className="input" value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Officer</label>
              <input className="input" value={form.contactOfficer ?? ""} onChange={(e) => set("contactOfficer", e.target.value)} />
            </div>
            <div>
              <label className="label">Date Accepted</label>
              <input type="date" className="input" value={form.dateAccepted ?? ""} onChange={(e) => set("dateAccepted", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Email *</label>
              <input required type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input required className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Nature of Case</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {natureOfCaseOptions.map((opt) => {
                const selected = form.natureOfCase === opt;
                return (
                  <label key={opt} className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition ${selected ? "border-primary bg-primary-light" : "border-border hover:bg-surface-hover"}`}>
                    <input type="checkbox" checked={selected} onChange={() => set("natureOfCase", selected ? undefined : opt as Client["natureOfCase"])} />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">Nature of Engagement</label>
            <textarea className="input" rows={2} value={form.natureOfEngagement ?? ""} onChange={(e) => set("natureOfEngagement", e.target.value)} />
          </div>

          <div>
            <label className="label">Brief Filing Title</label>
            <input className="input" value={form.briefFilingTitle ?? ""} onChange={(e) => set("briefFilingTitle", e.target.value)} />
          </div>

          <div>
            <label className="label">Partner(s) in Charge</label>
            <MultiSelect
              placeholder="Search..."
              options={eligiblePartners.map((u) => ({ value: u.name, label: u.name, sublabel: u.title }))}
              selected={partnersList}
              onChange={setPartnersList}
            />
          </div>

          <div>
            <label className="label">Associate(s) Assigned</label>
            <MultiSelect
              placeholder="Search..."
              options={eligibleAssociates.map((u) => ({ value: u.name, label: u.name, sublabel: u.title }))}
              selected={associatesList}
              onChange={setAssociatesList}
            />
          </div>

          <div>
            <label className="label">Fee Arrangement</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {feeArrangements.map((fee) => {
                const selected = feeList.includes(fee);
                return (
                  <label key={fee} className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition ${selected ? "border-primary bg-primary-light" : "border-border hover:bg-surface-hover"}`}>
                    <input type="checkbox" checked={selected} onChange={() => toggleFee(fee)} />
                    {fee}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">Filing Instructions</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {filingInstructionOptions.map((opt) => (
                <label key={opt} className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition ${form.filingInstruction === opt ? "border-primary bg-primary-light" : "border-border hover:bg-surface-hover"}`}>
                  <input type="radio" checked={form.filingInstruction === opt} onChange={() => set("filingInstruction", opt as Client["filingInstruction"])} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Referred By (source)</label>
              <select className="input" value={form.referredBy ?? ""} onChange={(e) => set("referredBy", e.target.value)}>
                <option value="">Select source...</option>
                {referralSources.map((r) => (<option key={r} value={r}>{r}</option>))}
              </select>
            </div>
            <div>
              <label className="label">Who Referred?</label>
              <input className="input" value={form.referredByName ?? ""} onChange={(e) => set("referredByName", e.target.value)} disabled={!form.referredBy || form.referredBy === "Walk-in"} />
            </div>
          </div>

          <div>
            <label className="label">Referred To</label>
            <select className="input" value={form.referredTo ?? ""} onChange={(e) => set("referredTo", e.target.value)}>
              <option value="">Select attorney...</option>
              {eligibleReferredTo.map((u) => (<option key={u.id} value={u.name}>{u.name} — {u.title}</option>))}
            </select>
          </div>
        </form>

        <div className="p-4 border-t border-border flex gap-3 shrink-0">
          <button onClick={submit} className="btn-primary flex-1">Save Changes</button>
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        </div>
      </div>
    </div>
  );
}