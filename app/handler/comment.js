import { convertFlatToTree } from '../util/util.js';
import { CommentModel } from '../model/comment.js';

class CommentHandler {
  constructor() {
  }

  async createComment(req, payload, callback) {
    try {
      const comment = await CommentModel.create({
        commenter: payload.userId,
        post: req.params.postId,
        parentComment: req.body.parentId,
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
          sort: { createdAt: 1 },
          populate: {
            path: 'commenter',
            select: { avatar: 1, nickname: 1, isActive: 1 },
            populate: { path: 'avatar', select: 'thumbnail', match: { isActive: true } }
          }
        }
      ).exec();

      callback.onSuccess({
        comments: convertFlatToTree(comments, '_id', 'parentComment', 'childComments', 'childCommentCount'),
        commentCount: comments.length
      });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateComment(req, payload, callback) {
    try {
      const { content, isPublic, isActive } = req.body;
      await CommentModel.updateOne(
        { _id: req.params.id, commenter: payload.userId },
        { $set: { content, isPublic, isActive } },
        { lean: true }
      ).exec();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteComment(req, payload, callback) {
    try {
      const childComment = await CommentModel.findOne(
        { parentComment: req.params.id },
        { _id: 1 },
        { lean: true }
      ).exec();

      const comment = childComment
        ? await CommentModel.findOneAndUpdate({ _id: req.params.id }, { $set: { isActive: false } }, { new: true, lean: true }).exec()
        : await CommentModel.findOneAndDelete({ _id: req.params.id }, { new: true, lean: true }).exec();

      callback.onSuccess({ comment });
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default CommentHandler;
