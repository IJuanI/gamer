import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  ideaSchema,
  slugify,
} from "@/lib/validation";

describe("slugify", () => {
  it("lowercases and dashes spaces", () => {
    expect(slugify("Data Litoral")).toBe("data-litoral");
  });
  it("strips accents", () => {
    expect(slugify("Río IoT")).toBe("rio-iot");
  });
  it("collapses non-alphanumerics and trims dashes", () => {
    expect(slugify("  DevRía!! 2024  ")).toBe("devria-2024");
  });
  it("handles empty-ish input", () => {
    expect(slugify("---")).toBe("");
  });
});

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const r = registerSchema.safeParse({
      name: "Ana",
      email: "ana@polo.test",
      password: "secret1",
    });
    expect(r.success).toBe(true);
  });
  it("rejects short name", () => {
    const r = registerSchema.safeParse({
      name: "A",
      email: "ana@polo.test",
      password: "secret1",
    });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toMatch(/Nombre/);
  });
  it("rejects bad email", () => {
    const r = registerSchema.safeParse({
      name: "Ana",
      email: "nope",
      password: "secret1",
    });
    expect(r.success).toBe(false);
  });
  it("rejects short password", () => {
    const r = registerSchema.safeParse({
      name: "Ana",
      email: "ana@polo.test",
      password: "123",
    });
    expect(r.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a non-empty password", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "" }).success
    ).toBe(false);
  });
});

describe("ideaSchema", () => {
  it("accepts a valid idea with optional fields omitted", () => {
    const r = ideaSchema.safeParse({
      title: "App de turnos",
      description: "Necesitamos una app para reservar canchas.",
    });
    expect(r.success).toBe(true);
  });
  it("rejects a too-short description", () => {
    const r = ideaSchema.safeParse({ title: "Hola mundo", description: "corto" });
    expect(r.success).toBe(false);
  });
});
