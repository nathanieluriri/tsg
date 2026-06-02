import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Login' };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-1">Sign in</h1>
      <p className="text-sm text-gray-600 mb-6">Welcome back. Sign in to access your dashboard.</p>
      <Suspense fallback={<div className="text-sm text-gray-500">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </>
  );
}
