import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminProfile = {
  id: string;
  email: string;
  display_name: string | null;
  role: "user" | "admin";
  created_at: string;
};

type AdminProject = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  owner_email: string;
  owner_display_name: string | null;
  status: "active" | "archived";
  member_count: number;
  created_at: string;
};

export type AdminDashboardData = {
  userCount: number;
  activeProjectCount: number;
  archivedProjectCount: number;
  timeEntryCount: number;
  users: AdminProfile[];
  projects: AdminProject[];
};

async function getTableCount(
  table: "profiles" | "projects" | "time_entries"
) {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`Admin count query failed for ${table}.`);
  }

  return count ?? 0;
}

async function getProjectCountByStatus(status: "active" | "archived") {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("status", status);

  if (error) {
    throw new Error(`Admin project count query failed for ${status}.`);
  }

  return count ?? 0;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createSupabaseServerClient();

  const [
    userCount,
    activeProjectCount,
    archivedProjectCount,
    timeEntryCount,
    usersResult,
    projectsResult,
    membershipsResult
  ] = await Promise.all([
    getTableCount("profiles"),
    getProjectCountByStatus("active"),
    getProjectCountByStatus("archived"),
    getTableCount("time_entries"),
    supabase
      .from("profiles")
      .select("id,email,display_name,role,created_at")
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("projects")
      .select("id,name,description,owner_id,status,created_at")
      .order("created_at", { ascending: false })
      .limit(25),
    supabase.from("project_members").select("project_id")
  ]);

  if (usersResult.error) {
    throw new Error("Admin users query failed.");
  }

  if (projectsResult.error) {
    throw new Error("Admin projects query failed.");
  }

  if (membershipsResult.error) {
    throw new Error("Admin project memberships query failed.");
  }

  const projects = projectsResult.data ?? [];
  const ownerIds = [...new Set(projects.map((project) => project.owner_id))];
  const ownersById = new Map<string, AdminProfile>();

  if (ownerIds.length > 0) {
    const { data: owners, error } = await supabase
      .from("profiles")
      .select("id,email,display_name,role,created_at")
      .in("id", ownerIds);

    if (error) {
      throw new Error("Admin project owner query failed.");
    }

    owners?.forEach((owner) => ownersById.set(owner.id, owner));
  }

  const memberCounts = new Map<string, number>();
  membershipsResult.data?.forEach((membership) => {
    memberCounts.set(
      membership.project_id,
      (memberCounts.get(membership.project_id) ?? 0) + 1
    );
  });

  return {
    userCount,
    activeProjectCount,
    archivedProjectCount,
    timeEntryCount,
    users: usersResult.data ?? [],
    projects: projects.map((project) => {
      const owner = ownersById.get(project.owner_id);

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        owner_id: project.owner_id,
        owner_email: owner?.email ?? "tuntematon",
        owner_display_name: owner?.display_name ?? null,
        status: project.status,
        member_count: memberCounts.get(project.id) ?? 0,
        created_at: project.created_at
      };
    })
  };
}
