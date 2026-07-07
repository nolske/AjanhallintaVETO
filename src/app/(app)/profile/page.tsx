import { AuthMessage } from "@/components/auth/auth-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { updateProfileAction } from "@/lib/auth/actions";
import { getCurrentProfile, requireAuthenticatedUser } from "@/lib/auth/server";

type ProfilePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await requireAuthenticatedUser("/profile");
  const profile = await getCurrentProfile(user.id);
  const params = (await searchParams) ?? {};

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold">Profiili</h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Hallitse näkyvää nimeäsi. Sähköposti ja rooli eivät ole muokattavissa
          talla lomakkeella.
        </p>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <form action={updateProfileAction} className="flex flex-col gap-5">
          <AuthMessage error={params.error} status={params.status} />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="email">
                Sähköposti
              </label>
              <input
                className="min-h-11 rounded-md border border-[var(--border)] bg-[#f4f6fa] px-3 py-2 text-[var(--muted)]"
                id="email"
                readOnly
                type="email"
                value={profile?.email ?? user.email ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="role">
                Rooli
              </label>
              <input
                className="min-h-11 rounded-md border border-[var(--border)] bg-[#f4f6fa] px-3 py-2 text-[var(--muted)]"
                id="role"
                readOnly
                type="text"
                value={profile?.role ?? "user"}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" htmlFor="displayName">
              Nimi
            </label>
            <input
              autoComplete="name"
              className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
              defaultValue={profile?.display_name ?? ""}
              id="displayName"
              maxLength={100}
              minLength={2}
              name="displayName"
              required
              type="text"
            />
          </div>
          <SubmitButton pendingText="Tallennetaan...">Tallenna profiili</SubmitButton>
        </form>
      </div>
    </section>
  );
}
