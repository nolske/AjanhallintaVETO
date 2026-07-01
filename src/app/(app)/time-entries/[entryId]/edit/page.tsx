import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthMessage } from "@/components/auth/auth-message";
import { TimeEntryForm } from "@/components/time-entries/time-entry-form";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { updateTimeEntryAction } from "@/lib/time-entries/actions";
import {
  getTimeEntryForEdit,
  getTimeEntryProjects
} from "@/lib/time-entries/queries";

type EditTimeEntryPageProps = {
  params: Promise<{ entryId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditTimeEntryPage({
  params,
  searchParams
}: EditTimeEntryPageProps) {
  const { entryId } = await params;
  await requireAuthenticatedUser(`/time-entries/${entryId}/edit`);
  const entry = await getTimeEntryForEdit(entryId);

  if (!entry) {
    notFound();
  }

  const projects = await getTimeEntryProjects();
  const query = (await searchParams) ?? {};

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div>
        <Link className="text-sm font-semibold text-[var(--accent)]" href="/time-entries">
          Takaisin kirjauksiin
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Muokkaa tuntikirjausta</h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Voit muokata vain omia kirjauksiasi. Kayttajatunnusta ei voi vaihtaa.
        </p>
      </div>
      <AuthMessage error={query.error} status={query.status} />
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <TimeEntryForm
          action={updateTimeEntryAction}
          defaultDescription={entry.description}
          defaultDurationMinutes={entry.duration_minutes}
          defaultEntryDate={entry.entry_date}
          defaultProjectId={entry.project_id}
          entryId={entryId}
          next="/time-entries"
          pendingLabel="Tallennetaan..."
          projects={projects}
          submitLabel="Tallenna muutokset"
        />
      </div>
    </section>
  );
}
