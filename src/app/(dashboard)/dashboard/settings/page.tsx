import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Setting } from '@/models/Setting';
import SettingsForm from './SettingsForm';

export const metadata: Metadata = { title: 'Site settings' };

export default async function SettingsPage() {
  await connectDB();
  const settingDoc = await Setting.getOrCreate();
  const setting = JSON.parse(JSON.stringify(settingDoc.toObject ? settingDoc.toObject() : settingDoc)) as Record<string, string | boolean | undefined>;
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Site settings</h1>
      <SettingsForm initial={setting} />
    </>
  );
}
