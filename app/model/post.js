import mongoose from 'mongoose';

import { CounterModel } from './counter.js';
import { MenuModel } from './menu.js';
import { FileModel } from './file.js';
import { DraftModel } from './draft.js';

const PostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
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

PostSchema.index({ subject: 1, createdAt: -1 });

PostSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      let counter = await CounterModel.findOne({ subject: this.subject, name: 'posts' }).exec();
      if (!counter) counter = await CounterModel.create({ subject: this.subject, name: 'posts' });
      
      counter.count++;
      await counter.save();
      this.postNum = counter.count;

      next();
    }
  } catch (error) {
    next(error);
  }
});

PostSchema.post('save', async function (res, next) {
  try {
    await MenuModel.updateOne(
      { _id: res.subject },
      { $addToSet: { categories: res.category } },
      { lean: true }
    ).exec();

    await DraftModel.updateOne(
      { author: res.author._id, isActive: true },
      { $set: { isActive: false } },
      { lean: true }
    ).exec();

    next();
  } catch (error) {
    next(error);
  }
});

PostSchema.post('updateOne', async function (res, next) {
  try {
    if (!res.isActive) {
      await FileModel.updateMany(
        { post: res._id },
        { $set: { isActive: false } },
        { lean: true }
      ).exec();
    }

    next();
  } catch (error) {
    next(error);
  }
});

export const PostModel = mongoose.model('Post', PostSchema);