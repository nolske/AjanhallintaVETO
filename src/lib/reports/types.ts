export type ReportEntry = {
  entry_id: string;
  project_id: string;
  project_name: string;
  project_status: "active" | "archived";
  entry_date: string;
  duration_minutes: number;
  description: string | null;
  created_at: string;
  updated_at: string;
};
