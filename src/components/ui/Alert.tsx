import type { ReactNode } from 'react';

const styles: Record<string, string> = {
  success: 'bg-green-50 border-green-300 text-green-900',
  error: 'bg-red-50 border-red-300 text-red-900',
  info: 'bg-blue-50 border-blue-300 text-blue-900',
};

export default function Alert({ kind = 'info', children }: { kind?: 'success' | 'error' | 'info'; children: ReactNode }) {
  return <div className={`border rounded px-4 py-3 mb-4 text-sm ${styles[kind]}`}>{children}</div>;
}
