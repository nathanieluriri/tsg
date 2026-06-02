import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import crypto from 'crypto';
import { defineModel } from './_helpers';

const otpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    tokenHash: { type: String, required: true },
    purpose: { type: String, enum: ['password-reset', 'verify-account'], default: 'password-reset' },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OtpTokenDoc = InferSchemaType<typeof otpSchema> & { _id: mongoose.Types.ObjectId };
export const OtpToken = defineModel<OtpTokenDoc>('OtpToken', otpSchema);

export function hashOtp(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
