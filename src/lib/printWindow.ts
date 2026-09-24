export function printWindow(title: string, contentHtml: string) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) {
    alert("Pop-up blocked. Please allow pop-ups to print.");
    return;
  }

  w.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 32px;
            margin: 0;
            background: #fff;
            color: #000;
            font-size: 13px;
            line-height: 1.5;
          }
          h1 { font-size: 20px; margin: 0 0 4px 0; font-weight: 700; }
          h2 { font-size: 15px; margin: 20px 0 8px 0; font-weight: 600; }
          h3 { font-size: 13px; margin: 12px 0 6px 0; font-weight: 600; }
          p { margin: 4px 0; }
          .muted { color: #666; }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #333;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .header-right { text-align: right; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 6px 10px;
            font-size: 11px;
            text-align: left;
            vertical-align: top;
          }
          thead {
            background: #f0f0f0;
          }
          th { font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
          .right { text-align: right; }
          .badge {
            display: inline-block;
            border: 1px solid #999;
            padding: 1px 8px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 500;
          }
          .card {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 12px;
            margin-bottom: 12px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
          }
          .label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #666;
            margin-bottom: 2px;
          }
          .value {
            font-size: 14px;
            font-weight: 600;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Nelson &amp; Murdock Law Offices</h1>
            <p class="muted">Enterprise Legal Practice Management</p>
          </div>
          <div class="header-right">
            <p><strong>${title}</strong></p>
            <p class="muted">Printed ${new Date().toLocaleString()}</p>
          </div>
        </div>
        ${contentHtml}
        <script>
          window.onload = function () {
            setTimeout(function () { window.print(); }, 250);
          };
        </script>
      </body>
    </html>
  `);
  w.document.close();
}