import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  commenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  content: {
    type: String,
    required: [true, 'Content is required!']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, { toObject: { virtuals: true }, timestamps: true, versionKey: false });

CommentSchema.virtual('id')
  .get(function () { return this._id });

CommentSchema.virtual('childComments')
  .get(function () { return this._childComments })
  .set(function (value) { this._childComments = value });

CommentSchema.index({ post: 1, createdAt: -1 });

export const CommentModel = mongoose.model('Comment', CommentSchema);