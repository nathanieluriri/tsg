import type { Metadata } from 'next';
import Image from 'next/image';
import { connectDB } from '@/lib/db';
import { Setting } from '@/models/Setting';

export const metadata: Metadata = { title: 'About' };

export default async function AboutPage() {
  await connectDB();
  const setting = await Setting.getOrCreate();
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">About Us</h1>
      <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
        <Image src="/assets/img/tinubu2.jpg" alt="President Tinubu" width={600} height={400} className="rounded shadow" />
        <div>
          <p className="text-gray-700 mb-3">
            The Tinubu Support Group (TSG) is a grassroots movement of Nigerians committed to supporting the
            transformative agenda of His Excellency President Bola Ahmed Tinubu.
          </p>
          {setting.description && <p className="text-gray-700">{setting.description}</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {setting.mission && (
          <div className="border rounded p-6">
            <h3 className="font-bold text-lg mb-2 text-[var(--tsg-green)]">Mission</h3>
            <p className="text-sm text-gray-700">{setting.mission}</p>
          </div>
        )}
        {setting.vision && (
          <div className="border rounded p-6">
            <h3 className="font-bold text-lg mb-2 text-[var(--tsg-green)]">Vision</h3>
            <p className="text-sm text-gray-700">{setting.vision}</p>
          </div>
        )}
        {setting.coreValues && (
          <div className="border rounded p-6">
            <h3 className="font-bold text-lg mb-2 text-[var(--tsg-green)]">Core Values</h3>
            <p className="text-sm text-gray-700">{setting.coreValues}</p>
          </div>
        )}
      </div>
    </div>
  );
}
