import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProjectSummary = {
  project_id: string;
  name: string;
  description: string | null;
  owner_id: string;
  owner_email: string;
  owner_display_name: string | null;
  status: "active" | "archived";
  user_role: "owner" | "member";
  member_count: number;
  current_user_minutes: number;
  total_minutes: number | null;
};

export type ProjectMember = {
  user_id: string;
  email: string;
  display_name: string | null;
  role: "owner" | "member";
  joined_at: string;
};

export async function getProjectSummaries() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_my_project_summaries");

  if (error) {
    return [];
  }

  return data satisfies ProjectSummary[];
}

export async function getProjectDetail(projectId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_project_detail", {
    p_project_id: projectId
  });

  if (error) {
    return null;
  }

  return data[0] ?? null;
}

export async function getProjectMembers(projectId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_project_members", {
    p_project_id: projectId
  });

  if (error) {
    return [];
  }

  return data satisfies ProjectMember[];
}
