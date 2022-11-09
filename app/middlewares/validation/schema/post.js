import mongoose from 'mongoose';
import escapeHtml from 'escape-html';
import { CommentModel } from '../../../model/comment.js';

const { ObjectId } = mongoose.Types;

const POST_VALIDATION_SCHEMA = () => {
  return {
    'menu': {
      isMongoId: { bail: true }
    },
    'category': {
      customSanitizer: {
        options: category => category ? String(category) : undefined
      }
    },
    'isPublic': {
      customSanitizer: { 
        options: value => value ? Boolean(value) : true
      }
    },
    'title': {
      customSanitizer: {
        options: title => escapeHtml(title)
      },
      isLength: { 
        options: [{ min: 1, max: 150 }],
        errorMessage: 'Post title must be between 1 and 150 chars long'
      }
    },
    'content': {
      customSanitizer: {
        options: content => escapeHtml(content)
      },
      isLength: { 
        options: [{ max: 10000 }],
        errorMessage: 'Post content must be under 10000 chars long'
      }
    },
    'thumbnail': {
      optional: { options: { nullable: true } },
      isMongoId: true
    }
  };
};

const POSTS_PAGINATION_SCHEMA = () => {
  return {
    'menu': {
      toArray: true,
      customSanitizer: {
        options: (menus) => menus.map(menu => ObjectId.isValid(menu) ? ObjectId(menu) : null)
      }
    },
    'category': {
      toString: true,
      customSanitizer: {
        options: (category) => category ? decodeURI(category) : '전체'
      }
    },
    'page': {
      toInt: true,
      isInt: { 
        options: [{ min: 1 }],
        errorMessage: 'Page must be an integer greater than 1'
      }
    },
    'limit': {
      toInt: true,
      isInt: { 
        options: [{ min: 1, max: 10 }],
        errorMessage: 'Limit must be an integer between 1 and 10'
      }
    },
    'skip': {
      customSanitizer: {
        options: (v, { req }) => (req.query.page - 1) * req.query.limit
      }
    },
    'filter': {
      optional: { options: { nullable: true } },
      matches: {
        options: [/\b(?:like|comment)\b/],
        errorMessage: 'Available filtering words: like, comment'
      }
    },
    'userId': {
      customSanitizer: {
        options: (userId, { req }) => {
          if (!userId) return;
          else if (req.query.filter === 'like') {
            req.query.likes = userId;
          }
          else if (req.query.filter === 'comment') {
            CommentModel.find(
              { commenter: userId },
              { post: 1, isActive: 1 },
              { skip: req.query.skip, limit: req.query.limit, lean: true }
            ).exec().then(comments => { req.query._id = { $in: comments.map(comment => comment.post) } });
          }
        }
      }
    }
  };
};

const POSTS_SEARCH_SCHEMA = () => {
  return {
    'searchType': {
      optional: { options: { nullable: true } }
    },
    'searchText': {
      optional: { options: { nullable: true } },
      isString: { 
        options: [{ min: 2, max: 30 }],
        errorMessage: 'Search text must be between 2 and 30 chars long'
      }
    }
  };
};

export default { 
  POST_VALIDATION_SCHEMA,
  POSTS_PAGINATION_SCHEMA,
  POSTS_SEARCH_SCHEMA
};