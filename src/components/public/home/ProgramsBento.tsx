'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import { PROGRAMS, type Program } from './homeContent';

// Bento spans. The lg 4-col / 2-row grid is filled exactly by the big hero
// (2x2) + the wide tile (2x1) + one small tile (1x1), with the CTA in the last
// cell. Indices line up with PROGRAMS order.
const SPANS = [
  'sm:col-span-2 lg:col-span-2 lg:row-span-2', // 0 Youth — big hero
  'lg:col-span-2', // 1 Economic — wide
  '', // 2 Inclusive — small
];

export default function ProgramsBento() {
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={gridRef}
      className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(240px,1fr)]"
    >
      {PROGRAMS.map((p, i) => (
        <TiltCard key={p.title} program={p} className={SPANS[i]} index={i} />
      ))}
      <CtaTile />
    </div>
  );
}

interface TiltCardProps {
  program: Program;
  className: string;
  index: number;
}

function TiltCard({ program, className, index }: TiltCardProps) {
  const outerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isHero = index === 0;
  const Icon = program.icon;

  return (
    <article
      ref={outerRef}
      className={`group relative min-h-[260px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/30 backdrop-blur transition-colors duration-300 hover:border-emerald-400/40 [perspective:1000px] ${className}`}
    >
      <div ref={innerRef} className="relative h-full [transform-style:preserve-3d]">
        {/* Base image plane (stays at Z=0 → reads as receding behind the copy) */}
        <Image
          src={program.image}
          alt=""
          fill
          sizes={
            isHero
              ? '(max-width: 1024px) 100vw, 50vw'
              : '(max-width: 1024px) 100vw, 25vw'
          }
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070809] via-[#070809]/40 to-transparent" />

        {/* Icon chip — pops forward */}
        <span className="absolute left-5 top-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/95 text-tsg-green shadow-lg [transform:translateZ(60px)]">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </span>

        {/* Copy — mid depth */}
        <div className="absolute inset-x-0 bottom-0 p-6 [transform:translateZ(40px)]">
          <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">
            {program.title}
          </h3>
          <p className={`mt-2 text-sm text-white/75 ${isHero ? '' : 'line-clamp-2'}`}>
            {program.body}
          </p>
        </div>
      </div>
    </article>
  );
}

function CtaTile() {
  return (
    <Link
      href="/register"
      className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-tsg-green to-tsg-deep p-6 shadow-xl shadow-emerald-900/30 transition-colors duration-300 hover:border-emerald-300/60 sm:col-span-2 lg:col-span-1"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
      />
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25">
        <Users className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <div>
        <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">
          Add your voice to the movement
        </h3>
        <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
          Become a member
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  );
}
