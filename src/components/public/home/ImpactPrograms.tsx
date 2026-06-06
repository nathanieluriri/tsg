import Image from 'next/image';
import Reveal from './Reveal';
import { PROGRAMS } from './homeContent';

export default function ImpactPrograms() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-tsg-green">What We Stand For</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-tsg-deep md:text-5xl">
            Programs driving the Renewed Hope agenda
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            Three commitments guide everything we do as we mobilise Nigerians behind a shared vision
            for the nation.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PROGRAMS.map((p, i) => (
            <Reveal key={p.title} delay={i * 110}>
              <article className="group relative h-full overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tsg-deep/70 via-tsg-deep/10 to-transparent" />
                  <span className="absolute left-5 top-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/95 text-tsg-green shadow-lg">
                    <p.icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                </div>
                <div className="p-7">
                  <h3 className="font-display text-xl font-semibold text-tsg-deep">{p.title}</h3>
                  <p className="mt-3 text-gray-600">{p.body}</p>
                </div>
                <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-tsg-green transition-transform duration-300 group-hover:scale-x-100" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
