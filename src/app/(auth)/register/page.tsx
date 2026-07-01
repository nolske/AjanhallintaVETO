import { AuthCard } from "@/components/auth/auth-card";
import { AuthMessage } from "@/components/auth/auth-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { registerAction } from "@/lib/auth/actions";
import { redirectAuthenticatedUser } from "@/lib/auth/server";

type RegisterPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  await redirectAuthenticatedUser();
  const params = (await searchParams) ?? {};

  return (
    <AuthCard
      title="Luo tili"
      description="Rekisteroidy sahkopostilla. Saat vahvistuslinkin ennen kuin tili on kaytossa."
      footerHref="/login"
      footerLabel="Onko sinulla jo tili? Kirjaudu sisaan."
    >
      <form action={registerAction} className="flex flex-col gap-5">
        <AuthMessage error={params.error} status={params.status} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" htmlFor="displayName">
            Nimi
          </label>
          <input
            autoComplete="name"
            className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
            id="displayName"
            maxLength={100}
            minLength={2}
            name="displayName"
            required
            type="text"
          />
        </div>
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
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" htmlFor="password">
              Salasana
            </label>
            <input
              autoComplete="new-password"
              className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
              id="password"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" htmlFor="confirmPassword">
              Vahvista salasana
            </label>
            <input
              autoComplete="new-password"
              className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
              id="confirmPassword"
              minLength={8}
              name="confirmPassword"
              required
              type="password"
            />
          </div>
        </div>
        <SubmitButton pendingText="Luodaan tili...">Luo tili</SubmitButton>
      </form>
    </AuthCard>
  );
}
