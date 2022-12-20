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
    ref: 'Menu'
  },
  category: {
    type: String,
    default: '기타'
  },
  postNum: {
    type: Number
  },
  title: {
    type: String
  },
  content: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  thumbnail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  },
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: false,
  versionKey: false
});

DraftSchema.index({ author: 1 });

DraftSchema.post('findOneAndDelete', async function (doc, next) {
  try {
    if (!doc || !doc.images) next();

    for await (const image of doc.images) {
      if (image) {
        FileModel.findOneAndDelete(
          { _id: image },
          { lean: true }
        ).exec();
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

DraftSchema.post('updateOne', async function (doc, next) {
  try {
    if (this._update?.$pull?.images) {
      await FileModel.findOneAndDelete(
        { _id: this._update.$pull.images },
        { lean: true }
      ).exec();
    }

    next();
  } catch (error) {
    next(error);
  }
});

export const DraftModel = mongoose.model('Draft', DraftSchema);
