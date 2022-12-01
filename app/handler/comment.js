import { convertFlatToTree } from '../util/util.js';
import { CommentModel } from '../model/comment.js';

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
        {
          lean: true,
          timestamps: false,
          sort: {
            createdAt: 1
          },
          populate: {
            path: 'commenter',
            select: { avatar: 1, nickname: 1, isActive: 1 },
            populate: { path: 'avatar', select: 'serverFileName isActive', match: { isActive: true } }
          }
        }
      ).exec();

      callback.onSuccess({ comments: convertFlatToTree(comments, '_id', 'parentComment', 'childComments'), commentCount: comments.length });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateComment(req, payload, callback) {
    try {
      const { content, isPublic, isActive } = req.body;
      await CommentModel.updateOne(
        { _id: req.params.id, commenter: payload.sub },
        { $set: {
          content, isPublic, isActive
        } },
        { lean: true }
      ).exec();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteComment(req, payload, callback) {
    try {
      await CommentModel.deleteOne(
        { _id: req.params.id, commenter: payload.sub },
        { lean: true }
      ).exec();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default CommentHandler;
