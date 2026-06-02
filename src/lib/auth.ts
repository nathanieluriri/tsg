import { hkdf } from '@panva/hkdf';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_TTL_SECONDS, type Role } from './config';

const SESSION_COOKIE = 'tsg_session';
let cachedKey: Uint8Array | null = null;

async function getSigningKey(): Promise<Uint8Array> {
  if (cachedKey) return cachedKey;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required to derive auth signing key');
  cachedKey = await hkdf('sha256', uri, '', 'tsg-jwt-v1', 32);
  return cachedKey;
}

export interface SessionPayload {
  userId: string;
  role: Role;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const key = await getSigningKey();
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuer('tsg')
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const key = await getSigningKey();
    const { payload } = await jwtVerify(token, key, { issuer: 'tsg' });
    if (!payload.sub || typeof payload.role !== 'string') return null;
    return { userId: payload.sub, role: payload.role as Role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireRole(...roles: Role[]): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!roles.includes(session.role)) redirect('/dashboard');
  return session;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
