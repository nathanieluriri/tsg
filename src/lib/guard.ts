import { getSession } from '@/lib/auth';
import { fail } from '@/lib/api';
import { ADMIN_ROLES, type Role } from '@/lib/config';
import type { NextResponse } from 'next/server';

export async function requireApiAuth(): Promise<{ userId: string; role: Role } | NextResponse> {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);
  return session;
}

export async function requireApiRole(...roles: Role[]): Promise<{ userId: string; role: Role } | NextResponse> {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);
  if (!roles.includes(session.role)) return fail('Forbidden', 403);
  return session;
}

export async function requireAdminApi(): Promise<{ userId: string; role: Role } | NextResponse> {
  return requireApiRole(...ADMIN_ROLES);
}
