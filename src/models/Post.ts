import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    link: { type: String, required: true, unique: true, lowercase: true, index: true },
    content: String,
    excerpt: String,
    thumbnail: String,
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    tags: { type: String, default: '' },
    commentsCount: { type: Number, default: 0 },
    status: { type: String, enum: ['0', '1'], default: '0' },
    views: { type: Number, default: 0 },
    newsLetter: { type: Number, default: 0 },
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

export type PostDoc = InferSchemaType<typeof postSchema> & { _id: mongoose.Types.ObjectId };
export const Post = defineModel<PostDoc>('Post', postSchema);
