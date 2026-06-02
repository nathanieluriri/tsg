import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';
import './globals.css';

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: 'Tinubu Support Group official website',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
