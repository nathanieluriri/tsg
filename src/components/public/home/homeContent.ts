// PLACEHOLDER CONTENT — replace with verified TSG content before launch.
// Mirrors the inline STATS/PILLARS pattern in src/app/(public)/page.tsx so it
// is easy for an editor to find and update. No external data source this round.
import type { LucideIcon } from 'lucide-react';
import { GraduationCap, LineChart, Landmark } from 'lucide-react';

export interface Program {
  icon: LucideIcon;
  title: string;
  body: string;
  image: string; // path under /public
}

export interface Milestone {
  year: string;
  title: string;
  body: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  location: string;
}

export interface AboutStat {
  value: string;
  label: string;
}

/** Section 5 — Impact / Programs. Seeded from the former PILLARS copy. */
export const PROGRAMS: Program[] = [
  {
    icon: GraduationCap,
    title: 'Youth Empowerment',
    body: 'Investing in education, skills and innovation so every young Nigerian can build a future at home.',
    image: '/assets/img/masonry-portfolio/masonry-portfolio-1.jpg',
  },
  {
    icon: LineChart,
    title: 'Economic Growth',
    body: 'Backing sustainable policies and enterprise that create jobs and lift families across the nation.',
    image: '/assets/img/masonry-portfolio/masonry-portfolio-4.jpg',
  },
  {
    icon: Landmark,
    title: 'Inclusive Governance',
    body: 'Championing transparency, accountability and citizen participation at every level of leadership.',
    image: '/assets/img/masonry-portfolio/masonry-portfolio-7.jpg',
  },
];

/** Section 6 — Our Journey timeline. PLACEHOLDER dates/copy — verify before launch. */
export const MILESTONES: Milestone[] = [
  {
    year: '2019',
    title: 'The movement begins',
    body: 'Supporters across Nigeria come together around a shared vision of renewed hope.',
  },
  {
    year: '2021',
    title: 'Grassroots mobilisation',
    body: 'Coordination expands into communities across the six geopolitical zones.',
  },
  {
    year: '2023',
    title: 'A nationwide network',
    body: 'Active membership grows across all 36 states and the Federal Capital Territory.',
  },
  {
    year: '2024',
    title: 'Programs take root',
    body: 'Youth, economic and governance initiatives move from advocacy into action.',
  },
  {
    year: 'Today',
    title: 'Stronger together',
    body: 'A united community advancing the Renewed Hope agenda, one citizen at a time.',
  },
];

/** Section 7 — Voices / Testimonials. PLACEHOLDER quotes — replace with real, consented quotes. */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Being part of this movement gave me a way to serve my community and believe in my country again.',
    name: 'Aisha B.',
    role: 'Volunteer Coordinator',
    location: 'Kano',
  },
  {
    quote: 'We are not waiting for change — we are organising for it, street by street.',
    name: 'Emeka O.',
    role: 'Group Leader',
    location: 'Enugu',
  },
  {
    quote:
      'The focus on young people is real. I found mentorship, skills and a network that opened doors.',
    name: 'Tunde A.',
    role: 'Member',
    location: 'Lagos',
  },
  {
    quote: 'From the FCT to the riverside communities, the message of renewed hope is the same.',
    name: 'Grace I.',
    role: 'Regional Volunteer',
    location: 'Bayelsa',
  },
];

/** Section 3 — About mini-stats. */
export const ABOUT_STATS: AboutStat[] = [
  { value: '36', label: 'States & FCT' },
  { value: '774', label: 'Local Governments' },
  { value: '2019', label: 'Mobilising since' },
];
