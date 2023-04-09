import mongoose from 'mongoose';

import { FileModel } from './file.js';

const DraftSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true
  },
  category: {
    type: String,
    default: '기타'
  },
  postNum: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    required: true,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  thumbnail: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  versionKey: false
});

DraftSchema.index({ author: 1 });

/* Will be updated
DraftSchema.post('findOneAndDelete', async function (doc, next) {
  try {
    if (!doc || !doc.images.length) next();

    for await (const image of doc.images) {
      FileModel.findOneAndDelete(
        { _id: image, belonging: doc._id, belongingModel: 'Draft' },
        { lean: true }
      ).exec();
    }

    next();
  } catch (error) {
    next(error);
  }
});
*/

export const DraftModel = mongoose.model('Draft', DraftSchema);
