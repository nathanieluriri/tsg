import type { Metadata } from 'next';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Team } from '@/models/Team';
import TeamDeleteButton from './TeamDeleteButton';

export const metadata: Metadata = { title: 'Teams' };

export default async function TeamsPage() {
  await connectDB();
  const teams = await Team.find().sort({ order: 1, createdAt: -1 }).lean();
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team members</h1>
        <Link href="/dashboard/teams/new" className="bg-[var(--tsg-green)] text-white px-4 py-2 rounded">New member</Link>
      </div>
      <table className="w-full border bg-white">
        <thead className="bg-gray-50"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Role</th><th className="text-left p-3">Order</th><th></th></tr></thead>
        <tbody>
          {teams.map((t) => (
            <tr key={String(t._id)} className="border-t">
              <td className="p-3 font-medium">{t.name}</td>
              <td className="p-3 text-sm">{t.role}</td>
              <td className="p-3 text-sm">{t.order}</td>
              <td className="p-3 text-right whitespace-nowrap">
                <Link href={`/dashboard/teams/${t._id}/edit`} className="text-blue-600 mr-3">Edit</Link>
                <TeamDeleteButton id={String(t._id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
