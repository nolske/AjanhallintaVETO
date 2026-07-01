import { z } from "zod";

export const projectNameSchema = z.string().trim().min(1).max(120);
