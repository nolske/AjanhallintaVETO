import { formatEcts } from "../calculations/ects.ts";
import { formatDuration } from "../time-entries/duration.ts";
import type { ReportEntry } from "./types.ts";

const spreadsheetFormulaPattern = /^\s*[=+\-@]/;

export function neutralizeSpreadsheetFormula(value: string) {
  if (spreadsheetFormulaPattern.test(value)) {
    return `'${value}`;
  }

  return value;
}

export function escapeCsvCell(value: string | number | null | undefined) {
  const stringValue = neutralizeSpreadsheetFormula(String(value ?? ""));
  return `"${stringValue.replaceAll("\"", "\"\"")}"`;
}

export function buildReportCsv(entries: ReportEntry[]) {
  const rows = [
    ["Päivämäärä", "Projekti", "Kuvaus", "Minuutit", "Kesto", "ECTS"],
    ...entries.map((entry) => [
      entry.entry_date,
      entry.project_name,
      entry.description ?? "",
      String(entry.duration_minutes),
      formatDuration(entry.duration_minutes),
      formatEcts(entry.duration_minutes)
    ])
  ];

  return `\uFEFF${rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\r\n")}\r\n`;
}

export function createReportFilename(dateRangeLabel: string) {
  return `ajanhallintaveto-raportti-${dateRangeLabel}.csv`;
}
