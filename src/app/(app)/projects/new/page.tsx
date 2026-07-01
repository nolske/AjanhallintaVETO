import Link from "next/link";
import { AuthMessage } from "@/components/auth/auth-message";
import { ProjectForm } from "@/components/projects/project-form";
import { createProjectAction } from "@/lib/projects/actions";
import { requireAuthenticatedUser } from "@/lib/auth/server";

type NewProjectPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  await requireAuthenticatedUser("/projects/new");
  const params = (await searchParams) ?? {};

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div>
        <Link className="text-sm font-semibold text-[var(--accent)]" href="/projects">
          Takaisin projekteihin
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Uusi projekti</h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Sinusta tulee projektin omistaja. Omistajan jasenyys luodaan
          tietokannassa samassa tapahtumassa projektin kanssa.
        </p>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <AuthMessage error={params.error} status={params.status} />
        <div className="mt-5">
          <ProjectForm
            action={createProjectAction}
            pendingLabel="Luodaan..."
            submitLabel="Luo projekti"
          />
        </div>
      </div>
    </section>
  );
}
