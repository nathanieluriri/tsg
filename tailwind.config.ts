import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tsg: {
          green: '#0a4d2e',
          deep: '#063d23',
          cream: '#f7f4ec',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        onest: ['var(--font-onest)', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '88rem',
      },
      keyframes: {
        'reveal-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1) translateY(0)' },
          '100%': { transform: 'scale(1.12) translateY(-1.5%)' },
        },
        'float-slow': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'reveal-up': 'reveal-up 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'ken-burns': 'ken-burns 18s ease-out forwards',
        'float-slow': 'float-slow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
