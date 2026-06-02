import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { Category } from '@/models/Category';
import { Image } from '@/models/Image';
import PostForm from '../../PostForm';

export const metadata: Metadata = { title: 'Edit post' };

interface Props { params: Promise<{ id: string }> }

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  await connectDB();
  const post = await Post.findById(id).lean();
  if (!post) return notFound();
  const [categories, images] = await Promise.all([
    Category.find().sort({ title: 1 }).lean(),
    Image.find().sort({ title: 1 }).lean(),
  ]);
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Edit post</h1>
      <PostForm
        postId={id}
        initial={{
          title: post.title,
          category: String(post.category),
          status: post.status as '0' | '1',
          thumbnail: post.thumbnail || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          tags: post.tags || '',
        }}
        categories={categories.map((c) => ({ id: String(c._id), title: c.title }))}
        images={images.map((i) => ({ id: String(i._id), title: i.title, link: i.link }))}
      />
    </>
  );
}
