import mongoose from 'mongoose';
import { MenuModel } from './menu.js';
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
  isActive: {
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true, versionKey: false });

PostSchema.index({ postNum: 1 });
PostSchema.index({ subject: 1, createdAt: -1 });

PostSchema.pre('save', async function (next) {
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

PostSchema.post(['save', 'updateOne'], async function (res, next) {
  try {
    console.log('Post Updated')

    await MenuModel.updateOne(
      { _id: res.subject },
      { $addToSet: { categories: res.category } },
      { runValidators: true }
    ).lean().exec();

    next();
  } catch (error) {
    next(error);
  }
});

export const PostModel = mongoose.model('Post', PostSchema);