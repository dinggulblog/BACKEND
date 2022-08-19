import mongoose from 'mongoose';
import { FileModel } from './file.js';

const DraftSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
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

DraftSchema.index({ author: 1 });

DraftSchema.pre('save', async function (next) {
  try {
    const { matchedCount } = await DraftModel.updateMany(
      { author: this.author },
      { $set: { isActive: false } },
      { lean: true }
    ).exec();

    if (matchedCount > 2) {
      await DraftModel.findOneAndRemove(
        { author: this.author, isActive: false },
        { lean: true, sort: { _id: 1 } }
      ).exec();
    }

    next();
  } catch (error) {
    next(error);
  }
});

DraftSchema.post('updateOne', async function (doc, next) {
  try {
    if (!doc.isActive) {
      await FileModel.updateMany(
        { post: this._id },
        { $set: { isActive: false } },
        { lean: true }
      ).exec();
    }

    next();
  } catch (error) {
    next(error);
  }
});

DraftSchema.pre('findOneAndRemove', async function (next) {
  try {
    await FileModel.deleteMany(
      { post: this._id },
      { lean: true }
    ).exec();

    next();
  } catch (error) {
    next(error);
  }
});

export const DraftModel = mongoose.model('Draft', DraftSchema);