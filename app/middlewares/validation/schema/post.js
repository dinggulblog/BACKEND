import mongoose from 'mongoose';
import { MenuModel } from '../../../model/menu.js';
import { UserModel } from '../../../model/user.js'

const POST_VALIDATION_SCHEMA = () => {
  return {
    'subject': {
      custom: {
        options: async (value) => await MenuModel.findById(value).select('_id').lean().exec() === null ? Promise.reject('Invalid Subject ID') : true
      }
    },
    'category': {
      customSanitizer: { 
        options: value => value ? String(value) : undefined
      }
    },
    'title': {
      isLength: { 
        options: [{ min: 1, max: 150 }],
        errorMessage: 'Post title must be between 1 and 150 chars long'
      }
    },
    'content': {
      isLength: { 
        options: [{ max: 10000 }],
        errorMessage: 'Post content must be under 10000 chars long'
      }
    },
    'thumbnail': {
      optional: { options: { nullable: true } }
    },
    'images': {
      customSanitizer: { 
        options: value => undefined
      }
    },
    'isPublic': {
      customSanitizer: { 
        options: value => value ? Boolean(value) : true
      }
    }
  };
};

const POSTS_PAGINATION_SCHEMA = () => {
  return {
    'subjects': {
      toArray: true
    },
    'subjects.*': {
      customSanitizer: { 
        options: value => mongoose.Types.ObjectId(value)
      },
    },
    'category': {
      optional: { options: { nullable: true } }
    },
    'filter': {
      optional: { options: { nullable: true } },
      isString: true,
      matches: {
        options: [/\b(?:like|comment)\b/],
        errorMessage: 'Available filtering words: like, comment'
      }
    },
    'nickname': {
      optional: { options: { nullable: true } },
      customSanitizer: {
        options: async (nickname) => {
          const user = await UserModel.findOne({ nickname }, { isActive: 1 }).lean().exec();
          return user._id;
        }
      }
    },
    'page': {
      toInt: true,
      isInt: { 
        options: [{ min: 1, max: Number.MAX_SAFE_INTEGER }],
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
    'searchType': {
      optional: { options: { nullable: true } }
    },
    'searchText': {
      optional: { options: { nullable: true } },
      isString: { 
        options: [{ min: 2, max: 100 }],
        errorMessage: 'Search text must be between 2 and 100 chars long'
      }
    }
  };
};

export default { 
  POST_VALIDATION_SCHEMA,
  POSTS_PAGINATION_SCHEMA
};