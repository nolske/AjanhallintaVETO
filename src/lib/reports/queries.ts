import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ReportFilters } from "@/lib/validation/reports";
import type { ReportEntry } from "@/lib/reports/types";

export async function getReportEntries(filters: ReportFilters) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_my_report_entries", {
    p_start_date: filters.startDate ?? null,
    p_end_date: filters.endDate ?? null,
    p_project_id: filters.projectId ?? null,
    p_project_status: filters.projectStatus ?? "all"
  });

  if (error) {
    return [];
  }

  return data satisfies ReportEntry[];
}
