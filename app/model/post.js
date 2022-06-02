import mongoose from 'mongoose';
import { CounterModel } from './counter.js';

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
    type: String
  },
  postNum: {
    type: Number
  },
  title: {
    type: String,
    required: [true, 'Title is required!']
  },
  content: {
    type: String,
    required: [true, 'Content is required!']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  attachment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  },
  likes: [{
    likedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, { timestamps: true, versionKey: false });

PostSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      let counter = await CounterModel.findOne({ name: 'posts' }).exec();
      if (!counter) counter = await CounterModel.create({ name: 'posts' });
      
      counter.count++;
      await counter.save();
      this.postNum = counter.count;
      next();
    }
  } catch (error) {
    next(error);
  }
});

PostSchema.index({ subject: 1, createdAt: -1 });

export const PostModel = mongoose.model('Post', PostSchema);