import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const eventSchema = new Schema(
  {
    name: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    description: { type: String, required: true },
    status: { type: Boolean, default: false },
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

export type EventDoc = InferSchemaType<typeof eventSchema> & { _id: mongoose.Types.ObjectId };
export const EventModel = defineModel<EventDoc>('Event', eventSchema);
