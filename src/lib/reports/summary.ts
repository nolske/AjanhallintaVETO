import { formatEcts } from "../calculations/ects.ts";
import { formatDuration } from "../time-entries/duration.ts";
import type { ReportEntry } from "./types.ts";

export type ReportSummary = {
  totalMinutes: number;
  formattedHours: string;
  ects: string;
  entryCount: number;
};

export type ProjectBreakdownRow = {
  projectId: string;
  projectName: string;
  projectStatus: "active" | "archived";
  minutes: number;
  formattedHours: string;
  ects: string;
  entryCount: number;
};

export function summarizeReport(entries: ReportEntry[]): ReportSummary {
  const totalMinutes = entries.reduce(
    (sum, entry) => sum + entry.duration_minutes,
    0
  );

  return {
    totalMinutes,
    formattedHours: formatDuration(totalMinutes),
    ects: formatEcts(totalMinutes),
    entryCount: entries.length
  };
}

export function buildProjectBreakdown(entries: ReportEntry[]) {
  const byProject = new Map<string, ProjectBreakdownRow>();

  for (const entry of entries) {
    const current = byProject.get(entry.project_id) ?? {
      projectId: entry.project_id,
      projectName: entry.project_name,
      projectStatus: entry.project_status,
      minutes: 0,
      formattedHours: "0 min",
      ects: "0.00",
      entryCount: 0
    };

    current.minutes += entry.duration_minutes;
    current.entryCount += 1;
    current.formattedHours = formatDuration(current.minutes);
    current.ects = formatEcts(current.minutes);
    byProject.set(entry.project_id, current);
  }

  return Array.from(byProject.values()).sort((a, b) =>
    a.projectName.localeCompare(b.projectName, "fi")
  );
}
