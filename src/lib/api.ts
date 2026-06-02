import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';

export function ok<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json({ ok: true, data }, typeof init === 'number' ? { status: init } : init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export async function readJson<T>(req: Request, schema: ZodSchema<T>): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const json = await req.json();
    return { data: schema.parse(json) };
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: fail('Validation failed', 422, { fields: err.flatten().fieldErrors }) };
    }
    return { error: fail('Invalid JSON body', 400) };
  }
}

export async function readForm<T>(req: Request, schema: ZodSchema<T>): Promise<{ data: T; form: FormData } | { error: NextResponse }> {
  try {
    const form = await req.formData();
    const obj: Record<string, FormDataEntryValue> = {};
    for (const [k, v] of form.entries()) obj[k] = v;
    return { data: schema.parse(obj), form };
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: fail('Validation failed', 422, { fields: err.flatten().fieldErrors }) };
    }
    return { error: fail('Invalid form body', 400) };
  }
}
