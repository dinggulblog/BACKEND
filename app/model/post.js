import mongoose from 'mongoose';

import { CounterModel } from './counter.js';
import { MenuModel } from './menu.js';
import { FileModel } from './file.js';
import ForbiddenError from '../error/forbidden.js';

const PostSchema = new mongoose.Schema({
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
  viewCount: {
    type: Number,
    default: 0
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
  timestamps: {
    currentTime: (time = Date.now()) => new Date(time).getTime() - new Date(time).getTimezoneOffset() * 60 * 1000
  },
  versionKey: false
});

PostSchema.index({ menu: 1, createdAt: -1 });

PostSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const counter = await CounterModel.findOneAndUpdate(
        { menu: this.menu },
        { $set: { name: 'Posts' }, $inc: { count: 1 } },
        { new: true, upsert: true, lean: true }
      ).exec();

      this.postNum = counter.count;
    }
    next();
  } catch (error) {
    next(error);
  }
});

PostSchema.post(['save', 'findOneAndUpdate'], async function (doc, next) {
  try {
    if (this._update.$addToSet) {
      doc.images.forEach(async (image) =>
        await FileModel.updateOne(
          { _id: image },
          { $set: { belonging: doc._id, belongingModel: 'Post' } },
          { lean: true }
        ).exec()
      )
    }

    if (this._update.$set?.category) {
      await MenuModel.updateOne(
        { _id: this.menu },
        { $addToSet: { categories: this.category } },
        { lean: true }
      ).exec();
    }
    
    next();
  } catch (error) {
    next(error);
  }
})

PostSchema.post('updateOne', async function (doc, next) {
  try {
    if (!doc.isActive) {
      await FileModel.updateMany(
        { belonging: this._id },
        { $set: { isActive: false } },
        { lean: true }
      ).exec();
    }

    next();
  } catch (error) {
    next(error);
  }
});

PostSchema.post(['findOne', 'findOneAndUpdate'], function (doc, next) {
  if (!doc.isActive) next(new ForbiddenError('본 게시물은 삭제되었거나 비활성화 상태입니다.'));
  next();
});

PostSchema.post('findOneAndDelete', async function (doc, next) {
  try {
    doc.images.forEach(async (image) => 
      await FileModel.findOneAndDelete(
        { _id: image },
        { lean: true }
      ).exec()
    );
    
    next();
  } catch (error) {
    next(error);
  }
});

export const PostModel = mongoose.model('Post', PostSchema);