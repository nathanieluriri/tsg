import type { Metadata } from 'next';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = { title: 'Forgot password' };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-1">Forgot password</h1>
      <p className="text-sm text-gray-600 mb-6">Enter your email and we&apos;ll send you a one-time code.</p>
      <ForgotPasswordForm />
    </>
  );
}
