import { describe, it, expect, vi } from "vitest";
import { validateEmail, validateName } from "@/lib/validation";

const mockResolveMx = vi.hoisted(() => {
  return vi.fn<[string], Promise<{ exchange: string; priority: number }[]>>();
});

vi.mock("dns", () => ({
  promises: {
    resolveMx: mockResolveMx,
  },
}));

describe("validateEmail", () => {
  it("returns valid for a correct email with common domain", async () => {
    mockResolveMx.mockResolvedValue([
      { exchange: "gmail-smtp-in.l.google.com", priority: 10 },
    ]);
    const result = await validateEmail("test@gmail.com");
    expect(result.valid).toBe(true);
  });

  it("returns invalid for missing @", async () => {
    const result = await validateEmail("notanemail");
    expect(result.valid).toBe(false);
  });

  it("returns invalid for empty string", async () => {
    const result = await validateEmail("");
    expect(result.valid).toBe(false);
  });

  it("returns invalid for missing domain", async () => {
    const result = await validateEmail("user@");
    expect(result.valid).toBe(false);
  });

  it("returns invalid for missing local part", async () => {
    const result = await validateEmail("@domain.com");
    expect(result.valid).toBe(false);
  });

  it("returns invalid for domain with no MX records", async () => {
    mockResolveMx.mockRejectedValue(new Error("ENOTFOUND"));
    const result = await validateEmail("test@nonexistent-domain-xyzabc.com");
    expect(result.valid).toBe(false);
  });
});

describe("validateName", () => {
  it("returns valid for a non-empty name", () => {
    const result = validateName("Alice");
    expect(result.valid).toBe(true);
  });

  it("returns invalid for empty name", () => {
    const result = validateName("");
    expect(result.valid).toBe(false);
  });
});
