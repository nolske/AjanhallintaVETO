import { z } from "zod";
import {
  hoursAndMinutesToTotalMinutes,
  isFutureDate,
  isValidDuration
} from "../time-entries/duration.ts";
import { idSchema } from "./common.ts";

const integerFieldSchema = z.coerce
  .number()
  .int("Anna kokonaisluku.")
  .min(0, "Arvo ei voi olla negatiivinen.");

export const timeEntryDescriptionSchema = z
  .string()
  .trim()
  .max(500, "Kuvaus on liian pitka.")
  .transform((value) => (value.length > 0 ? value : null));

export const timeEntryFormSchema = z
  .object({
    projectId: idSchema,
    entryDate: z
      .iso.date("Anna kelvollinen paivamaara.")
      .refine((value) => !isFutureDate(value), {
        message: "Tulevaisuuden paivamaaria ei sallita."
      }),
    hours: integerFieldSchema.max(24, "Tunnit voivat olla enintaan 24."),
    minutes: integerFieldSchema.max(59, "Minuutit voivat olla 0-59."),
    description: timeEntryDescriptionSchema
  })
  .transform((value) => ({
    projectId: value.projectId,
    entryDate: value.entryDate,
    durationMinutes: hoursAndMinutesToTotalMinutes(value.hours, value.minutes),
    description: value.description
  }))
  .refine((value) => isValidDuration(value.durationMinutes), {
    message: "Keston on oltava 1-1440 minuuttia.",
    path: ["minutes"]
  });

export const timeEntryIdSchema = z.object({
  entryId: idSchema
});
