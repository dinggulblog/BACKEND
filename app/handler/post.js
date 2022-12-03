import { UserModel } from '../model/user.js';
import { PostModel } from '../model/post.js';
import { FileModel } from '../model/file.js';
import { CommentModel } from '../model/comment.js';

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
      const { query: { skip, limit } } = req;

      const matchQuery = await this.#getMatchQuery(req.query);
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
        { $unwind: { path: '$thumbnail', preserveNullAndEmptyArrays: true } },
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
      const { query: { skip, limit } } = req;

      const matchQuery = await this.#getMatchQuery(req.query, payload.sub);
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
        { $unwind: { path: '$thumbnail', preserveNullAndEmptyArrays: true } },
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
      const { query: { skip, limit } } = req;

      const matchQuery = await this.#getMatchQuery(req.query, payload.sub)
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
        { $unwind: { path: '$thumbnail', preserveNullAndEmptyArrays: true } },
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
              populate: { path: 'avatar', select: 'serverFileName isActive', match: { isActive: true } } },
            { path: 'images',
              select: { serverFileName: 1, isActive: 1 },
              match: { isActive: true } },
            { path: 'likes',
              model: 'User',
              select: { avatar: 1, nickname: 1, isActive: 1 },
              perDocumentLimit: 10,
              populate: { path: 'avatar', select: 'serverFileName isActive', match: { isActive: true } } }
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
        { lean: true }
      ).exec();

      callback.onSuccess({ post, images });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updatePostLike(req, payload, callback) {
    try {
      await PostModel.updateOne(
        { _id: req.params.id },
        { $addToSet: { likes: payload.sub } },
        { lean: true, timestamps: false }
      ).exec();

      callback.onSuccess({});
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

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async deletePostLike(req, payload, callback) {
    try {
      await PostModel.updateOne(
        { _id: req.params.id },
        { $pull: { likes: payload.sub } },
        { lean: true, timestamps: false }
      ).exec();

      callback.onSuccess({});
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

  async #getMatchQuery(queries, loginUserId = null) {
    const matchQuery = {};
    const { menu, category, filter, userId, skip, limit } = queries;

    if (Array.isArray(menu) && menu.length) {
      matchQuery.menu = { $in: menu };
    }
    if (category) {
      matchQuery.category = category;
    }
    if (filter === 'like') {
      matchQuery.likes = userId;
    }
    else if (filter === 'comment') {
      const comments = await CommentModel.find(
        { commenter: userId },
        { post: 1 },
        { skip: skip, limit: limit, lean: true }
      ).exec();

      matchQuery._id = { $in: comments.map(comment => comment.post) };
    }

    if (loginUserId) {
      matchQuery.$or = [
        { isPublic: true, isActive: true, ...matchQuery },
        { isPublic: false, isActive: true, ...matchQuery, author: loginUserId }
      ];
    }
    else {
      matchQuery.isPublic = true;
      matchQuery.isActive = true;
    }

    return matchQuery;
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
