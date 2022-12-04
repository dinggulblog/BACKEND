import mongoose from 'mongoose';

import { CounterModel } from './counter.js';
import { DraftModel } from './draft.js';
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
    ref: 'File',
    default: null
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

// 게시물 저장 전 게시물 넘버링(카운터)을 위한 훅
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

// 게시물이 정상적으로 저장되면, 게시물에 포함될 File Documents의 belonging field를 게시물 ID로 수정 및
// 임시저장된 글 삭제
PostSchema.post('save', async function (doc, next) {
  try {
    if (this.isNew) {
      if (doc.images.length) {
        for await (const image of doc.images) {
          FileModel.updateOne(
            { _id: image },
            { $set: { belonging: doc._id, belongingModel: 'Post' } },
            { lean: true }
          ).exec()
        }
      }

      await DraftModel.findOneAndDelete(
        { author: doc.author },
        { lean: true }
      ).exec();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// findOneAndUpdate -> 게시물 받기
PostSchema.post('findOneAndUpdate', async function (doc, next) {
  try {
    if (!doc) {
      next(new ForbiddenError('존재하지 않는 게시물입니다.'))
    }
    else if (!doc.isActive) {
      next(new ForbiddenError('본 게시물은 삭제되었거나 비활성화 상태입니다.'))
    }
    else if (this.getPopulatedPaths().includes('author') && !doc.author.isActive) {
      next(new ForbiddenError('비활성화 유저의 게시물입니다.'));
    }

    // 게시물에 포함될 File Documents의 belonging field를 게시물 ID로 수정
    if (this._update?.$addToSet?.images) {
      for await (const image of doc.images) {
        FileModel.updateOne(
          { _id: image },
          { $set: { belonging: doc._id, belongingModel: 'Post' } },
          { lean: true }
        ).exec()
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// 게시물이 삭제된 경우 이미지 삭제 CASCADE
PostSchema.post('findOneAndDelete', async function (doc, next) {
  try {
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

export const PostModel = mongoose.model('Post', PostSchema);
