import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { requireRole } from '@/lib/auth';
import { ADMIN_ROLES } from '@/lib/config';
import UsersClient from './UsersClient';

export const metadata: Metadata = { title: 'Admins' };

export default async function UsersPage() {
  const session = await requireRole(...ADMIN_ROLES);
  await connectDB();
  const admins = await User.find({ role: { $in: ['admin', 'super admin'] } }).sort({ createdAt: -1 }).select('-password').lean();
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Administrators</h1>
      <UsersClient
        canAdd={session.role === 'super admin'}
        admins={admins.map((u) => ({
          _id: String(u._id), name: u.name, email: u.email, phone: u.phone, role: u.role, createdAt: String(u.createdAt),
        }))}
      />
    </>
  );
}
