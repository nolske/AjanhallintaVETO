import { z } from "zod";
import { idSchema } from "./common.ts";

const optionalDateSchema = z
  .string()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .pipe(z.iso.date().optional());

const optionalProjectIdSchema = z
  .string()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .pipe(idSchema.optional());

export const reportFilterSchema = z
  .object({
    projectId: optionalProjectIdSchema,
    startDate: optionalDateSchema,
    endDate: optionalDateSchema,
    projectStatus: z.enum(["all", "active", "archived"]).default("all")
  })
  .refine(
    (value) =>
      !value.startDate ||
      !value.endDate ||
      value.startDate <= value.endDate,
    {
      message: "Start date must be before or equal to end date.",
      path: ["startDate"]
    }
  );

export type ReportFilters = z.infer<typeof reportFilterSchema>;
