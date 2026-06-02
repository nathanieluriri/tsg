import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const imageSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    link: { type: String, required: true },
    gridfsId: String,
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

export type ImageDoc = InferSchemaType<typeof imageSchema> & { _id: mongoose.Types.ObjectId };
export const Image = defineModel<ImageDoc>('Image', imageSchema);
