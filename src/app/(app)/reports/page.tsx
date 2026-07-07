import Link from "next/link";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { formatEcts } from "@/lib/calculations/ects";
import { getTimeEntryProjects } from "@/lib/time-entries/queries";
import { formatDuration } from "@/lib/time-entries/duration";
import { parseReportFilters, reportFiltersToSearchParams } from "@/lib/reports/filters";
import { getReportEntries } from "@/lib/reports/queries";
import {
  buildProjectBreakdown,
  summarizeReport
} from "@/lib/reports/summary";

type ReportsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  await requireAuthenticatedUser("/reports");
  const params = (await searchParams) ?? {};
  const { filters, valid } = parseReportFilters(params);
  const [entries, projects] = await Promise.all([
    getReportEntries(filters),
    getTimeEntryProjects()
  ]);
  const summary = summarizeReport(entries);
  const breakdown = buildProjectBreakdown(entries);
  const exportParams = reportFiltersToSearchParams(filters);
  const exportHref = `/reports/export${exportParams.size > 0 ? `?${exportParams}` : ""}`;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Raportit</h1>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
            Raportti näyttää vain omat tuntikirjauksesi. ECTS lasketaan
            yhteenlasketuista minuuteista.
          </p>
        </div>
        <Link
          className="primary-button inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition"
          href={exportHref}
        >
          Vie CSV
        </Link>
      </div>
      {!valid ? (
        <p className="rounded-md border border-[#f1b7b7] bg-[#fff2f2] px-4 py-3 text-sm font-medium text-[#8a1f1f]">
          Suodattimet eivät olleet kelvollisia, joten näytetään koko raportti.
        </p>
      ) : null}
      <form className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm md:grid-cols-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" htmlFor="startDate">
            Alkaen
          </label>
          <input
            className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
            defaultValue={filters.startDate}
            id="startDate"
            name="startDate"
            type="date"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" htmlFor="endDate">
            Päättyen
          </label>
          <input
            className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
            defaultValue={filters.endDate}
            id="endDate"
            name="endDate"
            type="date"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" htmlFor="projectId">
            Projekti
          </label>
          <select
            className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
            defaultValue={filters.projectId ?? ""}
            id="projectId"
            name="projectId"
          >
            <option value="">Kaikki projektit</option>
            {projects.map((project) => (
              <option key={project.project_id} value={project.project_id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" htmlFor="projectStatus">
            Tila
          </label>
          <select
            className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
            defaultValue={filters.projectStatus}
            id="projectStatus"
            name="projectStatus"
          >
            <option value="all">Kaikki</option>
            <option value="active">Aktiiviset</option>
            <option value="archived">Arkistoidut</option>
          </select>
        </div>
        <div className="flex flex-col justify-end gap-2 sm:flex-row md:flex-col">
          <button
            className="primary-button inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition"
            type="submit"
          >
            Suodata
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--accent)]"
            href="/reports"
          >
            Tyhjenna
          </Link>
        </div>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Minuutit" value={String(summary.totalMinutes)} />
        <Metric title="Tunnit" value={summary.formattedHours} />
        <Metric title="ECTS" value={`${summary.ects} ECTS`} />
        <Metric title="Kirjauksia" value={String(summary.entryCount)} />
      </div>
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Projektikohtainen yhteenveto</h2>
        {breakdown.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-sm">
            <div className="grid gap-3 border-b border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--muted)] md:grid-cols-5">
              <span>Projekti</span>
              <span>Minuutit</span>
              <span>Tunnit</span>
              <span>ECTS</span>
              <span>Kirjauksia</span>
            </div>
            <ul className="divide-y divide-[var(--border)]">
              {breakdown.map((row) => (
                <li className="grid gap-3 px-5 py-4 text-sm md:grid-cols-5" key={row.projectId}>
                  <span className="font-semibold">
                    {row.projectName}
                    {row.projectStatus === "archived" ? " (arkistoitu)" : ""}
                  </span>
                  <span>{row.minutes}</span>
                  <span>{row.formattedHours}</span>
                  <span>{row.ects}</span>
                  <span>{row.entryCount}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Empty text="Raporttiin ei löytynyt projektikohtaisia kirjauksia." />
        )}
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Kirjaukset</h2>
        {entries.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-sm">
            <ul className="divide-y divide-[var(--border)]">
              {entries.map((entry) => (
                <li className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr_1fr]" key={entry.entry_id}>
                  <div>
                    <p className="font-semibold">{formatDate(entry.entry_date)}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {entry.project_name}
                      {entry.project_status === "archived" ? " (arkistoitu)" : ""}
                    </p>
                  </div>
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    {entry.description || "Ei kuvausta."}
                  </p>
                  <dl className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <dt className="font-semibold">Min</dt>
                      <dd>{entry.duration_minutes}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Kesto</dt>
                      <dd>{formatDuration(entry.duration_minutes)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">ECTS</dt>
                      <dd>{formatEcts(entry.duration_minutes)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Empty text="Valituilla suodattimilla ei löytynyt kirjauksia." />
        )}
      </section>
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

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel)] p-6 text-[var(--muted)]">
      {text}
    </div>
  );
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
}
