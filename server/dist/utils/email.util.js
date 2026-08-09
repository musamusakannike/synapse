"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const resend_1 = require("resend");
const DEFAULT_FROM = 'SabiLearn <noreply@sabilearn.online>';
const resend = process.env.RESEND_API_KEY
    ? new resend_1.Resend(process.env.RESEND_API_KEY)
    : null;
const transporter = process.env.SMTP_HOST
    ? nodemailer_1.default.createTransport({
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
async function sendEmail({ to, subject, html, }) {
    const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || DEFAULT_FROM;
    // Prefer Resend when configured.
    if (resend) {
        try {
            const { error } = await resend.emails.send({ from, to, subject, html });
            if (!error)
                return;
            console.warn('Resend failed, falling back to SMTP:', error.message);
        }
        catch (err) {
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
