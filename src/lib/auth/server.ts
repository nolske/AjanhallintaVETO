import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireAuthenticatedUser(nextPath = "/dashboard") {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/login?error=not_authenticated&next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

export async function redirectAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect("/dashboard");
  }
}

export async function getCurrentProfile(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,display_name,role,created_at,updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}
