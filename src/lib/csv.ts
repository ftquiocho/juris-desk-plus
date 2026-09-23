export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (c === "\r") {
        // skip
      } else {
        field += c;
      }
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export function downloadTemplate() {
  const headers = [
    "Client Name",
    "Client Type",
    "Email",
    "Phone",
    "Address",
    "Nationality",
    "Nature of Case",
    "Date Accepted",
    "Client Number",
    "File Number",
    "Contact Officer",
    "Partners in Charge",
    "Associates Assigned",
    "Fee Arrangement",
    "Filing Instruction",
    "Referred By",
    "Referred To",
  ];

  const sampleRow = [
    "Juan Dela Cruz",
    "Individual",
    "juan@email.com",
    "+63 917 111 1111",
    "123 Ayala Ave, Makati",
    "Filipino",
    "Litigation",
    "2025-01-15",
    "2025-001",
    "M-2025-001",
    "Juan Dela Cruz",
    "Atty. Matt Murdock",
    "Atty. Marci Stahl",
    "Regular Rate",
    "Separate File",
    "Client Referral",
    "Atty. Matt Murdock",
  ];

  const csv = [headers, sampleRow]
    .map((row) =>
      row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "juris-desk-clients-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}