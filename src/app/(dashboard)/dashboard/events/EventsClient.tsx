'use client';

import { useEffect, useState } from 'react';

interface EventItem { _id: string; name: string; description: string; start: string; end: string; status: boolean }

export default function EventsClient() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/events');
    const json = await res.json();
    if (json.ok) setItems(json.data);
  }
  useEffect(() => { load(); }, []);

  async function save(form: FormData) {
    const body = {
      name: String(form.get('name') || ''),
      description: String(form.get('description') || ''),
      start: String(form.get('start') || ''),
      end: String(form.get('end') || ''),
      status: form.get('status') === 'on',
    };
    const url = editing ? `/api/admin/events/${editing._id}` : '/api/admin/events';
    const res = await fetch(url, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json();
    if (!json.ok) { alert(json.error || 'Failed'); return; }
    setShowForm(false); setEditing(null);
    await load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this event?')) return;
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-[var(--tsg-green)] text-white px-4 py-2 rounded">Add event</button>
      </div>
      <table className="w-full border bg-white">
        <thead className="bg-gray-50"><tr><th className="text-left p-2">Name</th><th className="text-left p-2">Start</th><th className="text-left p-2">End</th><th className="text-left p-2">Status</th><th></th></tr></thead>
        <tbody>
          {items.map((e) => (
            <tr key={e._id} className="border-t">
              <td className="p-2">{e.name}</td>
              <td className="p-2 text-sm">{new Date(e.start).toLocaleString()}</td>
              <td className="p-2 text-sm">{new Date(e.end).toLocaleString()}</td>
              <td className="p-2 text-sm">{e.status ? 'Closed' : 'Open'}</td>
              <td className="p-2 text-right whitespace-nowrap">
                <button onClick={() => { setEditing(e); setShowForm(true); }} className="text-blue-600 mr-3">Edit</button>
                <button onClick={() => remove(e._id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">{editing ? 'Edit' : 'Add'} event</h2>
            <form onSubmit={(e) => { e.preventDefault(); save(new FormData(e.currentTarget)); }} className="space-y-3">
              <input name="name" defaultValue={editing?.name} required maxLength={255} placeholder="Name" className="w-full border rounded px-3 py-2" />
              <textarea name="description" defaultValue={editing?.description} required placeholder="Description" rows={3} className="w-full border rounded px-3 py-2" />
              <div className="grid grid-cols-2 gap-3">
                <input name="start" type="datetime-local" defaultValue={editing?.start ? editing.start.slice(0, 16) : ''} required className="border rounded px-3 py-2" />
                <input name="end" type="datetime-local" defaultValue={editing?.end ? editing.end.slice(0, 16) : ''} required className="border rounded px-3 py-2" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="status" defaultChecked={editing?.status} /> Closed
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2">Cancel</button>
                <button className="bg-[var(--tsg-green)] text-white px-4 py-2 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
