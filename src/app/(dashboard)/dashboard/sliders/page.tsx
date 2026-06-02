import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Image } from '@/models/Image';
import SlidersClient from './SlidersClient';

export const metadata: Metadata = { title: 'Sliders' };

export default async function SlidersPage() {
  await connectDB();
  const images = await Image.find().sort({ title: 1 }).lean();
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Hero sliders</h1>
      <SlidersClient images={images.map((i) => ({ id: String(i._id), title: i.title, link: i.link }))} />
    </>
  );
}
