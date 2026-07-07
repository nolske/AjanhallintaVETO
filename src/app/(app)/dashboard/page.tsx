import Link from "next/link";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { formatEcts } from "@/lib/calculations/ects";
import { getProjectSummaries } from "@/lib/projects/queries";
import { getReportEntries } from "@/lib/reports/queries";
import { summarizeReport } from "@/lib/reports/summary";
import { formatDuration } from "@/lib/time-entries/duration";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");
  const [entries, projects] = await Promise.all([
    getReportEntries({ projectStatus: "all" }),
    getProjectSummaries()
  ]);
  const summary = summarizeReport(entries);
  const monthPrefix = new Date().toISOString().slice(0, 7);
  const currentMonthMinutes = entries
    .filter((entry) => entry.entry_date.startsWith(monthPrefix))
    .reduce((sum, entry) => sum + entry.duration_minutes, 0);
  const activeProjects = projects.filter((project) => project.status === "active");
  const recentEntries = entries.slice(0, 5);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
          Kirjautunut kayttaja
        </p>
        <h1 className="mt-3 text-3xl font-bold">Koonti</h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Olet kirjautunut osoitteella {user.email}. Tassa on yhteenveto omista
          kirjauksistasi ja aktiivisista projekteistasi.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Minuutit yhteensa" value={String(summary.totalMinutes)} />
        <Metric title="Tunnit yhteensa" value={summary.formattedHours} />
        <Metric title="ECTS yhteensa" value={`${summary.ects} ECTS`} />
        <Metric title="Tassa kuussa" value={formatDuration(currentMonthMinutes)} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          className="primary-button inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition"
          href="/projects/new"
        >
          Luo projekti
        </Link>
        <Link
          className="primary-button inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition"
          href="/time-entries/new"
        >
          Lisaa tuntikirjaus
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Aktiiviset projektit</h2>
            <Link className="text-sm font-semibold text-[var(--accent)]" href="/projects">
              Kaikki projektit
            </Link>
          </div>
          {activeProjects.length > 0 ? (
            <ul className="mt-4 divide-y divide-[var(--border)]">
              {activeProjects.slice(0, 5).map((project) => (
                <li className="py-3" key={project.project_id}>
                  <Link
                    className="font-semibold hover:text-[var(--accent)]"
                    href={`/projects/${project.project_id}`}
                  >
                    {project.name}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Oma aika {formatDuration(project.current_user_minutes)},{" "}
                    {formatEcts(project.current_user_minutes)} ECTS
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-[var(--border)] p-5 text-[var(--muted)]">
              Aktiivisia projekteja ei viela ole.
            </p>
          )}
        </section>
        <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Viimeisimmat kirjaukset</h2>
            <Link className="text-sm font-semibold text-[var(--accent)]" href="/time-entries">
              Kaikki kirjaukset
            </Link>
          </div>
          {recentEntries.length > 0 ? (
            <ul className="mt-4 divide-y divide-[var(--border)]">
              {recentEntries.map((entry) => (
                <li className="py-3" key={entry.entry_id}>
                  <p className="font-semibold">
                    {formatDate(entry.entry_date)} - {entry.project_name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {formatDuration(entry.duration_minutes)} /{" "}
                    {formatEcts(entry.duration_minutes)} ECTS
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-[var(--border)] p-5 text-[var(--muted)]">
              Tuntikirjauksia ei viela ole.
            </p>
          )}
        </section>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm transition hover:border-[var(--accent)]"
          href="/projects"
        >
          <h2 className="font-semibold">Projektit</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Luo ja hallitse opiskeluprojekteja.
          </p>
        </Link>
        <Link
          className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm transition hover:border-[var(--accent)]"
          href="/time-entries"
        >
          <h2 className="font-semibold">Tunnit</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Kirjaa projektikohtainen aika minuutteina.
          </p>
        </Link>
        <Link
          className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm transition hover:border-[var(--accent)]"
          href="/reports"
        >
          <h2 className="font-semibold">Raportit</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Tarkastele tunteja ja laskettuja ECTS-pisteita.
          </p>
        </Link>
      </div>
    </section>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
      <p className="text-sm font-semibold text-[var(--muted)]">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
}
