import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getReportDateRangeLabel,
  parseReportFilters
} from "@/lib/reports/filters";
import { getReportEntries } from "@/lib/reports/queries";
import {
  buildReportCsv,
  createReportFilename
} from "@/lib/reports/csv";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return new NextResponse("Kirjaudu sisaan jatkaaksesi.", { status: 401 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const { filters } = parseReportFilters(params);
  const entries = await getReportEntries(filters);
  const csv = buildReportCsv(entries);
  const filename = createReportFilename(getReportDateRangeLabel(filters));

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}
