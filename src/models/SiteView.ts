import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const siteViewSchema = new Schema(
  {
    count: { type: Number, default: 0 },
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

export type SiteViewDoc = InferSchemaType<typeof siteViewSchema> & { _id: mongoose.Types.ObjectId };
export const SiteView = defineModel<SiteViewDoc>('SiteView', siteViewSchema);

export async function incrementSiteViews(): Promise<void> {
  await SiteView.findOneAndUpdate({}, { $inc: { count: 1 } }, { upsert: true, new: true });
}
