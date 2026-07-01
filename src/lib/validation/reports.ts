import { z } from "zod";
import { idSchema } from "@/lib/validation/common";

export const reportFilterSchema = z
  .object({
    projectId: idSchema.optional(),
    startDate: z.iso.date().optional(),
    endDate: z.iso.date().optional()
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
