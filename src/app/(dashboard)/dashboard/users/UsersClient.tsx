'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Admin { _id: string; name: string; email: string; phone: string; role: string; createdAt: string }

export default function UsersClient({ admins, canAdd }: { admins: Admin[]; canAdd: boolean }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(form: FormData) {
    setError(null);
    const body = {
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      phone: String(form.get('phone') || ''),
      role: String(form.get('role') || 'admin'),
    };
    const res = await fetch('/api/admin/users/add-admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json();
    if (!json.ok) { setError(json.error || 'Failed'); return; }
    setShowForm(false);
    router.refresh();
  }

  return (
    <div>
      {canAdd && (
        <div className="flex justify-end mb-3">
          <button onClick={() => setShowForm(true)} className="bg-[var(--tsg-green)] text-white px-4 py-2 rounded">Add admin</button>
        </div>
      )}
      <table className="w-full border bg-white">
        <thead className="bg-gray-50"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Role</th></tr></thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a._id} className="border-t"><td className="p-3">{a.name}</td><td className="p-3">{a.email}</td><td className="p-3">{a.phone}</td><td className="p-3 capitalize">{a.role}</td></tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">Invite admin</h2>
            <form onSubmit={(e) => { e.preventDefault(); add(new FormData(e.currentTarget)); }} className="space-y-3">
              {error && <div className="bg-red-50 border border-red-300 p-2 rounded text-sm text-red-900">{error}</div>}
              <input name="name" required minLength={3} placeholder="Name" className="w-full border rounded px-3 py-2" />
              <input name="email" type="email" required placeholder="Email" className="w-full border rounded px-3 py-2" />
              <input name="phone" required placeholder="Phone" className="w-full border rounded px-3 py-2" />
              <select name="role" className="w-full border rounded px-3 py-2">
                <option value="admin">Admin</option>
                <option value="super admin">Super admin</option>
              </select>
              <p className="text-xs text-gray-500">A temporary password will be emailed.</p>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2">Cancel</button>
                <button className="bg-[var(--tsg-green)] text-white px-4 py-2 rounded">Send invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
