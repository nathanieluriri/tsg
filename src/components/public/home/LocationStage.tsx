'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { MapPin, ExternalLink, Phone, Mail } from 'lucide-react';
import { gsap } from 'gsap';
import { AFRICA_VIEWBOX, AFRICA_OUTLINE, NIGERIA_PATH, ABUJA_POINT } from './flyInPaths';

const MAPS_LINK =
  'https://www.google.com/maps?cid=9709369009114742493&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF&hl=en&gl=NG&source=embed';

interface LocationStageProps {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  /** The server-rendered Maitama street-map <svg> (kept out of the client bundle). */
  children: ReactNode;
}

const vb = (s: string) => {
  const [x, y, w, h] = s.split(/\s+/).map(Number);
  return { x, y, w, h };
};

/**
 * Cinematic Location section: on first scroll-into-view the camera flies from a
 * wide Africa view, pans, and zooms into Abuja, then cross-fades into the
 * Maitama street map and drops the TSG tag. Afterwards the overlays drift with a
 * light parallax. Honours prefers-reduced-motion and degrades to the settled map
 * without JS.
 */
export default function LocationStage({ address, phone, email, children }: LocationStageProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<SVGSVGElement>(null);
  const streetScaleRef = useRef<HTMLDivElement>(null);
  const streetParallaxRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const displayAddress = address || '2 Kainji Crescent, Maitama, Abuja, FCT';

  useEffect(() => {
    const section = sectionRef.current;
    const outline = outlineRef.current;
    const streetScale = streetScaleRef.current;
    const streetParallax = streetParallaxRef.current;
    const intro = introRef.current;
    const card = cardRef.current;
    if (!section || !outline || !streetScale || !streetParallax || !intro || !card) return;
    const pin = streetScale.querySelector<SVGGElement>('.tsg-pin');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Settled state (also what no-JS users see via SSR).
    const settle = () => {
      gsap.set(outline, { autoAlpha: 0 });
      gsap.set(streetScale, { autoAlpha: 1, scale: 1 });
      gsap.set([intro, card], { autoAlpha: 1 });
      if (pin) gsap.set(pin, { autoAlpha: 1, y: 0, scale: 1 });
    };

    if (reduced) {
      settle();
      return;
    }

    const ctx = gsap.context(() => {
      // Start state: wide Africa, street + tag hidden.
      const cam = vb(AFRICA_VIEWBOX);
      const setCam = () => outline.setAttribute('viewBox', `${cam.x} ${cam.y} ${cam.w} ${cam.h}`);
      setCam();
      gsap.set(outline, { autoAlpha: 1 });
      gsap.set(streetScale, { autoAlpha: 0, scale: 1.22, transformOrigin: '50% 50%' });
      gsap.set([intro, card], { autoAlpha: 0 });
      if (pin) gsap.set(pin, { autoAlpha: 0, y: -18, scale: 0.9, transformOrigin: '50% 100%' });

      // Camera windows (same coord system): Africa → drift left → drift right →
      // hard zoom onto Abuja (365.3, 411.6).
      const KA = { x: 30, y: 194, w: 620, h: 651 };
      const KB = { x: 185, y: 274, w: 430, h: 452 };
      const KC = { x: 310, y: 354, w: 110, h: 116 };

      const tl = gsap.timeline({ defaults: { ease: 'power1.inOut' }, paused: true });
      tl.to(cam, { ...KA, duration: 0.9, onUpdate: setCam })
        .to(cam, { ...KB, duration: 0.7, onUpdate: setCam })
        .addLabel('zoom')
        .to(cam, { ...KC, duration: 1.0, ease: 'power2.in', onUpdate: setCam })
        .to(outline, { autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, 'zoom+=0.5')
        .to(streetScale, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, 'zoom+=0.35')
        .to(intro, { autoAlpha: 1, duration: 0.6 }, 'zoom+=0.7')
        .to(card, { autoAlpha: 1, duration: 0.6 }, 'zoom+=0.85');
      if (pin) tl.to(pin, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, 'zoom+=1.05');

      // Play once when the section scrolls into view.
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          tl.play();
        },
        { threshold: 0.35 },
      );
      io.observe(section);

      // Light parallax drift once settled.
      let raf = 0;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = section.getBoundingClientRect();
          const vh = window.innerHeight || 1;
          const off = (vh / 2 - (r.top + r.height / 2)) / vh; // ≈ -1 … 1 as it passes
          streetParallax.style.transform = `translate3d(0, ${(off * -26).toFixed(1)}px, 0) scale(1.06)`;
          intro.style.transform = `translate3d(0, ${(off * -30).toFixed(1)}px, 0)`;
          card.style.transform = `translate3d(0, ${(off * 32).toFixed(1)}px, 0)`;
        });
      };
      let parallaxOn = false;
      const enableParallax = () => {
        if (parallaxOn) return;
        parallaxOn = true;
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      };
      tl.eventCallback('onComplete', enableParallax);

      return () => {
        io.disconnect();
        window.removeEventListener('scroll', onScroll);
        if (raf) cancelAnimationFrame(raf);
      };
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="absolute inset-0">
      {/* Street map (server-rendered, parallax + zoom wrappers). The parallax
          wrapper keeps a slight base scale so the drift never reveals edges and
          enabling it causes no scale pop. */}
      <div
        ref={streetParallaxRef}
        className="absolute inset-0 will-change-transform"
        style={{ transform: 'translate3d(0,0,0) scale(1.06)' }}
      >
        <div ref={streetScaleRef} className="absolute inset-0">
          {children}
        </div>
      </div>

      {/* Fly-in outline layer (Africa → Nigeria → Abuja); hidden without JS */}
      <svg
        ref={outlineRef}
        viewBox={AFRICA_VIEWBOX}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <path d={AFRICA_OUTLINE} fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.13)" strokeWidth={0.8} />
        <path d={NIGERIA_PATH} fill="rgba(16,120,70,0.4)" stroke="rgba(52,211,153,0.7)" strokeWidth={1} />
        <circle cx={ABUJA_POINT.x} cy={ABUJA_POINT.y} r={2.4} fill="#34d399" />
        <circle cx={ABUJA_POINT.x} cy={ABUJA_POINT.y} r={5} fill="none" stroke="#34d399" strokeWidth={0.8} />
      </svg>

      {/* Legibility wash */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"
        aria-hidden="true"
      />

      {/* Overlays */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-between px-4 py-16 sm:px-6 lg:px-8">
        <div ref={introRef} className="max-w-md will-change-transform sm:ml-auto sm:text-right">
          <p className="eyebrow text-emerald-400">Find Us</p>
          <p className="mt-3 text-xs uppercase leading-relaxed tracking-[0.14em] text-white/65 sm:text-sm">
            The Tinubu Support Group is headquartered in the heart of Abuja — Maitama, in the
            Federal Capital Territory. Come and be part of the movement.
          </p>
        </div>

        <div
          ref={cardRef}
          className="max-w-sm rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-md will-change-transform"
        >
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold text-white">Tinubu Support Group</p>
              <p className="text-sm text-white/70">{displayAddress}</p>
            </div>
          </div>
          {(phone || email) && (
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm text-white/70">
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-2 transition hover:text-white">
                  <Phone className="h-4 w-4 text-emerald-400" /> {phone}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-2 transition hover:text-white">
                  <Mail className="h-4 w-4 text-emerald-400" /> {email}
                </a>
              )}
            </div>
          )}
          <a
            href={MAPS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-5 inline-flex items-center gap-2 rounded-full bg-tsg-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-tsg-deep"
          >
            Open in Google Maps
            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
