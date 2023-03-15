import mongoose from 'mongoose';

import { CounterModel } from './counter.js';
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
  viewCount: {
    type: Number,
    default: 0
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

PostSchema.index({ author: 1 });
PostSchema.index({ menu: 1, createdAt: -1 });

// 게시물 저장 전 게시물 넘버링
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

// 게시물이 정상적으로 저장되면, 게시물에 포함될 파일들의 belonging을 게시물 ID로 수정
PostSchema.post('save', async function (doc, next) {
  try {
    if (doc.images.length) {
      for await (const image of doc.images) {
        FileModel.updateOne(
          { _id: image },
          { $set: { belonging: doc._id, belongingModel: 'Post' } },
          { lean: true }
        ).exec();
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

PostSchema.post(['findOneAndUpdate', 'updateOne'], async function (doc, next) {
  try {
    if (!doc) {
      next(new ForbiddenError('존재하지 않는 게시물입니다.'))
    }

    next();
  } catch (error) {
    next(error);
  }
});

export const PostModel = mongoose.model('Post', PostSchema);
