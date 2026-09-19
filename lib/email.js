import nodemailer from 'nodemailer';

const getEnv = (key, fallback = '') => process.env[key] || fallback;

let transporterInstance = null;

export const getTransporter = () => {
  if (transporterInstance) return transporterInstance;

  const host = getEnv('SMTP_HOST') || getEnv('EMAIL_HOST') || 'smtp.gmail.com';
  const port = parseInt(getEnv('SMTP_PORT') || getEnv('EMAIL_PORT') || '465', 10);
  const secure = (getEnv('SMTP_SECURE') || getEnv('EMAIL_SECURE') || 'true') === 'true';
  const user = getEnv('SMTP_USER') || getEnv('EMAIL_USER') || 'uxdesigner@shoolin.co.uk';
  const pass = getEnv('SMTP_PASS') || getEnv('EMAIL_PASS') || 'nwhihwuknwueeioj';

  transporterInstance = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return transporterInstance;
};

const getFromAddress = () => {
  return (
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    '"Shoolin OS" <uxdesigner@shoolin.co.uk>'
  );
};

/**
 * Common HTML wrapper with Shoolin OS enterprise styling
 */
const renderEmailTemplate = ({ title, preheader, bodyHtml }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; }
    .wrapper { width: 100%; background-color: #0b1120; padding: 40px 16px; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); }
    .header { background: linear-gradient(135deg, #047857 0%, #065f46 100%); padding: 28px 32px; text-align: center; }
    .logo-text { color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin: 0; }
    .logo-sub { color: #a7f3d0; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 4px; }
    .content { padding: 36px 32px; }
    .h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
    .p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }
    .otp-box { background: #f0fdf4; border: 2px dashed #059669; border-radius: 10px; padding: 20px; text-align: center; margin: 28px 0; }
    .otp-code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 0.35em; color: #065f46; margin: 0; padding-left: 0.35em; }
    .otp-caption { font-size: 12px; color: #047857; margin-top: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
    .notice { background: #f8fafc; border-left: 4px solid #cbd5e1; padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 24px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; }
    .footer a { color: #059669; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
      ${preheader}
    </div>
    <div class="container">
      <div class="header">
        <h1 class="logo-text">Shoolin OS</h1>
        <div class="logo-sub">Enterprise Project Operations System</div>
      </div>
      <div class="content">
        ${bodyHtml}
      </div>
      <div class="footer">
        <p style="margin:0 0 6px 0;">&copy; ${new Date().getFullYear()} Shoolin Innovations Limited. All rights reserved.</p>
        <p style="margin:0;">This is an automated operational security dispatch from Shoolin OS. Do not reply to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * Dispatch 6-digit Login OTP
 */
export const sendLoginOtpEmail = async ({ to, name = 'Team Member', otp, minutes = 15 }) => {
  const transporter = getTransporter();
  const subject = `Your Shoolin OS Login Passcode: ${otp}`;
  const preheader = `Your one-time login code is ${otp}. Valid for ${minutes} minutes.`;

  const bodyHtml = `
    <span class="badge">Identity Verification</span>
    <h2 class="h1">Hello, ${name}</h2>
    <p class="p">You requested a secure One-Time Passcode (OTP) to sign in to your <strong>Shoolin OS</strong> workstation session.</p>
    
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-caption">Valid for ${minutes} Minutes</div>
    </div>

    <p class="p">Enter this 6-digit verification code in the login screen to authenticate your 30-day active workstation session.</p>

    <div class="notice">
      <strong>Security Notice:</strong> Never share this code with anyone. Shoolin IT and Super Administrators will never ask for your authentication passcode. If you did not initiate this login request, please report it immediately to your administrator.
    </div>
  `;

  const html = renderEmailTemplate({ title: subject, preheader, bodyHtml });
  const text = `Hello ${name},\n\nYour Shoolin OS login passcode is: ${otp}\n\nValid for ${minutes} minutes. Do not share this code with anyone.\n\nShoolin Innovations Limited`;

  const info = await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  });

  return info;
};

/**
 * Dispatch Password Reset OTP
 */
export const sendPasswordResetEmail = async ({ to, name = 'Team Member', otp, minutes = 15 }) => {
  const transporter = getTransporter();
  const subject = `Password Reset Request for Shoolin OS: ${otp}`;
  const preheader = `Your password reset code is ${otp}. Valid for ${minutes} minutes.`;

  const bodyHtml = `
    <span class="badge" style="background:#fee2e2;color:#991b1b;">Password Reset</span>
    <h2 class="h1">Password Reset Verification</h2>
    <p class="p">Hello <strong>${name}</strong>,</p>
    <p class="p">We received a request to reset the password for your account associated with <strong>${to}</strong>.</p>
    
    <div class="otp-box" style="background:#fef2f2;border-color:#ef4444;">
      <div class="otp-code" style="color:#b91c1c;">${otp}</div>
      <div class="otp-caption" style="color:#dc2626;">Expires in ${minutes} Minutes</div>
    </div>

    <p class="p">Enter this 6-digit OTP along with your new password on the <strong>Forgot Password</strong> screen to complete your security update.</p>

    <div class="notice">
      <strong>Didn't request this change?</strong> You can safely ignore this email. Your existing credentials remain fully protected until this code is submitted.
    </div>
  `;

  const html = renderEmailTemplate({ title: subject, preheader, bodyHtml });
  const text = `Hello ${name},\n\nYour Shoolin OS password reset code is: ${otp}\n\nExpires in ${minutes} minutes.\n\nShoolin Innovations Limited`;

  const info = await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  });

  return info;
};

/**
 * Dispatch Welcome / Account Created Invitation
 */
export const sendNewUserWelcomeEmail = async ({ to, name, role = 'Member', appUrl = 'http://localhost:3001' }) => {
  const transporter = getTransporter();
  const subject = `Welcome to Shoolin OS — Account Created`;
  const preheader = `Your enterprise account has been created with role ${role}.`;

  const bodyHtml = `
    <span class="badge" style="background:#ecfdf5;color:#065f46;">Account Activated</span>
    <h2 class="h1">Welcome aboard, ${name}!</h2>
    <p class="p">Your Shoolin OS workspace account has been created by your administrator with the <strong>${role}</strong> role.</p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0 0 8px 0;font-size:13px;"><strong>Login Email:</strong> ${to}</p>
      <p style="margin:0 0 8px 0;font-size:13px;"><strong>Assigned Role:</strong> ${role}</p>
      <p style="margin:0;font-size:13px;"><strong>Workstation URL:</strong> <a href="${appUrl}" style="color:#059669;">${appUrl}</a></p>
    </div>

    <p class="p"><strong>How to Sign In for the First Time:</strong></p>
    <ol style="font-size:13px;color:#475569;line-height:1.8;padding-left:20px;margin:0 0 24px 0;">
      <li>Navigate to the login screen at <a href="${appUrl}" style="color:#059669;">${appUrl}</a></li>
      <li>Click the <strong>"Email OTP"</strong> tab, enter your email (<strong>${to}</strong>), and receive an instant 6-digit login passcode, OR</li>
      <li>Click <strong>"Forgot password?"</strong> to set your permanent custom password.</li>
    </ol>

    <div class="notice">
      Once signed in, your session remains securely authenticated for 30 days. You will have access to your assigned projects, tasks, sprints, and meeting governance.
    </div>
  `;

  const html = renderEmailTemplate({ title: subject, preheader, bodyHtml });
  const text = `Welcome ${name}!\n\nYour Shoolin OS account has been created with role: ${role}.\n\nLogin Email: ${to}\nWorkstation URL: ${appUrl}\n\nYou can log in directly using Email OTP or set your password via Forgot Password.`;

  const info = await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  });

  return info;
};
