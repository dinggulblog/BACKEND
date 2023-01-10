import { UserModel } from '../model/user.js';
import { PostModel } from '../model/post.js';
import { FileModel } from '../model/file.js';
import { CommentModel } from '../model/comment.js';

class PostHandler {
  constructor() {
    this.cachedPostIds = [];
    this.uploadUrl = process.env.NODE_ENV === 'develop' ? 'http://localhost:3000/uploads/' : `${process.env.S3_URL}thumbnail/`;
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

  async getPosts(req, payload, callback) {
    try {
      const { query: { skip, limit } } = req;
      const userId = payload ? ObjectId(payload.userId) : null;

      const matchQuery = await this.#getMatchQuery(req.query, userId);
      const maxPage = !skip ? await PostModel.countDocuments(matchQuery) : null;
      const posts = await PostModel.aggregate([
        { $match: matchQuery },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          pipeline: [{ $project: { nickname: 1 } }],
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
          pipeline: [{ $project: { serverFileName: 1 } }],
          as: 'thumbnail'
        } },
        { $unwind: { path: '$thumbnail', preserveNullAndEmptyArrays: true } },
        { $addFields: {
          thumbnail: { $concat: [this.uploadUrl, '$thumbnail.serverFileName'] },
          content: { $substrCP: ['$content', 0, 200] },
          liked: { $in: [userId, '$likes'] },
          likeCount: { $size: '$likes' },
          commentCount: { $size: '$comments' }
        } },
        { $project: {
          comments: 0,
          images: 0,
          likes: 0
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
      const maxPage = !skip ? await PostModel.countDocuments(matchQuery) : null;
      const posts = await PostModel.aggregate([
        { $match: matchQuery },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          pipeline: [{ $project: { nickname: 1 } }],
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
          pipeline: [{ $project: { serverFileName: 1 } }],
          as: 'thumbnail'
        } },
        { $unwind: { path: '$thumbnail', preserveNullAndEmptyArrays: true } },
        { $addFields: {
          thumbnail: { $concat: [this.uploadUrl, '$thumbnail.serverFileName'] },
          content: { $substrCP: ['$content', 0, 200] },
          liked: { $in: [userId, '$likes'] },
          likeCount: { $size: '$likes' },
          commentCount: { $size: '$comments' }
        } },
        { $project: {
          comments: 0,
          images: 0,
          likes: 0
        } }
      ]).exec();

      callback.onSuccess({ posts, maxPage });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getPost(req, payload, callback) {
    try {
      const userId = payload ? ObjectId(payload.userId) : null;
      const postId = ObjectId(req.params.id);
      const post = await PostModel.aggregate([
        { $setWindowFields: {
          partitionBy: { menu: '$menu', category: '$category' },
          sortBy: { createdAt: -1 },
          output: { nearIds: { $addToSet: '$_id', window: { documents: [-1, 1] } } }
        } },
        { $match: { _id: postId } },
        { $limit: 1 },
        { $lookup: {
          from: 'posts',
          localField: 'nearIds',
          foreignField: '_id',
          pipeline: [
            { $match: { _id: { $ne: postId } } },
            { $project: { title: { $substrCP: ['$title', 0, 50] }, rel: { $cond: [{ $lt: ['$_id', postId] }, 'prev', 'next'] } } }
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
            { $unwind: { path: '$avatar', preserveNullAndEmptyArrays: true } },
            { $project: { avatar: { thumbnail: { $concat: [this.uploadUrl, '$avatar.serverFileName'] } }, nickname: 1, greetings: 1 } }
          ],
          as: 'author'
        } },
        { $unwind: { path: '$author' } },
        { $lookup: {
          from: 'files',
          localField: 'images',
          foreignField: '_id',
          pipeline: [{ $project: { thumbnail: { $concat: [this.uploadUrl, '$serverFileName'] } } }],
          as: 'images'
        } },
        { $set: {
          viewCount: { $add: ['$viewCount', 1] }
        } },
        { $addFields: {
          liked: { $in: [userId, '$likes'] },
          likeCount: { $size: '$likes' }
        } },
        { $project: {
          nearIds: 0
        } }
      ]).exec();

      if (post.length) this.cachedPostIds.push(post[0]._id)

      callback.onSuccess({ post: post.shift() ?? null });
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

  async #getMatchQuery(queries, loginUserId) {
    const matchQuery = {};
    const { menu, category, hasThumbnail, filter, userId } = queries;

    if (Array.isArray(menu) && menu.length) {
      matchQuery.menu = { $in: menu };
    }
    if (category && category !== '전체') {
      matchQuery.category = category;
    }
    if (hasThumbnail) {
      matchQuery.thumbnail = { $exists: true, $ne: null }
    }
    if (filter === 'like') {
      matchQuery.likes = userId;
    }
    else if (filter === 'comment') {
      const comments = await CommentModel.find(
        { commenter: userId },
        { post: 1 },
        { lean: true }
      ).exec();

      matchQuery._id = { $in: comments.map(comment => comment.post) };
    }

    if (loginUserId) {
      return { $or: [
        { isPublic: true, isActive: true, ...matchQuery },
        { author: loginUserId, isPublic: false, isActive: true, ...matchQuery }
      ] }
    }

    return { isPublic: true, isActive: true, ...matchQuery }
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

  async #increaseViewCount() {

  }
}

export default PostHandler;
