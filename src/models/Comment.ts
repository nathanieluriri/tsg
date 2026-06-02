import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    author: String,
    email: String,
    commentBody: { type: String, required: true },
    status: { type: String, enum: ['0', '1'], default: '0' },
    ipAddress: String,
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

export type CommentDoc = InferSchemaType<typeof commentSchema> & { _id: mongoose.Types.ObjectId };
export const Comment = defineModel<CommentDoc>('Comment', commentSchema);
