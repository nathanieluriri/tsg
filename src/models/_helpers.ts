import mongoose, { type Model, type Schema } from 'mongoose';

export function defineModel<T>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}
