import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { defineModel } from './_helpers';

const commentResponseSchema = new Schema(
  {
    comment: { type: Schema.Types.ObjectId, ref: 'Comment', required: true, index: true },
    response: { type: String, required: true },
    author: String,
    email: String,
    _oldId: { type: Number, index: true, sparse: true },
  },
  { timestamps: true },
);

export type CommentResponseDoc = InferSchemaType<typeof commentResponseSchema> & { _id: mongoose.Types.ObjectId };
export const CommentResponse = defineModel<CommentResponseDoc>('CommentResponse', commentResponseSchema);
