import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  kind: {
    type: String,
    enum: ['avatar', 'thumbnail', 'detail'],
    default: 'detail'
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

const fileModel = mongoose.model('File', FileSchema);

fileModel.createNewInstance = async function (uploader, post, kind, file) {
  return await FileModel.create({
    uploader: uploader,
    post: post,
    kind: kind,
    originalFileName: file.originalname,
    serverFileName: file.filename,
    size: file.size
  });
};

export const FileModel = fileModel;