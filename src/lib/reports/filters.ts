import { reportFilterSchema, type ReportFilters } from "../validation/reports.ts";

export function parseReportFilters(input: Record<string, string | string[] | undefined>) {
  const getSingle = (key: string) => {
    const value = input[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const parsed = reportFilterSchema.safeParse({
    startDate: getSingle("startDate"),
    endDate: getSingle("endDate"),
    projectId: getSingle("projectId"),
    projectStatus: getSingle("projectStatus") ?? "all"
  });

  if (!parsed.success) {
    return {
      filters: {
        projectStatus: "all"
      } satisfies ReportFilters,
      valid: false
    };
  }

  return {
    filters: parsed.data,
    valid: true
  };
}

export function reportFiltersToSearchParams(filters: ReportFilters) {
  const params = new URLSearchParams();

  if (filters.startDate) {
    params.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.set("endDate", filters.endDate);
  }

  if (filters.projectId) {
    params.set("projectId", filters.projectId);
  }

  if (filters.projectStatus && filters.projectStatus !== "all") {
    params.set("projectStatus", filters.projectStatus);
  }

  return params;
}

export function getReportDateRangeLabel(filters: ReportFilters) {
  if (filters.startDate && filters.endDate) {
    return `${filters.startDate}_${filters.endDate}`;
  }

  if (filters.startDate) {
    return `${filters.startDate}_alkaen`;
  }

  if (filters.endDate) {
    return `asti_${filters.endDate}`;
  }

  return "kaikki";
}
