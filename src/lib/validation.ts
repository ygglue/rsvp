import dns, { promises as dnsPromises } from "dns";

// Configure reliable DNS servers to bypass potential Windows Node.js DNS lookup failures
if (!process.env.VITEST) {
  try {
    if (dns && typeof dns.setServers === "function") {
      dns.setServers(["8.8.8.8", "8.8.4.4"]);
    }
  } catch (e) {
    console.warn("Failed to set custom DNS servers in validation.ts:", e);
  }
}

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
    const mx = await dnsPromises.resolveMx(domain);
    if (!mx || mx.length === 0) {
      return { valid: false, error: "Domain does not accept email" };
    }
  } catch (error: any) {
    const errCode = error?.code;
    // Bypass MX lookup during local development or on network-level DNS server connection failures
    if (
      process.env.NODE_ENV === "development" || 
      errCode === "ECONNREFUSED" || 
      errCode === "ETIMEOUT" || 
      errCode === "EAI_AGAIN"
    ) {
      console.warn(`DNS MX lookup failed with '${errCode}'. Bypassing check for local testing.`);
      return { valid: true };
    }
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
