export type ReportColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  value: (row: T) => string | number;
};

function toCellText(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";

  return String(value);
}

function escapeCsvValue(value: string) {
  const needsQuotes = /[",;\n\r]/.test(value);
  const safeValue = value.replace(/"/g, '""');

  return needsQuotes ? `"${safeValue}"` : safeValue;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * México usa punto decimal y coma como separador de lista,
 * así que el CSV va con coma y con BOM para no romper los acentos.
 */
export function buildCsv<T>({
  columns,
  rows,
  delimiter = ",",
}: {
  columns: ReportColumn<T>[];
  rows: T[];
  delimiter?: string;
}) {
  const headerLine = columns
    .map((column) => escapeCsvValue(column.header))
    .join(delimiter);

  const bodyLines = rows.map((row) =>
    columns
      .map((column) => escapeCsvValue(toCellText(column.value(row))))
      .join(delimiter)
  );

  return [headerLine, ...bodyLines].join("\r\n");
}

export function downloadCsv<T>({
  columns,
  rows,
  fileName,
}: {
  columns: ReportColumn<T>[];
  rows: T[];
  fileName: string;
}) {
  const csv = buildCsv({ columns, rows });

  downloadBlob(
    new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" }),
    fileName
  );
}

function buildReportTableHtml<T>({
  columns,
  rows,
}: {
  columns: ReportColumn<T>[];
  rows: T[];
}) {
  const head = columns
    .map(
      (column) =>
        `<th style="text-align:${column.align || "left"}">${escapeHtml(
          column.header
        )}</th>`
    )
    .join("");

  const body = rows
    .map(
      (row) =>
        `<tr>${columns
          .map(
            (column) =>
              `<td style="text-align:${column.align || "left"}">${escapeHtml(
                toCellText(column.value(row))
              )}</td>`
          )
          .join("")}</tr>`
    )
    .join("");

  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function buildReportDocumentHtml<T>({
  title,
  subtitle,
  meta,
  columns,
  rows,
}: {
  title: string;
  subtitle: string;
  meta: { label: string; value: string }[];
  columns: ReportColumn<T>[];
  rows: T[];
}) {
  const metaHtml = meta
    .map(
      (item) =>
        `<div class="meta-item"><span class="meta-label">${escapeHtml(
          item.label
        )}</span><span class="meta-value">${escapeHtml(item.value)}</span></div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 24px; }
  h1 { font-size: 20px; margin: 0; }
  .eyebrow { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #64748b; margin: 0 0 6px; }
  .subtitle { font-size: 12px; color: #475569; margin: 6px 0 0; }
  .meta { display: flex; flex-wrap: wrap; gap: 16px; margin: 16px 0; border: 1px solid #cbd5f5; padding: 12px; }
  .meta-item { display: flex; flex-direction: column; }
  .meta-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
  .meta-value { font-size: 13px; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #e2e8f0; border: 1px solid #94a3b8; padding: 6px; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
  td { border: 1px solid #cbd5e1; padding: 6px; }
  tbody tr:nth-child(even) td { background: #f8fafc; }
  @page { size: landscape; margin: 12mm; }
</style>
</head>
<body>
  <p class="eyebrow">Kiichpam Xunáan · Admin</p>
  <h1>${escapeHtml(title)}</h1>
  <p class="subtitle">${escapeHtml(subtitle)}</p>
  <div class="meta">${metaHtml}</div>
  ${buildReportTableHtml({ columns, rows })}
</body>
</html>`;
}

/**
 * Excel abre sin problema un HTML con extensión .xls y respeta
 * acentos, columnas y alineación sin necesidad de librerías extra.
 */
export function downloadExcel<T>({
  title,
  subtitle,
  meta,
  columns,
  rows,
  fileName,
}: {
  title: string;
  subtitle: string;
  meta: { label: string; value: string }[];
  columns: ReportColumn<T>[];
  rows: T[];
  fileName: string;
}) {
  const html = buildReportDocumentHtml({
    title,
    subtitle,
    meta,
    columns,
    rows,
  });

  downloadBlob(
    new Blob([`﻿${html}`], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    }),
    fileName
  );
}

export function printReport<T>({
  title,
  subtitle,
  meta,
  columns,
  rows,
}: {
  title: string;
  subtitle: string;
  meta: { label: string; value: string }[];
  columns: ReportColumn<T>[];
  rows: T[];
}) {
  const html = buildReportDocumentHtml({
    title,
    subtitle,
    meta,
    columns,
    rows,
  });

  const printWindow = window.open("", "_blank", "width=1200,height=800");

  if (!printWindow) {
    throw new Error(
      "El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes e intenta de nuevo."
    );
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

export function buildReportFileName({
  prefix,
  from,
  to,
  extension,
}: {
  prefix: string;
  from: string;
  to: string;
  extension: string;
}) {
  const range = [from, to].filter(Boolean).join("_a_") || "todo";

  return `${prefix}_${range}.${extension}`;
}
