import mongoose from 'mongoose';

import CommentHandler from './comment.js'
import { UserModel } from '../model/user.js';
import { PostModel } from '../model/post.js';
import { CommentModel } from '../model/comment.js';
import BaseAutoBindedClass from '../base/autobind.js';

class PostHandler extends BaseAutoBindedClass {
  constructor() {
    super();
    this._converTrees = CommentHandler.convertTrees;
  }

  async createPost(req, payload, callback) {
    try {
      const post = await PostModel.create({
        author: payload.sub,
        subject: req.body.subject,
        category: req.body.category,
        title: req.body.title,
        content: req.body.content,
        isPublic: req.body.isPublic
      });

      callback.onSuccess({ post });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getPosts(req, callback) {
    try {
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
          postNum: 1,
          author: { nickname: 1 },
          subject: 1,
          category: 1,
          title: 1,
          content: { $substrCP: ['$content', 0, 200] },
          isPublic: 1,
          createdAt: 1,
          updatedAt: 1,
          likes: 1,
          viewCount: 1,
          likeCount: { $size: '$likes' },
          commentCount: { $size: '$comments' }
        } }
      ]).exec();

      callback.onSuccess({ posts, maxPage });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getPostsWithFilter(req, payload, callback) {
    try {
      const filterQuery = { isActive: true }
      const limit = req.query.limit;
      const skip = (req.query.page - 1) * limit;

      if (req.params.filter === 'like') {
        filterQuery.likes = mongoose.Types.ObjectId(payload.sub) 
      }
      else if (req.params.filter === 'comment') {
        const comments = await CommentModel.find({ commenter: payload.sub }, { post: 1 })
          .sort('-createdAt')
          .skip(skip)
          .limit(limit)
          .lean()
          .exec();

        filterQuery._id = { $in: comments.map(comment => comment.post._id) } 
      }

      const maxPage = Math.ceil(await PostModel.countDocuments(filterQuery) / limit);
      const posts = await PostModel.aggregate([
        { $match: filterQuery },
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
          postNum: 1,
          author: { nickname: 1 },
          subject: 1,
          category: 1,
          title: 1,
          content: { $substrCP: ['$content', 0, 200] },
          isPublic: 1,
          createdAt: 1,
          updatedAt: 1,
          likes: 1,
          viewCount: 1,
          likeCount: { $size: '$likes' },
          commentCount: { $size: '$comments' }
        }}
      ]).exec();

      callback.onSuccess({ posts, maxPage });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getPost(req, callback) {
    try {
      const filter = req.query.id ? { _id: req.query.id } : { postNum: req.query.postNum };
      const post = await PostModel.findOneAndUpdate(filter, { $inc: { viewCount: 1 } }, { new: true })
        .populate('author', { _id: 0, nickname: 1 })
        .lean()
        .exec();

      post.likeCount = post.likes.length

      const comments = await CommentModel.find({ post: post._id })
        .populate('commenter', { _id: 0, nickname: 1 })
        .sort('-createdAt')
        .lean()
        .exec();

      callback.onSuccess({ post, comments: this._converTrees(comments, '_id', 'parentComment', 'childComments') });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updatePost(req, payload, callback) {
    try {
      await PostModel.updateOne(
        { _id: req.params.id, author: payload.sub },
        { $set: req.body }
      ).lean().exec();

      req.query.id = req.params.id;

      return await this.getPost(req, callback);
    } catch (error) {
      callback.onError(error);
    }
  }

  async updatePostLike(req, payload, callback) {
    try {
      const post = await PostModel.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { likes: payload.sub } },
        { new: true, projection: { likes: 1, likeCount: { $size: '$likes' } } }
      ).lean().exec();

      callback.onSuccess({ post });
    } catch (error) {
      callback.onError(error);
    }
  }

  async deletePost(req, payload, callback) {
    try {
      const post = await PostModel.findOneAndRemove(
        { _id: req.params.id, author: payload.sub },
        { projection: { _id: 1 } }
      ).lean().exec();

      callback.onSuccess({ post });
    } catch (error) {
      callback.onError(error);
    }
  }

  async deletePostLike(req, payload, callback) {
    try {
      const post = await PostModel.findByIdAndUpdate(
        req.params.id,
        { $pull: { likes: payload.sub } },
        { new: true, projection: { likes: 1, likeCount: { $size: '$likes' } } }
      ).lean().exec();

      callback.onSuccess({ post });
    } catch (error) {
      callback.onError(error);
    }
  }

  static async #getSearchQuery(queries) {
    const searchQuery = { isActive: true };

    // Menu Query filtering
    if (queries.subjects) {
      searchQuery.subject = queries.subjects.length === 1 ? mongoose.Types.ObjectId(queries.subjects[0]) : { $in: queries.subjects };
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