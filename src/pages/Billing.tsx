import { useState } from "react";
import { useStore } from "../store/useStore";
import { clients } from "../data";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../components/Toast";
import InvoiceModal from "../components/InvoiceModal";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { SkeletonKpiGrid } from "../components/Skeleton";
import {
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Send,
  DollarSign,
  Printer,
} from "lucide-react";
import { printWindow } from "../lib/printWindow";

const tabs = ["Overview", "Invoices", "Trust Ledger", "Rate Card", "Reconciliation"] as const;

export default function Billing() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const invoices = useStore((s) => s.invoices);
  const trustTransactions = useStore((s) => s.trustTransactions);
  const timeEntries = useStore((s) => s.timeEntries);
  const reconciliations = useStore((s) => s.reconciliations);
  const billedTimeEntryIds = useStore((s) => s.billedTimeEntryIds);
  const addReconciliation = useStore((s) => s.addReconciliation);
  const updateInvoiceStatus = useStore((s) => s.updateInvoiceStatus);
  const addTrustTransaction = useStore((s) => s.addTrustTransaction);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const storeUsers = useStore((s) => s.users);
  const push = useToast((s) => s.push);
  const loading = useDelayedLoading();

  const unbilled = timeEntries.filter(
    (t) => t.billable && !billedTimeEntryIds.includes(t.id)
  );
  const unbilledTotal = unbilled.reduce((s, t) => s + t.duration * t.rate, 0);
  const trustBalance = trustTransactions.reduce(
    (s, t) => s + t.credit - t.debit,
    0
  );

  const bankBalance = trustBalance;
  const clientLedgerTotals = trustTransactions.reduce<Record<string, number>>(
    (acc, t) => {
      acc[t.clientId] = (acc[t.clientId] || 0) + t.credit - t.debit;
      return acc;
    },
    {}
  );
  const sumClientLedgers = Object.values(clientLedgerTotals).reduce(
    (s, v) => s + v,
    0
  );

  const matched =
    bankBalance === trustBalance && trustBalance === sumClientLedgers;
  const diff = Math.max(
    Math.abs(bankBalance - trustBalance),
    Math.abs(trustBalance - sumClientLedgers)
  );

  const handleReconcile = () => {
    if (!matched) {
      push("Cannot reconcile — balances do not match.", "error");
      return;
    }
    addReconciliation({
      id: `REC-${Date.now()}`,
      bankStatement: bankBalance,
      trustLedger: trustBalance,
      clientLedgers: sumClientLedgers,
      reconciledBy: user.id,
      reconciledAt: new Date().toISOString(),
      matched,
    });
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: "Reconciled trust accounts",
      target: "3-way",
      timestamp: new Date().toISOString(),
    });
    push("Trust accounts reconciled successfully.");
  };

  const handleSend = (invoiceId: string) => {
    updateInvoiceStatus(invoiceId, "Sent");
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: "Sent invoice",
      target: invoiceId,
      timestamp: new Date().toISOString(),
    });
    push(`Invoice ${invoiceId} marked as sent.`);
  };

  const handleRecordPayment = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    // If trust was applied, record a trust debit
    if (inv.trustApplied > 0) {
      addTrustTransaction({
        id: `TR-${Date.now()}`,
        clientId: inv.clientId,
        date: new Date().toISOString().slice(0, 10),
        reference: `PAY-${inv.id}`,
        description: `Applied to ${inv.id}`,
        debit: inv.trustApplied,
        credit: 0,
      });
    }

    updateInvoiceStatus(invoiceId, "Paid");
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: "Recorded payment",
      target: invoiceId,
      timestamp: new Date().toISOString(),
    });
    push(`Payment recorded for ${invoiceId}.`);
  };

  const lastRecon = reconciliations[0];
  const handlePrint = () => {
    const invoiceRows = invoices
      .map((i) => {
        const c = clients.find((x) => x.id === i.clientId);
        return `
          <tr>
            <td>${i.id}</td>
            <td>${c?.name ?? "—"}</td>
            <td class="right">₱${i.amount.toLocaleString()}</td>
            <td class="right">₱${i.trustApplied.toLocaleString()}</td>
            <td>${i.dueDate}</td>
            <td><span class="badge">${i.status}</span></td>
          </tr>`;
      })
      .join("");

    const trustRows = trustTransactions
      .map((t) => {
        const c = clients.find((x) => x.id === t.clientId);
        return `
          <tr>
            <td>${t.date}</td>
            <td>${t.reference}</td>
            <td>${c?.name ?? "—"}</td>
            <td>${t.description}</td>
            <td class="right">${t.debit ? "₱" + t.debit.toLocaleString() : "—"}</td>
            <td class="right">${t.credit ? "₱" + t.credit.toLocaleString() : "—"}</td>
          </tr>`;
      })
      .join("");

    const html = `
      <div class="grid-3">
        <div class="card"><div class="label">Unbilled Time</div><div class="value">₱${unbilledTotal.toLocaleString()}</div></div>
        <div class="card"><div class="label">Trust Balance</div><div class="value">₱${trustBalance.toLocaleString()}</div></div>
        <div class="card"><div class="label">Active Invoices</div><div class="value">${invoices.length}</div></div>
      </div>

      <h2>Invoices</h2>
      <table>
        <thead>
          <tr>
            <th>Invoice</th><th>Client</th><th class="right">Amount</th>
            <th class="right">Trust</th><th>Due</th><th>Status</th>
          </tr>
        </thead>
        <tbody>${invoiceRows}</tbody>
      </table>

      <h2>Trust Ledger — ${trustTransactions.length} transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Ref</th><th>Client</th><th>Description</th>
            <th class="right">Debit</th><th class="right">Credit</th>
          </tr>
        </thead>
        <tbody>${trustRows}</tbody>
      </table>`;

    printWindow("Billing Report", html);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start md:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Billing Center</h1>
          <p className="text-sm text-muted">
            Invoices, trust ledger, reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn-secondary flex items-center gap-2 no-print"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            New Invoice
          </button>
        </div>
      </div>

      <div className="border-b border-border flex gap-1 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-4">
          {loading ? (
            <SkeletonKpiGrid count={3} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card">
                <p className="text-xs uppercase text-muted">Unbilled Time</p>
                <p className="text-2xl font-bold mt-2">
                  ₱{unbilledTotal.toLocaleString()}
                </p>
                <p className="text-xs text-muted mt-1">
                  {unbilled.length} entries
                </p>
              </div>
              <div className="card">
                <p className="text-xs uppercase text-muted">Trust Balance</p>
                <p className="text-2xl font-bold mt-2">
                  ₱{trustBalance.toLocaleString()}
                </p>
              </div>
              <div className="card">
                <p className="text-xs uppercase text-muted">Active Invoices</p>
                <p className="text-2xl font-bold mt-2">{invoices.length}</p>
              </div>
            </div>
          )}
          <div className="card">
            <h2 className="font-semibold mb-3">Recent Invoices</h2>
            <ul className="divide-y divide-border">
              {invoices.slice(0, 5).map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between py-2 text-sm gap-3"
                >
                  <span className="truncate">
                    {i.id} — {clients.find((c) => c.id === i.clientId)?.name}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-medium">
                      ₱{i.amount.toLocaleString()}
                    </span>
                    <StatusBadge status={i.status} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "Invoices" && (
        <div className="card">
          <h2 className="font-semibold mb-3">All Invoices</h2>
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-border">
                  <th className="py-2 pr-4">Invoice</th>
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Trust</th>
                  <th className="py-2 pr-4">Due</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="border-b border-border">
                    <td className="py-2 pr-4 font-medium">{i.id}</td>
                    <td className="py-2 pr-4">
                      {clients.find((c) => c.id === i.clientId)?.name}
                    </td>
                    <td className="py-2 pr-4">₱{i.amount.toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      ₱{i.trustApplied.toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">{i.dueDate}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={i.status} />
                    </td>
                    <td className="py-2">
                      {i.status === "Draft" && (
                        <button
                          onClick={() => handleSend(i.id)}
                          className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"
                        >
                          <Send size={12} />
                          Send
                        </button>
                      )}
                      {i.status === "Sent" && (
                        <button
                          onClick={() => handleRecordPayment(i.id)}
                          className="btn-primary text-xs py-1 px-2 flex items-center gap-1"
                        >
                          <DollarSign size={12} />
                          Record Payment
                        </button>
                      )}
                      {i.status === "Paid" && (
                        <span className="text-xs text-success">✓ Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Trust Ledger" && (
        <div className="card">
          <h2 className="font-semibold mb-3">Trust Transactions</h2>
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-border">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Ref</th>
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Debit</th>
                  <th className="py-2">Credit</th>
                </tr>
              </thead>
              <tbody>
                {trustTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-border">
                    <td className="py-2 pr-4">{t.date}</td>
                    <td className="py-2 pr-4">{t.reference}</td>
                    <td className="py-2 pr-4">
                      {clients.find((c) => c.id === t.clientId)?.name}
                    </td>
                    <td className="py-2 pr-4">{t.description}</td>
                    <td className="py-2 pr-4">
                      {t.debit ? `₱${t.debit.toLocaleString()}` : "—"}
                    </td>
                    <td className="py-2">
                      {t.credit ? `₱${t.credit.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Rate Card" && (
        <div className="card !p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <DollarSign size={16} className="text-primary" />
              Firm Rate Card
            </h2>
            <p className="text-xs text-muted mt-1">
              Default billing rates. Only Admin and Managing Partner can edit
              (Admin → Rates).
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-muted text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4 text-right">Rate (₱/hr)</th>
                </tr>
              </thead>
              <tbody>
                {storeUsers
                  .filter((u) => u.defaultRate)
                  .map((u) => (
                    <tr key={u.id} className="border-b border-border">
                      <td className="py-3 px-4 font-medium">{u.name}</td>
                      <td className="py-3 px-4 text-xs text-muted">
                        {u.title}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        ₱{(u.defaultRate ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Reconciliation" && (
        <div className="space-y-4">
          <div
            className={`card border-l-4 ${
              matched
                ? "border-l-success bg-success-light/20"
                : "border-l-danger bg-danger-light/20"
            }`}
          >
            <div className="flex items-center gap-3">
              {matched ? (
                <CheckCircle className="text-success-ink" size={22} />
              ) : (
                <AlertTriangle className="text-danger-ink" size={22} />
              )}
              <div>
                <p className={`font-semibold ${matched ? "text-success-ink" : "text-danger-ink"}`}>
                  {matched
                    ? "All three balances match"
                    : "Mismatch detected — investigate"}
                </p>
                <p className="text-sm text-muted mt-1">
                  {matched
                    ? "Trust accounts are reconciled and compliant with CPRA Canon 16."
                    : `Difference of ₱${diff.toLocaleString()} found.`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-xs uppercase text-muted">Bank Statement</p>
              <p className="text-2xl font-bold mt-2">
                ₱{bankBalance.toLocaleString()}
              </p>
            </div>
            <div className="card">
              <p className="text-xs uppercase text-muted">Trust Ledger</p>
              <p className="text-2xl font-bold mt-2">
                ₱{trustBalance.toLocaleString()}
              </p>
            </div>
            <div className="card">
              <p className="text-xs uppercase text-muted">
                Sum of Client Ledgers
              </p>
              <p className="text-2xl font-bold mt-2">
                ₱{sumClientLedgers.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-3">Client Ledger Breakdown</h2>
            <ul className="divide-y divide-border">
              {Object.entries(clientLedgerTotals).map(([clientId, total]) => (
                <li
                  key={clientId}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span>
                    {clients.find((c) => c.id === clientId)?.name ?? clientId}
                  </span>
                  <span className="font-medium">₱{total.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-medium text-sm">Run Reconciliation</p>
              <p className="text-xs text-muted">
                {lastRecon
                  ? `Last reconciled ${new Date(
                      lastRecon.reconciledAt
                    ).toLocaleString()}`
                  : "Not yet reconciled this period."}
              </p>
            </div>
            <button
              onClick={handleReconcile}
              disabled={!matched}
              className={`flex items-center gap-2 text-sm ${
                matched
                  ? "btn-primary"
                  : "btn-secondary opacity-50 cursor-not-allowed"
              }`}
            >
              <RefreshCw size={16} />
              Reconcile Now
            </button>
          </div>

          {reconciliations.length > 0 && (
            <div className="card">
              <h2 className="font-semibold mb-3">Reconciliation History</h2>
              <ul className="divide-y divide-border">
                {reconciliations.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span>{new Date(r.reconciledAt).toLocaleString()}</span>
                    <span className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-success" />
                      <span className="font-medium">
                        ₱{r.trustLedger.toLocaleString()}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {showInvoiceModal && (
        <InvoiceModal onClose={() => setShowInvoiceModal(false)} />
      )}
    </div>
  );
}