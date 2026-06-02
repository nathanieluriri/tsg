import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = (global.__mongoose ??= { conn: null, promise: null });

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
    const dbName = process.env.MONGODB_DB || 'tsgweb';
    cached.promise = mongoose.connect(uri, { dbName, bufferCommands: false });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
