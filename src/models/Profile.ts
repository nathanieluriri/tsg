import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const profileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    state: String,
    lga: String,
    ward: String,
    vid: String,
    address: String,
    zone: String,
    organization: String,
    headquarter: String,
    orgAddress: String,
    position: String,
    stateOrigin: String,
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

export type ProfileDoc = InferSchemaType<typeof profileSchema> & { _id: mongoose.Types.ObjectId };
export const Profile = defineModel<ProfileDoc>('Profile', profileSchema);
