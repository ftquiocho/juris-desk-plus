import { useState } from "react";
import { useStore } from "../store/useStore";
import { useToast } from "../components/Toast";
import { Clock, Plus, Receipt, Pencil, Trash2 } from "lucide-react";
import { users } from "../data";
import type { Expense } from "../types";

const expenseCategories = [
  "Filing Fees",
  "Photocopies",
  "Travel",
  "Meals",
  "Notarial Fees",
  "Courier",
  "Court Fees",
  "Other",
];

const tabs = ["Time", "Expenses"] as const;

export default function TimeTracker() {
  const currentUser = useStore((s) => s.currentUser)!;
  const matters = useStore((s) => s.matters);
  const timeEntries = useStore((s) => s.timeEntries);
  const expenses = useStore((s) => s.expenses);
  const addTimeEntry = useStore((s) => s.addTimeEntry);
  const addExpense = useStore((s) => s.addExpense);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const push = useToast((s) => s.push);

  const [tab, setTab] = useState<(typeof tabs)[number]>("Time");

  // TIME
  const [matterId, setMatterId] = useState("");
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState("");
  const [billable, setBillable] = useState(true);
  const [rate, setRate] = useState(String(currentUser.defaultRate ?? 2500));

  // EXPENSE
  const [expMatterId, setExpMatterId] = useState("");
  const [expCategory, setExpCategory] = useState(expenseCategories[0]);
  const [expAmount, setExpAmount] = useState("");
  const [expBillable, setExpBillable] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expNotes, setExpNotes] = useState("");

  const canSeeAll =
    currentUser.roles.includes("MNG_PARTNER") ||
    currentUser.roles.includes("SYS_ADMIN") ||
    currentUser.roles.includes("BILLING");

  const visibleMatters = canSeeAll
    ? matters
    : matters.filter(
        (m) =>
          m.attorneyId === currentUser.id ||
          m.paralegalId === currentUser.id ||
          m.secretaryId === currentUser.id
      );

  const myEntries = canSeeAll
    ? timeEntries
    : timeEntries.filter((t) => t.userId === currentUser.id);
  const myExpenses = canSeeAll
    ? expenses
    : expenses.filter((e) => e.userId === currentUser.id);

  const totalHours = myEntries.reduce((s, t) => s + t.duration, 0);
  const billableAmount = myEntries
    .filter((t) => t.billable)
    .reduce((s, t) => s + t.duration * t.rate, 0);
  const totalExpenses = myExpenses.reduce((s, e) => s + e.amount, 0);

  const submitTime = (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseFloat(duration);
    if (!matterId || !activity || !dur) return;
    addTimeEntry({
      id: `TE-${Date.now()}`,
      matterId,
      userId: currentUser.id,
      activity,
      duration: dur,
      billable,
      rate: billable ? parseFloat(rate) || 0 : 0,
      date: new Date().toISOString().slice(0, 10),
    });
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: currentUser.id,
      action: "Logged time entry",
      target: matterId,
      timestamp: new Date().toISOString(),
    });
    push("Time entry saved.");
    setMatterId("");
    setActivity("");
    setDuration("");
  };

  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (!expMatterId || !amt) return;
    const expense: Expense = {
      id: `EXP-${Date.now()}`,
      matterId: expMatterId,
      userId: currentUser.id,
      date: new Date().toISOString().slice(0, 10),
      category: expCategory,
      amount: amt,
      billable: expBillable,
      notes: expNotes,
    };
    addExpense(expense);
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: currentUser.id,
      action: "Logged expense",
      target: expense.id,
      timestamp: new Date().toISOString(),
    });
    push(`Expense of ₱${amt.toLocaleString()} saved.`);
    setExpMatterId("");
    setExpAmount("");
    setExpNotes("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Time & Expenses</h1>
        <p className="text-sm text-muted">Log billable hours and out-of-pocket costs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs uppercase text-muted">Total Hours</p>
          <p className="text-2xl font-bold mt-2">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="card">
          <p className="text-xs uppercase text-muted">Billable Amount</p>
          <p className="text-2xl font-bold mt-2 text-success">₱{billableAmount.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-xs uppercase text-muted">Expenses</p>
          <p className="text-2xl font-bold mt-2 text-warning">₱{totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      <div className="border-b border-border flex gap-1 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Time" && (
        <>
          <form onSubmit={submitTime} className="card space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Plus size={18} /> Log Time Entry
            </h2>
            <div>
              <label className="label">Matter *</label>
              <select required className="input" value={matterId} onChange={(e) => setMatterId(e.target.value)}>
                <option value="">Select a matter...</option>
                {visibleMatters.map((m) => (
                  <option key={m.id} value={m.id}>{m.id} — {m.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Activity *</label>
              <input required className="input" placeholder="e.g., Client consultation" value={activity} onChange={(e) => setActivity(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Duration (hours) *</label>
                <input required type="number" step="0.25" min="0.25" className="input" placeholder="1.5" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <div>
                <label className="label">
                  Rate (₱/hour)
                  {currentUser.defaultRate ? (
                    <span className="ml-2 text-xs text-muted font-normal">
                      default from your profile
                    </span>
                  ) : null}
                </label>
                <input type="number" className="input" value={rate} onChange={(e) => setRate(e.target.value)} disabled={!billable} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={billable} onChange={() => setBillable(true)} /> Billable
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={!billable} onChange={() => setBillable(false)} /> Non-billable
              </label>
            </div>
            <button type="submit" className="btn-primary">Save Time Entry</button>
          </form>

          <div className="card">
            <h2 className="font-semibold mb-3">{canSeeAll ? "All" : "My"} Time Entries ({myEntries.length})</h2>
            {myEntries.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">No time entries yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {myEntries.map((t) => {
                  const matter = matters.find((m) => m.id === t.matterId);
                  const owner = users.find((u) => u.id === t.userId);
                  return (
                    <li key={t.id} className="flex items-center justify-between py-3 text-sm gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Clock size={16} className="text-muted shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{t.activity}</p>
                          <p className="text-xs text-muted truncate">{matter?.title} · {owner?.name} · {t.date}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium">{t.duration}h</p>
                        {t.billable ? (
                          <p className="text-xs text-success">₱{(t.duration * t.rate).toLocaleString()}</p>
                        ) : (
                          <p className="text-xs text-muted">Non-billable</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}

      {tab === "Expenses" && (
        <>
          <form onSubmit={submitExpense} className="card space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Plus size={18} /> Log Expense
            </h2>
            <div>
              <label className="label">Matter *</label>
              <select required className="input" value={expMatterId} onChange={(e) => setExpMatterId(e.target.value)}>
                <option value="">Select a matter...</option>
                {visibleMatters.map((m) => (
                  <option key={m.id} value={m.id}>{m.id} — {m.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Category *</label>
                <select className="input" value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
                  {expenseCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Amount (₱) *</label>
                <input required type="number" min="0.01" step="0.01" className="input" placeholder="500" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <input className="input" placeholder="e.g., RTC filing fee receipt #12345" value={expNotes} onChange={(e) => setExpNotes(e.target.value)} />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={expBillable} onChange={() => setExpBillable(true)} /> Billable to client
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={!expBillable} onChange={() => setExpBillable(false)} /> Firm expense
              </label>
            </div>
            <button type="submit" className="btn-primary">Save Expense</button>
          </form>

          <div className="card">
            <h2 className="font-semibold mb-3">{canSeeAll ? "All" : "My"} Expenses ({myExpenses.length})</h2>
            {myExpenses.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">No expenses logged yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {myExpenses.map((e) => {
                  const matter = matters.find((m) => m.id === e.matterId);
                  const owner = users.find((u) => u.id === e.userId);
                  return (
                    <li key={e.id} className="flex items-center justify-between py-3 text-sm gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Receipt size={16} className="text-muted shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{e.category}</p>
                          <p className="text-xs text-muted truncate">
                            {matter?.title} · {owner?.name} · {e.date}
                            {e.notes ? ` · ${e.notes}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="font-medium">₱{e.amount.toLocaleString()}</p>
                          <p className={`text-xs ${e.billable ? "text-success" : "text-muted"}`}>
                            {e.billable ? "Billable" : "Firm"}
                          </p>
                        </div>
                        <button
                          onClick={() => setEditingExpense(e)}
                          className="icon-btn icon-btn-primary icon-btn-sm"
                          aria-label="Edit expense"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this expense?")) {
                              useStore.getState().removeExpense(e.id);
                            }
                          }}
                          className="icon-btn icon-btn-danger icon-btn-sm"
                          aria-label="Delete expense"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}

function EditExpenseModal({
  expense,
  onClose,
}: {
  expense: Expense;
  onClose: () => void;
}) {
  const matters = useStore((s) => s.matters);
  const updateExpense = useStore((s) => s.updateExpense);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const [matterId, setMatterId] = useState(expense.matterId);
  const [category, setCategory] = useState(expense.category);
  const [amount, setAmount] = useState(String(expense.amount));
  const [billable, setBillable] = useState(expense.billable);
  const [notes, setNotes] = useState(expense.notes ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    updateExpense(expense.id, {
      matterId,
      category,
      amount: amt,
      billable,
      notes,
    });
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: "Updated expense",
      target: expense.id,
      timestamp: new Date().toISOString(),
    });
    push("Expense updated.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-md rounded-t-2xl md:rounded-2xl border border-border shadow-modal">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Edit Expense</h2>
          <button onClick={onClose} className="text-muted hover:text-text p-1">×</button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4">
          <div>
            <label className="label">Matter</label>
            <select className="input" value={matterId} onChange={(e) => setMatterId(e.target.value)}>
              {matters.map((m) => (<option key={m.id} value={m.id}>{m.id} — {m.title}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <label className="label">Amount (₱)</label>
              <input required type="number" step="0.01" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={billable} onChange={() => setBillable(true)} /> Billable
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={!billable} onChange={() => setBillable(false)} /> Firm
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Save</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}