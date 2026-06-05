import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(
  name: string,
  to: string,
  baseUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {

    await resend.emails.send({
      from: "Anne <anne@18th>",
      to,
      subject: "RSVP Received",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0A1E3F;font-family:Georgia,serif;color:#E8F0FF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#102F5C;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.3);border:1px solid #1A447A;">
          <tr>
            <td style="text-align:center;padding-top:24px;">
              <img src="${baseUrl}/images/flower%201.webp" alt="" width="120" style="display:block;margin:0 auto;filter:hue-rotate(200deg) brightness(0.5) saturate(0.7);">
            </td>
          </tr>
          <tr>
            <td style="text-align:center;padding-top:8px;">
              <h1 style="margin:0;font-size:14px;color:#8CB4E8;letter-spacing:0.15em;text-transform:uppercase;font-family:Arial,sans-serif;">Anne's 18th Birthday</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 40px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:28px;font-style:italic;font-weight:normal;color:#FFD700;">Thank You</h1>
              <p style="margin:0 0 24px;font-size:12px;color:#8CB4E8;letter-spacing:0.15em;text-transform:uppercase;">RSVP Confirmed</p>
              <div style="width:48px;height:1px;background-color:#1A447A;margin:0 auto 24px;"></div>
              <p style="margin:0 0 8px;font-size:16px;color:#E8F0FF;">Hi ${name},</p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#B0C8E8;">
                Your RSVP has been received. We're looking forward to celebrating with you on July 6, 2026. 
                Villa El Dantess, 6:00 PM.
              </p>
              <div style="background-color:#1A447A;border-radius:8px;padding:12px;color:#FFD700;font-size:14px;font-weight:500;">
                &#10003; RSVP Confirmed
              </div>
              <p style="margin-top:24px;font-size:12px;color:#5A7AAC;">
                Anne's 18th Birthday · July 6, 2026 · 6:00 PM
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
