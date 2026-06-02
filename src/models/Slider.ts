import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const sliderSchema = new Schema(
  {
    image: { type: Schema.Types.ObjectId, ref: 'Image', required: true },
    status: { type: String, enum: ['0', '1'], default: '0' },
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

export type SliderDoc = InferSchemaType<typeof sliderSchema> & { _id: mongoose.Types.ObjectId };
export const Slider = defineModel<SliderDoc>('Slider', sliderSchema);
