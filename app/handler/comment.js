import { convertFlatToTree } from '../util/util.js';
import { CommentModel } from '../model/comment.js';
import { FileModel } from '../model/file.js';

class CommentHandler {
  constructor() {
  }

  async createComment(req, payload, callback) {
    try {
      const comment = await CommentModel.create({
        commenter: payload.sub,
        post: req.params.postId,
        parentComment: req.params?.parentId,
        content: req.body.content,
        isPublic: req.body.isPublic
      });

      if (req.file) {
        const file = await FileModel.createNewInstance(payload.sub, comment._id, 'comment', req.file);
        await comment.updateOne({ $set: { image: file._id } }, { lean: true }).exec();
      }

      callback.onSuccess({ comment });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getComments(req, callback) {
    try {
      const comments = await CommentModel.find(
        { post: req.params.postId },
        null,
        { lean: true,
          sort: { createdAt: -1 },
          populate: { path: 'commenter', select: { _id: 0, nickname: 1, isActive: 1 } } }
      ).exec();

      callback.onSuccess({ comments: convertFlatToTree(comments, '_id', 'parentComment', 'childComments') });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateComment(req, payload, callback) {
    try {
      if (req.file) {
        const image = await FileModel.createNewInstance(payload.sub, req.params.id, 'comment', req.file);
        req.body.image = image._id;
      }

      await CommentModel.updateOne(
        { _id: req.params.id, commenter: payload.sub },
        { $set: req.body },
        { new: false,
          lean: true }
      ).exec();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteComment(req, payload, callback) {
    try {
      await CommentModel.updateOne(
        { _id: req.params.id, commenter: payload.sub },
        { $set: { isActive: false } },
        { lean: true }
      ).exec();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default CommentHandler;