import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("produces a hash different from the plaintext", async () => {
    const hash = await hashPassword("password123");
    expect(hash).not.toBe("password123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("password123");
    expect(await verifyPassword("password123", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("password123");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("produces distinct salts for the same input", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
  });
});
