import { DraftModel } from '../model/draft.js';
import { FileModel } from '../model/file.js';

class DraftHandler {
  constructor() {
  }

  async createDraft(req, payload, callback) {
    try {
      const { menu, category, title, content, isPublic, thumbnail } = req.body;
      const id = new ObjectId();

      const images = await FileModel.createManyInstancesS3(payload.userId, id, 'Draft', req.files);
      const draft = await new DraftModel({
        _id: id,
        author: payload.userId,
        menu,
        category,
        title,
        content,
        isPublic,
        thumbnail,
        images: images.map(({ _id }) => _id)
      }).save({ validateBeforeSave: false });

      callback.onSuccess({ draft, images });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getDraft(req, payload, callback) {
    try {
      const draft = await DraftModel.findOne(
        { author: payload.userId, isActive: true },
        null,
        {
          lean: true,
          populate: [{
            path: 'menu',
            select: { main: 1, sub: 1 },
          }, {
            path: 'images', select: { serverFileName: 1, thumbnail: 1 }, match: { isActive: true }
          }]
        }
      ).exec();

      callback.onSuccess({ draft });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateDraft(req, payload, callback) {
    try {
      const { menu, category, title, content, isPublic, thumbnail } = req.body;

      const images = await FileModel.createManyInstancesS3(payload.userId, req.params.id, 'Draft', req.files)
      const draft = await DraftModel.findOneAndUpdate(
        { _id: req.params.id, author: payload.userId },
        {
          $set: { menu, category, title, content, isPublic, thumbnail },
          $addToSet: { images: { $each: images.map(({ _id }) => _id) } }
        },
        { new: true, lean: true }
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
