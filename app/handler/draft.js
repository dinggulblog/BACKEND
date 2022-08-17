import { DraftModel } from '../model/draft.js';
import { FileModel } from '../model/file.js';

class DraftHandler {
  constructor() {

  }

  async createDraft(req, payload, callback) {
    try {
      const draft = await new DraftModel({ author: payload.sub }).save({ validateBeforeSave: false });

      callback.onSuccess({ draft });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getDraft(req, payload, callback) {
    try {
      const draft = await DraftModel.findOne(
        { author: payload.sub, isActive: true }
      ).lean().exec();

      callback.onSuccess({ draft });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateDraft(req, payload, callback) {
    try {
      const images = Array.isArray(req.files) && req.files.length
        ? await Promise.all(req.files.map(async (file) => await FileModel.createNewInstance(payload.sub, req.params.id, 'detail', file)))
        : undefined;

      const draft = await DraftModel.findOneAndUpdate(
        { author: payload.sub, isActive: true },
        { $set: req.body, $addToSet: { images: { $each: images?.map(image => image._id) ?? [] } } },
        { new: true,
          lean: true,
          projection: { _id: 1, isActive: 1, images: 1 },
          populate: { path: 'images', select: { serverFileName: 1 }, match: { isActive: true } } }
      ).exec();

      callback.onSuccess({ draft });
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteDraft(req, payload, callback) {
    try {
      await DraftModel.updateOne(
        { author: payload.sub },
        { $set: { isActive: false } },
        { new: true, lean: true }
      ).exec();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteDraftFile(req, payload, callback) {
    try {
      const { modifiedCount } = await DraftModel.updateOne(
        { author: payload.sub },
        { $pull: { images: req.body.image } },
        { new: true, lean: true }
      ).exec();

      if (modifiedCount) {
        await FileModel.updateOne(
          { _id: req.body.image },
          { $set: { isActive: false } },
          { lean: true }
        ).exec();
      }

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default DraftHandler;