
// src/app/actions/authActions.ts
'use server';

import { z } from 'zod';
import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { createSession, clearSession, getSession, type SessionPayload } from '@/lib/auth';
import { 
  sendVerificationEmail as sendOtpEmail, 
  storeVerificationCode as storeOtpCode, 
  getValidVerificationCode as getValidOtp, 
  consumeVerificationCode as consumeOtp, 
  generateVerificationCode as generateOtp,
  sendLoginNotificationEmail
} from '@/lib/email';
import { addNotification } from './notificationActions';

const RequestOtpFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

const VerifyOtpFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  otp: z.string().length(6, { message: 'OTP must be 6 digits.' }),
});

interface RequestOtpState {
  message?: string | null;
  errors?: {
    email?: string[];
  };
  success?: boolean;
  email?: string;
}

export async function requestOtp(prevState: RequestOtpState, formData: FormData): Promise<RequestOtpState> {
  const validatedFields = RequestOtpFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid email.',
    };
  }
  const { email } = validatedFields.data;
  const normalizedEmail = email.toLowerCase();

  try {
    const otp = generateOtp();
    storeOtpCode(normalizedEmail, otp);
    const emailResult = await sendOtpEmail(normalizedEmail, otp);

    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      return { message: 'Failed to send OTP. Please try again.', email: normalizedEmail };
    }
    
    return { success: true, message: 'OTP sent to your email.', email: normalizedEmail };

  } catch (error: any) {
    console.error('Request OTP error:', error);
    return { message: error.message || 'An unexpected error occurred.', email: normalizedEmail };
  }
}

interface VerifyOtpState {
  message?: string | null;
  errors?: {
    email?: string[];
    otp?: string[];
  };
  success?: boolean;
}

export async function verifyOtpAndLogin(prevState: VerifyOtpState, formData: FormData): Promise<VerifyOtpState> {
  console.log("Server verifyOtpAndLogin: Received formData entries:");
  for (const [key, value] of formData.entries()) {
    console.log(`Server FormData: ${key} = ${String(value)}`);
  }

  const validatedFields = VerifyOtpFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    console.error("Server verifyOtpAndLogin: Zod validation failed", validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid data submitted for OTP verification.',
    };
  }
  
  const { email, otp } = validatedFields.data;
  const normalizedEmail = email.toLowerCase();
  console.log("Server verifyOtpAndLogin: Parsed email and OTP:", normalizedEmail, otp);

  const storedOtpEntry = getValidOtp(normalizedEmail);
  console.log("Server verifyOtpAndLogin: Stored OTP entry for", normalizedEmail, ":", storedOtpEntry);

  if (!storedOtpEntry || storedOtpEntry.code !== otp) {
    console.warn("Server verifyOtpAndLogin: OTP Mismatch or Not Found/Expired.", {
      inputEmail: normalizedEmail,
      inputOtp: otp,
      storedCode: storedOtpEntry?.code,
      isExpired: storedOtpEntry ? Date.now() >= storedOtpEntry.expiresAt : 'N/A (No entry found)',
      entryExists: !!storedOtpEntry,
    });
    return { message: 'Invalid or expired OTP. Please try again or request a new one.' };
  }

  try {
    consumeOtp(normalizedEmail); // Consume OTP after successful validation

    let user = db.prepare('SELECT id, email, display_name, avatar_url, is_verified FROM users WHERE email = ?').get(normalizedEmail) as { 
      id: string; 
      email: string; 
      display_name: string | null;
      avatar_url: string | null;
      is_verified: number; 
    } | undefined;

    if (!user) {
      // User does not exist, create new user
      const userId = randomUUID();
      const initialDisplayName = normalizedEmail.split('@')[0];
      const insertUserStmt = db.prepare(
        'INSERT INTO users (id, email, display_name, is_verified, email_verified_at) VALUES (?, ?, ?, TRUE, CURRENT_TIMESTAMP)'
      );
      insertUserStmt.run(userId, normalizedEmail, initialDisplayName);
      user = { 
        id: userId, 
        email: normalizedEmail, 
        display_name: initialDisplayName, 
        avatar_url: null, 
        is_verified: 1 
      };
      
      // Add welcome notification for new user
      await addNotification(
        userId, 
        'success', 
        'Welcome to AlgoLink!', 
        'Your account has been successfully created. Link your first wallet to get started.'
      );
      
      console.log("Server verifyOtpAndLogin: New user created:", user.id);
    } else {
      // User exists. Ensure their display_name is set if null, and mark as verified if not already.
      const currentDisplayName = user.display_name || normalizedEmail.split('@')[0];
      if (!user.is_verified || user.display_name !== currentDisplayName) {
        db.prepare('UPDATE users SET is_verified = TRUE, email_verified_at = CURRENT_TIMESTAMP, display_name = ? WHERE id = ?')
          .run(currentDisplayName, user.id);
        user.is_verified = 1;
        user.display_name = currentDisplayName;
        console.log("Server verifyOtpAndLogin: Existing user updated:", user.id);
      } else {
        console.log("Server verifyOtpAndLogin: Existing user found, no update needed:", user.id);
      }
      
      // Add login notification for existing user
      await addNotification(
        user.id, 
        'info', 
        'Login Successful', 
        `Welcome back! You successfully logged in as ${user.email}.`
      );
    }
    
    await createSession(user.id, user.email, !!user.is_verified, user.display_name, user.avatar_url);
    console.log("Server verifyOtpAndLogin: Session created for user:", user.id);
    
    // Send login notification email
    await sendLoginNotificationEmail(user.email, user.display_name);
    
  } catch (error: any) {
    console.error('Server verifyOtpAndLogin: Error during login/signup or session creation:', error);
    return { message: error.message || 'An unexpected error occurred during login/signup.' };
  }
  redirect('/dashboard');
}


export async function logoutUser() {
  await clearSession();
  redirect('/auth/authenticate'); 
}

export async function resendOtp(email: string): Promise<{ success: boolean; message: string }> {
  if (!email || !z.string().email().safeParse(email).success) {
    return { success: false, message: "Invalid email address provided." };
  }
  const normalizedEmail = email.toLowerCase();

  const otp = generateOtp();
  storeOtpCode(normalizedEmail, otp);
  const emailResult = await sendOtpEmail(normalizedEmail, otp);

  if (emailResult.success) {
    return { success: true, message: "A new OTP has been sent to your email." };
  } else {
    console.error('Failed to resend OTP email:', emailResult.error);
    return { success: false, message: "Failed to send OTP. Please try again later." };
  }
}

export async function getCurrentUser(): Promise<(Omit<SessionPayload, 'expiresAt' | 'isVerified'> & { isVerified: boolean; displayName: string | null; avatarUrl: string | null; }) | null> {
  const session = await getSession();
  if (!session) return null;
  
  const userStmt = db.prepare('SELECT id, email, display_name, avatar_url, is_verified FROM users WHERE id = ?');
  const user = userStmt.get(session.userId) as { 
    id: string; 
    email: string; 
    display_name: string | null;
    avatar_url: string | null;
    is_verified: number; 
  } | undefined;
  
  if (!user) {
    // This case might mean the session refers to a user deleted from DB, or a session/DB mismatch.
    // Clearing the session might be a good idea here to force re-auth.
    console.warn(`User ID ${session.userId} from session not found in database. Clearing session.`);
    await clearSession();
    return null;
  }

  return { 
    userId: user.id, 
    email: user.email, 
    displayName: user.display_name, 
    avatarUrl: user.avatar_url,
    isVerified: !!user.is_verified 
  };
}
