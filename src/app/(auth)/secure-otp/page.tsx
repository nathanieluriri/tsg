import type { Metadata } from 'next';
import OtpForm from './OtpForm';

export const metadata: Metadata = { title: 'Verify OTP' };

export default function SecureOtpPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-1">Enter OTP</h1>
      <p className="text-sm text-gray-600 mb-6">Enter the 6-digit code sent to your email.</p>
      <OtpForm />
    </>
  );
}
