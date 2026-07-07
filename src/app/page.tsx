import Link from "next/link";
import { ECTS_MINUTES, minutesToEcts } from "@/lib/calculations/ects";

const highlights = [
  "Kirjaa opiskeluprojektien aika kokonaisina minuutteina.",
  "Jaa projektit rekisteroityjen jasenten kanssa.",
  "Raportoi tunnit ja lasketut ECTS-pisteet.",
  "Pidä oikeudet Supabase RLS -saantojen takana."
];

export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
          Opiskelun ajanseurannan MVP
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-normal text-[var(--foreground)] sm:text-5xl">
          AjanhallintaVETO
        </h1>
        <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
          Selkea verkkosovellus opiskeluprojektien tuntien kirjaamiseen,
          projektijasenten hallintaan ja ECTS-pisteiden laskemiseen kirjatuista
          minuuteista.
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
        <h2 className="text-xl font-semibold">ECTS-laskenta</h2>
        <p className="mt-3 text-[var(--muted)]">
          Yksi ECTS-piste on {ECTS_MINUTES.toLocaleString("fi-FI")} minuuttia.
          Esimerkiksi 810 minuuttia on {minutesToEcts(810)} ECTS-pistetta.
        </p>
      </div>

      <div>
        <Link
          className="primary-button inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition"
          href="/dashboard"
        >
          Siirry koontiin
        </Link>
      </div>
    </section>
  );
}
