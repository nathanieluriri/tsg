import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Category } from '@/models/Category';
import { Image } from '@/models/Image';
import PostForm from '../PostForm';

export const metadata: Metadata = { title: 'New post' };

export default async function NewPostPage() {
  await connectDB();
  const [categories, images] = await Promise.all([
    Category.find().sort({ title: 1 }).lean(),
    Image.find().sort({ title: 1 }).lean(),
  ]);
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">New post</h1>
      <PostForm
        categories={categories.map((c) => ({ id: String(c._id), title: c.title }))}
        images={images.map((i) => ({ id: String(i._id), title: i.title, link: i.link }))}
      />
    </>
  );
}
