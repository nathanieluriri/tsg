'use client';

import { useRouter } from 'next/navigation';

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  async function remove() {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
    router.refresh();
  }
  return <button onClick={remove} className="text-red-600">Delete</button>;
}
