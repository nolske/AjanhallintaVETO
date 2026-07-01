"use server";

import { redirect } from "next/navigation";
import { getSafeRedirectPath, withStatus } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  timeEntryFormSchema,
  timeEntryIdSchema
} from "@/lib/validation/time-entries";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
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

export async function createTimeEntryAction(formData: FormData) {
  const parsed = timeEntryFormSchema.safeParse({
    projectId: getString(formData, "projectId"),
    entryDate: getString(formData, "entryDate"),
    hours: getString(formData, "hours"),
    minutes: getString(formData, "minutes"),
    description: getString(formData, "description")
  });

  if (!parsed.success) {
    redirect(withStatus("/time-entries/new", "error", "time_entry_invalid"));
  }

  const next = getSafeRedirectPath(formData.get("next"));
  const { supabase } = await requireActionUser();
  const { error } = await supabase.from("time_entries").insert({
    project_id: parsed.data.projectId,
    entry_date: parsed.data.entryDate,
    duration_minutes: parsed.data.durationMinutes,
    description: parsed.data.description
  });

  if (error) {
    redirect(withStatus("/time-entries/new", "error", "time_entry_save_failed"));
  }

  redirect(withStatus(next, "status", "time_entry_created"));
}

export async function updateTimeEntryAction(formData: FormData) {
  const idParsed = timeEntryIdSchema.safeParse({
    entryId: getString(formData, "entryId")
  });
  const parsed = timeEntryFormSchema.safeParse({
    projectId: getString(formData, "projectId"),
    entryDate: getString(formData, "entryDate"),
    hours: getString(formData, "hours"),
    minutes: getString(formData, "minutes"),
    description: getString(formData, "description")
  });

  if (!idParsed.success) {
    redirect(withStatus("/time-entries", "error", "time_entry_invalid"));
  }

  const editPath = `/time-entries/${idParsed.data.entryId}/edit`;

  if (!parsed.success) {
    redirect(withStatus(editPath, "error", "time_entry_invalid"));
  }

  const { supabase } = await requireActionUser();
  const { error } = await supabase
    .from("time_entries")
    .update({
      project_id: parsed.data.projectId,
      entry_date: parsed.data.entryDate,
      duration_minutes: parsed.data.durationMinutes,
      description: parsed.data.description
    })
    .eq("id", idParsed.data.entryId);

  if (error) {
    redirect(withStatus(editPath, "error", "time_entry_save_failed"));
  }

  redirect(withStatus("/time-entries", "status", "time_entry_updated"));
}

export async function deleteTimeEntryAction(formData: FormData) {
  const parsed = timeEntryIdSchema.safeParse({
    entryId: getString(formData, "entryId")
  });
  const next = getSafeRedirectPath(formData.get("next"));

  if (!parsed.success) {
    redirect(withStatus(next, "error", "time_entry_invalid"));
  }

  const { supabase } = await requireActionUser();
  const { error } = await supabase
    .from("time_entries")
    .delete()
    .eq("id", parsed.data.entryId);

  if (error) {
    redirect(withStatus(next, "error", "time_entry_delete_failed"));
  }

  redirect(withStatus(next, "status", "time_entry_deleted"));
}
