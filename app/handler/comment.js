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

      const file = req.file ? await FileModel.createNewInstance(payload.sub, comment._id, 'comment', req.file) : undefined;

      if (file) {
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
          populate: [
            { path: 'commenter', select: { _id: 0, nickname: 1, isActive: 1 } },
            { path: 'image', select: { serverFileName: 1, isActive: 1 }, match: { isActive: true } }
          ]
        }
      ).exec();

      callback.onSuccess({ comments: CommentHandler.convertTrees(comments, '_id', 'parentComment', 'childComments') });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateComment(req, payload, callback) {
    try {
      const image = req.file ? await FileModel.createNewInstance(payload.sub, req.params.id, 'comment', req.file) : undefined;

      if (image) {
        req.body.image = image._id;
      }

      const comment = await CommentModel.findOneAndUpdate(
        { _id: req.params.id, commenter: payload.sub },
        { $set: req.body },
        { new: false,
          lean: true }
      ).exec();

      if (image && comment.image !== image._id) {
        await FileModel.updateOne(
          { _id: comment.image },
          { $set: { isActive: false } },
          { lean: true }
        ).exec();
      }

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

  static convertTrees(array = [], idFieldName, parentIdFieldName, childrenFieldName) {
    const cloned = array.slice();
  
    for (let i = cloned.length - 1; i > -1 ; i--) {
      const parentId = cloned[i][parentIdFieldName];
      if (parentId) {
        const filtered = array.filter(elem => elem[idFieldName].toString() === parentId.toString());
        if (filtered.length) {
          const parent = filtered[0];
          parent[childrenFieldName]
            ? parent[childrenFieldName].unshift(cloned[i])
            : parent[childrenFieldName] = [cloned[i]];
        }
        cloned.splice(i, 1);
      }
    }

    return cloned;
  }
}

export default CommentHandler;