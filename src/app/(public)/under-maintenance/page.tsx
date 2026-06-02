import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Under Maintenance' };

export default function UnderMaintenancePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold mb-2">Under Maintenance</h1>
      <p className="text-gray-600">We&apos;re performing some scheduled maintenance. Please check back shortly.</p>
    </div>
  );
}
