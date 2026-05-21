import { describe, it, expect, vi } from "vitest";
import { submitRsvp, adminLogin, getRsvps } from "@/lib/actions";

vi.mock("@/lib/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models/rsvp", () => ({
  Rsvp: {
    create: vi.fn().mockResolvedValue({ name: "Alice", email: "alice@test.com" }),
    find: vi.fn().mockReturnValue({ sort: vi.fn().mockResolvedValue([{ name: "Alice", email: "alice@test.com", createdAt: new Date() }]) }),
  },
}));

vi.mock("@/lib/email", () => ({
  sendConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

const mockResolveMx = vi.hoisted(() => {
  return vi.fn<[string], Promise<{ exchange: string; priority: number }[]>>();
});

vi.mock("dns", () => ({
  promises: {
    resolveMx: mockResolveMx,
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
    get: vi.fn().mockReturnValue({ value: "true" }),
    delete: vi.fn(),
  }),
}));

describe("submitRsvp", () => {
  it("returns success for valid input", async () => {
    mockResolveMx.mockResolvedValue([{ exchange: "mail.test.com", priority: 10 }]);
    const result = await submitRsvp({ name: "Alice", email: "alice@test.com" });
    expect(result.success).toBe(true);
  });

  it("returns error for missing name", async () => {
    const result = await submitRsvp({ name: "", email: "alice@test.com" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("adminLogin", () => {
  it("returns true for correct password", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "secret");
    const result = await adminLogin("secret");
    expect(result).toBe(true);
    vi.unstubAllEnvs();
  });

  it("returns false for wrong password", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "secret");
    const result = await adminLogin("wrong");
    expect(result).toBe(false);
    vi.unstubAllEnvs();
  });
});
