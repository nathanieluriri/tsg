import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';
import MemberActions from '../../members/MemberActions';

export const metadata: Metadata = { title: 'Profile' };

interface Props { params: Promise<{ id: string }> }

export default async function ViewProfilePage({ params }: Props) {
  const { id } = await params;
  await connectDB();
  const user = await User.findById(id).select('-password').lean();
  if (!user) return notFound();
  const profile = await Profile.findOne({ user: id }).lean();

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">{user.name}</h1>
      <div className="bg-white border rounded p-6 max-w-2xl space-y-2 text-sm">
        <Row label="Email" value={user.email} />
        <Row label="Phone" value={user.phone} />
        <Row label="Role" value={user.role} />
        <Row label="Status" value={user.isBlocked ? 'Pending' : 'Approved'} />
        {profile?.organization && <Row label="Organization" value={profile.organization} />}
        {profile?.headquarter && <Row label="Headquarter" value={profile.headquarter} />}
        {profile?.orgAddress && <Row label="Org address" value={profile.orgAddress} />}
        {profile?.position && <Row label="Position" value={profile.position} />}
        {profile?.state && <Row label="State" value={profile.state} />}
        {profile?.lga && <Row label="LGA" value={profile.lga} />}
        {profile?.ward && <Row label="Ward" value={profile.ward} />}
        {profile?.zone && <Row label="Zone" value={profile.zone} />}
        {profile?.address && <Row label="Address" value={profile.address} />}
        {profile?.vid && <Row label="Voter ID" value={profile.vid} />}
      </div>
      <div className="mt-4">
        <MemberActions id={String(user._id)} blocked={!!user.isBlocked} />
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1 border-b last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="col-span-2">{value || '—'}</span>
    </div>
  );
}
