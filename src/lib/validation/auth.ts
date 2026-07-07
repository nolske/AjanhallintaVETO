import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Anna kelvollinen sähköpostiosoite.")
  .max(320, "Sähköpostiosoite on liian pitkä.");

export const passwordSchema = z
  .string()
  .min(8, "Salasanan on oltava vähintään 8 merkkiä.")
  .max(128, "Salasana on liian pitkä.");

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Nimen on oltava vähintään 2 merkkiä.")
  .max(100, "Nimi on liian pitkä.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Anna salasana."),
  next: z.string().optional()
});

export const registerSchema = z
  .object({
    displayName: displayNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Salasanat eivät täsmää.",
    path: ["confirmPassword"]
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Salasanat eivät täsmää.",
    path: ["confirmPassword"]
  });

export const updateProfileSchema = z.object({
  displayName: displayNameSchema
});
