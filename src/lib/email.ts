import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(
  name: string,
  to: string,
  baseUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {

    const firstName = name.split(" ")[0];
    await resend.emails.send({
      from: "Anne <anne@gabri.elle>",
      to,
      subject: "RSVP Received",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0A1E3F;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#102F5C;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.3);border:1px solid #1A447A;">
          <tr>
            <td style="background-image:radial-gradient(circle at 30% 20%,rgba(42,90,150,0.12),transparent 60%),radial-gradient(circle at 70% 80%,rgba(26,68,122,0.08),transparent 50%);padding:36px 28px 40px;text-align:center;">

              <h1 style="margin:0 0 8px;font-size:32px;font-style:italic;font-weight:normal;color:#FFD700;">Thank You</h1>
              <p style="margin:0 0 24px;font-size:11px;color:#8CB4E8;letter-spacing:0.15em;text-transform:uppercase;font-family:Arial,sans-serif;">We received your RSVP</p>
              <div style="width:48px;height:1px;background-color:#1A447A;margin:0 auto 28px;"></div>
              <p style="margin:0 0 18px;font-size:16px;color:#FFD700;text-align:left;">Dear ${firstName},</p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.9;color:#B0C8E8;text-align:left;">
                As I celebrate this special milestone, I find myself reflecting on the people who have made a difference in my life. Your presence, support, and encouragement have meant so much to me, and I am truly grateful for the role you have played in my journey.
              </p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.9;color:#B0C8E8;text-align:left;">
                Because of that, it would be an honor to have you join me for this unforgettable occasion. Sharing this moment with you would make the celebration even more meaningful, and I sincerely hope you can be there to celebrate this special day with me.
              </p>
              <p style="margin:0 0 32px;font-size:14px;line-height:1.9;color:#B0C8E8;text-align:left;">
                I look forward to celebrating with you.
              </p>
              <p style="margin:0 0 4px;font-size:13px;font-style:italic;color:#8CB4E8;text-align:left;">With love,</p>
              <p style="margin:0 0 2px;font-size:15px;letter-spacing:0.08em;color:#FFD700;text-align:left;">Anne Gabrielle Bacuel</p>
              <p style="margin:0 0 32px;font-size:11px;color:#8CB4E8;letter-spacing:0.15em;text-transform:uppercase;font-family:Arial,sans-serif;text-align:left;">Debutante</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A1E3F;border-radius:12px;border:1px solid #1A447A;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:18px;font-style:italic;color:#FFD700;">Anne's 18th Birthday</p>
                    <p style="margin:0;font-size:13px;color:#B0C8E8;line-height:1.8;">
                      July 6, 2026 &middot; 6:00 PM<br>
                      Villa El Dantess
                    </p>
                  </td>
                </tr>
              </table>
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
