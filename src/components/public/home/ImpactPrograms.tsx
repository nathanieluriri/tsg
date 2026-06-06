import Reveal from './Reveal';
import ProgramsBento from './ProgramsBento';

export default function ImpactPrograms() {
  return (
    <section
      aria-labelledby="impact-programs-heading"
      className="relative isolate overflow-hidden bg-[#070809]"
    >
      {/* Cinematic glow backdrop (matches the CTA banner's blurred blobs) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-24 -z-10 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-24 -z-10 h-96 w-96 rounded-full bg-tsg-green/20 blur-3xl"
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-emerald-400">What We Stand For</p>
          <h2
            id="impact-programs-heading"
            className="font-display mt-3 text-3xl font-semibold text-white md:text-5xl"
          >
            Programs driving the Renewed Hope agenda
          </h2>
          <p className="mt-5 text-lg text-white/70">
            Three commitments guide everything we do as we mobilise Nigerians behind a shared vision
            for the nation.
          </p>
        </Reveal>

        <ProgramsBento />
      </div>
    </section>
  );
}
