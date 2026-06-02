import type { Metadata } from 'next';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Post } from '@/models/Post';
import { Profile } from '@/models/Profile';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardHome() {
  await connectDB();
  const [totalMembers, totalPosts, leaders, nexco, snexco, regexco] = await Promise.all([
    User.countDocuments({}),
    Post.countDocuments({}),
    User.countDocuments({ role: 'leader' }),
    Profile.countDocuments({ position: 'National Exco' }),
    Profile.countDocuments({ position: 'Sub-National Exco' }),
    Profile.countDocuments({ position: 'Regional Exco' }),
  ]);

  const stats = [
    { label: 'Total members', value: totalMembers, href: '/dashboard/members' },
    { label: 'Leaders', value: leaders, href: '/dashboard/leaders' },
    { label: 'National Exco', value: nexco },
    { label: 'Sub-National Exco', value: snexco },
    { label: 'Regional Exco', value: regexco },
    { label: 'Posts', value: totalPosts, href: '/dashboard/posts' },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} {...s} />
        ))}
      </div>
    </>
  );
}

function Card({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <div className="bg-white border rounded p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
