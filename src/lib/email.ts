// src/lib/email.ts
import 'server-only';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';


interface VerificationCodeEntry {
  code: string;
  email: string;
  expiresAt: number; // timestamp
}

// In-memory store for verification codes (replace with DB for production)
const verificationCodesStore = new Map<string, VerificationCodeEntry>();
const CODE_EXPIRY_DURATION_MS = 10 * 60 * 1000; // 10 minutes

function getTransporter() {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
    console.warn('SMTP configuration is missing. Email sending is mocked.');
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

export function storeVerificationCode(email: string, code: string): void {
  const expiresAt = Date.now() + CODE_EXPIRY_DURATION_MS;
  verificationCodesStore.set(email.toLowerCase(), { code, email, expiresAt });
  // Clean up expired codes periodically (optional, for long-running servers)
  // This is a simple cleanup, a more robust one would run on a timer
  for (const [key, entry] of verificationCodesStore.entries()) {
    if (Date.now() > entry.expiresAt) {
      verificationCodesStore.delete(key);
    }
  }
}

export function getValidVerificationCode(email: string): VerificationCodeEntry | null {
  const entry = verificationCodesStore.get(email.toLowerCase());
  if (entry && Date.now() < entry.expiresAt) {
    return entry;
  }
  if (entry && Date.now() >= entry.expiresAt) {
    verificationCodesStore.delete(email.toLowerCase()); // Clean up expired
  }
  return null;
}

export function consumeVerificationCode(email: string): void {
  verificationCodesStore.delete(email.toLowerCase());
}

export async function sendVerificationEmail(to: string, code: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`SIMULATED OTP EMAIL to ${to}: Your Algolink verification code is ${code}`);
    return { success: true, messageId: 'simulated-otp-email' };
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: 'Your Algolink Email Verification Code',
    text: `Your Algolink verification code is: ${code}\nThis code will expire in 10 minutes.`,
    html: `<p>Your Algolink verification code is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}

export async function sendLoginNotificationEmail(to: string, userName?: string | null): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const transporter = getTransporter();
  const name = userName || to.split('@')[0]; // Fallback to email prefix if displayName not set
  const secureAccountLink = `${NEXT_PUBLIC_APP_URL}/settings`; // For now, links to general settings

  if (!transporter) {
    console.log(`SIMULATED LOGIN NOTIFICATION EMAIL to ${to}: Welcome back, ${name}!`);
    return { success: true, messageId: 'simulated-login-notification-email' };
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: 'Welcome Back to Algolink!',
    text: `Hi ${name},\n\nThanks for logging in to Algolink! We're glad to have you here.\n\nIf you didn’t log in or notice anything unusual, please secure your account using this link: ${secureAccountLink}\n\nEnjoy your session, and let us know if you need anything.\n\nBest,\nThe Algolink Team`,
    html: `<p>Hi ${name},</p>
           <p>Thanks for logging in to Algolink! We're glad to have you here.</p>
           <p>If you didn’t log in or notice anything unusual, please <a href="${secureAccountLink}">secure your account</a>.</p>
           <p>Enjoy your session, and let us know if you need anything.</p>
           <p>Best,<br>The Algolink Team</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Login notification email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending login notification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}
export async function sendProfileUpdateEmail(to: string, userName: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const transporter = getTransporter();
  const secureAccountLink = `${NEXT_PUBLIC_APP_URL}/dashboard`;

  if (!transporter) {
    console.log(`SIMULATED PROFILE UPDATE EMAIL to ${to}: Your profile has been updated, ${userName}!`);
    return { success: true, messageId: 'simulated-profile-update-email' };
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: 'Your Algolink Profile was Updated',
    text: `Hi ${userName},\n\nYour Algolink profile (username or avatar) was recently updated.\n\nIf you did not make this change, please secure your account immediately: ${secureAccountLink}\n\nBest,\nThe Algolink Team`,
    html: `<p>Hi <strong>${userName}</strong>,</p>
           <p>Your Algolink profile (username or avatar) was recently updated.</p>
           <p>If you did not make this change, please <a href="${secureAccountLink}">secure your account immediately</a>.</p>
           <p>Best,<br>The Algolink Team</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Profile update email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending profile update email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}
