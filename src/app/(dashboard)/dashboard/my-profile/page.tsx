import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';
import { requireAuth } from '@/lib/auth';
import MyProfileForm from './MyProfileForm';

export const metadata: Metadata = { title: 'My profile' };

export default async function MyProfilePage() {
  const session = await requireAuth();
  await connectDB();
  const user = await User.findById(session.userId).select('-password').lean();
  const profile = await Profile.findOne({ user: session.userId }).lean();
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">My profile</h1>
      <MyProfileForm
        initial={{
          name: user?.name || '',
          phone: user?.phone || '',
          state: profile?.state || '',
          lga: profile?.lga || '',
          ward: profile?.ward || '',
          voter_card: profile?.vid || '',
        }}
        readonly={{ email: user?.email || '', role: user?.role || '' }}
      />
    </>
  );
}
