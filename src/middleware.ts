import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { hkdf } from '@panva/hkdf';

const SESSION_COOKIE = 'tsg_session';

const PROTECTED = ['/dashboard'];
const GUEST_ONLY = ['/login', '/register', '/forgot-password', '/secure-otp', '/new-password'];

let cachedKey: Uint8Array | null = null;
async function getKey(): Promise<Uint8Array | null> {
  if (cachedKey) return cachedKey;
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  cachedKey = await hkdf('sha256', uri, '', 'tsg-jwt-v1', 32);
  return cachedKey;
}

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const key = await getKey();
  if (!key) return false;
  try {
    await jwtVerify(token, key, { issuer: 'tsg' });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await isAuthed(req);

  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (GUEST_ONLY.some((p) => pathname === p)) {
    if (authed) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/forgot-password', '/secure-otp', '/new-password'],
};
