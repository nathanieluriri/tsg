import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Slider } from '@/models/Slider';
import { Image } from '@/models/Image';
import { sliderSchema } from '@/lib/validators';
import { readJson } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';

export async function GET() {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  await connectDB();
  const sliders = await Slider.find().sort({ createdAt: -1 }).populate({ path: 'image', model: Image }).lean();
  return NextResponse.json({ ok: true, data: sliders });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const parsed = await readJson(req, sliderSchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  const slider = await Slider.create(parsed.data);
  return NextResponse.json({ ok: true, data: slider });
}
