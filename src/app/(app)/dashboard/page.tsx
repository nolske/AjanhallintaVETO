import Link from "next/link";
import { requireAuthenticatedUser } from "@/lib/auth/server";

export default function DashboardPage() {
  const userPromise = requireAuthenticatedUser("/dashboard");

  return (
    <DashboardContent userPromise={userPromise} />
  );
}

async function DashboardContent({
  userPromise
}: {
  userPromise: ReturnType<typeof requireAuthenticatedUser>;
}) {
  const user = await userPromise;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
          Kirjautunut kayttaja
        </p>
        <h1 className="mt-3 text-3xl font-bold">Koonti</h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Olet kirjautunut osoitteella {user.email}. Projektit, tunnit ja raportit
          lisataan seuraavissa vaiheissa.
        </p>
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
