import { splitMinutes } from "@/lib/time-entries/duration";
import { SubmitButton } from "@/components/forms/submit-button";
import type { TimeEntryProject } from "@/lib/time-entries/queries";

type TimeEntryFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  projects: TimeEntryProject[];
  submitLabel: string;
  pendingLabel: string;
  next: string;
  entryId?: string;
  defaultProjectId?: string;
  defaultEntryDate?: string;
  defaultDurationMinutes?: number;
  defaultDescription?: string | null;
};

export function TimeEntryForm({
  action,
  projects,
  submitLabel,
  pendingLabel,
  next,
  entryId,
  defaultProjectId,
  defaultEntryDate,
  defaultDurationMinutes = 60,
  defaultDescription = ""
}: TimeEntryFormProps) {
  const { hours, minutes } = splitMinutes(defaultDurationMinutes);
  const activeProjects = projects.filter((project) => project.status === "active");
  const selectedProjectIsArchived = projects.some(
    (project) => project.project_id === defaultProjectId && project.status === "archived"
  );
  const selectableProjects = selectedProjectIsArchived
    ? projects.filter((project) => project.project_id === defaultProjectId)
    : activeProjects;

  return (
    <form action={action} className="flex flex-col gap-5">
      {entryId ? <input name="entryId" type="hidden" value={entryId} /> : null}
      <input name="next" type="hidden" value={next} />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold" htmlFor="projectId">
          Projekti
        </label>
        <select
          className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
          defaultValue={defaultProjectId}
          disabled={selectableProjects.length === 0}
          id="projectId"
          name="projectId"
          required
        >
          <option value="">Valitse projekti</option>
          {selectableProjects.map((project) => (
            <option key={project.project_id} value={project.project_id}>
              {project.name}
              {project.status === "archived" ? " (arkistoitu)" : ""}
            </option>
          ))}
        </select>
        {selectedProjectIsArchived ? (
          <p className="text-sm text-[var(--muted)]">
            Arkistoidun projektin olemassa olevaa kirjausta voi muokata, mutta
            uusia kirjauksia ei voi lisätä arkistoituun projektiin.
          </p>
        ) : null}
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" htmlFor="entryDate">
            Päivämäärä
          </label>
          <input
            className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
            defaultValue={defaultEntryDate}
            id="entryDate"
            name="entryDate"
            required
            type="date"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" htmlFor="hours">
            Tunnit
          </label>
          <input
            className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
            defaultValue={hours}
            id="hours"
            max={24}
            min={0}
            name="hours"
            required
            type="number"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" htmlFor="minutes">
            Minuutit
          </label>
          <input
            className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2"
            defaultValue={minutes}
            id="minutes"
            max={59}
            min={0}
            name="minutes"
            required
            type="number"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold" htmlFor="description">
          Kuvaus
        </label>
        <textarea
          className="min-h-28 rounded-md border border-[var(--border)] bg-white px-3 py-2"
          defaultValue={defaultDescription ?? ""}
          id="description"
          maxLength={500}
          name="description"
          rows={4}
        />
      </div>
      <SubmitButton pendingText={pendingLabel}>{submitLabel}</SubmitButton>
    </form>
  );
}
