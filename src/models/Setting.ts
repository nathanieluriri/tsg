import mongoose, { Schema, type InferSchemaType, type Model, type HydratedDocument } from 'mongoose';

const settingSchema = new Schema(
  {
    title: String,
    description: String,
    keywords: String,
    mission: String,
    vision: String,
    coreValues: String,
    email: String,
    phone: String,
    address: String,
    bankName: String,
    accountName: String,
    accountNumber: String,
    logo: String,
    fbLink: String,
    twLink: String,
    igLink: String,
    ytLink: String,
    maintenanceMode: { type: Boolean, default: false },
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

export type SettingDoc = InferSchemaType<typeof settingSchema> & { _id: mongoose.Types.ObjectId };
export type SettingHydrated = HydratedDocument<SettingDoc>;

interface SettingStatics {
  getOrCreate(): Promise<SettingHydrated>;
}

settingSchema.statics.getOrCreate = async function () {
  const existing = await this.findOne();
  if (existing) return existing;
  return this.create({ title: 'Tinubu Support Group' });
};

type SettingModel = Model<SettingDoc> & SettingStatics;

export const Setting: SettingModel =
  (mongoose.models.Setting as SettingModel) ||
  mongoose.model<SettingDoc, SettingModel>('Setting', settingSchema);
