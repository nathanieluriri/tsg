import Link from 'next/link';
import Image from 'next/image';
import { connectDB } from '@/lib/db';
import { Slider } from '@/models/Slider';
import { Image as ImageModel } from '@/models/Image';
import { Post } from '@/models/Post';
import { Category } from '@/models/Category';
import { Faq } from '@/models/Faq';
import { incrementSiteViews } from '@/models/SiteView';
import PostCard from '@/components/public/PostCard';


export default async function HomePage() {
  await connectDB();
  await incrementSiteViews();

  const [sliders, eventCategory, faqs] = await Promise.all([
    Slider.find({ status: '1' }).populate({ path: 'image', model: ImageModel }).limit(5).lean(),
    Category.findOne({ link: 'events' }).lean(),
    Faq.find().limit(8).lean(),
  ]);

  const latestQuery = eventCategory
    ? Post.find({ category: { $ne: eventCategory._id }, status: '1' })
    : Post.find({ status: '1' });
  const latestPosts = await latestQuery.sort({ createdAt: -1 }).limit(6).populate('user', 'name').lean();

  return (
    <>
      <section className="bg-[var(--tsg-green)] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Renewed Hope. Stronger Nigeria.</h1>
            <p className="text-lg opacity-90 mb-6">
              Joining hands with President Bola Ahmed Tinubu to build a brighter future for every Nigerian.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/register" className="bg-[var(--tsg-gold)] text-gray-900 px-6 py-3 rounded font-semibold">
                Become a Member
              </Link>
              <Link href="/about" className="border border-white px-6 py-3 rounded font-semibold">
                Learn More
              </Link>
            </div>
          </div>
          <div className="relative aspect-video rounded overflow-hidden bg-white/10">
            {sliders[0]?.image && typeof sliders[0].image === 'object' && 'link' in sliders[0].image ? (
              <Image src={String(sliders[0].image.link)} alt="" fill className="object-cover" />
            ) : (
              <Image src="/assets/img/hero-carousel/tinubu1.png" alt="President Tinubu" fill className="object-cover" />
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Latest News</h2>
        {latestPosts.length === 0 ? (
          <p className="text-gray-600">No posts yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {latestPosts.map((p) => (
              <PostCard
                key={String(p._id)}
                post={{
                  link: p.link,
                  title: p.title,
                  excerpt: p.excerpt || undefined,
                  thumbnail: p.thumbnail || undefined,
                  authorName: typeof p.user === 'object' && p.user && 'name' in p.user ? (p.user as { name: string }).name : undefined,
                  createdAt: p.createdAt,
                }}
              />
            ))}
          </div>
        )}
        <div className="text-center mt-6">
          <Link href="/blog" className="text-[var(--tsg-green)] font-semibold hover:underline">View all posts →</Link>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((f) => (
                <details key={String(f._id)} className="border rounded p-4 bg-white">
                  <summary className="font-medium cursor-pointer">{f.question}</summary>
                  <p className="mt-2 text-sm text-gray-700">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
