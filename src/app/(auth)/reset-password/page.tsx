import { AuthCard } from "@/components/auth/auth-card";
import { AuthMessage } from "@/components/auth/auth-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { resetPasswordAction } from "@/lib/auth/actions";

type ResetPasswordPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({
  searchParams
}: ResetPasswordPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <AuthCard
      title="Aseta uusi salasana"
      description="Kirjoita uusi salasana. Linkin taytyy olla avattu samassa selaimessa."
      footerHref="/login"
      footerLabel="Takaisin kirjautumiseen."
    >
      <form action={resetPasswordAction} className="flex flex-col gap-5">
        <AuthMessage error={params.error} status={params.status} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" htmlFor="password">
              Uusi salasana
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
        <SubmitButton pendingText="Tallennetaan...">Tallenna uusi salasana</SubmitButton>
      </form>
    </AuthCard>
  );
}
