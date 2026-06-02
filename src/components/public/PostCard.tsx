import Link from 'next/link';
import Image from 'next/image';

export interface PostCardData {
  link: string;
  title: string;
  excerpt?: string;
  thumbnail?: string;
  authorName?: string;
  createdAt?: Date | string;
}

export default function PostCard({ post }: { post: PostCardData }) {
  const thumb = post.thumbnail
    ? (post.thumbnail.startsWith('/') || post.thumbnail.startsWith('http')
        ? post.thumbnail
        : `/storage/images/${post.thumbnail}`)
    : '/assets/img/tsg-logo.png';
  return (
    <article className="border rounded overflow-hidden bg-white hover:shadow-lg transition">
      <Link href={`/b/${post.link}`}>
        <div className="aspect-video relative bg-gray-100">
          <Image src={thumb} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/b/${post.link}`} className="font-semibold hover:text-[var(--tsg-green)] block">
          {post.title}
        </Link>
        {post.excerpt && <p className="text-sm text-gray-600 mt-2 line-clamp-3">{post.excerpt}</p>}
        <div className="text-xs text-gray-500 mt-3 flex justify-between">
          {post.authorName && <span>{post.authorName}</span>}
          {post.createdAt && <span>{new Date(post.createdAt).toLocaleDateString()}</span>}
        </div>
      </div>
    </article>
  );
}
