import { promises as dns } from "dns";

export async function validateEmail(email: string): Promise<{ valid: boolean; error?: string }> {
  if (!email || !email.trim()) {
    return { valid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  const domain = email.split("@")[1];
  try {
    const mx = await dns.resolveMx(domain);
    if (!mx || mx.length === 0) {
      return { valid: false, error: "Domain does not accept email" };
    }
  } catch {
    return { valid: false, error: "Domain does not accept email" };
  }

  return { valid: true };
}

export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { valid: false, error: "Name is required" };
  }
  return { valid: true };
}
