import Reveal from './Reveal';
import { MILESTONES } from './homeContent';

export default function JourneyTimeline() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center bg-tsg-cream">
      <div className="mx-auto w-full max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="eyebrow justify-center text-tsg-green">Our Journey</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-tsg-deep md:text-5xl">
            From a shared belief to a national movement
          </h2>
        </Reveal>

        <div className="timeline mt-16">
          {MILESTONES.map((m, i) => (
            <Reveal key={m.year} delay={i * 80}>
              <div className="relative pb-12 md:pb-0 md:py-6">
                <span className="timeline-node" aria-hidden="true" />
                <div
                  className={`pl-12 md:w-1/2 md:pl-0 ${
                    i % 2 === 0 ? 'md:ml-auto md:pl-12' : 'md:pr-12 md:text-right'
                  }`}
                >
                  <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                    <span className="font-display text-2xl font-semibold text-tsg-green">
                      {m.year}
                    </span>
                    <h3 className="font-display mt-2 text-lg font-semibold text-tsg-deep">
                      {m.title}
                    </h3>
                    <p className="mt-2 text-gray-600">{m.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
