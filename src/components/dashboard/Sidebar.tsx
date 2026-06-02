'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, Crown, FileText, Bookmark, Calendar,
  HelpCircle, Image as ImageIcon, Sliders, Users2, Settings, FileEdit, MessageCircle,
  PlaySquare, BadgeDollarSign, Folder, LogOut,
} from 'lucide-react';
import type { Role } from '@/lib/config';
import { ADMIN_ROLES } from '@/lib/config';

interface Props { role: Role }

interface Item { href: string; label: string; icon: typeof Users; roles?: Role[] }

const ITEMS: Item[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/users', label: 'Admins', icon: Crown, roles: ADMIN_ROLES },
  { href: '/dashboard/members', label: 'Members', icon: Users, roles: ADMIN_ROLES },
  { href: '/dashboard/leaders', label: 'Leaders', icon: UserCheck, roles: ADMIN_ROLES },
  { href: '/dashboard/categories', label: 'Categories', icon: Folder, roles: ADMIN_ROLES },
  { href: '/dashboard/posts', label: 'Posts', icon: FileText, roles: ADMIN_ROLES },
  { href: '/dashboard/pages', label: 'Pages', icon: FileEdit, roles: ADMIN_ROLES },
  { href: '/dashboard/events', label: 'Events', icon: Calendar, roles: ADMIN_ROLES },
  { href: '/dashboard/faqs', label: 'FAQs', icon: HelpCircle, roles: ADMIN_ROLES },
  { href: '/dashboard/images', label: 'Images', icon: ImageIcon, roles: ADMIN_ROLES },
  { href: '/dashboard/sliders', label: 'Sliders', icon: Sliders, roles: ADMIN_ROLES },
  { href: '/dashboard/teams', label: 'Teams', icon: Users2 },
  { href: '/dashboard/media', label: 'Media', icon: Bookmark, roles: ADMIN_ROLES },
  { href: '/dashboard/live-stream', label: 'Live Stream', icon: PlaySquare, roles: ADMIN_ROLES },
  { href: '/dashboard/testimonials', label: 'Testimonials', icon: MessageCircle, roles: ADMIN_ROLES },
  { href: '/dashboard/transactions', label: 'Transactions', icon: BadgeDollarSign, roles: ADMIN_ROLES },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ADMIN_ROLES },
  { href: '/dashboard/my-profile', label: 'My Profile', icon: Users },
];

export default function Sidebar({ role }: Props) {
  const pathname = usePathname();
  const visible = ITEMS.filter((i) => !i.roles || i.roles.includes(role));

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  return (
    <aside className="bg-gray-900 text-gray-200 w-60 min-h-screen p-3 flex flex-col">
      <div className="px-2 mb-6">
        <Link href="/dashboard" className="text-lg font-bold text-white">TSG Admin</Link>
        <p className="text-xs text-gray-400 mt-1 capitalize">{role}</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {visible.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${active ? 'bg-[var(--tsg-green)] text-white' : 'hover:bg-gray-800'}`}>
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-gray-800 text-red-300 mt-2">
        <LogOut size={16} /> Logout
      </button>
    </aside>
  );
}
