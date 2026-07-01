import { z } from "zod";

export const idSchema = z.string().uuid();

export const positiveIntegerMinutesSchema = z
  .number()
  .int()
  .positive()
  .max(24 * 60);
