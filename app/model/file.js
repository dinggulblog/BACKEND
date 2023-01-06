import mongoose from 'mongoose';
import { join } from 'path';
import { accessSync, constants, unlinkSync } from 'fs';
import { deleteS3 } from '../middlewares/multer.js';

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
  storage: {
    type: String,
    enum: ['local', 's3'],
    required: true,
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

FileSchema.post('findOneAndDelete', async function (doc, next) {
  try {
    if (!doc) return next();

    if (doc.storage === 'local') {
      const filePath = join(__dirname, 'uploads', doc.serverFileName);
      accessSync(filePath, constants.F_OK);
      unlinkSync(filePath);
    }

    else if (doc.storage === 's3') {
      deleteS3(doc.serverFileName);
    }

    else {
      throw new Error('파일 삭제 도중 에러가 발생하였습니다.');
    }

    next();
  } catch (error) {
    error.code === 'ENOENT' ? next() : next(error);
  }
});

const fileModel = mongoose.model('File', FileSchema);

/**
 * Built-in model method to create single file instance
 * @param {mongoose.Types.ObjectId} uploader
 * @param {mongoose.Types.ObjectId} belonging
 * @param {String} belongingModel
 * @param {Object} file
 * @returns Single Document
 */
fileModel.createSingleInstance = async function (uploader, belonging, belongingModel, file) {
  if (file && file?.originalname) {
    return await FileModel.create({
      uploader,
      belonging,
      belongingModel,
      storage: file.key ? 's3' : 'local',
      originalFileName: file.originalname,
      serverFileName: file?.filename ?? file.key.split('/')[file.key.split('/').length - 1],
      size: file.size
    });
  };
  return null;
};

/**
 * Built-in model method to create array of file instances
 * @param {mongoose.Types.ObjectId} uploader
 * @param {mongoose.Types.ObjectId} belonging
 * @param {String} belongingModel
 * @param {Object} file
 * @returns Array of Documents
 */
fileModel.createManyInstances = async function (uploader, belonging, belongingModel, files = []) {
  return await FileModel.insertMany(files.map(
    file => ({
      uploader,
      belonging,
      belongingModel,
      storage: file.key ? 's3' : 'local',
      originalFileName: file.originalname,
      serverFileName: file?.filename ?? file.key.split('/')[file.key.split('/').length - 1],
      size: file.size
    })
  ));
};

export const FileModel = fileModel;
