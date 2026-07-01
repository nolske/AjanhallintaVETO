import Link from "next/link";
import { AuthMessage } from "@/components/auth/auth-message";
import { TimeEntryList } from "@/components/time-entries/time-entry-list";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { getPersonalTimeEntries } from "@/lib/time-entries/queries";

type TimeEntriesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TimeEntriesPage({ searchParams }: TimeEntriesPageProps) {
  const user = await requireAuthenticatedUser("/time-entries");
  const params = (await searchParams) ?? {};
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  const entries = await getPersonalTimeEntries(projectId);
  const next = projectId ? `/time-entries?projectId=${projectId}` : "/time-entries";

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Omat tuntikirjaukset</h1>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
            Naet ja hallitset vain omia kirjauksiasi. Projektin omistaja voi
            tarkastella projektinsa kokonaiskirjauksia projektin sivulla.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          href={projectId ? `/time-entries/new?projectId=${projectId}` : "/time-entries/new"}
        >
          Uusi tuntikirjaus
        </Link>
      </div>
      <AuthMessage error={params.error} status={params.status} />
      <TimeEntryList
        currentUserId={user.id}
        emptyText="Tuntikirjauksia ei viela ole."
        entries={entries}
        next={next}
        showProject
      />
    </section>
  );
}
