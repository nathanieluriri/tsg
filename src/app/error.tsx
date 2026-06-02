'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold mb-2">Something went wrong</h1>
      <p className="text-lg mb-6">An unexpected error occurred. Please try again.</p>
      <button onClick={reset} className="px-4 py-2 bg-[var(--tsg-green)] text-white rounded">Try again</button>
    </main>
  );
}
