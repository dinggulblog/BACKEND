import mongoose from 'mongoose';

import { accessSync, constants, unlinkSync } from 'fs';
import { join } from 'path';

const FileSchema = new mongoose.Schema({
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  belonging: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'belongingModel'
  },
  belongingModel: {
    type: String,
    enum: ['User', 'Post', 'Draft', 'Comment']
  },
  originalFileName: {
    type: String,
    required: true
  },
  serverFileName: {
    type: String,
    required: true
  },
  size: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: {
    currentTime: (time = Date.now()) => new Date(time).getTime() - new Date(time).getTimezoneOffset() * 60 * 1000
  },
  versionKey: false
});

FileSchema.post(['deleteOne', 'findOneAndDelete'], async function (doc, next) {
  try {
    const filePath = join(__dirname, 'uploads', doc.serverFileName);
    accessSync(filePath, constants.F_OK);
    unlinkSync(filePath);

    next();
  } catch (error) {
    error.code === 'ENOENT' ? next() : next(error);
  }
});

const fileModel = mongoose.model('File', FileSchema);

/**
 * Built-in model function to create file model instance with params
 * @param {mongoose.Types.ObjectId} uploader 
 * @param {mongoose.Types.ObjectId} belonging 
 * @param {String} belongingModel 
 * @param {Object} file 
 * @returns File object
 */
fileModel.createNewInstance = async function (uploader, belonging, belongingModel, file) {
  return await FileModel.create({
    uploader,
    belonging,
    belongingModel,
    originalFileName: file.originalname,
    serverFileName: file.filename,
    size: file.size
  });
};

export const FileModel = fileModel;