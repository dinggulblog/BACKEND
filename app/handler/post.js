import { UserModel } from '../model/user.js';
import { PostModel } from '../model/post.js';
import { FileModel } from '../model/file.js';
import mongoose from 'mongoose';

class PostHandler {
  constructor() {
  }

  async createPost(req, payload, callback) {
    try {
      const { menu, category, title, content, isPublic, thumbnail, images } = req.body;
      const post = await new PostModel({
        author: payload.sub,
        menu,
        category,
        title,
        content,
        isPublic,
        thumbnail,
        images
      }).save();

      callback.onSuccess({ post });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getPosts(req, callback) {
    try {
      const { query: { skip, limit }, paginationQuery } = req;
      const matchQuery = { isActive: true, isPublic: true, ...paginationQuery };

      const maxPage = Math.ceil(await PostModel.countDocuments(matchQuery) / limit);
      const posts = await PostModel.aggregate([
        { $match: matchQuery },
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
          author: { _id: 1, nickname: 1 },
          menu: 1,
          category: 1,
          title: 1,
          content: { $substrCP: ['$content', 0, 200] },
          thumbnail: { _id: 1, serverFileName: 1 },
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

  async getPostsAsUser (req, payload, callback) {
    try {
      const { query : { skip, limit }, paginationQuery } = req;
      const matchQuery = {
        $or: [
          { isPublic: true, isActive: true, ...paginationQuery },
          { isPublic: false, isActive: true, author: mongoose.Types.ObjectId(payload.sub), ...paginationQuery }
        ]
      }

      const maxPage = Math.ceil(await PostModel.countDocuments(matchQuery) / limit);
      const posts = await PostModel.aggregate([
        { $match: matchQuery },
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
          author: { _id: 1, nickname: 1 },
          menu: 1,
          category: 1,
          title: 1,
          content: { $substrCP: ['$content', 0, 200] },
          thumbnail: { _id: 1, serverFileName: 1 },
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

  async getPostsAsAdmin (req, payload, callback) {
    try {
      const { query: { skip, limit }, paginationQuery } = req;

      const maxPage = Math.ceil(await PostModel.countDocuments(paginationQuery) / limit);
      const posts = await PostModel.aggregate([
        { $match: paginationQuery },
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
          author: { _id: 1, nickname: 1 },
          menu: 1,
          category: 1,
          title: 1,
          content: { $substrCP: ['$content', 0, 200] },
          thumbnail: { _id: 1, serverFileName: 1 },
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
          populate: [
            { path: 'author',
              select: { avatar: 1, nickname: 1, greetings: 1, isActive: 1 },
              populate: { path: 'avatar', select: 'serverFileName', match: { isActive: true } } },
            { path: 'images',
              select: { serverFileName: 1, isActive: 1 },
              match: { isActive: true } },
            { path: 'likes',
              select: { nickname: 1 },
              perDocumentLimit: 10 }
          ] }
        ).exec();

      callback.onSuccess({
        post,
        likes: post.likes,
        likeCount: post.likes.length
      });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updatePost(req, payload, callback) {
    try {
      const { menu, category, title, content, isPublic, thumbnail } = req.body;

      const images = await FileModel.createManyInstances(payload.sub, req.params.id, 'Draft', req.files)
      const post = await PostModel.findOneAndUpdate(
        { _id: req.params.id, author: payload.sub },
        {
          $set: { menu, category, title, content, isPublic, thumbnail },
          $addToSet: { images: { $each: images.map(image => image._id) } }
        },
        { new: true,
          lean: true,
          populate: { path: 'images', select: { serverFileName: 1, isActive: 1 }, match: { isActive: true } } }
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
          projection: { likes: 1, likeCount: { $size: '$likes' } },
          populate: { path: 'likes', select: { nickname: 1 }, perDocumentLimit: 10 }
        }
      ).exec();

      callback.onSuccess({ likes: post.likes, likeCount: post.likeCount });
    } catch (error) {
      callback.onError(error);
    }
  }

  async deletePost(req, payload, callback) {
    try {
      await PostModel.updateOne(
        { _id: req.params.id, author: payload.sub },
        { $set: { isActive: false } },
        { new: true, lean: true }
      ).exec();

      callback.onSuccess({ });
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
          projection: { likes: 1, likeCount: { $size: '$likes' } },
          populate: { path: 'likes', select: { nickname: 1 }, perDocumentLimit: 10 }
        }
      ).exec();

      callback.onSuccess({ likes: post.likes, likeCount: post.likeCount });
    } catch (error) {
      callback.onError(error);
    }
  }

  async deletePostFile(req, payload, callback) {
    try {
      const { modifiedCount } = await PostModel.updateOne(
        { _id: req.params.id, author: payload.sub },
        { $pull: { images: req.body.image } },
        { lean: true }
      ).exec();

      if (modifiedCount) {
        await FileModel.findOneAndDelete(
          { _id: req.body.image },
          { lean: true }
        ).exec();
      }

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async #getSearchQuery(queries) {
    const searchQuery = {};

    if (queries.searchType && queries?.searchText.length >= 2) {
      const searchTypes = queries.searchType.toLowerCase().split('+').map(elem => elem.trim());
      const searchQuries = [];

      if (searchTypes.indexOf('title') >= 0) {
        searchQuries.push({ title: { $regex: new RegExp(queries.searchText, 'i') } });
      }
      if (searchTypes.indexOf('content') >= 0) {
        searchQuries.push({ content: { $regex: new RegExp(queries.searchText, 'i') } });
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
