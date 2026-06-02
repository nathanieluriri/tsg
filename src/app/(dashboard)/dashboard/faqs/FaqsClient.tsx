'use client';

import { useEffect, useState } from 'react';

interface Faq { _id: string; question: string; answer: string }

export default function FaqsClient() {
  const [items, setItems] = useState<Faq[]>([]);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/faqs');
    const json = await res.json();
    if (json.ok) setItems(json.data);
  }
  useEffect(() => { load(); }, []);

  async function save(form: FormData) {
    const body = { question: String(form.get('question') || ''), answer: String(form.get('answer') || '') };
    const url = editing ? `/api/admin/faqs/${editing._id}` : '/api/admin/faqs';
    const res = await fetch(url, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json();
    if (!json.ok) { alert(json.error || 'Failed'); return; }
    setShowForm(false); setEditing(null);
    await load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this FAQ?')) return;
    await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-[var(--tsg-green)] text-white px-4 py-2 rounded">Add FAQ</button>
      </div>
      <div className="space-y-2">
        {items.map((f) => (
          <details key={f._id} className="border rounded p-3 bg-white">
            <summary className="font-medium cursor-pointer flex justify-between">
              {f.question}
              <span className="space-x-3 text-sm">
                <button onClick={(e) => { e.preventDefault(); setEditing(f); setShowForm(true); }} className="text-blue-600">Edit</button>
                <button onClick={(e) => { e.preventDefault(); remove(f._id); }} className="text-red-600">Delete</button>
              </span>
            </summary>
            <p className="mt-2 text-sm text-gray-700">{f.answer}</p>
          </details>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">{editing ? 'Edit' : 'Add'} FAQ</h2>
            <form onSubmit={(e) => { e.preventDefault(); save(new FormData(e.currentTarget)); }} className="space-y-3">
              <input name="question" defaultValue={editing?.question} required maxLength={255} placeholder="Question" className="w-full border rounded px-3 py-2" />
              <textarea name="answer" defaultValue={editing?.answer} required maxLength={255} placeholder="Answer" rows={3} className="w-full border rounded px-3 py-2" />
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
