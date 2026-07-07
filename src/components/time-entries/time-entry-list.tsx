import Link from "next/link";
import { DeleteTimeEntryForm } from "@/components/time-entries/delete-time-entry-form";
import { formatDuration } from "@/lib/time-entries/duration";
import { formatEcts } from "@/lib/calculations/ects";
import type {
  PersonalTimeEntry,
  ProjectTimeEntry
} from "@/lib/time-entries/queries";

type TimeEntryListProps = {
  entries: Array<PersonalTimeEntry | ProjectTimeEntry>;
  emptyText: string;
  next: string;
  showProject?: boolean;
  showUser?: boolean;
  currentUserId?: string;
};

export function TimeEntryList({
  entries,
  emptyText,
  next,
  showProject,
  showUser,
  currentUserId
}: TimeEntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel)] p-6 text-[var(--muted)]">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-sm">
      <ul className="divide-y divide-[var(--border)]">
        {entries.map((entry) => {
          const canEdit = !currentUserId || entry.user_id === currentUserId;
          const userLabel =
            "user_display_name" in entry
              ? entry.user_display_name || entry.user_email
              : null;

          return (
            <li
              className="grid gap-4 p-5 lg:grid-cols-[1.2fr_1fr_auto]"
              key={entry.entry_id}
            >
              <div>
                <p className="font-semibold">
                  {formatEntryDate(entry.entry_date)}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  {entry.description || "Ei kuvausta."}
                </p>
                {showProject ? (
                  <p className="mt-2 text-sm font-medium text-[var(--accent)]">
                    {entry.project_name}
                    {entry.project_status === "archived" ? " (arkistoitu)" : ""}
                  </p>
                ) : null}
                {showUser && userLabel ? (
                  <p className="mt-2 text-sm text-[var(--muted)]">Kirjaaja: {userLabel}</p>
                ) : null}
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-semibold">Kesto</dt>
                  <dd className="mt-1 text-[var(--muted)]">
                    {formatDuration(entry.duration_minutes)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Opintopisteet</dt>
                  <dd className="mt-1 text-[var(--muted)]">
                    {formatEcts(entry.duration_minutes)}
                  </dd>
                </div>
              </dl>
              {canEdit ? (
                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)]"
                    href={`/time-entries/${entry.entry_id}/edit`}
                  >
                    Muokkaa
                  </Link>
                  <DeleteTimeEntryForm entryId={entry.entry_id} next={next} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function formatEntryDate(dateString: string) {
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
}
