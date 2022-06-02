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

const FileModel = mongoose.model('File', FileSchema);

FileModel.createNewInstance = async function (file, uploader, post) {
  return await FileModel.create({
    uploader: uploader,
    post: post,
    originalFileName: file.originalFileName,
    serverFileName: file.fileName,
    size: file.size
  })
}

export default FileModel