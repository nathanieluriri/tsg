import { z } from 'zod';
import { NIGERIAN_STATES, REGIONS } from '@/lib/config';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
  remember: z.preprocess((v) => v === 'on' || v === true, z.boolean()).optional(),
});

export const registerMemberObject = z.object({
  reg_type: z.literal('member'),
  organization: z.string().min(1),
  name: z.string().min(3).max(50),
  state: z.enum(NIGERIAN_STATES),
  zone: z.enum(REGIONS),
  lga: z.string().min(1),
  ward: z.string().min(1),
  tel: z.string().min(7),
  location: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  voter_card: z.string().min(19).max(21),
});
export const registerMemberSchema = registerMemberObject;

export const registerLeaderObject = z.object({
  reg_type: z.literal('leader'),
  orgName: z.string().min(1),
  orgHeadquarter: z.string().min(1),
  orgAddress: z.string().min(1),
  name: z.string().min(3).max(50),
  position: z.string().min(1),
  zone: z.enum(REGIONS).optional(),
  state: z.enum(NIGERIAN_STATES).optional(),
  lga: z.string().min(1),
  ward: z.string().min(1),
  tel: z.string().min(7),
  location: z.string().min(1),
  email: z.string().email(),
  voter_card: z.string().min(19).max(21),
  password: z.string().min(8),
  password_confirmation: z.string().min(8),
});
export const registerLeaderSchema = registerLeaderObject.refine((d) => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

export const registerIndividualObject = z.object({
  reg_type: z.literal('individual'),
  state: z.string().min(1),
  name: z.string().min(3).max(50),
  lga: z.string().min(1),
  ward: z.string().min(1),
  tel: z.string().min(7),
  location: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  voter_card: z.string().min(19).max(21),
  password: z.string().min(8),
  password_confirmation: z.string().min(8),
});
export const registerIndividualSchema = registerIndividualObject.refine((d) => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export const newPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  password_confirmation: z.string().min(8),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

export const addAdminSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  phone: z.string().min(7),
  role: z.enum(['admin', 'super admin']),
});
