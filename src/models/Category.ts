import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const categorySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    link: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: String,
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

categorySchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

export type CategoryDoc = InferSchemaType<typeof categorySchema> & { _id: mongoose.Types.ObjectId };
export const Category = defineModel<CategoryDoc>('Category', categorySchema);
