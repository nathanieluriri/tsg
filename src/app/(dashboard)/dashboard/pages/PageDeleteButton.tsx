'use client';

import { useRouter } from 'next/navigation';

export default function PageDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  async function remove() {
    if (!confirm('Delete this page?')) return;
    await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
    router.refresh();
  }
  return <button onClick={remove} className="text-red-600">Delete</button>;
}
