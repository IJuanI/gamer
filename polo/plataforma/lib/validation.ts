import { z } from "zod";

// Pure validation schemas + helpers. No server-only imports so these can be
// unit-tested directly and reused across server actions and the client.

export const registerSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export const ideaSchema = z.object({
  title: z.string().min(4, "Título demasiado corto"),
  description: z.string().min(10, "Contanos un poco más sobre tu idea"),
  category: z.string().optional(),
  budget: z.string().optional(),
});

/** Build a URL-safe slug from an empresa name. */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
