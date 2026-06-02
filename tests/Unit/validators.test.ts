import { describe, it, expect } from 'vitest';
import { loginSchema, otpSchema, contactSchema } from '../../src/lib/validators';

describe('loginSchema', () => {
  it('accepts valid email + password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });
  it('rejects bad email', () => {
    expect(loginSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false);
  });
});

describe('otpSchema', () => {
  it('requires 6 digits', () => {
    expect(otpSchema.safeParse({ otp: '123456' }).success).toBe(true);
    expect(otpSchema.safeParse({ otp: '12345' }).success).toBe(false);
    expect(otpSchema.safeParse({ otp: 'abcdef' }).success).toBe(false);
  });
});

describe('contactSchema', () => {
  it('rejects missing fields', () => {
    expect(contactSchema.safeParse({ name: 'a' }).success).toBe(false);
  });
});
