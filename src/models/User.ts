import mongoose, { Schema, type InferSchemaType, type Model, type HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS, ROLES, type Role } from '@/lib/config';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    emailVerifiedAt: { type: Date, default: null },
    password: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'member' },
    rememberToken: { type: String, default: null },
    isBlocked: { type: Boolean, default: false },
    status: { type: String, default: '0' },
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } },
);

userSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password.startsWith('$2y$') || this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  next();
});

interface UserMethods {
  comparePassword(plain: string): Promise<boolean>;
  hasRole(role: Role): boolean;
}

userSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.hasRole = function (role: Role): boolean {
  return this.role === role;
};

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export type UserHydrated = HydratedDocument<UserDoc, UserMethods>;
type UserModel = Model<UserDoc, Record<string, never>, UserMethods>;

export const User: UserModel =
  (mongoose.models.User as UserModel) ||
  mongoose.model<UserDoc, UserModel>('User', userSchema);
