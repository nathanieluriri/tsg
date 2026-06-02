import { Resend } from 'resend';
import type { ReactElement } from 'react';

let cachedResend: Resend | null = null;

function getResend(): Resend {
  if (cachedResend) return cachedResend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  cachedResend = new Resend(key);
  return cachedResend;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
}

export async function sendEmail({ to, subject, react, from }: SendEmailOptions) {
  const fromAddr = from || process.env.RESEND_FROM_EMAIL;
  if (!fromAddr) throw new Error('RESEND_FROM_EMAIL is not set');
  return getResend().emails.send({ to, subject, react, from: fromAddr });
}
