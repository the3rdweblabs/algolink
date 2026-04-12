// src/lib/auth.ts
import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const JWT_SECRET_KEY = process.env.JWT_SECRET;
if (!JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const secretKey = new TextEncoder().encode(JWT_SECRET_KEY);

export const SESSION_COOKIE_NAME = 'algolink_session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

export interface SessionPayload {
  userId: string;
  email: string;
  displayName?: string | null; // User's display name
  avatarUrl?: string | null;   // URL to user's avatar image
  isVerified: boolean; // Indicates if the email was OTP verified
  expiresAt: Date;
}

export async function createSession(
  userId: string,
  email: string,
  isVerified: boolean,
  displayName?: string | null,
  avatarUrl?: string | null
) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000);
  const sessionPayload: Omit<SessionPayload, 'expiresAt'> = {
    userId,
    email,
    isVerified,
    displayName,
    avatarUrl
  };

  const token = await new SignJWT(sessionPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secretKey);

  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      displayName: payload.displayName as string | null | undefined,
      avatarUrl: payload.avatarUrl as string | null | undefined,
      isVerified: payload.isVerified as boolean,
      expiresAt: new Date((payload.exp as number) * 1000),
    };
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME);
  if (cookie && cookie.value) {
    const session = await verifySession(cookie.value);
    return session;
  }
  return null;
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

export async function getUserIdFromSession(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ?? null;
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    return verifySession(token);
  }
  return null;
}
