import type { Metadata } from 'next';
import EventsClient from './EventsClient';

export const metadata: Metadata = { title: 'Events' };

export default function EventsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Events</h1>
      <EventsClient />
    </>
  );
}
