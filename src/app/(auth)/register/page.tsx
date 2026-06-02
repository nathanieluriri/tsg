import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = { title: 'Register' };

export default async function RegisterPage() {
  await connectDB();
  const orgsRaw = (await Profile.distinct('organization')) as (string | null)[];
  const orgs = orgsRaw.filter((o): o is string => Boolean(o));

  return (
    <>
      <h1 className="text-2xl font-bold mb-1">Member registration</h1>
      <p className="text-sm text-gray-600 mb-6">Sign up as a member of an existing organization.</p>
      <RegisterForm orgs={orgs} />
    </>
  );
}
