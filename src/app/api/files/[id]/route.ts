import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getFile } from '@/lib/uploads';
import { Readable } from 'stream';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const file = await getFile(id);
  if (!file) return new NextResponse('Not found', { status: 404 });

  const webStream = Readable.toWeb(file.stream as Readable) as unknown as ReadableStream;
  return new NextResponse(webStream, {
    status: 200,
    headers: {
      'Content-Type': file.contentType,
      'Content-Length': String(file.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
