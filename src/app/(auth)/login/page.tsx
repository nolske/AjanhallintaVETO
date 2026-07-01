import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthMessage } from "@/components/auth/auth-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { loginAction } from "@/lib/auth/actions";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { redirectAuthenticatedUser } from "@/lib/auth/server";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectAuthenticatedUser();
  const params = (await searchParams) ?? {};
  const requestedNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = getSafeRedirectPath(requestedNext);

  return (
    <AuthCard
      title="Kirjaudu sisaan"
      description="Kirjaudu omalla sahkopostiosoitteellasi ja salasanallasi."
      footerHref="/register"
      footerLabel="Ei tiliä? Luo uusi tili."
    >
      <form action={loginAction} className="flex flex-col gap-5">
        <AuthMessage error={params.error} status={params.status} />
        <input name="next" type="hidden" value={next} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" htmlFor="email">
            Sahkoposti
          </label>
          <input
            autoComplete="email"
            className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
            id="email"
            name="email"
            required
            type="email"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" htmlFor="password">
            Salasana
          </label>
          <input
            autoComplete="current-password"
            className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
            id="password"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SubmitButton pendingText="Kirjaudutaan...">Kirjaudu</SubmitButton>
          <Link
            className="text-sm font-semibold text-[var(--accent)]"
            href="/forgot-password"
          >
            Unohtuiko salasana?
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
