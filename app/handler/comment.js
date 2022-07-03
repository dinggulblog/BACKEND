import { param, checkSchema, validationResult } from 'express-validator';

import { PostModel } from '../model/post.js';
import { CommentModel } from '../model/comment.js';
import BaseAutoBindedClass from '../base/autobind.js';
import InvalidRequestError from '../error/invalid-request.js';
import NotFoundError from '../error/not-found.js';

class CommentHandler extends BaseAutoBindedClass {
  constructor() {
    super();
  }

  static get POSTID_VALIDATION_SCHEMA() {
    return {
      'pid': {
        notEmpty: { errorMessage: 'No Post ID passed in params' },
        custom: {
          options: async (value) => {
            const post = await PostModel.findById(value).lean().exec();
            if (!post) return Promise.reject(new NotFoundError('Post not found'));
          }
        }
      }
    }
  }

  static get COMMENT_VALIDATION_SCHEMA() {
    return {
      'parentComment': {
        optional: { options: { nullable: true } },
        isMongoId: { errorMessage: 'Invalid parent comment ID' },
        errorMessage: 'Invalid parent comment ID provided'
      },
      'content': {
        notEmpty: true,
        isLength: {
          options: [{ min: 1, max: 1000 }],
          errorMessage: 'Comment content must be between 1 and 1000 chars long'
        },
        errorMessage: 'Invalid Comment content'
      },
      'isPublic': {
        optional: { options: { nullable: true } },
        isBoolean: true,
        toBoolean: true,
        errorMessage: 'Invalid isPublic provided'
      }
    };
  }

  async createComment(req, payload, callback) {
    try {
      await checkSchema(CommentHandler.POSTID_VALIDATION_SCHEMA, ['params']).run(req);
      await checkSchema(CommentHandler.COMMENT_VALIDATION_SCHEMA, ['body']).run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors: ' + errorMessages.join(' && '));
      }

      const newComment = await CommentModel.create({
        commenter: payload.sub,
        post: req.params.pid,
        parentComment: req.body?.parentComment,
        content: req.body.content,
        isPublic: req.body?.isPublic
      });

      callback.onSuccess(newComment);
    } catch (error) {
      callback.onError(error);
    }
  }

  async getComments(req, callback) {
    try {
      await checkSchema(CommentHandler.POSTID_VALIDATION_SCHEMA, ['params']).run(req);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors:' + errorMessages.join(' && '));
      }

      const comments = await CommentModel.find({ post: req.params.pid })
        .populate('commenter', { nickname: 1 })
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
      await param('cid', 'Invalid comment ID provided').notEmpty().isMongoId().run(req);
      await checkSchema(CommentHandler.POSTID_VALIDATION_SCHEMA, ['params']).run(req);
      await checkSchema(CommentHandler.COMMENT_VALIDATION_SCHEMA, ['body']).run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors:' + errorMessages.join(' && '));
      }

      const updatedComment = await CommentModel.findOneAndUpdate(
        { _id: req.params.cid, post: req.params.pid, commenter: payload.sub },
        { $set: req.body },
        { new: true }
      ).lean().exec();
      if (!updatedComment) {
        throw new NotFoundError('Comment not found');
      }

      callback.onSuccess(updatedComment);
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteComment(req, payload, callback) {
    try {
      await param('cid', 'Invalid comment ID provided').notEmpty().isMongoId().run(req);
      await checkSchema(CommentHandler.POSTID_VALIDATION_SCHEMA, ['params']).run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors:' + errorMessages.join(' && '));
      }

      const deletedComment = await CommentModel.findOneAndRemove(
        { _id: req.params.cid, post: req.params.pid, commenter: payload.sub }
      ).lean().exec();
      if (!deletedComment) {
        throw new NotFoundError('Post not found');
      }

      callback.onSuccess(deletedComment);
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