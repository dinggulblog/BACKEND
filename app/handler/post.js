import mongoose from 'mongoose';

import { convertFlatToTree } from '../util/util.js';
import { UserModel } from '../model/user.js';
import { PostModel } from '../model/post.js';
import { FileModel } from '../model/file.js';
import { CommentModel } from '../model/comment.js';

class PostHandler {
  constructor() {
  }

  async createPost(req, payload, callback) {
    try {
      const post = await new PostModel({
        author: payload.sub,
        menu: req.body.menu,
        category: req.body.category,
        title: req.body.title,
        content: req.body.content,
        isPublic: req.body.isPublic,
        thumbnail: req.body?.thumbnail,
        images: req.body?.images
      }).save();

      callback.onSuccess({ post });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getPosts(req, callback) {
    try {
      const limit = req.query.limit;
      const skip = (req.query.page - 1) * limit;

      const searchQuery = await this.#getSearchQuery(req.query, skip, limit);
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
        { $lookup: {
          from: 'files',
          localField: 'thumbnail',
          foreignField: '_id',
          as: 'thumbnail'
        } },
        { $project: {
          postNum: 1,
          author: { nickname: 1 },
          subject: 1,
          category: 1,
          title: 1,
          content: { $substrCP: ['$content', 0, 200] },
          thumbnail: { serverFileName: 1 },
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

  async getPost(req, callback) {
    try {
      const post = await PostModel.findOneAndUpdate(
        { _id: req.params.id },
        { $inc: { viewCount: 1 } },
        { new: true,
          lean: true,
          timestamps: false,
          populate: [
            { path: 'author', select: { _id: 0, nickname: 1, isActive: 1 }, match: { isActive: true } },
            { path: 'images', select: { serverFileName: 1, isActive: 1 }, match: { isActive: true } }
          ] }
        ).exec();

      post.likeCount = post.likes.length

      const comments = await CommentModel.find(
        { post: post._id },
        null,
        { lean: true,
          sort: { createdAt: -1 },
          populate: { path: 'commenter', select: { _id: 0, nickname: 1, isActive: 1 }, match: { isActive: true } } }
        ).exec();

      callback.onSuccess({ post, comments: convertFlatToTree(comments, '_id', 'parentComment', 'childComments') });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updatePost(req, payload, callback) {
    try {
      const images = req.files?.length
        ? await Promise.all(req.files.map(async (file) => await FileModel.createNewInstance(payload.sub, req.params.id, 'post', file)))
        : [];

      const post = await PostModel.findOneAndUpdate(
        { _id: req.params.id, author: payload.sub },
        { $set: req.body, $addToSet: { images: { $each: images.map(image => image._id) } } },
        { new: true,
          lean: true,
          projection: { _id: 1, isActive: 1, thumbnail: 1, images: 1 },
          populate: { path: 'images', select: { serverFileName: 1 }, match: { isActive: true } } }
      ).exec();

      callback.onSuccess({ post });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updatePostLike(req, payload, callback) {
    try {
      const post = await PostModel.findOneAndUpdate(
        { _id: req.params.id },
        { $addToSet: { likes: payload.sub } },
        { new: true,
          lean: true,
          timestamps: false,
          projection: { likes: 1, likeCount: { $size: '$likes' } } }
      ).exec();

      callback.onSuccess({ post });
    } catch (error) {
      callback.onError(error);
    }
  }

  async deletePost(req, payload, callback) {
    try {
      const { modifiedCount } = await PostModel.updateOne(
        { _id: req.params.id, author: payload.sub },
        { $set: { isActive: false } },
        { lean: true }
      ).exec();

      callback.onSuccess({ modifiedCount });
    } catch (error) {
      callback.onError(error);
    }
  }

  async deletePostLike(req, payload, callback) {
    try {
      const post = await PostModel.findOneAndUpdate(
        { _id: req.params.id },
        { $pull: { likes: payload.sub } },
        { new: true,
          lean: true,
          timestamps: false,
          projection: { likes: 1, likeCount: { $size: '$likes' } } }
      ).exec();

      callback.onSuccess({ post });
    } catch (error) {
      callback.onError(error);
    }
  }

  async deletePostFile(req, payload, callback) {
    try {
      await PostModel.updateOne(
        { _id: req.params.id, author: payload.sub },
        { $pull: { images: req.body.image } },
        { lean: true }
      ).exec();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async #getSearchQuery(queries, skip, limit) {
    const searchQuery = { isActive: true };

    if (queries.subjects.length) {
      searchQuery.subject = queries.subjects.length === 1 ? mongoose.Types.ObjectId(queries.subjects[0]) : { $in: queries.subjects };
    }
    if (queries.category) {
      searchQuery.category = queries.category === 'all' ? null : queries.category;
    }
    if (queries.filter === 'like' && queries.nickname) {
      searchQuery.likes = queries.nickname;
    }
    else if (queries.filter === 'comment' && queries.nickname) {
      const comments = await CommentModel.find({ commenter: queries.nickname }, { post: 1, isActive: 1 })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      searchQuery._id = { $in: comments.map(comment => comment.post._id) } 
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