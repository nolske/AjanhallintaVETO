import { z } from "zod";
import { idSchema, positiveIntegerMinutesSchema } from "@/lib/validation/common";

export const timeEntryDraftSchema = z.object({
  projectId: idSchema,
  entryDate: z.iso.date(),
  minutes: positiveIntegerMinutesSchema,
  description: z.string().trim().max(1000).optional()
});
