import { useState } from "react";
import { X, Upload, Download, CheckCircle } from "lucide-react";
import { useStore } from "../store/useStore";
import { useToast } from "./Toast";
import { parseCSV, downloadTemplate } from "../lib/csv";
import type { Client } from "../types";

type Step = "upload" | "preview" | "done";

interface ParsedRow {
  data: Partial<Client>;
  errors: string[];
}

export default function ImportClientsModal({ onClose }: { onClose: () => void }) {
  const addClients = useStore((s) => s.addClients);
  const existingClients = useStore((s) => s.clients);
  const addAuditEvent = useStore((s) => s.addAuditEvent);
  const user = useStore((s) => s.currentUser)!;
  const push = useToast((s) => s.push);

  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [summary, setSummary] = useState({ imported: 0, skipped: 0, errors: 0 });

  const handleFile = async (file: File) => {
    const text = await file.text();
    const parsed = parseCSV(text);
    if (parsed.length < 2) {
      push("File is empty or missing headers.", "error");
      return;
    }

    const headers = parsed[0].map((h) => h.trim());
    const dataRows = parsed.slice(1);

    const existingNames = new Set(
      existingClients.map((c) => c.name.toLowerCase().trim())
    );

    const results: ParsedRow[] = dataRows.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = (row[i] ?? "").trim();
      });

      const errors: string[] = [];
      const name = obj["Client Name"];

      if (!name) errors.push("Missing Client Name");
      else if (existingNames.has(name.toLowerCase().trim()))
        errors.push("Duplicate client name");

      const data: Partial<Client> = {
        id: `CL-${String(Date.now()).slice(-4)}-${Math.random()
          .toString(36)
          .slice(2, 5)}`,
        name,
        type: (obj["Client Type"] as Client["type"]) || "Individual",
        email: obj["Email"],
        phone: obj["Phone"],
        address: obj["Address"],
        nationality: obj["Nationality"],
        caseType: obj["Nature of Case"] || "Unspecified",
        urgency: "Medium",
        createdAt: obj["Date Accepted"] || new Date().toISOString().slice(0, 10),
        clientNumber: obj["Client Number"],
        fileNumber: obj["File Number"],
        contactOfficer: obj["Contact Officer"],
        dateAccepted: obj["Date Accepted"],
        natureOfCase: obj["Nature of Case"] as Client["natureOfCase"],
        partnersInCharge: obj["Partners in Charge"],
        associatesAssigned: obj["Associates Assigned"],
        feeArrangement: obj["Fee Arrangement"],
        filingInstruction: obj["Filing Instruction"] as Client["filingInstruction"],
        referredBy: obj["Referred By"],
        referredTo: obj["Referred To"],
      };

      return { data, errors };
    });

    setRows(results);
    setStep("preview");
  };

  const handleImport = () => {
    const valid = rows.filter((r) => r.errors.length === 0);
    const skipped = rows.filter((r) =>
      r.errors.some((e) => e.includes("Duplicate"))
    ).length;
    const errors = rows.filter(
      (r) => r.errors.length > 0 && !r.errors.some((e) => e.includes("Duplicate"))
    ).length;

    addClients(valid.map((r) => r.data as Client));
    addAuditEvent({
      id: `LOG-${Date.now()}`,
      userId: user.id,
      action: `Imported ${valid.length} clients from CSV`,
      target: "bulk-import",
      timestamp: new Date().toISOString(),
    });

    setSummary({ imported: valid.length, skipped, errors });
    setStep("done");
    push(`${valid.length} clients imported.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-elevated w-full md:max-w-4xl rounded-t-2xl md:rounded-2xl border border-border shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-primary" />
            <h2 className="font-semibold">Import Clients from CSV</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {step === "upload" && (
            <>
              <div className="card bg-surface border-primary/30">
                <div className="flex items-start gap-3">
                  <Download size={18} className="text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">1. Download the template</p>
                    <p className="text-xs text-muted mt-1">
                      Fill in your client data using our CSV template. Required
                      column: <strong>Client Name</strong>.
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="btn-secondary mt-3 text-sm flex items-center gap-2"
                    >
                      <Download size={14} />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <p className="font-medium text-sm mb-2">2. Upload your CSV</p>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                  className="input cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary file:text-white hover:file:bg-primary-hover"
                />
                <p className="text-xs text-muted mt-2">
                  Max 5,000 rows per import. Duplicate client names will be
                  skipped.
                </p>
              </div>
            </>
          )}

          {step === "preview" && (
            <>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="text-success font-medium">
                  ✓ {rows.filter((r) => r.errors.length === 0).length} ready
                </span>
                <span className="text-warning font-medium">
                  ⚠ {rows.filter((r) => r.errors.some((e) => e.includes("Duplicate"))).length} duplicates
                </span>
                <span className="text-danger font-medium">
                  ✗ {rows.filter((r) => r.errors.length > 0 && !r.errors.some((e) => e.includes("Duplicate"))).length} errors
                </span>
              </div>

              <div className="card !p-0 overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-surface sticky top-0">
                      <tr className="text-left text-muted border-b border-border">
                        <th className="py-2 px-3 w-8">#</th>
                        <th className="py-2 px-3">Client Name</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Nature of Case</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 100).map((r, i) => (
                        <tr key={i} className="border-b border-border">
                          <td className="py-2 px-3 text-xs text-muted">
                            {i + 1}
                          </td>
                          <td className="py-2 px-3 font-medium truncate max-w-[200px]">
                            {r.data.name || "—"}
                          </td>
                          <td className="py-2 px-3 text-xs">
                            {r.data.type}
                          </td>
                          <td className="py-2 px-3 text-xs truncate max-w-[160px]">
                            {r.data.natureOfCase || "—"}
                          </td>
                          <td className="py-2 px-3">
                            {r.errors.length === 0 ? (
                              <span className="text-xs text-success">
                                Ready
                              </span>
                            ) : (
                              <span className="text-xs text-warning">
                                {r.errors[0]}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rows.length > 100 && (
                  <p className="text-xs text-muted p-3 text-center border-t border-border">
                    Showing first 100 of {rows.length} rows
                  </p>
                )}
              </div>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Import Complete</h3>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-6">
                <div className="card text-center">
                  <p className="text-2xl font-bold text-success">
                    {summary.imported}
                  </p>
                  <p className="text-xs text-muted mt-1">Imported</p>
                </div>
                <div className="card text-center">
                  <p className="text-2xl font-bold text-warning">
                    {summary.skipped}
                  </p>
                  <p className="text-xs text-muted mt-1">Skipped</p>
                </div>
                <div className="card text-center">
                  <p className="text-2xl font-bold text-danger">
                    {summary.errors}
                  </p>
                  <p className="text-xs text-muted mt-1">Errors</p>
                </div>
              </div>
              <p className="text-xs text-muted mt-6">
                All imports are recorded in the Audit Log.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex gap-3 shrink-0">
          {step === "preview" && (
            <>
              <button
                onClick={handleImport}
                disabled={rows.every((r) => r.errors.length > 0)}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                Import{" "}
                {rows.filter((r) => r.errors.length === 0).length} Clients
              </button>
              <button
                onClick={() => {
                  setRows([]);
                  setStep("upload");
                }}
                className="btn-secondary"
              >
                Back
              </button>
            </>
          )}
          {step === "done" && (
            <button onClick={onClose} className="btn-primary flex-1">
              Done
            </button>
          )}
          {step === "upload" && (
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}