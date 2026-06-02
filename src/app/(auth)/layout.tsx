import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/assets/img/tsg-logo.png" alt="TSG" width={40} height={40} />
            <span className="font-semibold text-[var(--tsg-green)]">Tinubu Support Group</span>
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">← Back to site</Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6">{children}</div>
      </main>
    </div>
  );
}
