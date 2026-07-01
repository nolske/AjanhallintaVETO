import { SubmitButton } from "@/components/forms/submit-button";

type ProjectFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  projectId?: string;
  defaultName?: string;
  defaultDescription?: string | null;
};

export function ProjectForm({
  action,
  submitLabel,
  pendingLabel,
  projectId,
  defaultName = "",
  defaultDescription = ""
}: ProjectFormProps) {
  return (
    <form action={action} className="flex flex-col gap-5">
      {projectId ? <input name="projectId" type="hidden" value={projectId} /> : null}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold" htmlFor="name">
          Projektin nimi
        </label>
        <input
          className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
          defaultValue={defaultName}
          id="name"
          maxLength={100}
          minLength={2}
          name="name"
          required
          type="text"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold" htmlFor="description">
          Kuvaus
        </label>
        <textarea
          className="min-h-32 rounded-md border border-[var(--border)] bg-white px-3 py-2"
          defaultValue={defaultDescription ?? ""}
          id="description"
          maxLength={1000}
          name="description"
          rows={5}
        />
      </div>
      <SubmitButton pendingText={pendingLabel}>{submitLabel}</SubmitButton>
    </form>
  );
}
