import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(name: string, to: string): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({
      from: "RSVP <onboarding@resend.dev>",
      to,
      subject: "RSVP Received",
      text: `Hi ${name},\n\nThanks! Your RSVP has been received.\n\nBest,\nThe Team`,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
