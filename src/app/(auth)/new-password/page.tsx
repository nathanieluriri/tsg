import type { Metadata } from 'next';
import NewPasswordForm from './NewPasswordForm';

export const metadata: Metadata = { title: 'Set new password' };

export default function NewPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-1">Set new password</h1>
      <p className="text-sm text-gray-600 mb-6">Choose a new password (minimum 8 characters).</p>
      <NewPasswordForm />
    </>
  );
}
