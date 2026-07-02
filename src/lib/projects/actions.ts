"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSafeRedirectPath, withStatus } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  createRateLimitKey
} from "@/lib/security/rate-limit";
import {
  addProjectMemberSchema,
  projectFormSchema,
  projectIdSchema,
  removeProjectMemberSchema
} from "@/lib/validation/projects";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

const memberInviteRateLimit = {
  limit: 10,
  windowMs: 60 * 60 * 1000
};

async function getClientFingerprint() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();

  return forwardedFor || headerStore.get("x-real-ip") || "unknown";
}

async function requireActionUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?error=not_authenticated");
  }

  return { supabase, user };
}

async function requireProjectOwner(projectId: string) {
  const { supabase, user } = await requireActionUser();
  const { data, error } = await supabase.rpc("is_project_owner", {
    p_project_id: projectId,
    p_user_id: user.id
  });

  if (error || !data) {
    redirect(withStatus(`/projects/${projectId}`, "error", "project_not_allowed"));
  }

  return { supabase, user };
}

export async function createProjectAction(formData: FormData) {
  const parsed = projectFormSchema.safeParse({
    name: getString(formData, "name"),
    description: getString(formData, "description")
  });

  if (!parsed.success) {
    redirect(withStatus("/projects/new", "error", "project_invalid"));
  }

  const { supabase, user } = await requireActionUser();
  const { error: profileError } = await supabase.rpc("ensure_current_profile");

  if (profileError) {
    redirect(withStatus("/projects/new", "error", "profile_setup_failed"));
  }

  const projectId = crypto.randomUUID();
  const { error } = await supabase.from("projects").insert({
    id: projectId,
    name: parsed.data.name,
    description: parsed.data.description,
    owner_id: user.id
  });

  if (error) {
    redirect(withStatus("/projects/new", "error", "project_save_failed"));
  }

  redirect(withStatus(`/projects/${projectId}`, "status", "project_created"));
}

export async function updateProjectAction(formData: FormData) {
  const idParsed = projectIdSchema.safeParse({
    projectId: getString(formData, "projectId")
  });
  const parsed = projectFormSchema.safeParse({
    name: getString(formData, "name"),
    description: getString(formData, "description")
  });

  if (!idParsed.success) {
    redirect(withStatus("/projects", "error", "project_invalid"));
  }

  if (!parsed.success) {
    redirect(
      withStatus(`/projects/${idParsed.data.projectId}/settings`, "error", "project_invalid")
    );
  }

  const { supabase } = await requireProjectOwner(idParsed.data.projectId);
  const { error } = await supabase
    .from("projects")
    .update({
      name: parsed.data.name,
      description: parsed.data.description
    })
    .eq("id", idParsed.data.projectId);

  if (error) {
    redirect(
      withStatus(
        `/projects/${idParsed.data.projectId}/settings`,
        "error",
        "project_save_failed"
      )
    );
  }

  redirect(
    withStatus(`/projects/${idParsed.data.projectId}/settings`, "status", "project_updated")
  );
}

export async function setProjectArchivedAction(formData: FormData) {
  const parsed = projectIdSchema.safeParse({
    projectId: getString(formData, "projectId")
  });
  const next = getSafeRedirectPath(formData.get("next"));
  const status = getString(formData, "status") === "archived" ? "archived" : "active";

  if (!parsed.success) {
    redirect(withStatus("/projects", "error", "project_invalid"));
  }

  const { supabase } = await requireProjectOwner(parsed.data.projectId);
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", parsed.data.projectId);

  if (error) {
    redirect(withStatus(next, "error", "project_save_failed"));
  }

  redirect(
    withStatus(next, "status", status === "archived" ? "project_archived" : "project_restored")
  );
}

export async function addProjectMemberAction(formData: FormData) {
  const parsed = addProjectMemberSchema.safeParse({
    projectId: getString(formData, "projectId"),
    email: getString(formData, "email")
  });

  if (!parsed.success) {
    redirect(withStatus("/projects", "error", "member_invalid"));
  }

  const { supabase, user } = await requireProjectOwner(parsed.data.projectId);
  const fingerprint = await getClientFingerprint();
  const rateLimit = checkRateLimit(
    createRateLimitKey("memberInvite", [
      user.id,
      parsed.data.projectId,
      fingerprint
    ]),
    memberInviteRateLimit
  );
  const path = `/projects/${parsed.data.projectId}/members`;

  if (!rateLimit.allowed) {
    redirect(withStatus(path, "error", "too_many_requests"));
  }

  const { data, error } = await supabase.rpc("add_project_member_by_email", {
    p_project_id: parsed.data.projectId,
    p_email: parsed.data.email
  });

  if (error || data === "not_allowed" || data === "not_found") {
    redirect(withStatus(path, "error", "member_add_failed"));
  }

  if (data === "already_member") {
    redirect(withStatus(path, "status", "member_already_exists"));
  }

  redirect(withStatus(path, "status", "member_added"));
}

export async function removeProjectMemberAction(formData: FormData) {
  const parsed = removeProjectMemberSchema.safeParse({
    projectId: getString(formData, "projectId"),
    userId: getString(formData, "userId")
  });

  if (!parsed.success) {
    redirect(withStatus("/projects", "error", "member_invalid"));
  }

  const { supabase } = await requireProjectOwner(parsed.data.projectId);
  const { data, error } = await supabase.rpc("remove_project_member", {
    p_project_id: parsed.data.projectId,
    p_user_id: parsed.data.userId
  });

  const path = `/projects/${parsed.data.projectId}/members`;

  if (error || data === "not_allowed" || data === "not_found") {
    redirect(withStatus(path, "error", "member_remove_failed"));
  }

  if (data === "owner_not_removed") {
    redirect(withStatus(path, "error", "owner_remove_blocked"));
  }

  redirect(withStatus(path, "status", "member_removed"));
}
