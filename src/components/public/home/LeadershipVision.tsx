import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import Reveal from './Reveal';
import SplitText from './SplitText';
import { STORY } from './storyContent';

interface LeadershipVisionProps {
  vision?: string | null;
  mission?: string | null;
}

export default function LeadershipVision({ vision, mission }: LeadershipVisionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-tsg-green text-white">
      <div
        className="absolute -right-40 -top-24 -z-10 h-[28rem] w-[28rem] rounded-full bg-tsg-deep/50 blur-3xl"
        aria-hidden="true"
      />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-28 sm:px-6 md:py-36 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:px-8">
        {/* Portrait */}
        <Reveal>
          <div className="relative mx-auto max-w-sm lg:max-w-none">
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-black/40">
              <Image
                src="/assets/img/blog/presidentbola.jpg"
                alt="President Bola Ahmed Tinubu"
                width={680}
                height={820}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 80vw, 40vw"
              />
            </div>
          </div>
        </Reveal>

        {/* Text */}
        <div>
          <Reveal>
            <p className="eyebrow text-white/70">{STORY.leadership.eyebrow}</p>
          </Reveal>
          <SplitText
            as="h2"
            text={STORY.leadership.heading}
            className="font-onest mt-5 text-[clamp(2.75rem,6vw,5.5rem)] font-normal uppercase leading-[0.92] tracking-[-0.03em] text-white"
          />
          <Reveal delay={120}>
            <Quote className="mt-8 h-9 w-9 text-white/40" aria-hidden="true" />
            <blockquote className="font-display mt-3 text-2xl font-light leading-snug text-white md:text-3xl">
              {STORY.leadership.quote}
            </blockquote>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/80">
              {vision || STORY.leadership.fallbackBody}
            </p>
          </Reveal>
          {mission && (
            <Reveal delay={220}>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/80">{mission}</p>
            </Reveal>
          )}
          <Reveal delay={260}>
            <Link
              href={STORY.leadership.cta.href}
              className="group mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-tsg-green shadow-lg shadow-black/20 transition hover:bg-white/90"
            >
              {STORY.leadership.cta.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
