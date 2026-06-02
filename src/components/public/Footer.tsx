import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import type { SettingDoc } from '@/models/Setting';
import SubscribeForm from './SubscribeForm';

interface Props { setting: Partial<SettingDoc> }

export default function Footer({ setting }: Props) {
  const socials = [
    { href: setting.fbLink, label: 'Facebook', Icon: Facebook },
    { href: setting.twLink, label: 'X (Twitter)', Icon: Twitter },
    { href: setting.igLink, label: 'Instagram', Icon: Instagram },
    { href: setting.ytLink, label: 'YouTube', Icon: Youtube },
  ].filter((s): s is { href: string; label: string; Icon: typeof Facebook } =>
    typeof s.href === 'string' && s.href.length > 0,
  );

  return (
    <footer className="bg-gray-900 text-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold mb-3 text-white">{setting.title || 'Tinubu Support Group'}</h3>
          <p className="text-sm">{setting.address || '2 Kainji Cres, Maitama, Abuja'}</p>
          {setting.email && <p className="text-sm mt-2">{setting.email}</p>}
          {setting.phone && <p className="text-sm">{setting.phone}</p>}
          {socials.length > 0 && (
            <div className="mt-4 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[var(--tsg-gold)] hover:text-gray-900"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-white">Useful Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link href="/pbat" className="hover:text-white">PBAT</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-white">Register</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/register" className="hover:text-white">Individual</Link></li>
            <li><Link href="/nationals" className="hover:text-white">National</Link></li>
            <li><Link href="/sub-nationals" className="hover:text-white">Sub-National</Link></li>
            <li><Link href="/region" className="hover:text-white">Regions</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-white">Newsletter</h4>
          <SubscribeForm />
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between text-xs text-gray-400">
          <span>© {new Date().getFullYear()} {setting.title || 'Tinubu Support Group'}</span>
          <span>All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
