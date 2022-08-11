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
  originalFileName: {
    type: String,
    required: true
  },
  serverFileName: {
    type: String
  },
  size: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
})

const fileModel = mongoose.model('File', FileSchema);

fileModel.createNewInstance = async function (file, uploader, post) {
  return await FileModel.create({
    uploader: uploader,
    post: post,
    originalFileName: file.originalname,
    serverFileName: file.filename,
    size: file.size
  })
}

export const FileModel = fileModel