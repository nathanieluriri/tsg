'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/blog', label: 'Blog' },
  { href: '/pbat', label: 'PBAT' },
  { href: '/faq', label: 'FAQ' },
  { href: '/fg-ministries', label: 'FG Ministries' },
];

const REG = [
  { href: '/nationals', label: 'National' },
  { href: '/sub-nationals', label: 'Sub-National' },
  { href: '/region', label: 'Regions' },
  { href: '/register', label: 'Individual' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [regOpen, setRegOpen] = useState(false);

  return (
    <header className="bg-white shadow sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/img/tsg_logo.png"
            alt="Tinubu Support Group"
            width={528}
            height={472}
            priority
            className="h-12 w-auto"
          />
          <span className="font-bold text-[var(--tsg-green)] hidden sm:inline">Tinubu Support Group</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-[var(--tsg-green)]">{n.label}</Link>
          ))}
          <div className="relative">
            <button onClick={() => setRegOpen((o) => !o)} className="hover:text-[var(--tsg-green)]">Register ▾</button>
            {regOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded shadow py-2 min-w-[180px]">
                {REG.map((r) => (
                  <Link key={r.href} href={r.href} className="block px-4 py-2 hover:bg-gray-50" onClick={() => setRegOpen(false)}>
                    {r.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/login" className="bg-[var(--tsg-green)] text-white px-4 py-2 rounded hover:opacity-90">Sign in</Link>
        </nav>
        <button className="lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="lg:hidden border-t bg-white px-4 py-3 space-y-2 text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block py-1">{n.label}</Link>
          ))}
          <div className="border-t pt-2">
            <p className="font-semibold mb-1">Register</p>
            {REG.map((r) => (
              <Link key={r.href} href={r.href} onClick={() => setOpen(false)} className="block py-1 pl-3">{r.label}</Link>
            ))}
          </div>
          <Link href="/login" onClick={() => setOpen(false)} className="block bg-[var(--tsg-green)] text-white px-4 py-2 rounded text-center mt-2">Sign in</Link>
        </nav>
      )}
    </header>
  );
}
