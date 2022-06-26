import mongoose from 'mongoose';
import { param, checkSchema, validationResult, check } from 'express-validator';

import CommentHandler from './comment.js'
import { UserModel } from '../model/user.js';
import { PostModel } from '../model/post.js';
import { CommentModel } from '../model/comment.js';
import BaseAutoBindedClass from '../base/autobind.js';
import InvalidRequestError from '../error/invalid-request.js';
import NotFoundError from '../error/not-found.js';

class PostHandler extends BaseAutoBindedClass {
  constructor() {
    super();
    this._converTrees = CommentHandler.convertTrees;
  }

  static get POST_VALIDATION_SCHEMA() {
    return {
      'subject': {
        optional: { options: { nullable: true } },
        isMongoId: { errorMessage: 'Invalid subject ID' },
      },
      'category': {
        optional: { options: { nullable: true } },
        isString: { errorMessage: 'Invalid category' }
      },
      'title': {
        notEmpty: true,
        isLength: { options: [{ min: 1, max: 150 }] },
        errorMessage: 'Post title must be between 1 and 150 chars long'
      },
      'content': {
        notEmpty: true,
        isLength: { options: [{ min: 1, max: 5000 }] },
        errorMessage: 'Post content must be between 1 and 5000 chars long'
      },
      'isPublic': {
        optional: { options: { nullable: true } },
        isBoolean: true,
        toBoolean: true,
        errorMessage: 'Invalid post isPublic provided'
      }
    };
  }

  static get POSTS_PAGINATION_SCHEMA() {
    return {
      'subject': {
        optional: { options: { nullable: true } },
        customSanitizer: { options: value => mongoose.Types.ObjectId(value) }
      },
      'category': {
        optional: { options: { nullable: true } },
        isString: { errorMessage: 'Invalid category' }
      },
      'page': {
        customSanitizer: { options: value => value ? value : 1 },
        isInt: { options: [{ min: 1, max: Number.MAX_SAFE_INTEGER }] },
        toInt: true,
        errorMessage: 'Page must be an integer greater than 1'
      },
      'limit': {
        customSanitizer: { options: value => value ? value : 10 },
        isInt: { options: [{ min: 1, max: 20 }] },
        toInt: true,
        errorMessage: 'Limit must be an integer between 1 and 20'
      },
      'searchType': {
        optional: { options: { nullable: true } },
        isString: true,
        toString: false,
        errorMessage: 'Invalid search type provided'
      },
      'searchText': {
        optional: { options: { nullable: true } },
        isString: { options: [{ min: 3, max: 100 }] },
        toString: true,
        errorMessage: 'Search text must be between 3 and 100 chars long'
      }
    }
  }

  async createPost(req, token, callback) {
    try {
      await checkSchema(PostHandler.POST_VALIDATION_SCHEMA, ['body']).run(req);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors: ' + errorMessages.join(' && '));
      }

      const newPost = await PostModel.create({
        author: token.id,
        subject: req.body.subject,
        category: req.body?.category,
        title: req.body.title,
        content: req.body.content,
        isPublic: req.body?.isPublic
      });

      callback.onSuccess(newPost);
    } catch (error) {
      callback.onError(error);
    }
  }

  async getPosts(req, callback) {
    try {
      await checkSchema(PostHandler.POSTS_PAGINATION_SCHEMA, ['query']).run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors:' + errorMessages.join(' && '));
      }

      const searchQuery = await PostHandler.#getSearchQuery(req.query);
      const limit = req.query.limit;
      const skip = (req.query.page - 1) * limit;

      const maxPage = Math.ceil(await PostModel.countDocuments(searchQuery) / limit);
      const posts = await PostModel.aggregate([
        { $match: searchQuery },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        } },
        { $unwind: '$author' },
        { $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post',
          as: 'comments'
        } },
        { $project: {
          author: { nickname: 1 },
          category: 1,
          postNum: 1,
          title: 1,
          content: { $substrCP: ['$content', 0, 100] },
          isPublic: 1,
          createdAt: 1,
          updatedAt: 1,
          viewCount: 1,
          commentCount: { $size: '$comments' }
        }}
      ]).exec();

      callback.onSuccess({
        posts,
        maxPage
      });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getPost(req, callback) {
    try {
      await param('id').notEmpty().isMongoId().run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors:' + errorMessages.join(' && '));
      }

      const post = await PostModel.findByIdAndUpdate(
        req.params.id,
        { $inc: { viewCount: 1} },
        { new: true }
      ).populate('author', { _id: 0, nickname: 1 }).lean().exec();
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      const comments = await CommentModel.find({ post: post._id })
        .populate('commenter', { nickname: 1 })
        .sort('-createdAt')
        .lean()
        .exec();

      callback.onSuccess({
        post,
        comments: this._converTrees(comments, '_id', 'parentComment', 'childComments')
      });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updatePost(req, token, callback) {
    try {
      await param('id').notEmpty().isMongoId().run(req);
      await checkSchema(PostHandler.POST_VALIDATION_SCHEMA).run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors:' + errorMessages.join(' && '));
      }

      const updatedPost = await PostModel.findOneAndUpdate(
        { _id: req.params.id, author: token.id },
        { $set: req.body },
        { new: true }
      ).populate('author', { _id: 0, nickname: 1 }).lean().exec();
      if (!updatedPost) {
        throw new NotFoundError('Post not found');
      }

      callback.onSuccess(updatedPost);
    } catch (error) {
      callback.onError(error);
    }
  }

  async deletePost(req, token, callback) {
    try {
      await param('id').notEmpty().isMongoId().run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors:' + errorMessages.join(' && '));
      }

      const deletedPost = await PostModel.findOneAndRemove(
        { _id: req.params.id, author: token.id }
      ).lean().exec();
      if (!deletedPost) {
        throw new NotFoundError('Post not found');
      }

      callback.onSuccess(deletedPost);
    } catch (error) {
      callback.onError(error);
    }
  }

  static async #getSearchQuery(queries) {
    const searchQuery = {};

    // Menu Query filtering
    if (queries.subject) {
      searchQuery.subject = queries.subject;
    }
    if (queries.category) {
      searchQuery.category = queries.category;
    }

    // Search Query filtering
    if (queries.searchType && queries?.searchText.length >= 3) {
      const searchTypes = queries.searchType.toLowerCase().split('+').map(elem => elem.trim());
      const searchQuries = [];

      if (searchTypes.indexOf('title') >= 0) {
        searchQuries.push({ title: { $regex: new RegExp(queries.searchText, 'i') } });
      }
      if (searchTypes.indexOf('body') >= 0) {
        searchQuries.push({ body: { $regex: new RegExp(queries.searchText, 'i') } });
      }
      if (searchTypes.indexOf('author!') >= 0) {
        const user = await UserModel.findOne({ nickname: queries.searchText }).lean().exec();
        if (user) searchQuries.push({ author: user.id });
      }
      else if (searchTypes.indexOf('author') >= 0) {
        const users = await UserModel.find({ nickname: { $regex: new RegExp(queries.searchText, 'i') } }).lean().exec();
        users.forEach(user => { if (user) searchQuries.push({ author: { $in: user.id } }) });
      }

      if (searchQuries.length > 0) {
        searchQuery.$or = searchQuries;
      }
    }

    return searchQuery;    
  }
}

export default PostHandler;