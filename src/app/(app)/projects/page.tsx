import Link from "next/link";
import { AuthMessage } from "@/components/auth/auth-message";
import { ProjectCard } from "@/components/projects/project-card";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { getProjectSummaries } from "@/lib/projects/queries";

type ProjectsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function EmptyState({ archived }: { archived?: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel)] p-6 text-[var(--muted)]">
      {archived
        ? "Arkistoituja projekteja ei ole."
        : "Aktiivisia projekteja ei viela ole. Luo ensimmainen projekti."}
    </div>
  );
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  await requireAuthenticatedUser("/projects");
  const params = (await searchParams) ?? {};
  const projects = await getProjectSummaries();
  const activeProjects = projects.filter((project) => project.status === "active");
  const archivedProjects = projects.filter((project) => project.status === "archived");

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projektit</h1>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
            Naet vain projektit, joissa olet jasenena. Aktiiviset ja arkistoidut
            projektit pidetaan erillaan.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          href="/projects/new"
        >
          Uusi projekti
        </Link>
      </div>
      <AuthMessage error={params.error} status={params.status} />
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Aktiiviset</h2>
        {activeProjects.length > 0 ? (
          activeProjects.map((project) => (
            <ProjectCard key={project.project_id} project={project} />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Arkistoidut</h2>
        {archivedProjects.length > 0 ? (
          archivedProjects.map((project) => (
            <ProjectCard key={project.project_id} project={project} />
          ))
        ) : (
          <EmptyState archived />
        )}
      </div>
    </section>
  );
}
