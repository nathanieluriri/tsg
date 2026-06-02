import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Setting } from '@/models/Setting';
import ContactForm from './ContactForm';

export const metadata: Metadata = { title: 'Contact' };

export default async function ContactPage() {
  await connectDB();
  const setting = await Setting.getOrCreate();
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
      <div>
        <h1 className="text-3xl font-bold mb-4">Get in touch</h1>
        <p className="text-gray-700 mb-6">We&apos;d love to hear from you. Send us a message using the form.</p>
        {setting.address && <p className="mb-2"><strong>Address:</strong> {setting.address}</p>}
        {setting.email && <p className="mb-2"><strong>Email:</strong> {setting.email}</p>}
        {setting.phone && <p className="mb-2"><strong>Phone:</strong> {setting.phone}</p>}
      </div>
      <ContactForm />
    </div>
  );
}
