import { useState, useMemo } from "react";
import { X, Calculator } from "lucide-react";
import { useStore } from "../store/useStore";
import { clients } from "../data";
import { useToast } from "./Toast";
import type { Invoice } from "../types";

export default function InvoiceModal({ onClose }: { onClose: () => void }) {
  const matters = useStore((s) => s.matters);
  const timeEntries = useStore((s) => s.timeEntries);
  const expenses = useStore((s) => s.expenses);
  const trustTransactions = useStore((s) => s.trustTransactions);
  const billedTimeEntryIds = useStore((s) => s.billedTimeEntryIds);
  const billedExpenseIds = useStore((s) => s.billedExpenseIds);
  const createInvoice = useStore((s) => s.createInvoice);
  const addTrustTransaction = useStore((s) => s.addTrustTransaction);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const [clientId, setClientId] = useState("");
  const [selectedMatterIds, setSelectedMatterIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [discount, setDiscount] = useState("0");
  const [trustApplied, setTrustApplied] = useState("0");

  const billableClients = useMemo(() => {
    const clientIds = new Set(matters.map((m) => m.clientId));
    return clients.filter((c) => clientIds.has(c.id));
  }, [matters]);

  const clientMatters = useMemo(
    () => matters.filter((m) => m.clientId === clientId),
    [matters, clientId]
  );

  const unbilledEntries = useMemo(() => {
    return timeEntries.filter(
      (t) =>
        t.billable &&
        !billedTimeEntryIds.includes(t.id) &&
        clientMatters.some((m) => m.id === t.matterId) &&
        (!selectedMatterIds.length ||
          selectedMatterIds.includes(t.matterId)) &&
        (!startDate || t.date >= startDate) &&
        (!endDate || t.date <= endDate)
    );
  }, [
    timeEntries,
    billedTimeEntryIds,
    clientMatters,
    selectedMatterIds,
    startDate,
    endDate,
  ]);

  const unbilledExpenses = useMemo(() => {
    return expenses.filter(
      (e) =>
        e.billable &&
        !billedExpenseIds.includes(e.id) &&
        clientMatters.some((m) => m.id === e.matterId) &&
        (!selectedMatterIds.length ||
          selectedMatterIds.includes(e.matterId)) &&
        (!startDate || e.date >= startDate) &&
        (!endDate || e.date <= endDate)
    );
  }, [
    expenses,
    billedExpenseIds,
    clientMatters,
    selectedMatterIds,
    startDate,
    endDate,
  ]);

  const timeSubtotal = unbilledEntries.reduce(
    (s, t) => s + t.duration * t.rate,
    0
  );
  const expenseSubtotal = unbilledExpenses.reduce((s, e) => s + e.amount, 0);
  const subtotal = timeSubtotal + expenseSubtotal;

  const trustBalance = trustTransactions
    .filter((t) => t.clientId === clientId)
    .reduce((s, t) => s + t.credit - t.debit, 0);
  const discountNum = parseFloat(discount) || 0;
  const trustNum = Math.min(
    parseFloat(trustApplied) || 0,
    trustBalance,
    subtotal
  );
  const total = Math.max(0, subtotal - trustNum - discountNum);

  const toggleMatter = (id: string) => {
    setSelectedMatterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || unbilledEntries.length + unbilledExpenses.length === 0)
      return;

    const invoice: Invoice = {
      id: `INV-${String(Date.now()).slice(-4)}`,
      clientId,
      matterIds: selectedMatterIds.length
        ? selectedMatterIds
        : clientMatters.map((m) => m.id),
      amount: total,
      status: "Draft",
      trustApplied: trustNum,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
    };

    createInvoice(
      invoice,
      unbilledEntries.map((t) => t.id),
      unbilledExpenses.map((e) => e.id)
    );

    // Debit trust immediately so balance reflects the applied amount
    if (trustNum > 0) {
      addTrustTransaction({
        id: `TR-${Date.now()}`,
        clientId,
        date: new Date().toISOString().slice(0, 10),
        reference: `INV-${invoice.id}`,
        description: `Applied to ${invoice.id}`,
        debit: trustNum,
        credit: 0,
      });
    }

    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: "Created invoice",
      target: invoice.id,
      timestamp: new Date().toISOString(),
    });

    push(`Invoice ${invoice.id} created for ₱${total.toLocaleString()}.`);
    onClose();
  };

  const totalLineItems = unbilledEntries.length + unbilledExpenses.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-3xl rounded-t-2xl md:rounded-2xl border border-border shadow-modal max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-brand" />
            <h2 className="font-semibold">Generate Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="flex-1 overflow-y-auto p-4 space-y-5"
        >
          <div>
            <label className="label">Client *</label>
            <select
              required
              className="input"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setSelectedMatterIds([]);
                setTrustApplied("0");
              }}
            >
              <option value="">Select a client...</option>
              {billableClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {clientId && (
            <>
              <div>
                <label className="label">
                  Matters{" "}
                  <span className="text-muted text-xs font-normal">
                    (leave blank to include all)
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {clientMatters.map((m) => {
                    const selected = selectedMatterIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition ${
                          selected
                            ? "border-primary bg-primary-light"
                            : "border-border hover:bg-surface-hover"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleMatter(m.id)}
                        />
                        <span className="truncate">{m.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label">
                  Period{" "}
                  <span className="text-muted text-xs font-normal">
                    (leave empty to include all dates)
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    className="input"
                    placeholder="From"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <input
                    type="date"
                    className="input"
                    placeholder="To"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="card !p-0 overflow-hidden">
                <div className="p-3 border-b border-border">
                  <h3 className="font-semibold text-sm">
                    Line Items ({totalLineItems})
                  </h3>
                </div>
                {totalLineItems === 0 ? (
                  <p className="p-4 text-sm text-muted text-center">
                    No unbilled entries in this period.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted border-b border-border">
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Item</th>
                          <th className="py-2 px-3 text-right">Hours</th>
                          <th className="py-2 px-3 text-right">Rate</th>
                          <th className="py-2 px-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unbilledEntries.map((t) => (
                          <tr key={t.id} className="border-b border-border">
                            <td className="py-2 px-3 text-xs">{t.date}</td>
                            <td className="py-2 px-3">{t.activity}</td>
                            <td className="py-2 px-3 text-right">
                              {t.duration}
                            </td>
                            <td className="py-2 px-3 text-right">
                              ₱{t.rate.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right font-medium">
                              ₱{(t.duration * t.rate).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        {unbilledExpenses.map((e) => (
                          <tr key={e.id} className="border-b border-border">
                            <td className="py-2 px-3 text-xs">{e.date}</td>
                            <td className="py-2 px-3">
                              {e.category}{" "}
                              <span className="text-muted text-xs">
                                (expense)
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right">—</td>
                            <td className="py-2 px-3 text-right">—</td>
                            <td className="py-2 px-3 text-right font-medium">
                              ₱{e.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Trust Applied (₱)</label>
                  <input
                    type="number"
                    className="input"
                    value={trustApplied}
                    onChange={(e) => setTrustApplied(e.target.value)}
                  />
                  <p className="text-xs text-muted mt-1">
                    Available: ₱{trustBalance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="label">Discount (₱)</label>
                  <input
                    type="number"
                    className="input"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
              </div>

              <div className="card bg-surface">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Subtotal</span>
                    <span>₱{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Trust Applied</span>
                    <span className="text-success">
                      -₱{trustNum.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Discount</span>
                    <span className="text-warning">
                      -₱{discountNum.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2 font-semibold text-base">
                    <span>Total Due</span>
                    <span className="text-brand">
                      ₱{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </form>

        <div className="p-4 border-t border-border flex gap-3">
          <button
            onClick={submit}
            disabled={
              !clientId || unbilledEntries.length + unbilledExpenses.length === 0
            }
            className="btn-primary flex-1 disabled:opacity-40"
          >
            Create Invoice
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}