import { PostModel } from '../model/post.js';
import { FileModel } from '../model/file.js';
import { CommentModel } from '../model/comment.js';

export const cachedPostIds = new Map();

export class PostHandler {
  constructor() {
    this._originalUrl = `${process.env.AWS_S3_URL}/post/`
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

  async getPost(req, payload, callback) {
    try {
      const userId = payload ? new ObjectId(payload.userId) : null;
      const postId = new ObjectId(req.params.id);

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
            { $match: { _id: { $ne: postId }, isActive: true } },
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
            { $project: { avatar: { thumbnail: 1 }, nickname: 1, greetings: 1 } }
          ],
          as: 'author'
        } },
        { $unwind: { path: '$author' } },
        { $lookup: {
          from: 'menus',
          localField: 'menu',
          foreignField: '_id',
          pipeline: [{ $project: { main: 1, sub: 1 } }],
          as: 'menu'
        } },
        { $unwind: { path: '$menu' } },
        { $lookup: {
          from: 'files',
          localField: 'images',
          foreignField: '_id',
          pipeline: [{ $project: { serverFileName: 1, thumbnail: 1 } }],
          as: 'images'
        } },
        { $addFields: {
          liked: { $in: [userId, '$likes'] }
        } },
        { $project: {
          nearIds: 0
        } }
      ]).exec();

      if (post.length) {
        const { _id } = post[0];
        cachedPostIds.has(_id) ? cachedPostIds.set(_id, cachedPostIds.get(_id) + 1) : cachedPostIds.set(_id, 1)
      }

      callback.onSuccess({ post: post[0] ?? null });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getPosts(req, payload, callback) {
    try {
      const userId = payload ? new ObjectId(payload.userId) : null;
      const { skip, limit, sort, searchText } = req.query;

      const query = !searchText
        ? await this.#getMatchQuery(req.query, { loginUserId: userId })
        : this.#getSearchQuery({ sort, searchText });

      const maxCount = !searchText && !skip
        ? await PostModel.countDocuments(query[0].$match)
        : null; // will be updated when using mongo atlas 6.0 (current: 5.0)

      const posts = await PostModel.aggregate([
        ...query,
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
        { $addFields: {
          content: { $substrCP: ['$content', 0, 200] },
          liked: { $in: [userId, '$likes'] },
          commentCount: { $size: '$comments' }
        } },
        { $project: {
          comments: 0,
          images: 0,
          likes: 0
        } }
      ]).exec();

      callback.onSuccess({ posts, maxCount });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getCounts(req, callback) {
    try {
      const counts = await PostModel.aggregate([
        { $group: { _id: '$menu', count: { $sum: 1 } } }
      ]).exec();

      callback.onSuccess({ counts });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updatePost(req, payload, callback) {
    try {
      const { menu, category, title, content, isPublic, thumbnail } = req.body;

      const images = await FileModel.createManyInstancesS3(payload.userId, req.params.id, 'Post', req.files)
      const post = await PostModel.findOneAndUpdate(
        { _id: req.params.id, author: payload.userId },
        {
          $set: { menu, category, title, content, isPublic, thumbnail },
          $addToSet: { images: { $each: images.map(({ _id }) => _id) } }
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
        { _id: req.params.id, likes: { $ne: payload.userId } },
        { $addToSet: { likes: payload.userId },
          $inc: { likeCount: 1 } },
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
        { _id: req.params.id, likes: payload.userId },
        { $pull: { likes: payload.userId },
          $inc: { likeCount: -1 } },
        { lean: true, timestamps: false }
      ).exec();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async deletePostFile(req, payload, callback) {
    try {
      await PostModel.updateOne(
        { _id: req.params.id, author: payload.userId },
        { $pull: { images: req.body.image } },
        { lean: true }
      ).exec();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async #getMatchQuery(queries, { loginUserId, adminId }) {
    const { menus, category, hasThumbnail, filter, userId, sort, likes, comments } = queries;
    const matchQuery = {};
    const sortQuery = {};

    if (menus.length === 1) {
      matchQuery.menu = new ObjectId(menus[0]);
    }
    else if (menus.length > 1) {
      matchQuery.menu = { $in: menus };
    }
    if (!category.includes('전체')) {
      matchQuery.category = category;
    }
    if (hasThumbnail) {
      matchQuery.thumbnail = { $exists: true, $ne: '' };
    }
    if (likes) {
      matchQuery.likes = likes;
    }
    else if (comments) {
      matchQuery._id = { $in: comments };
    }

    // Will be deprecated
    if (filter === 'like') {
      matchQuery.likes = userId;
    }
    else if (filter === 'comment') {
      const comments = await CommentModel.distinct('post', { commenter: userId }).exec();
      matchQuery._id = { $in: comments };
    }

    if (sort === 'like') {
      sortQuery.likeCount = -1;
    }
    else if (sort === 'view') {
      sortQuery.viewCount = -1;
    }

    if (adminId) {
      return [{
        $match: matchQuery,
      }, {
        $sort: { ...sortQuery, createdAt: -1 }
      }];
    }

    if (loginUserId) {
      return [{
        $match: {
          $or: [{ ...matchQuery, isPublic: true, isActive: true }, { author: loginUserId, ...matchQuery, isPublic: false, isActive: true }]
        },
      }, {
        $sort: { ...sortQuery, createdAt: -1 }
      }]
    }

    return [{
      $match: { ...matchQuery, isPublic: true, isActive: true }
    }, {
      $sort: { ...sortQuery, createdAt: -1 }
    }];
  }

  #getSearchQuery({ sort, searchText, loginUserId, adminId }) {
    if (!sort) {
      const textFilter = {
        compound: {
          must: {
            text: {
              path: ['title', 'content'],
              query: searchText
            }
          },
          mustNot: [{
            equals: {
              path: 'isActive',
              value: false
            }
          }, {
            equals: {
              path: 'isPublic',
              value: false
            }
          }],
          should: {
            near: {
              origin: 100000,
              path: 'postNum',
              pivot: 1,
              score: { boost: { value: 999 } }
            }
          }
        }
      };

      if (adminId) delete textFilter.compound.mustNot;

      return [{ $search: textFilter }];
    }

    const sortFilter = {
      compound: {
        filter: {
          text: {
            path: ['title', 'content'],
            query: searchText
          }
        },
        must: {
          near: {
            origin: 100000,
            path: sort === 'view' ? 'viewCount' : 'likeCount',
            pivot: 2
          }
        },
        mustNot: [{
          equals: {
            path: 'isActive',
            value: false
          }
        }, {
          equals: {
            path: 'isPublic',
            value: false
          }
        }],
        should: {
          near: {
            origin: 1000000,
            path: 'postNum',
            pivot: 1,
            score: { boost: { value: 999 } }
          }
        }
      }
    };

    if (adminId) delete sortFilter.compound.mustNot;

    return [{ $search: sortFilter }];
  }
}
