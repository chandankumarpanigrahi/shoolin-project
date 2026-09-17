import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '465'),
  secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) !== 'false',
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

/**
 * Send email notification
 */
export async function sendEmail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || `"Shoolin OS" <${process.env.SMTP_USER}>`;
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    console.log(`✉️ Email dispatched to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send OTP Verification Email
 */
export async function sendOtpEmail(to, otp) {
  const subject = `Your Shoolin OS Verification Code: ${otp}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #4f46e5; margin-bottom: 8px;">Shoolin Innovations Limited</h2>
      <p style="color: #475569; font-size: 14px;">Enterprise Operations Platform</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
      <p style="color: #1e293b; font-size: 15px;">Use the verification code below to complete your authentication:</p>
      <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 12px;">This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to, subject, text: `Your Shoolin OS verification code is: ${otp}`, html });
}
