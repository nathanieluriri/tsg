'use client';

import { useState } from 'react';

type SettingShape = Record<string, string | boolean | undefined>;

export default function SettingsForm({ initial }: { initial: SettingShape }) {
  const [data, setData] = useState<SettingShape>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function bind(name: string) {
    return {
      name,
      value: typeof data[name] === 'string' ? (data[name] as string) : '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setData({ ...data, [name]: e.target.value }),
    };
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const res = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json();
      setMsg(json.ok ? 'Saved' : (json.error || 'Failed'));
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={save} className="bg-white p-6 rounded border max-w-3xl space-y-6">
      {msg && <div className="bg-blue-50 border border-blue-300 p-3 rounded text-sm">{msg}</div>}

      <Section title="General">
        <Field label="Site title"><input {...bind('title')} className="w-full border rounded px-3 py-2" /></Field>
        <Field label="Description"><textarea {...bind('description')} rows={2} className="w-full border rounded px-3 py-2" /></Field>
        <Field label="Keywords"><input {...bind('keywords')} className="w-full border rounded px-3 py-2" /></Field>
      </Section>

      <Section title="Mission / Vision">
        <Field label="Mission"><textarea {...bind('mission')} rows={2} className="w-full border rounded px-3 py-2" /></Field>
        <Field label="Vision"><textarea {...bind('vision')} rows={2} className="w-full border rounded px-3 py-2" /></Field>
        <Field label="Core values"><textarea {...bind('coreValues')} rows={2} className="w-full border rounded px-3 py-2" /></Field>
      </Section>

      <Section title="Contact">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Email"><input {...bind('email')} type="email" className="w-full border rounded px-3 py-2" /></Field>
          <Field label="Phone"><input {...bind('phone')} className="w-full border rounded px-3 py-2" /></Field>
        </div>
        <Field label="Address"><input {...bind('address')} className="w-full border rounded px-3 py-2" /></Field>
      </Section>

      <Section title="Bank">
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Bank name"><input {...bind('bankName')} className="w-full border rounded px-3 py-2" /></Field>
          <Field label="Account name"><input {...bind('accountName')} className="w-full border rounded px-3 py-2" /></Field>
          <Field label="Account number"><input {...bind('accountNumber')} className="w-full border rounded px-3 py-2" /></Field>
        </div>
      </Section>

      <Section title="Social links">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Facebook"><input {...bind('fbLink')} className="w-full border rounded px-3 py-2" /></Field>
          <Field label="Twitter / X"><input {...bind('twLink')} className="w-full border rounded px-3 py-2" /></Field>
          <Field label="Instagram"><input {...bind('igLink')} className="w-full border rounded px-3 py-2" /></Field>
          <Field label="YouTube"><input {...bind('ytLink')} className="w-full border rounded px-3 py-2" /></Field>
        </div>
      </Section>

      <Section title="Maintenance">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!data.maintenanceMode} onChange={(e) => setData({ ...data, maintenanceMode: e.target.checked })} />
          Enable maintenance mode (public site shows a maintenance page)
        </label>
      </Section>

      <button disabled={saving} className="bg-[var(--tsg-green)] text-white px-6 py-2 rounded disabled:opacity-50">{saving ? 'Saving…' : 'Save settings'}</button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
    </label>
  );
}
