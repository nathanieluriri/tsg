import type { Metadata } from 'next';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import MemberActions from './MemberActions';

export const metadata: Metadata = { title: 'Members' };

export default async function MembersPage() {
  await connectDB();
  const users = await User.find({ role: 'member' }).sort({ createdAt: -1 }).select('-password').lean();
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Members</h1>
      <div className="overflow-x-auto bg-white border rounded">
        <table className="w-full">
          <thead className="bg-gray-50"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={String(u._id)} className="border-t">
                <td className="p-3"><Link href={`/dashboard/member-profile/${u._id}`} className="text-blue-600 hover:underline">{u.name}</Link></td>
                <td className="p-3 text-sm">{u.email}</td>
                <td className="p-3 text-sm">{u.phone}</td>
                <td className="p-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${u.isBlocked ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {u.isBlocked ? 'Pending' : 'Approved'}
                  </span>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <MemberActions id={String(u._id)} blocked={!!u.isBlocked} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
