import type { ReactNode } from 'react';
import { connectDB } from '@/lib/db';
import { Setting } from '@/models/Setting';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import SmoothScroll from '@/components/public/scroll/SmoothScroll';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  await connectDB();
  const setting = await Setting.getOrCreate();
  if (setting.maintenanceMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold">Under Maintenance</h1>
        <p className="mt-2 text-gray-600">We&apos;ll be back shortly.</p>
      </div>
    );
  }
  return (
    <SmoothScroll>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer setting={setting.toObject()} />
      </div>
    </SmoothScroll>
  );
}
