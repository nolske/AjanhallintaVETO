import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthMessage } from "@/components/auth/auth-message";
import { TimeEntryList } from "@/components/time-entries/time-entry-list";
import { formatEcts, formatMinutesAsHours } from "@/lib/calculations/ects";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { canManageProject } from "@/lib/projects/authz";
import { getProjectDetail, getProjectMembers } from "@/lib/projects/queries";
import { getProjectTimeEntries } from "@/lib/time-entries/queries";

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectDetailPage({
  params,
  searchParams
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const user = await requireAuthenticatedUser(`/projects/${projectId}`);
  const project = await getProjectDetail(projectId);

  if (!project) {
    notFound();
  }

  const members = await getProjectMembers(projectId);
  const entries = await getProjectTimeEntries(projectId);
  const query = (await searchParams) ?? {};
  const isOwner = canManageProject(project.user_role);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link className="text-sm font-semibold text-[var(--accent)]" href="/projects">
            Takaisin projekteihin
          </Link>
          <h1 className="mt-4 text-3xl font-bold">{project.name}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
            {project.description || "Projektilla ei ole kuvausta."}
          </p>
        </div>
        <span className="w-fit rounded-md border border-[var(--border)] px-3 py-1 text-xs font-semibold uppercase text-[var(--muted)]">
          {project.status === "active" ? "Aktiivinen" : "Arkistoitu"}
        </span>
      </div>
      <AuthMessage error={query.error} status={query.status} />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Omat tunnit" minutes={project.current_user_minutes} />
        <Metric label="Omat ECTS" value={`${formatEcts(project.current_user_minutes)} ECTS`} />
        <Metric label="Jasenia" value={String(project.member_count)} />
        <Metric
          label="Projektin tunnit"
          value={
            project.total_minutes === null
              ? "Vain omistajalle"
              : formatMinutesAsHours(project.total_minutes)
          }
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Jasenet</h2>
            <ul className="mt-4 divide-y divide-[var(--border)]">
              {members.map((member) => (
                <li className="flex items-center justify-between gap-4 py-3" key={member.user_id}>
                  <div>
                    <p className="font-medium">{member.display_name || member.email}</p>
                    <p className="text-sm text-[var(--muted)]">{member.email}</p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--muted)]">
                    {member.role === "owner" ? "Omistaja" : "Jasen"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Projektin kirjaukset</h2>
            <TimeEntryList
              currentUserId={user.id}
              emptyText="Projektissa ei ole viela nakyvissa olevia tuntikirjauksia."
              entries={entries}
              next={`/projects/${projectId}`}
              showUser={isOwner}
            />
          </div>
        </div>
        <aside className="flex flex-col gap-3">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)]"
            href={`/time-entries/new?projectId=${project.project_id}`}
          >
            Lisaa tuntikirjaus
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)]"
            href={`/time-entries?projectId=${project.project_id}`}
          >
            Nayta kirjaukset
          </Link>
          {isOwner ? (
            <>
              <Link
                className="primary-button inline-flex min-h-11 items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition"
                href={`/projects/${project.project_id}/settings`}
              >
                Projektin asetukset
              </Link>
              <Link
                className="primary-button inline-flex min-h-11 items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition"
                href={`/projects/${project.project_id}/members`}
              >
                Hallitse jasenia
              </Link>
            </>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function Metric({
  label,
  minutes,
  value
}: {
  label: string;
  minutes?: number;
  value?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
      <dt className="text-sm font-semibold text-[var(--muted)]">{label}</dt>
      <dd className="mt-2 text-2xl font-bold">
        {typeof minutes === "number" ? formatMinutesAsHours(minutes) : value}
      </dd>
    </div>
  );
}
