import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const subscriptionSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

export type SubscriptionDoc = InferSchemaType<typeof subscriptionSchema> & { _id: mongoose.Types.ObjectId };
export const Subscription = defineModel<SubscriptionDoc>('Subscription', subscriptionSchema);
