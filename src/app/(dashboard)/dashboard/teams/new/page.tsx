import type { Metadata } from 'next';
import TeamForm from '../TeamForm';

export const metadata: Metadata = { title: 'New team member' };

export default function NewTeamPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">New team member</h1>
      <TeamForm />
    </>
  );
}
