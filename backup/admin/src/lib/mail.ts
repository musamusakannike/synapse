const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@sabilearn.online";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sabilearn.online";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[Mail] RESEND_API_KEY is not configured in Admin. Email will not be sent.");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Sabi Learn <${RESEND_FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Mail] Resend Admin error response: ${response.status} - ${errorText}`);
      return false;
    }

    const data = await response.json();
    console.log(`[Mail] Admin Email successfully sent to ${to}. Message ID: ${data.id || "unknown"}`);
    return true;
  } catch (error) {
    console.error(`[Mail] Failed to send Admin email to ${to}:`, error);
    return false;
  }
}

function getBaseTemplate(title: string, headline: string, contentHtml: string, ctaText?: string, ctaUrl?: string): string {
  const year = new Date().getFullYear();
  const ctaHtml = ctaText && ctaUrl 
    ? `<div class="cta-container">
         <a href="${ctaUrl}" class="cta-button" target="_blank">${ctaText}</a>
       </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      background-color: #0C0C0E;
      color: #F5F2ED;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      background-color: #0C0C0E;
      padding: 40px 20px;
      text-align: center;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #141416;
      border: 1px solid #2A2A30;
      border-radius: 16px;
      padding: 40px;
      text-align: left;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    }
    .logo-container {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 4px;
      color: #F5F2ED;
      text-decoration: none;
      text-transform: uppercase;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .logo span {
      color: #E8A838;
    }
    .divider {
      height: 1px;
      background-color: #2A2A30;
      margin: 25px 0;
    }
    .headline {
      font-size: 24px;
      font-weight: 700;
      color: #F5F2ED;
      margin-top: 0;
      margin-bottom: 15px;
      line-height: 1.3;
    }
    .body-text {
      font-size: 16px;
      line-height: 1.6;
      color: #A8A29E;
      margin-bottom: 25px;
    }
    .cta-container {
      text-align: center;
      margin: 35px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #E8A838;
      color: #0C0C0E !important;
      font-weight: 700;
      font-size: 16px;
      padding: 14px 30px;
      text-decoration: none;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(232, 168, 56, 0.2);
    }
    .highlight-card {
      background-color: #1C1C20;
      border: 1px solid #2A2A30;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .highlight-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #E8A838;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 12px;
      color: #6B6560;
      line-height: 1.5;
    }
    .footer a {
      color: #A8A29E;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo-container">
        <a href="${APP_URL}" class="logo">SABI<span>LEARN</span></a>
      </div>
      <div class="divider"></div>
      <h1 class="headline">${headline}</h1>
      <div class="body-text">
        ${contentHtml}
      </div>
      ${ctaHtml}
      <div class="divider"></div>
      <p class="body-text" style="font-size: 14px; margin-bottom: 0;">
        If you have any questions, reply directly to this email. We're always here to help!
      </p>
    </div>
    <div class="footer">
      &copy; ${year} Sabi Learn. All rights reserved.<br>
      Sabi the way your brain dey work.<br>
      <a href="${APP_URL}/dashboard/settings">Manage Email Preferences</a> | <a href="${APP_URL}">Visit Website</a>
    </div>
  </div>
</body>
</html>`;
}

export async function sendAdminUpgradeEmail(
  email: string,
  name: string,
  months: number,
  expiryDate: Date
): Promise<boolean> {
  const title = "Your account has been upgraded!";
  const headline = "Sabi Learn Premium access granted by Admin.";
  const formattedExpiry = expiryDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const contentHtml = `
    <p>Hi ${name},</p>
    <p>Great news! An administrator has upgraded your Sabi Learn account to <strong>Premium</strong>. Your subscription status is now fully active, granting you unlimited, unrestricted access to all our state-of-the-art AI-powered personalized learning features.</p>
    <div class="highlight-card">
      <div class="highlight-title">Premium Access Grant</div>
      <p style="margin: 5px 0; color: #F5F2ED;"><strong>Upgraded Plan:</strong> Premium Monthly</p>
      <p style="margin: 5px 0; color: #F5F2ED;"><strong>Duration Granted:</strong> ${months} Month${months > 1 ? "s" : ""}</p>
      <p style="margin: 5px 0; color: #F5F2ED;"><strong>Expires On:</strong> ${formattedExpiry}</p>
      <p style="margin: 5px 0; color: #F5F2ED;"><strong>Price:</strong> Free (Admin Granted)</p>
    </div>
    <p>Go ahead and generate unlimited courses, quizzes, custom videos, and interact with the AI tutor as much as you'd like!</p>
  `;

  const html = getBaseTemplate(title, headline, contentHtml, "Access Premium Dashboard", `${APP_URL}/dashboard`);
  return sendEmail({
    to: email,
    subject: "Your Sabi Learn subscription has been upgraded! 🚀",
    html,
  });
}
