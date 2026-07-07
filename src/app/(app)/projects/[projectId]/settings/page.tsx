import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthMessage } from "@/components/auth/auth-message";
import { ProjectForm } from "@/components/projects/project-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { canManageProject } from "@/lib/projects/authz";
import {
  setProjectArchivedAction,
  updateProjectAction
} from "@/lib/projects/actions";
import { getProjectDetail } from "@/lib/projects/queries";

type ProjectSettingsPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectSettingsPage({
  params,
  searchParams
}: ProjectSettingsPageProps) {
  const { projectId } = await params;
  await requireAuthenticatedUser(`/projects/${projectId}/settings`);
  const project = await getProjectDetail(projectId);

  if (!project) {
    notFound();
  }

  if (!canManageProject(project.user_role)) {
    notFound();
  }

  const query = (await searchParams) ?? {};
  const next = `/projects/${projectId}/settings`;
  const archiveTarget = project.status === "active" ? "archived" : "active";

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div>
        <Link
          className="text-sm font-semibold text-[var(--accent)]"
          href={`/projects/${projectId}`}
        >
          Takaisin projektiin
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Projektin asetukset</h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Vain projektin omistaja voi muokata projektia tai muuttaa sen tilaa.
        </p>
      </div>
      <AuthMessage error={query.error} status={query.status} />
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <ProjectForm
          action={updateProjectAction}
          defaultDescription={project.description}
          defaultName={project.name}
          pendingLabel="Tallennetaan..."
          projectId={projectId}
          submitLabel="Tallenna muutokset"
        />
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          {project.status === "active" ? "Arkistoi projekti" : "Palauta projekti"}
        </h2>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Projektia ei poisteta pysyvästi MVP-versiossa.
        </p>
        <form action={setProjectArchivedAction} className="mt-5">
          <input name="projectId" type="hidden" value={projectId} />
          <input name="status" type="hidden" value={archiveTarget} />
          <input name="next" type="hidden" value={next} />
          <SubmitButton pendingText="Päivitetään...">
            {project.status === "active" ? "Arkistoi projekti" : "Palauta aktiiviseksi"}
          </SubmitButton>
        </form>
      </div>
    </section>
  );
}
