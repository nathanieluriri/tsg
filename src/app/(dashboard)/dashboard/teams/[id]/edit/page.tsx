import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Team } from '@/models/Team';
import TeamForm from '../../TeamForm';

export const metadata: Metadata = { title: 'Edit team member' };

interface Props { params: Promise<{ id: string }> }

export default async function EditTeamPage({ params }: Props) {
  const { id } = await params;
  await connectDB();
  const team = await Team.findById(id).lean();
  if (!team) return notFound();
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Edit team member</h1>
      <TeamForm teamId={id} initial={{
        name: team.name,
        role: team.role || '',
        bio: team.bio || '',
        photo: team.photo ? String(team.photo) : '',
        order: team.order || 0,
      }} />
    </>
  );
}
