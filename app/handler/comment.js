import { CommentModel } from '../model/comment.js';
import BaseAutoBindedClass from '../base/autobind.js';

class CommentHandler extends BaseAutoBindedClass {
  constructor() {
    super();
  }

  async createComment(req, payload, callback) {
    try {
      await CommentModel.create({
        commenter: payload.sub,
        post: req.params.postId,
        parentComment: req.params?.parentId,
        content: req.body.content,
        isPublic: req.body.isPublic
      });

      return await this.getComments(req, callback);
    } catch (error) {
      callback.onError(error);
    }
  }

  async getComments(req, callback) {
    try {
      const comments = await CommentModel.find({ post: req.params.postId })
        .populate('commenter', { _id: 0, nickname: 1 })
        .sort('-createdAt')
        .lean()
        .exec();

      callback.onSuccess(comments);
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateComment(req, payload, callback) {
    try {
      await CommentModel.findOneAndUpdate(
        { _id: req.params.id, post: req.params.postId, commenter: payload.sub },
        { $set: req.body }
      ).lean().exec();

      return await this.getComments(req, callback);
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteComment(req, payload, callback) {
    try {
      await CommentModel.findOneAndUpdate(
        { _id: req.params.id, post: req.params.postId, commenter: payload.sub },
        { $set: { isActive: false } }
      ).lean().exec();

      return await this.getComments(req, callback);
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