import Link from 'next/link';
import {
  ArrowRight,
  GraduationCap,
  LineChart,
  Landmark,
  Users,
  ChevronDown,
  Newspaper,
} from 'lucide-react';
import { connectDB } from '@/lib/db';
import { APP_NAME, APP_URL } from '@/lib/config';
import { Slider } from '@/models/Slider';
import { Image as ImageModel } from '@/models/Image';
import { Post } from '@/models/Post';
import { Category } from '@/models/Category';
import { Faq } from '@/models/Faq';
import { Setting } from '@/models/Setting';
import { incrementSiteViews } from '@/models/SiteView';
import PostCard from '@/components/public/PostCard';
import Hero from '@/components/public/home/Hero';
import Reveal from '@/components/public/home/Reveal';
import CountUp from '@/components/public/home/CountUp';

const FALLBACK_HERO_IMAGES = [
  '/assets/img/hero-carousel/hero-carousel-1.jpg',
  '/assets/img/hero-carousel/tsg2.png',
  '/assets/img/hero-carousel/hero-carousel-3.jpg',
  '/assets/img/hero-carousel/tinubu1.png',
];

const STATS = [
  { value: 36, suffix: '', label: 'States & FCT', separator: false },
  { value: 774, suffix: '', label: 'Local Governments', separator: true },
  { value: 6, suffix: '', label: 'Geopolitical Zones', separator: false },
  { value: 2019, suffix: '', label: 'Mobilising Since', separator: false },
];

const PILLARS = [
  {
    icon: GraduationCap,
    title: 'Youth Empowerment',
    body: 'Investing in education, skills and innovation so every young Nigerian can build a future at home.',
  },
  {
    icon: LineChart,
    title: 'Economic Growth',
    body: 'Backing sustainable policies and enterprise that create jobs and lift families across the nation.',
  },
  {
    icon: Landmark,
    title: 'Inclusive Governance',
    body: 'Championing transparency, accountability and citizen participation at every level of leadership.',
  },
];

export default async function HomePage() {
  await connectDB();
  await incrementSiteViews();

  const [sliders, eventCategory, faqs, setting] = await Promise.all([
    Slider.find({ status: '1' }).populate({ path: 'image', model: ImageModel }).limit(5).lean(),
    Category.findOne({ link: 'events' }).lean(),
    Faq.find().limit(6).lean(),
    Setting.getOrCreate(),
  ]);

  const latestQuery = eventCategory
    ? Post.find({ category: { $ne: eventCategory._id }, status: '1' })
    : Post.find({ status: '1' });
  const latestPosts = await latestQuery
    .sort({ createdAt: -1 })
    .limit(3)
    .populate('user', 'name')
    .lean();

  const sliderImages = sliders
    .map((s) =>
      s.image && typeof s.image === 'object' && 'link' in s.image
        ? String((s.image as { link: string }).link)
        : null,
    )
    .filter((v): v is string => !!v);
  // Burst sequence for the opening animation; the last image settles as the
  // hero background. Use real slider images when present, else curated fallbacks.
  const heroImages = (sliderImages.length >= 2 ? sliderImages : FALLBACK_HERO_IMAGES).slice(0, 4);

  const sameAs = [setting.fbLink, setting.twLink, setting.igLink, setting.ytLink].filter(
    (v): v is string => typeof v === 'string' && v.length > 0,
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_NAME,
    alternateName: 'TSG',
    url: APP_URL,
    logo: `${APP_URL}/icon-512.png`,
    image: `${APP_URL}/og-image.png`,
    description:
      'A nationwide movement standing with President Bola Ahmed Tinubu to advance the Renewed Hope agenda for a stronger Nigeria.',
    foundingDate: '2019',
    areaServed: 'NG',
    ...(sameAs.length ? { sameAs } : {}),
    ...(setting.email || setting.phone
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'membership',
            ...(setting.email ? { email: setting.email } : {}),
            ...(setting.phone ? { telephone: setting.phone } : {}),
          },
        }
      : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: setting.address || '2 Kainji Crescent, Maitama',
      addressLocality: 'Abuja',
      addressRegion: 'FCT',
      addressCountry: 'NG',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape `<` so admin-editable Setting fields can't break out of the
        // <script> tag (e.g. a value containing "</script>"). < is valid JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* ---------------------------------------------------------------- Hero */}
      <Hero images={heroImages} />

      {/* --------------------------------------------------------------- Stats */}
      <section id="stats" className="bg-tsg-deep text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-14 text-center sm:px-6 lg:grid-cols-4 lg:px-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <div className="font-display text-4xl font-semibold text-tsg-gold md:text-5xl">
                <CountUp value={s.value} suffix={s.suffix} separator={s.separator} />
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/65 sm:text-sm">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- Pillars */}
      <section className="bg-tsg-cream">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">What We Stand For</p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-tsg-deep md:text-4xl">
              The Renewed Hope Agenda
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Three commitments guide everything we do as we mobilise Nigerians behind a
              shared vision for the nation.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 110}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-black/5 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-tsg-gold transition-transform duration-300 group-hover:scale-x-100" />
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-tsg-green/10 text-tsg-green ring-1 ring-tsg-green/15">
                    <p.icon className="h-7 w-7" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-display mt-6 text-xl font-semibold text-tsg-deep">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-gray-600">{p.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Latest News */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">From the Movement</p>
              <h2 className="font-display mt-3 text-3xl font-semibold text-tsg-deep md:text-4xl">
                Latest News
              </h2>
            </div>
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 font-semibold text-tsg-green hover:text-tsg-deep"
            >
              View all posts
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          {latestPosts.length === 0 ? (
            <Reveal className="mt-10">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-tsg-green/20 bg-tsg-cream/60 px-6 py-16 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-tsg-green/10 text-tsg-green">
                  <Newspaper className="h-6 w-6" />
                </span>
                <p className="mt-4 text-lg font-semibold text-tsg-deep">
                  Fresh updates are on the way
                </p>
                <p className="mt-1 max-w-md text-gray-600">
                  Stories, press releases and updates from across the movement will appear
                  here. Check back soon.
                </p>
                <Link
                  href="/blog"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-tsg-green px-6 py-3 font-semibold text-white transition hover:bg-tsg-deep"
                >
                  Visit the blog
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {latestPosts.map((p, i) => (
                <Reveal key={String(p._id)} delay={i * 110}>
                  <PostCard
                    post={{
                      link: p.link,
                      title: p.title,
                      excerpt: p.excerpt || undefined,
                      thumbnail: p.thumbnail || undefined,
                      authorName:
                        typeof p.user === 'object' && p.user && 'name' in p.user
                          ? (p.user as { name: string }).name
                          : undefined,
                      createdAt: p.createdAt,
                    }}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ----------------------------------------------------------- CTA banner */}
      <section className="relative isolate overflow-hidden bg-tsg-green text-white">
        <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-tsg-gold/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 -z-10 h-80 w-80 rounded-full bg-tsg-gold/10 blur-3xl" />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow justify-center text-tsg-gold-soft">Be Part Of It</p>
            <h2 className="font-display mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              Add your voice to the movement
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">
              Whether you join as an individual or register your group, every Nigerian who
              stands up makes the vision of a Renewed Hope stronger.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-tsg-gold px-7 py-3.5 font-semibold text-tsg-deep shadow-lg shadow-black/20 transition hover:bg-tsg-gold-soft"
              >
                <Users className="h-4 w-4" />
                Become a Member
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/group-reg"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Register a Group
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------------- FAQ */}
      {faqs.length > 0 && (
        <section className="bg-tsg-cream">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
            <Reveal className="text-center">
              <p className="eyebrow justify-center">Good To Know</p>
              <h2 className="font-display mt-3 text-3xl font-semibold text-tsg-deep md:text-4xl">
                Frequently Asked Questions
              </h2>
            </Reveal>
            <div className="mt-10 space-y-3">
              {faqs.map((f, i) => (
                <Reveal key={String(f._id)} delay={i * 60}>
                  <details className="group rounded-xl border border-black/5 bg-white px-5 py-4 shadow-sm transition open:shadow-md [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-tsg-deep">
                      {f.question}
                      <ChevronDown className="h-5 w-5 shrink-0 text-tsg-green transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-gray-600">{f.answer}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
