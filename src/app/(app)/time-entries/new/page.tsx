import Link from "next/link";
import { AuthMessage } from "@/components/auth/auth-message";
import { TimeEntryForm } from "@/components/time-entries/time-entry-form";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { createTimeEntryAction } from "@/lib/time-entries/actions";
import { getTodayDateString } from "@/lib/time-entries/duration";
import { getTimeEntryProjects } from "@/lib/time-entries/queries";

type NewTimeEntryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewTimeEntryPage({ searchParams }: NewTimeEntryPageProps) {
  await requireAuthenticatedUser("/time-entries/new");
  const params = (await searchParams) ?? {};
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  const projects = await getTimeEntryProjects();
  const activeProjects = projects.filter((project) => project.status === "active");
  const next = projectId ? `/projects/${projectId}` : "/time-entries";

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div>
        <Link className="text-sm font-semibold text-[var(--accent)]" href={next}>
          Takaisin
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Uusi tuntikirjaus</h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Kirjaa aika tunteina ja minuutteina. Tieto tallennetaan tietokantaan
          kokonaisina minuutteina.
        </p>
      </div>
      <AuthMessage error={params.error} status={params.status} />
      {activeProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel)] p-6 text-[var(--muted)]">
          Sinulla ei ole aktiivisia projekteja, joihin voisi lisata kirjauksia.
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <TimeEntryForm
            action={createTimeEntryAction}
            defaultEntryDate={getTodayDateString()}
            defaultProjectId={projectId}
            next={next}
            pendingLabel="Tallennetaan..."
            projects={activeProjects}
            submitLabel="Tallenna kirjaus"
          />
        </div>
      )}
    </section>
  );
}
