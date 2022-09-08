import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  belonging: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'belongModel',
    required: true
  },
  belongModel: {
    type: String,
    enum: ['user', 'post', 'draft', 'comment']
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

FileSchema.post('updateOne', async function (doc, next) {
  try {
    const deleted = await FileModel.findOneAndDelete(
      this._conditions,
      { lean: true, projection: { serverFileName: 1 } }
    ).exec();
    
    

    next();
  } catch (error) {
    next(error);
  }
});

FileSchema.post('updateMany', async function (doc, next) {
  try {

    next();
  } catch (error) {
    next(error);
  }
})

const fileModel = mongoose.model('File', FileSchema);

fileModel.createNewInstance = async function (uploader, belonging, belongModel, file) {
  return await FileModel.create({
    uploader: uploader,
    belonging: belonging,
    belongModel: belongModel,
    originalFileName: file.originalname,
    serverFileName: file.filename,
    size: file.size
  });
};

export const FileModel = fileModel;