import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

export async function sendConfirmationEmail(
  name: string,
  to: string,
  baseUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const firstName = name.split(" ")[0];
    const user = process.env.SMTP_USER || "";

    await transporter.sendMail({
      from: `"Anne" <${user}>`,
      to,
      subject: "RSVP Received",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0A1E3F;font-family:Georgia,'Times New Roman',serif;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#0A1E3F;">
    Your RSVP for Anne&rsquo;s 18th Birthday is confirmed. We can&rsquo;t wait to celebrate with you on July 6, 2026.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:100%;max-width:480px;background-color:#102F5C;border:1px solid #1A447A;">
          <!-- Header -->
          <tr>
            <td style="padding:36px 28px 24px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:28px;font-style:italic;font-weight:normal;color:#FFD700;font-family:Georgia,'Times New Roman',serif;">Thank You</h1>
              <p style="margin:0;font-size:11px;color:#8CB4E8;letter-spacing:0.15em;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;">We received your RSVP</p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 28px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#1A447A;font-size:1px;line-height:1px;height:1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Letter Body -->
          <tr>
            <td style="padding:0 28px 8px;">
              <p style="margin:0 0 18px;font-size:16px;color:#D4AF37;font-family:Georgia,'Times New Roman',serif;text-align:left;">Dear ${firstName},</p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.9;color:#B0C8E8;font-family:Georgia,'Times New Roman',serif;text-align:left;">
                As I celebrate this special milestone, I find myself reflecting on the people who have made a difference in my life. Your presence, support, and encouragement have meant so much to me, and I am truly grateful for the role you have played in my journey.
              </p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.9;color:#B0C8E8;font-family:Georgia,'Times New Roman',serif;text-align:left;">
                Because of that, it would be an honor to have you join me for this unforgettable occasion. Sharing this moment with you would make the celebration even more meaningful, and I sincerely hope you can be there to celebrate this special day with me.
              </p>
              <p style="margin:0 0 32px;font-size:14px;line-height:1.9;color:#B0C8E8;font-family:Georgia,'Times New Roman',serif;text-align:left;">
                I look forward to celebrating with you.
              </p>
              <p style="margin:0 0 4px;font-size:13px;font-style:italic;color:#8CB4E8;font-family:Georgia,'Times New Roman',serif;text-align:left;">With love,</p>
              <p style="margin:0 0 2px;font-size:15px;letter-spacing:0.08em;color:#FFD700;font-family:Georgia,'Times New Roman',serif;text-align:left;">Anne Gabrielle Bacuel</p>
              <p style="margin:0 0 28px;font-size:11px;color:#8CB4E8;letter-spacing:0.15em;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;text-align:left;">Debutante</p>
            </td>
          </tr>
          <!-- Gold Divider -->
          <tr>
            <td style="padding:0 28px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#FFD700;font-size:1px;line-height:1px;height:1px;opacity:0.4;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Event Details Box -->
          <tr>
            <td style="padding:0 28px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A1E3F;border:1px solid #1A447A;">
                <tr>
                  <td style="padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:18px;font-style:italic;color:#FFD700;font-family:Georgia,'Times New Roman',serif;">Anne&rsquo;s 18th Birthday</p>
                    <p style="margin:0;font-size:13px;color:#B0C8E8;font-family:Georgia,'Times New Roman',serif;line-height:1.8;">
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
