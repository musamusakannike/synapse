import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const DEFAULT_FROM = 'SabiLearn <noreply@sabilearn.com>';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS || '',
          }
        : undefined,
    })
  : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || DEFAULT_FROM;

  // Prefer Resend when configured.
  if (resend) {
    try {
      const { error } = await resend.emails.send({ from, to, subject, html });
      if (!error) return;
      console.warn('Resend failed, falling back to SMTP:', error.message);
    } catch (err) {
      console.warn('Resend threw, falling back to SMTP:', err);
    }
  }

  // Fall back to SMTP.
  if (transporter) {
    await transporter.sendMail({ from, to, subject, html });
    return;
  }

  console.warn('No email provider configured. Email not sent to:', to);
}
