// Single source of truth for the "Who We Are" (AboutStory) and
// "Leadership & Vision" (LeadershipVision) copy. Consumed by those two
// components AND by the pinned ScrollStory so the two render paths never drift.
// Headings use "\n" to mark a forced line break; the `uppercase` class on each
// heading handles display casing.

export const STORY = {
  about: {
    eyebrow: 'Who We Are',
    heading: 'A Movement For\nRenewed Hope',
    fallbackBody:
      'The Tinubu Support Group is a nationwide community of individuals and groups standing with President Bola Ahmed Tinubu — advancing policies, initiatives and developmental programs that build a better Nigeria.',
    beliefs: [
      'Unity & national cohesion',
      'Good, accountable governance',
      'Opportunity for every citizen',
    ],
    cta: { label: 'Read our story', href: '/about' },
  },
  leadership: {
    eyebrow: 'Leadership & Vision',
    heading: 'Renewed\nHope',
    quote:
      '“More than a slogan — a commitment to a Nigeria where every citizen can dream, build and belong.”',
    fallbackBody:
      'We stand with President Tinubu to turn the Renewed Hope agenda into real progress — championing reform, opportunity and unity in every community.',
    cta: { label: 'About the President', href: '/pbat' },
  },
} as const;
