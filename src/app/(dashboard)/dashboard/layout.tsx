import type { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth';
import Sidebar from '@/components/dashboard/Sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAuth();
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={session.role} />
      <div className="flex-1 overflow-x-auto">
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500 capitalize">{session.role}</span>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
