import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { sendEmail } from './email.util';
import User from '../models/user.model';

export interface EmailProps {
  name?: string;
}

export function getSwepAnnouncementEmailHtml({ name = 'Learner' }: EmailProps): string {
  const recipientName = name && name.trim() ? name.trim() : 'Learner';
  const swepUrl = 'https://sabilearn.online/swep';
  const homeUrl = 'https://sabilearn.online';
  const logoUrl = 'https://pub-25cf731b17e245559cf292c270f8e8a1.r2.dev/assets/sabilearn-logo.png';
  const mascotUrl = 'https://pub-25cf731b17e245559cf292c270f8e8a1.r2.dev/assets/mascot-unilorin.png';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>SWEP Practice is Now Available</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style type="text/css">
    body, table, td, p, a, span {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 16px 8px !important; }
      .email-card { width: 100% !important; border-radius: 16px !important; }
      .email-header { padding: 24px 20px 16px 20px !important; }
      .email-body { padding: 0 20px 28px 20px !important; }
      .mascot-container { padding: 16px !important; }
      .cta-btn-cell { width: 100% !important; }
      .cta-btn { display: block !important; width: 100% !important; text-align: center !important; padding: 15px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF9F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #35354A;">

  <!-- Hidden Preheader -->
  <div style="display: none; font-size: 1px; color: #FAF9F7; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    SWEP 2026 past questions and interactive practice are now available on SabiLearn.
    &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy;
  </div>

  <!-- Canvas -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-wrapper" style="background-color: #FAF9F7; margin: 0; padding: 32px 16px;">
    <tr>
      <td align="center">
        
        <!-- Card Container -->
        <table role="presentation" class="email-card" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; width: 100%; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E5E1D8; box-shadow: 0 4px 20px rgba(14, 14, 26, 0.04); overflow: hidden; margin: 0 auto;">
          
          <!-- Top Accent -->
          <tr>
            <td height="4" style="background-color: #F2A900; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td class="email-header" style="padding: 32px 32px 20px 32px; text-align: center;">
              <a href="${homeUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                  <tr>
                    <td style="vertical-align: middle;">
                      <img src="${logoUrl}" alt="SabiLearn" width="30" height="30" style="display: block; width: 30px; height: 30px; border-radius: 6px; margin-right: 8px;" />
                    </td>
                    <td style="vertical-align: middle;">
                      <span style="font-size: 20px; font-weight: 800; color: #0E0E1A; letter-spacing: -0.4px; line-height: 1;">
                        Sabi<span style="color: #F2A900;">Learn</span>
                      </span>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>

          <!-- Mascot Banner -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="mascot-container" align="center" style="background-color: #FFF9EE; border: 1px solid #F5E5C9; border-radius: 16px; padding: 20px 16px; text-align: center;">
                    
                    <div style="font-size: 11px; font-weight: 700; color: #B37400; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                      University of Ilorin &bull; SWEP 2026
                    </div>

                    <div style="margin: 0 auto; display: inline-block;">
                      <img src="${mascotUrl}" alt="Mascot" width="115" height="115" style="display: block; width: 115px; height: 115px; object-fit: contain; margin: 0 auto;" />
                    </div>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td class="email-body" style="padding: 0 32px 32px 32px;">
              
              <!-- Title -->
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0E0E1A; line-height: 1.3; letter-spacing: -0.4px; text-align: center;">
                SWEP Practice is Now Available
              </h1>

              <!-- Intro -->
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #35354A; text-align: center;">
                Hi ${recipientName}, SWEP 2026 past questions and interactive practice are now live on SabiLearn.
              </p>

              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #6B6B80; text-align: center;">
                Practice 180 questions across all 9 workshop units with instant answers, detailed explanations, and progress tracking.
              </p>

              <!-- Minimal Highlights List -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF9F7; border: 1px solid #EAE6DF; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 13.5px; color: #35354A; line-height: 1.5;">
                          <strong style="color: #0E0E1A;">180 Past Questions</strong> &mdash; All 9 workshop units included
                        </td>
                      </tr>
                      <tr>
                        <td height="1" style="background-color: #EAE6DF; font-size: 0; line-height: 0;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13.5px; color: #35354A; line-height: 1.5;">
                          <strong style="color: #0E0E1A;">Instant Feedback</strong> &mdash; Step-by-step explanations for each question
                        </td>
                      </tr>
                      <tr>
                        <td height="1" style="background-color: #EAE6DF; font-size: 0; line-height: 0;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13.5px; color: #35354A; line-height: 1.5;">
                          <strong style="color: #0E0E1A;">Flexible Practice</strong> &mdash; Filter by unit or take quick mock quizzes
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" class="cta-btn-cell" style="background-color: #F2A900; border-radius: 10px;">
                          <a href="${swepUrl}" target="_blank" class="cta-btn" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 700; color: #0E0E1A; text-decoration: none; border-radius: 10px;">
                            Start SWEP Practice &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <span style="font-size: 12px; color: #8C8C9E;">
                      Direct link: <a href="${swepUrl}" target="_blank" style="color: #D89400; text-decoration: underline;">sabilearn.online/swep</a>
                    </span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Divider -->
          <tr>
            <td height="1" style="background-color: #EAE6DF; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #FAF9F7; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #0E0E1A;">
                SabiLearn &mdash; Learn a skill. Sabi it for life.
              </p>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #8C8C9E;">
                <a href="${homeUrl}" target="_blank" style="color: #6B6B80; text-decoration: none;">sabilearn.online</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #B0AFC0;">
                &copy; 2026 SabiLearn. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Send test email to musamusakannike@gmail.com
 */
export async function sendTestEmail(): Promise<void> {
  const testEmail = 'musamusakannike@gmail.com';
  console.log(`Sending SWEP Announcement test email to ${testEmail}...`);

  const html = getSwepAnnouncementEmailHtml({ name: 'Musa' });
  const subject = 'SWEP Practice is Now Available on SabiLearn';

  await sendEmail({
    to: testEmail,
    subject,
    html,
  });

  console.log(`✅ Test email successfully dispatched to ${testEmail}!`);
}

/**
 * Broadcast to all users in database with emailNotifications enabled
 */
export async function broadcastToAllUsers(): Promise<void> {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in environment.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const users = await User.find({
    $or: [
      { 'settings.emailNotifications': true },
      { 'settings.emailNotifications': { $exists: false } },
    ],
  }).select('email name firstName');

  console.log(`Found ${users.length} eligible user(s) to notify.`);

  let sentCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      const displayName = user.firstName || user.name || 'Learner';
      const html = getSwepAnnouncementEmailHtml({ name: displayName });
      const subject = 'SWEP Practice is Now Available on SabiLearn';

      await sendEmail({
        to: user.email,
        subject,
        html,
      });

      sentCount++;
      console.log(`[${sentCount}/${users.length}] Sent to ${user.email}`);

      // Small throttle to avoid hitting Resend rate limits
      await new Promise((resolve) => setTimeout(resolve, 150));
    } catch (err) {
      errorCount++;
      console.error(`Failed to send to ${user.email}:`, err);
    }
  }

  console.log(`🎉 Broadcast complete! Sent: ${sentCount}, Failed: ${errorCount}`);
  await mongoose.disconnect();
}

// CLI runner
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--broadcast')) {
    broadcastToAllUsers().catch((err) => {
      console.error('Broadcast failed:', err);
      process.exit(1);
    });
  } else {
    sendTestEmail().catch((err) => {
      console.error('Test email failed:', err);
      process.exit(1);
    });
  }
}
