import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatEcts } from "../src/lib/calculations/ects.ts";
import {
  buildReportCsv,
  createReportFilename,
  escapeCsvCell,
  neutralizeSpreadsheetFormula
} from "../src/lib/reports/csv.ts";
import {
  getReportDateRangeLabel,
  parseReportFilters,
  reportFiltersToSearchParams
} from "../src/lib/reports/filters.ts";
import {
  buildProjectBreakdown,
  summarizeReport
} from "../src/lib/reports/summary.ts";
import type { ReportEntry } from "../src/lib/reports/types.ts";
import { formatDuration } from "../src/lib/time-entries/duration.ts";

const entries: ReportEntry[] = [
  {
    entry_id: "entry-1",
    project_id: "project-1",
    project_name: "Testi",
    project_status: "active",
    entry_date: "2026-07-01",
    duration_minutes: 1620,
    description: "Hyva tyoskentely",
    created_at: "2026-07-01T10:00:00.000Z",
    updated_at: "2026-07-01T10:00:00.000Z"
  },
  {
    entry_id: "entry-2",
    project_id: "project-1",
    project_name: "Testi",
    project_status: "active",
    entry_date: "2026-07-02",
    duration_minutes: 810,
    description: "=formula",
    created_at: "2026-07-02T10:00:00.000Z",
    updated_at: "2026-07-02T10:00:00.000Z"
  }
];

describe("report calculations", () => {
  it("sums minutes before calculating ECTS", () => {
    const summary = summarizeReport(entries);

    assert.equal(summary.totalMinutes, 2430);
    assert.equal(summary.formattedHours, "40 h 30 min");
    assert.equal(summary.ects, "1.50");
    assert.equal(summary.entryCount, 2);
    assert.equal(formatEcts(4860), "3.00");
    assert.equal(formatDuration(1620), "27 h");
  });

  it("builds project breakdown from summed project minutes", () => {
    const breakdown = buildProjectBreakdown(entries);

    assert.equal(breakdown.length, 1);
    assert.equal(breakdown[0].minutes, 2430);
    assert.equal(breakdown[0].ects, "1.50");
    assert.equal(breakdown[0].entryCount, 2);
  });
});

describe("report filters", () => {
  it("parses valid filters and serializes them back to search params", () => {
    const result = parseReportFilters({
      startDate: "2026-07-01",
      endDate: "2026-07-31",
      projectId: "00000000-0000-4000-8000-000000000000",
      projectStatus: "active"
    });

    assert.equal(result.valid, true);
    assert.equal(result.filters.projectStatus, "active");
    assert.equal(getReportDateRangeLabel(result.filters), "2026-07-01_2026-07-31");
    assert.equal(
      reportFiltersToSearchParams(result.filters).toString(),
      "startDate=2026-07-01&endDate=2026-07-31&projectId=00000000-0000-4000-8000-000000000000&projectStatus=active"
    );
  });

  it("rejects invalid date ranges", () => {
    const result = parseReportFilters({
      startDate: "2026-08-01",
      endDate: "2026-07-01"
    });

    assert.equal(result.valid, false);
    assert.equal(result.filters.projectStatus, "all");
  });
});

describe("CSV export", () => {
  it("escapes commas, quotes, line breaks, and formulas", () => {
    assert.equal(escapeCsvCell("a,b"), "\"a,b\"");
    assert.equal(escapeCsvCell("a\"b"), "\"a\"\"b\"");
    assert.equal(escapeCsvCell("a\nb"), "\"a\nb\"");
    assert.equal(neutralizeSpreadsheetFormula("=1+1"), "'=1+1");
    assert.equal(neutralizeSpreadsheetFormula(" @cmd"), "' @cmd");
  });

  it("builds UTF-8 CSV with header and safe filename", () => {
    const csv = buildReportCsv(entries);

    assert.equal(csv.startsWith("\uFEFF"), true);
    assert.match(csv, /"Paivamaara","Projekti","Kuvaus","Minuutit","Kesto","ECTS"/);
    assert.match(csv, /"'=formula"/);
    assert.equal(createReportFilename("2026-07-01_2026-07-31"), "ajanhallintaveto-raportti-2026-07-01_2026-07-31.csv");
  });
});
