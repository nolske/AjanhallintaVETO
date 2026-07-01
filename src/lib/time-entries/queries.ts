import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TimeEntryProject = {
  project_id: string;
  name: string;
  status: "active" | "archived";
  user_role: "owner" | "member";
};

export type PersonalTimeEntry = {
  entry_id: string;
  project_id: string;
  project_name: string;
  project_status: "active" | "archived";
  user_id: string;
  entry_date: string;
  duration_minutes: number;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectTimeEntry = PersonalTimeEntry & {
  user_email: string;
  user_display_name: string | null;
};

export type EditableTimeEntry = Omit<PersonalTimeEntry, "project_status" | "user_id"> & {
  project_status: "active" | "archived";
};

export async function getTimeEntryProjects() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_time_entry_projects");

  if (error) {
    return [];
  }

  return data satisfies TimeEntryProject[];
}

export async function getPersonalTimeEntries(projectId?: string | null) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_my_time_entries", {
    p_project_id: projectId ?? null
  });

  if (error) {
    return [];
  }

  return data satisfies PersonalTimeEntry[];
}

export async function getProjectTimeEntries(projectId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_project_time_entries", {
    p_project_id: projectId
  });

  if (error) {
    return [];
  }

  return data satisfies ProjectTimeEntry[];
}

export async function getTimeEntryForEdit(entryId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_time_entry_for_edit", {
    p_entry_id: entryId
  });

  if (error) {
    return null;
  }

  return data[0] ?? null;
}
