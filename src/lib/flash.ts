import { cookies } from 'next/headers';

const KEY = 'tsg_flash';

export type FlashKind = 'success' | 'error' | 'info';
export interface Flash {
  kind: FlashKind;
  message: string;
}

export async function setFlash(flash: Flash): Promise<void> {
  const c = await cookies();
  c.set(KEY, JSON.stringify(flash), { path: '/', maxAge: 30, httpOnly: false, sameSite: 'lax' });
}

export async function consumeFlash(): Promise<Flash | null> {
  const c = await cookies();
  const raw = c.get(KEY)?.value;
  if (!raw) return null;
  c.delete(KEY);
  try {
    const parsed = JSON.parse(raw) as Flash;
    if (!parsed.kind || !parsed.message) return null;
    return parsed;
  } catch {
    return null;
  }
}
