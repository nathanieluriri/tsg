'use client';

import { useEffect, useState } from 'react';

interface Category { _id: string; title: string; link: string; description?: string }

export default function CategoriesClient() {
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/categories');
    const json = await res.json();
    if (json.ok) setItems(json.data);
  }

  useEffect(() => { load(); }, []);

  async function save(form: FormData) {
    const body = { title: String(form.get('title') || ''), description: String(form.get('description') || '') };
    const url = editing ? `/api/admin/categories/${editing._id}` : '/api/admin/categories';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json();
    if (!json.ok) { alert(json.error || 'Failed'); return; }
    setShowForm(false); setEditing(null);
    await load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-[var(--tsg-green)] text-white px-4 py-2 rounded">Add category</button>
      </div>
      <table className="w-full border bg-white">
        <thead className="bg-gray-50"><tr><th className="text-left p-2">Title</th><th className="text-left p-2">Slug</th><th className="text-left p-2">Description</th><th></th></tr></thead>
        <tbody>
          {items.map((c) => (
            <tr key={c._id} className="border-t">
              <td className="p-2">{c.title}</td>
              <td className="p-2 text-sm text-gray-500">{c.link}</td>
              <td className="p-2 text-sm">{c.description}</td>
              <td className="p-2 text-right whitespace-nowrap">
                <button onClick={() => { setEditing(c); setShowForm(true); }} className="text-blue-600 mr-3">Edit</button>
                <button onClick={() => remove(c._id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">{editing ? 'Edit' : 'Add'} category</h2>
            <form onSubmit={(e) => { e.preventDefault(); save(new FormData(e.currentTarget)); }} className="space-y-3">
              <input name="title" defaultValue={editing?.title} required placeholder="Title" className="w-full border rounded px-3 py-2" />
              <textarea name="description" defaultValue={editing?.description} placeholder="Description" rows={3} className="w-full border rounded px-3 py-2" />
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
