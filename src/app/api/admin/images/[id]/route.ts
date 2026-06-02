import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Image } from '@/models/Image';
import { deleteFile } from '@/lib/uploads';
import { fail } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';

interface Ctx { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  const img = await Image.findById(id);
  if (!img) return fail('Not found', 404);
  if (img.gridfsId) await deleteFile(img.gridfsId);
  await img.deleteOne();
  return NextResponse.json({ ok: true, data: { deleted: true } });
}
