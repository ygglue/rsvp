import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(
  name: string,
  to: string,
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
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Georgia,serif;color:#334155;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
          <tr>
            <td style="text-align:center;padding-top:20px;">
              <img src="https://yourdomain.com/images/flower-1.webp" alt="" width="160" style="display:block;margin:0 auto;">
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 40px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:28px;font-style:italic;font-weight:normal;color:#1e293b;">Thank You</h1>
              <p style="margin:0 0 24px;font-size:12px;color:#64748b;letter-spacing:0.15em;text-transform:uppercase;">RSVP Confirmed</p>
              <div style="width:48px;height:1px;background-color:#cbd5e1;margin:0 auto 24px;"></div>
              <p style="margin:0 0 8px;font-size:16px;color:#1e293b;">Hi ${name},</p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#475569;">
                Your RSVP has been received. We're looking forward to seeing you.
              </p>
              <div style="background-color:#f1f5f9;border-radius:8px;padding:12px;color:#334155;font-size:14px;font-weight:500;">
                &#10003; RSVP Confirmed
              </div>
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
