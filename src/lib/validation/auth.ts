import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Anna kelvollinen sahkopostiosoite.")
  .max(320, "Sahkopostiosoite on liian pitka.");

export const passwordSchema = z
  .string()
  .min(8, "Salasanan on oltava vahintaan 8 merkkia.")
  .max(128, "Salasana on liian pitka.");

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Nimen on oltava vahintaan 2 merkkia.")
  .max(100, "Nimi on liian pitka.");

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
    message: "Salasanat eivat tasmaa.",
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
    message: "Salasanat eivat tasmaa.",
    path: ["confirmPassword"]
  });

export const updateProfileSchema = z.object({
  displayName: displayNameSchema
});
