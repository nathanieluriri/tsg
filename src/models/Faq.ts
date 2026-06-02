import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

export type FaqDoc = InferSchemaType<typeof faqSchema> & { _id: mongoose.Types.ObjectId };
export const Faq = defineModel<FaqDoc>('Faq', faqSchema);
