import type { Metadata } from 'next';
import VerifyForm from './VerifyForm';

export const metadata: Metadata = { title: 'Verify account' };

interface Props {
  params: Promise<{ email: string; password: string }>;
}

export default async function VerifyAccountPage({ params }: Props) {
  const { email, password } = await params;
  return (
    <>
      <h1 className="text-2xl font-bold mb-1">Verify account</h1>
      <p className="text-sm text-gray-600 mb-6">Confirm to complete account verification.</p>
      <VerifyForm email={decodeURIComponent(email)} password={decodeURIComponent(password)} />
    </>
  );
}
