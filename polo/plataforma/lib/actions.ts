"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "./auth";
import { registerSchema, loginSchema, ideaSchema } from "./validation";

type ActionState = { error?: string } | undefined;

// ---------- Auth ----------

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "Ya existe una cuenta con ese email" };

  const user = await db.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
  });
  await createSession(user.id);
  redirect("/panel");
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Credenciales incorrectas" };
  }
  await createSession(user.id);
  redirect("/panel");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

// ---------- Ideas ----------

export async function createIdea(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = ideaSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category") || undefined,
    budget: formData.get("budget") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.idea.create({ data: { ...parsed.data, authorId: user!.id } });
  revalidatePath("/ideas");
  redirect("/ideas");
}

// ---------- Claims (empresa picks up an idea) ----------

export async function claimIdea(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const ideaId = String(formData.get("ideaId"));
  const empresaId = String(formData.get("empresaId"));
  const message = (formData.get("message") as string) || null;

  // Authorization: the acting user must be a member of that empresa.
  const membership = await db.membership.findUnique({
    where: { userId_empresaId: { userId: user!.id, empresaId } },
  });
  if (!membership) return;

  await db.ideaClaim.upsert({
    where: { ideaId_empresaId: { ideaId, empresaId } },
    create: { ideaId, empresaId, actorId: user!.id, message },
    update: { message },
  });
  await db.idea.update({ where: { id: ideaId }, data: { status: "CLAIMED" } });

  revalidatePath(`/ideas/${ideaId}`);
  revalidatePath("/ideas");
}
