import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Slider } from '@/models/Slider';
import { requireAdminApi } from '@/lib/guard';

interface Ctx { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  await Slider.findByIdAndDelete(id);
  return NextResponse.json({ ok: true, data: { deleted: true } });
}
