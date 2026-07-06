import bcrypt from "bcryptjs";

// Pure password helpers — no server-only deps, so unit-testable in isolation.

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
