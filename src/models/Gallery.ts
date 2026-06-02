import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const gallerySchema = new Schema(
  {
    image: { type: Schema.Types.ObjectId, ref: 'Image', required: true },
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

export type GalleryDoc = InferSchemaType<typeof gallerySchema> & { _id: mongoose.Types.ObjectId };
export const Gallery = defineModel<GalleryDoc>('Gallery', gallerySchema);
