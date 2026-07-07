import Link from "next/link";
import { formatEcts, formatMinutesAsHours } from "@/lib/calculations/ects";
import type { ProjectSummary } from "@/lib/projects/queries";

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const ownMinutes = project.current_user_minutes;
  const totalMinutes = project.total_minutes;

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold">
            <Link className="hover:text-[var(--accent)]" href={`/projects/${project.project_id}`}>
              {project.name}
            </Link>
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {project.description || "Ei kuvausta."}
          </p>
        </div>
        <span className="w-fit rounded-md border border-[var(--border)] px-3 py-1 text-xs font-semibold uppercase text-[var(--muted)]">
          {project.user_role === "owner" ? "Omistaja" : "Jäsen"}
        </span>
      </div>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-semibold">Omistaja</dt>
          <dd className="mt-1 text-[var(--muted)]">
            {project.owner_display_name || project.owner_email}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Jäseniä</dt>
          <dd className="mt-1 text-[var(--muted)]">{project.member_count}</dd>
        </div>
        <div>
          <dt className="font-semibold">Omat tunnit</dt>
          <dd className="mt-1 text-[var(--muted)]">
            {formatMinutesAsHours(ownMinutes)} / {formatEcts(ownMinutes)} ECTS
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Projektin tunnit</dt>
          <dd className="mt-1 text-[var(--muted)]">
            {totalMinutes === null
              ? "Vain omistajalle"
              : `${formatMinutesAsHours(totalMinutes)} / ${formatEcts(totalMinutes)} ECTS`}
          </dd>
        </div>
      </dl>
    </article>
  );
}
