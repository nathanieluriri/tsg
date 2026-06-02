'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MemberActions({ id, blocked }: { id: string; blocked: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function call(action: 'approve' | 'disapprove' | 'make-admin') {
    if (action === 'make-admin' && !confirm('Promote this member to admin?')) return;
    if (action === 'disapprove' && !confirm('Disapprove this member?')) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/users/${id}/${action}`, { method: 'POST' });
      router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <div className="flex gap-2 justify-end">
      {blocked ? (
        <button disabled={busy} onClick={() => call('approve')} className="text-green-700 text-sm">Approve</button>
      ) : (
        <button disabled={busy} onClick={() => call('disapprove')} className="text-yellow-700 text-sm">Disapprove</button>
      )}
      <button disabled={busy} onClick={() => call('make-admin')} className="text-blue-700 text-sm">Make admin</button>
    </div>
  );
}
