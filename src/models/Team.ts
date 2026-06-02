import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const teamSchema = new Schema(
  {
    name: { type: String, required: true },
    role: String,
    photo: { type: Schema.Types.ObjectId, ref: 'Image' },
    bio: String,
    order: { type: Number, default: 0 },
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

export type TeamDoc = InferSchemaType<typeof teamSchema> & { _id: mongoose.Types.ObjectId };
export const Team = defineModel<TeamDoc>('Team', teamSchema);
