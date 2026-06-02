import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const pageSchema = new Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true, unique: true, lowercase: true, index: true },
    thumbnail: String,
    description: String,
    keywords: String,
    content: { type: String, default: '' },
    status: { type: String, enum: ['0', '1'], default: '0' },
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

export type PageDoc = InferSchemaType<typeof pageSchema> & { _id: mongoose.Types.ObjectId };
export const Page = defineModel<PageDoc>('Page', pageSchema);
