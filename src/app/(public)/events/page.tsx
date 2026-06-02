import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { EventModel } from '@/models/Event';

export const metadata: Metadata = { title: 'Events' };

export default async function EventsPage() {
  await connectDB();
  const events = await EventModel.find().sort({ start: -1 }).lean();
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Events</h1>
      {events.length === 0 ? (
        <p className="text-gray-600">No events scheduled.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Description</th>
                <th className="text-left p-3">Start</th>
                <th className="text-left p-3">End</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={String(e._id)} className="border-t">
                  <td className="p-3 font-medium">{e.name}</td>
                  <td className="p-3 text-sm text-gray-700">{e.description}</td>
                  <td className="p-3 text-sm">{new Date(e.start).toLocaleString()}</td>
                  <td className="p-3 text-sm">{new Date(e.end).toLocaleString()}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${e.status ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {e.status ? 'Closed' : 'Open'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
