import { AuthCard } from "@/components/auth/auth-card";
import { AuthMessage } from "@/components/auth/auth-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { redirectAuthenticatedUser } from "@/lib/auth/server";

type ForgotPasswordPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ForgotPasswordPage({
  searchParams
}: ForgotPasswordPageProps) {
  await redirectAuthenticatedUser();
  const params = (await searchParams) ?? {};

  return (
    <AuthCard
      title="Vaihda unohtunut salasana"
      description="Anna sahkopostiosoite. Jos tili loytyy, saat linkin salasanan vaihtamiseen."
      footerHref="/login"
      footerLabel="Takaisin kirjautumiseen."
    >
      <form action={forgotPasswordAction} className="flex flex-col gap-5">
        <AuthMessage error={params.error} status={params.status} />
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
        <SubmitButton pendingText="Lahetetaan...">Laheta vaihtolinkki</SubmitButton>
      </form>
    </AuthCard>
  );
}
