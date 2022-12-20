import { DraftModel } from '../model/draft.js';
import { FileModel } from '../model/file.js';

class DraftHandler {
  constructor() {
  }

  async createDraft(req, payload, callback) {
    try {
      const { menu, category, title, content, isPublic, thumbnail } = req.body;

      const draft = await new DraftModel({
        author: payload.userId,
        menu,
        category,
        title,
        content,
        isPublic,
        thumbnail
      }).save({ validateBeforeSave: false });

      if (req.files) {
        const images = await FileModel.createManyInstances(payload.userId, draft._id, 'Draft', req.files)
        draft.images = images.map(image => image._id)
        await draft.save({ validateBeforeSave: false })

        return callback.onSuccess({ draft, images })
      }

      callback.onSuccess({ draft, images: null });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getDraft(req, payload, callback) {
    try {
      const draft = await DraftModel.findOne(
        { author: payload.userId, isActive: true },
        null,
        { lean: true,
          populate: { path: 'images', select: { serverFileName: 1 } } }
      ).exec();

      callback.onSuccess({ draft });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateDraft(req, payload, callback) {
    try {
      const { menu, category, title, content, isPublic, thumbnail } = req.body;

      const images = await FileModel.createManyInstances(payload.userId, req.params.id, 'Draft', req.files)
      const draft = await DraftModel.findOneAndUpdate(
        { _id: req.params.id, author: payload.userId },
        {
          $set: { menu, category, title, content, isPublic, thumbnail },
          $addToSet: { images: { $each: images.map(image => image._id) } }
        },
        { lean: true }
      ).exec();

      callback.onSuccess({ draft, images });
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteDraft(req, payload, callback) {
    try {
      await DraftModel.findOneAndDelete(
        { _id: req.params.id, author: payload.userId },
        { lean: true }
      ).exec();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteDraftFile(req, payload, callback) {
    try {
      await DraftModel.updateOne(
        { _id: req.params.id, author: payload.userId },
        { $pull: { images: req.body.image } },
        { new: true, lean: true }
      ).exec();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default DraftHandler;
