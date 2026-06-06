import type { Metadata, Viewport } from 'next';
import { Fraunces, Public_Sans, Onest } from 'next/font/google';
import { APP_NAME, APP_URL } from '@/lib/config';
import './globals.css';

const display = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

// Onest — geometric sans used for the aircenter-style scroll-crossfade sections
// (large, tight, uppercase). Exposed as --font-onest.
const onest = Onest({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-onest',
  display: 'swap',
});

const DESCRIPTION =
  'Stand with President Bola Ahmed Tinubu. The Tinubu Support Group is a nationwide grassroots movement advancing the Renewed Hope agenda — youth empowerment, economic growth and inclusive governance. Join Nigerians across all 36 states and the FCT in building a stronger nation.';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Renewed Hope. Stronger Nigeria.`,
    template: `%s | ${APP_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: APP_NAME,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'Tinubu Support Group',
    'TSG',
    'Bola Ahmed Tinubu',
    'President Tinubu',
    'Renewed Hope',
    'Renewed Hope Agenda',
    'Nigeria',
    'PBAT',
    'support group',
    'grassroots movement',
    'become a member',
    'Nigerian politics',
    'good governance',
  ],
  authors: [{ name: APP_NAME, url: APP_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,
  category: 'politics',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Renewed Hope. Stronger Nigeria.`,
    description: DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tinubu Support Group — Renewed Hope. Stronger Nigeria.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — Renewed Hope. Stronger Nigeria.`,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  manifest: '/manifest.webmanifest',
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  themeColor: '#0a4d2e',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${onest.variable}`}>
      <body suppressHydrationWarning>
        {/* Progressive enhancement: if JS is disabled the scroll-reveal
            observer never runs, so make revealed content visible by default. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
