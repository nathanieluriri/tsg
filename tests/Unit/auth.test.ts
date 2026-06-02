import { describe, it, expect, beforeAll } from 'vitest';

describe('JWT session round-trip (HKDF-derived key)', () => {
  beforeAll(() => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/tsgweb-test-key';
  });

  it('signs a session and verifies it back', async () => {
    const { signSession, verifySession } = await import('../../src/lib/auth');
    const token = await signSession({ userId: '64b7f8e8c2a4f8a4d8c2a4f8', role: 'admin' });
    expect(token).toMatch(/^eyJ/);
    const payload = await verifySession(token);
    expect(payload).toMatchObject({ userId: '64b7f8e8c2a4f8a4d8c2a4f8', role: 'admin' });
  });

  it('returns null for tampered tokens', async () => {
    const { signSession, verifySession } = await import('../../src/lib/auth');
    const token = await signSession({ userId: '64b7f8e8c2a4f8a4d8c2a4f8', role: 'admin' });
    const tampered = token.slice(0, -3) + 'xxx';
    expect(await verifySession(tampered)).toBeNull();
  });
});
