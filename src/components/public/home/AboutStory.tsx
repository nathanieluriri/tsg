import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import Reveal from './Reveal';
import SplitText from './SplitText';
import { STORY } from './storyContent';

interface AboutStoryProps {
  description?: string | null;
}

export default function AboutStory({ description }: AboutStoryProps) {
  return (
    <section id="about" className="relative isolate overflow-hidden bg-tsg-cream">
      <div
        className="absolute -left-40 top-1/4 -z-10 h-[28rem] w-[28rem] rounded-full bg-tsg-green/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-28 sm:px-6 md:py-36 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Text */}
        <div className="order-2 lg:order-1">
          <Reveal>
            <p className="eyebrow text-tsg-green">{STORY.about.eyebrow}</p>
          </Reveal>
          <SplitText
            as="h2"
            text={STORY.about.heading}
            className="font-onest mt-5 text-[clamp(2.25rem,5vw,4.5rem)] font-normal uppercase leading-[0.95] tracking-[-0.03em] text-tsg-deep"
          />
          <Reveal delay={120}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-gray-600">
              {description || STORY.about.fallbackBody}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <ul className="mt-8 space-y-3">
              {STORY.about.beliefs.map((b) => (
                <li key={b} className="flex items-center gap-3 text-tsg-deep">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tsg-green/12 text-tsg-green">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="font-medium">{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={260}>
            <Link
              href={STORY.about.cta.href}
              className="group mt-10 inline-flex items-center gap-2 rounded-full bg-tsg-green px-7 py-3.5 font-semibold text-white shadow-lg shadow-tsg-green/20 transition hover:bg-tsg-deep"
            >
              {STORY.about.cta.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {/* Image */}
        <Reveal delay={120} className="order-1 lg:order-2">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div
              className="absolute -right-4 -top-4 h-full w-full rounded-[2rem] border border-tsg-green/25"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-tsg-deep/25">
              <Image
                src="/assets/img/tinubu2.jpg"
                alt="President Bola Ahmed Tinubu"
                width={760}
                height={900}
                className="h-full w-full object-cover object-top"
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-tsg-deep/85 to-transparent p-6">
                <p className="font-display text-lg text-white">President Bola Ahmed Tinubu</p>
                <p className="text-sm text-white/75">
                  Commander-in-Chief, Federal Republic of Nigeria
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
