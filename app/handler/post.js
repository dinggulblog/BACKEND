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
        author: payload.userId,
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
          author: { nickname: 1 },
          thumbnail: { serverFileName: 1 },
          menu: 1,
          category: 1,
          title: 1,
          content: { $substrCP: ['$content', 0, 200] },
          isActive: 1,
          isPublic: 1,
          createdAt: 1,
          updatedAt: 1,
          viewCount: 1,
          liked: { $literal: false },
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

      const matchQuery = await this.#getMatchQuery(req.query, payload.userId);
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
          author: { nickname: 1 },
          thumbnail: { serverFileName: 1 },
          menu: 1,
          category: 1,
          title: 1,
          content: { $substrCP: ['$content', 0, 200] },
          isPublic: 1,
          createdAt: 1,
          updatedAt: 1,
          viewCount: 1,
          liked: { $in: [ObjectId(payload.userId), '$likes'] },
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

      const matchQuery = await this.#getMatchQuery(req.query, payload.userId)
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
          author: { nickname: 1 },
          thumbnail: { serverFileName: 1 },
          menu: 1,
          category: 1,
          title: 1,
          content: { $substrCP: ['$content', 0, 200] },
          isPublic: 1,
          createdAt: 1,
          updatedAt: 1,
          viewCount: 1,
          liked: { $in: [ObjectId(payload.userId), '$likes'] },
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
      const post = await PostModel.aggregate([
        { $setWindowFields: {
            partitionBy: { menu: '$menu', category: '$category' },
            sortBy: { createdAt: -1 },
            output: {
              nearIds: {
                $addToSet: '$_id',
                window: { documents: [-1, 1] }
              }
            }
          }
        },
        { $match: { _id: ObjectId(req.params.id) } },
        { $limit: 1 },
        { $lookup: {
          from: 'posts',
          localField: 'nearIds',
          foreignField: '_id',
          pipeline: [
            { $match: { _id: { $ne: ObjectId(req.params.id) } } },
            { $project: { title: { $substrCP: ['$title', 0, 50] }, rel: { $cond: [{ $lt: ['$_id', ObjectId(req.params.id)] }, 'prev', 'next'] } } }
          ],
          as: 'linkedPosts'
        } },
        { $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          pipeline: [
            { $lookup: {
              from: 'files',
              localField: 'avatar',
              foreignField: '_id',
              as: 'avatar'
            } },
            { $project: { avatar: { serverFileName: 1 }, nickname: 1, greetings: 1 } }
          ],
          as: 'author'
        } },
        { $unwind: '$author' },
        { $unwind: '$author.avatar' },
        { $lookup: {
          from: 'files',
          localField: 'images',
          foreignField: '_id',
          pipeline: [
            { $project: { serverFileName: 1 } }
          ],
          as: 'images'
        } },
        { $addFields: {
          likeCount: { $size: '$likes' }
        } },
        { $project: {
          nearIds: 0
        } }
      ]).exec();

      callback.onSuccess({ post: post[0] ?? null });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updatePost(req, payload, callback) {
    try {
      const { menu, category, title, content, isPublic, thumbnail } = req.body;

      const images = await FileModel.createManyInstances(payload.userId, req.params.id, 'Post', req.files)
      const post = await PostModel.findOneAndUpdate(
        { _id: req.params.id, author: payload.userId },
        {
          $set: { menu, category, title, content, isPublic, thumbnail },
          $addToSet: { images: { $each: images.map(image => image._id) } }
        },
        { new: true, lean: true }
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
        { $addToSet: { likes: payload.userId } },
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
        { _id: req.params.id, author: payload.userId },
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
        { $pull: { likes: payload.userId } },
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
        { _id: req.params.id, author: payload.userId },
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
    const { menu, category, hasThumbnail, filter, userId, skip, limit } = queries;

    if (Array.isArray(menu) && menu.length) {
      matchQuery.menu = { $in: menu };
    }
    if (category && category !== '전체') {
      matchQuery.category = category;
    }
    if (hasThumbnail) {
      matchQuery.thumbnail = { $ne: null }
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
      return { $or: [
        { isPublic: true, isActive: true, ...matchQuery },
        { author: ObjectId(loginUserId), isPublic: false, isActive: true, ...matchQuery }
      ] }
    }
    else {
      return { isPublic: true, isActive: true, ...matchQuery }
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
