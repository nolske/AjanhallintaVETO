import Link from "next/link";
import { notFound } from "next/navigation";
import { canAccessAdminArea } from "@/lib/admin/authz";
import { getAdminDashboardData } from "@/lib/admin/queries";
import { getCurrentProfile, requireAuthenticatedUser } from "@/lib/auth/server";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fi-FI", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

export default async function AdminPage() {
  const user = await requireAuthenticatedUser("/admin");
  const profile = await getCurrentProfile(user.id);

  if (!canAccessAdminArea(profile?.role)) {
    notFound();
  }

  const data = await getAdminDashboardData();
  const totalProjectCount = data.activeProjectCount + data.archivedProjectCount;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
          Ylläpito
        </p>
        <h1 className="mt-2 text-3xl font-bold">Ylläpitäjän koonti</h1>
        <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
          Lue perustietoja käyttäjistä ja projekteista tukitilanteita varten.
          Tässä näkymässä ei muokata muiden käyttäjien tunteja.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <p className="text-sm text-[var(--muted)]">Käyttäjiä</p>
          <p className="mt-2 text-3xl font-bold">{data.userCount}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <p className="text-sm text-[var(--muted)]">Aktiivisia projekteja</p>
          <p className="mt-2 text-3xl font-bold">{data.activeProjectCount}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <p className="text-sm text-[var(--muted)]">Arkistoituja projekteja</p>
          <p className="mt-2 text-3xl font-bold">{data.archivedProjectCount}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <p className="text-sm text-[var(--muted)]">Aikamerkintoja</p>
          <p className="mt-2 text-3xl font-bold">{data.timeEntryCount}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Käyttäjät</h2>
              <p className="text-sm text-[var(--muted)]">
                Viimeisimmat profiilit. Salasanoja tai tunnisteita ei näytetä.
              </p>
            </div>
          </div>

          {data.users.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-[var(--border)] text-[var(--muted)]">
                  <tr>
                    <th className="py-3 pr-4 font-semibold">Nimi</th>
                    <th className="py-3 pr-4 font-semibold">Sähköposti</th>
                    <th className="py-3 pr-4 font-semibold">Rooli</th>
                    <th className="py-3 font-semibold">Luotu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {data.users.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-4">
                        {item.display_name || "Ei nimea"}
                      </td>
                      <td className="py-3 pr-4">{item.email}</td>
                      <td className="py-3 pr-4">
                        {item.role === "admin" ? "Ylläpitäjä" : "Käyttäjä"}
                      </td>
                      <td className="py-3">{formatDate(item.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-5 rounded-md border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
              Käyttäjiä ei löytynyt.
            </p>
          )}
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Projektit</h2>
              <p className="text-sm text-[var(--muted)]">
                {totalProjectCount} projektia yhteensä. Avaa projekti
                tarkempaa tarkastelua varten.
              </p>
            </div>
            <Link className="text-sm font-semibold text-[var(--accent)]" href="/projects">
              Projektit
            </Link>
          </div>

          {data.projects.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-[var(--border)] text-[var(--muted)]">
                  <tr>
                    <th className="py-3 pr-4 font-semibold">Projekti</th>
                    <th className="py-3 pr-4 font-semibold">Omistaja</th>
                    <th className="py-3 pr-4 font-semibold">Tila</th>
                    <th className="py-3 pr-4 font-semibold">Jäseniä</th>
                    <th className="py-3 pr-4 font-semibold">Luotu</th>
                    <th className="py-3 font-semibold">Linkki</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {data.projects.map((project) => (
                    <tr key={project.id}>
                      <td className="py-3 pr-4">
                        <div className="font-medium">{project.name}</div>
                        {project.description ? (
                          <div className="mt-1 max-w-64 truncate text-xs text-[var(--muted)]">
                            {project.description}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4">
                        {project.owner_display_name || project.owner_email}
                      </td>
                      <td className="py-3 pr-4">
                        {project.status === "active" ? "Aktiivinen" : "Arkistoitu"}
                      </td>
                      <td className="py-3 pr-4">{project.member_count}</td>
                      <td className="py-3 pr-4">{formatDate(project.created_at)}</td>
                      <td className="py-3">
                        <Link
                          className="font-semibold text-[var(--accent)]"
                          href={`/projects/${project.id}`}
                        >
                          Avaa
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-5 rounded-md border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
              Projekteja ei ole vielä.
            </p>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[#f4f6fa] p-5 text-sm leading-6 text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">Rajaukset</h2>
        <p className="mt-2">
          Ylläpitäjän näkymä käyttää samaa palvelinpuolen Supabase-istuntoa ja
          tietokannan RLS-sääntöjä kuin muu sovellus. Palvelurooliavainta ei
          käytetä, eikä tässä näkymässä ole toimintoja muiden käyttäjien
          aikamerkintojen muokkaamiseen.
        </p>
        <p className="mt-2">
          Aikamerkintojen luku on merkintojen määrä, ei tuntisumma.
        </p>
      </section>
    </section>
  );
}
