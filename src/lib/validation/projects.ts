import { z } from "zod";
import { emailSchema } from "./auth.ts";
import { idSchema } from "./common.ts";

export const projectNameSchema = z
  .string()
  .trim()
  .min(2, "Projektin nimen on oltava vähintään 2 merkkiä.")
  .max(100, "Projektin nimi on liian pitkä.");

export const projectDescriptionSchema = z
  .string()
  .trim()
  .max(1000, "Kuvaus on liian pitkä.")
  .transform((value) => (value.length > 0 ? value : null));

export const projectFormSchema = z.object({
  name: projectNameSchema,
  description: projectDescriptionSchema
});

export const projectIdSchema = z.object({
  projectId: idSchema
});

export const addProjectMemberSchema = z.object({
  projectId: idSchema,
  email: emailSchema
});

export const removeProjectMemberSchema = z.object({
  projectId: idSchema,
  userId: idSchema
});
