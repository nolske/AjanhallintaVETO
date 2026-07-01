import Link from "next/link";
import { ECTS_MINUTES, minutesToEcts } from "@/lib/calculations/ects";

const highlights = [
  "Track study project work as integer minutes.",
  "Share projects with registered members.",
  "Report hours and calculated ECTS credits.",
  "Keep authorization enforced by Supabase RLS."
];

export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
          Study time management MVP
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-normal text-[var(--foreground)] sm:text-5xl">
          AjanhallintaVETO
        </h1>
        <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
          A focused web application for logging study project hours, managing
          shared project membership, and calculating ECTS credits from approved
          time entries.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {highlights.map((highlight) => (
          <div
            className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm"
            key={highlight}
          >
            <p className="text-base leading-7 text-[var(--foreground)]">
              {highlight}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold">ECTS calculation</h2>
        <p className="mt-3 text-[var(--muted)]">
          One ECTS credit equals {ECTS_MINUTES.toLocaleString("en-US")} minutes.
          For example, 810 minutes is {minutesToEcts(810)} ECTS credits.
        </p>
      </div>

      <div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          href="/dashboard"
        >
          View app shell
        </Link>
      </div>
    </section>
  );
}
