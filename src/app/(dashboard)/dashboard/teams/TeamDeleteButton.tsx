'use client';

import { useRouter } from 'next/navigation';

export default function TeamDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  async function remove() {
    if (!confirm('Delete this team member?')) return;
    await fetch(`/api/admin/teams/${id}`, { method: 'DELETE' });
    router.refresh();
  }
  return <button onClick={remove} className="text-red-600">Delete</button>;
}
