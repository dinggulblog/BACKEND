import mongoose from 'mongoose';
import escapeHtml from 'escape-html';

const { ObjectId } = mongoose.Types;

const POST_VALIDATION_SCHEMA = () => {
  return {
    'menu': {
      isMongoId: {
        bail: true,
        errorMessage: 'Invalide menu ID!'
      }
    },
    'category': {
      customSanitizer: {
        options: category => !!category ? String(category).trim() : '기타'
      }
    },
    'isPublic': {
      toBoolean: true
    },
    'title': {
      isLength: {
        options: [{ min: 1, max: 150 }],
        errorMessage: 'Post title must be between 1 and 150 chars long'
      },
      customSanitizer: {
        options: title => escapeHtml(title)
      }
    },
    'content': {
      isLength: {
        options: [{ max: 10000 }],
        errorMessage: 'Post content must be under 10000 chars long'
      },
      customSanitizer: {
        options: content => escapeHtml(content)
      }
    },
    'thumbnail': {
      customSanitizer: {
        options: (value) => ObjectId.isValid(value) ? ObjectId(value) : undefined
      },
    }
  };
};

const POSTS_PAGINATION_SCHEMA = () => {
  return {
    'menu': {
      toArray: true,
      customSanitizer: {
        options: (menu) => menu.map(menuId => ObjectId.isValid(menuId) ? ObjectId(menuId) : null).filter(Boolean)
      }
    },
    'category': {
      toString: true,
      customSanitizer: {
        options: (category) => !!category ? decodeURI(category).trim() : null
      }
    },
    'filter': {
      matches: {
        options: [/\b(?:like|comment)\b/],
        errorMessage: 'Available filtering words: like, comment'
      },
      optional: { options: { nullable: true } },
    },
    'userId': {
      isMongoId: true,
      optional: { options: { nullable: true } }
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
