"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema
} from "@/lib/validation/auth";
import { getSafeRedirectPath, withStatus } from "@/lib/auth/redirects";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function getRequestOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    displayName: getString(formData, "displayName"),
    email: getString(formData, "email"),
    password: getString(formData, "password"),
    confirmPassword: getString(formData, "confirmPassword")
  });

  if (!parsed.success) {
    redirect(withStatus("/register", "error", "invalid_form"));
  }

  const origin = await getRequestOrigin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: {
        display_name: parsed.data.displayName
      }
    }
  });

  if (error) {
    redirect(withStatus("/register", "error", "unexpected"));
  }

  redirect(withStatus("/login", "status", "registration_check_email"));
}

export async function loginAction(formData: FormData) {
  const next = getSafeRedirectPath(formData.get("next"));
  const parsed = loginSchema.safeParse({
    email: getString(formData, "email"),
    password: getString(formData, "password"),
    next
  });

  if (!parsed.success) {
    redirect(withStatus(`/login?next=${encodeURIComponent(next)}`, "error", "invalid_form"));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    redirect(
      withStatus(`/login?next=${encodeURIComponent(next)}`, "error", "invalid_credentials")
    );
  }

  redirect(next);
}

export async function forgotPasswordAction(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: getString(formData, "email")
  });

  if (!parsed.success) {
    redirect(withStatus("/forgot-password", "error", "invalid_form"));
  }

  const origin = await getRequestOrigin();
  const supabase = await createSupabaseServerClient();

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`
  });

  redirect(withStatus("/forgot-password", "status", "reset_email_sent"));
}

export async function resetPasswordAction(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    password: getString(formData, "password"),
    confirmPassword: getString(formData, "confirmPassword")
  });

  if (!parsed.success) {
    redirect(withStatus("/reset-password", "error", "invalid_form"));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password
  });

  if (error) {
    redirect(withStatus("/reset-password", "error", "reset_failed"));
  }

  redirect(withStatus("/login", "status", "password_updated"));
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect(withStatus("/login", "status", "signed_out"));
}

export async function updateProfileAction(formData: FormData) {
  const parsed = updateProfileSchema.safeParse({
    displayName: getString(formData, "displayName")
  });

  if (!parsed.success) {
    redirect(withStatus("/profile", "error", "invalid_form"));
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(withStatus("/login", "error", "not_authenticated"));
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName })
    .eq("id", user.id);

  if (error) {
    redirect(withStatus("/profile", "error", "update_failed"));
  }

  redirect(withStatus("/profile", "status", "profile_updated"));
}
