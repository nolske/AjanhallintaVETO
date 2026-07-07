import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthMessage } from "@/components/auth/auth-message";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  addProjectMemberAction,
  removeProjectMemberAction
} from "@/lib/projects/actions";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { canManageProject, canRemoveProjectMember } from "@/lib/projects/authz";
import { getProjectDetail, getProjectMembers } from "@/lib/projects/queries";

type ProjectMembersPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectMembersPage({
  params,
  searchParams
}: ProjectMembersPageProps) {
  const { projectId } = await params;
  await requireAuthenticatedUser(`/projects/${projectId}/members`);
  const project = await getProjectDetail(projectId);

  if (!project) {
    notFound();
  }

  if (!canManageProject(project.user_role)) {
    notFound();
  }

  const members = await getProjectMembers(projectId);
  const query = (await searchParams) ?? {};

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <div>
        <Link
          className="text-sm font-semibold text-[var(--accent)]"
          href={`/projects/${projectId}`}
        >
          Takaisin projektiin
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Jäsenet</h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Lisää olemassa oleva rekisteröity käyttäjä sähköpostiosoitteella.
          Käyttäjähakua ei näytetä julkisesti.
        </p>
      </div>
      <AuthMessage error={query.error} status={query.status} />
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <form action={addProjectMemberAction} className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <input name="projectId" type="hidden" value={projectId} />
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-sm font-semibold" htmlFor="email">
              Uuden jäsenen sähköposti
            </label>
            <input
              autoComplete="email"
              className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
              id="email"
              name="email"
              required
              type="email"
            />
          </div>
          <SubmitButton pendingText="Lisätään...">Lisää jäsen</SubmitButton>
        </form>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Nykyiset jäsenet</h2>
        <ul className="mt-4 divide-y divide-[var(--border)]">
          {members.map((member) => (
            <li
              className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              key={member.user_id}
            >
              <div>
                <p className="font-medium">{member.display_name || member.email}</p>
                <p className="text-sm text-[var(--muted)]">{member.email}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                  {member.role === "owner" ? "Omistaja" : "Jäsen"}
                </p>
              </div>
              {canRemoveProjectMember(project.user_role, member.role) ? (
                <form action={removeProjectMemberAction}>
                  <input name="projectId" type="hidden" value={projectId} />
                  <input name="userId" type="hidden" value={member.user_id} />
                  <SubmitButton pendingText="Poistetaan...">Poista</SubmitButton>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
