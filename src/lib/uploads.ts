import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import sharp from 'sharp';
import { connectDB } from './db';

let cachedBucket: GridFSBucket | null = null;

async function getBucket(): Promise<GridFSBucket> {
  if (cachedBucket) return cachedBucket;
  const conn = await connectDB();
  if (!conn.connection.db) throw new Error('Mongo connection has no db handle');
  cachedBucket = new GridFSBucket(conn.connection.db, { bucketName: 'uploads' });
  return cachedBucket;
}

export interface SavedFile {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
}

export async function saveImage(
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<SavedFile> {
  const bucket = await getBucket();
  const processed = await sharp(buffer).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const finalName = filename.replace(/\.[^.]+$/, '') + '.webp';

  const id = await new Promise<ObjectId>((resolve, reject) => {
    const upload = bucket.openUploadStream(finalName, {
      contentType: 'image/webp',
      metadata: { originalContentType: contentType, originalName: filename },
    });
    Readable.from(processed).pipe(upload).on('error', reject).on('finish', () => resolve(upload.id as ObjectId));
  });

  return {
    id: id.toHexString(),
    url: `/api/files/${id.toHexString()}`,
    filename: finalName,
    contentType: 'image/webp',
    size: processed.byteLength,
  };
}

export async function saveFile(
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<SavedFile> {
  const bucket = await getBucket();
  const id = await new Promise<ObjectId>((resolve, reject) => {
    const upload = bucket.openUploadStream(filename, { contentType });
    Readable.from(buffer).pipe(upload).on('error', reject).on('finish', () => resolve(upload.id as ObjectId));
  });
  return {
    id: id.toHexString(),
    url: `/api/files/${id.toHexString()}`,
    filename,
    contentType,
    size: buffer.byteLength,
  };
}

export async function getFile(id: string): Promise<{ stream: NodeJS.ReadableStream; contentType: string; length: number; filename: string } | null> {
  const bucket = await getBucket();
  let oid: ObjectId;
  try { oid = new ObjectId(id); } catch { return null; }
  const files = await bucket.find({ _id: oid }).toArray();
  const meta = files[0];
  if (!meta) return null;
  return {
    stream: bucket.openDownloadStream(oid),
    contentType: meta.contentType || 'application/octet-stream',
    length: meta.length,
    filename: meta.filename,
  };
}

export async function deleteFile(id: string): Promise<boolean> {
  const bucket = await getBucket();
  try {
    await bucket.delete(new ObjectId(id));
    return true;
  } catch {
    return false;
  }
}
