import { FileModel } from '../model/file.js';

class FileHandler {
  constructor() {
    this._FileModel = FileModel;
  }

  async createFile(req, payload, callback) {
    try {
      const { id, model } = req.body;

      const file = await this._FileModel.createSingleInstanceS3(payload.userId, id, model, req.file);

      callback.onSuccess({ file });
    } catch (error) {
      callback.onError(error);
    }
  }

  async createFiles(req, payload, callback) {
    try {
      const { id, model } = req.body;

      const files = await this._FileModel.createManyInstancesS3(payload.userId, id, model, req.files);

      callback.onSuccess({ files });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getFile(req, payload, callback) {
    try {
      const { fileId } = req.params;

      const file = await this._FileModel.findOne({ _id: fileId })
        .lean()
        .exec();

      callback.onSuccess({ file });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getFiles(req, payload, callback) {
    try {
      const { belongingId } = req.params;

      const files = await this._FileModel.find({ belonging: belongingId })
        .lean()
        .exec();

      callback.onSuccess({ files });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateFile(req, payload, callback) {
    try {

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateFiles(req, payload, callback) {
    try {

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteFile(req, payload, callback) {
    try {

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default FileHandler;
