"use client";

import { deleteTimeEntryAction } from "@/lib/time-entries/actions";
import { SubmitButton } from "@/components/forms/submit-button";

type DeleteTimeEntryFormProps = {
  entryId: string;
  next: string;
};

export function DeleteTimeEntryForm({ entryId, next }: DeleteTimeEntryFormProps) {
  return (
    <form
      action={deleteTimeEntryAction}
      onSubmit={(event) => {
        if (!window.confirm("Haluatko varmasti poistaa tuntikirjauksen?")) {
          event.preventDefault();
        }
      }}
    >
      <input name="entryId" type="hidden" value={entryId} />
      <input name="next" type="hidden" value={next} />
      <SubmitButton pendingText="Poistetaan...">Poista</SubmitButton>
    </form>
  );
}
