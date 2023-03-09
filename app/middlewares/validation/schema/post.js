import { MenuModel } from '../../../model/menu.js';

const POST_VALIDATION_SCHEMA = () => {
  return {
    'main': {
      toString: true
    },
    'sub': {
      custom: {
        options: async (sub, { req }) => {
          const menu = await MenuModel.findOne(
            { main: req.body.main, sub: sub },
            { _id: 1 },
            { lean: true }
          ).exec();

          if (!menu) return Promise.reject('게시물 메뉴가 올바르지 않습니다.');

          req.body.menu = menu._id;
          return true
        }
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
      trim: true,
      isLength: {
        options: [{ min: 1, max: 150 }],
        errorMessage: '게시물 제목은 1자 이상 150자 이내로 작성해 주세요.'
      }
    },
    'content': {
      trim: true,
      isLength: {
        options: [{ max: 10000 }],
        errorMessage: '게시물 내용은 최대 10000자까지 가능합니다.'
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
    'menus': {
      toArray: true
    },
    'menus.*': {
      isMongoId: {
        bail: true,
        errorMessage: '메뉴 ID가 올바르지 않습니다.'
      },
      customSanitizer: {
        options: (menu) => new ObjectId(menu)
      }
    },
    'category': {
      toString: true,
      customSanitizer: {
        options: (category) => !!category ? decodeURI(category).trim() : null
      }
    },
    'hasThumbnail': {
      toBoolean: true
    },
    'filter': {
      optional: { options: { nullable: true, checkFalsy: true } },
      matches: {
        options: [/\b(?:like|comment)\b/],
        errorMessage: '사용 가능한 필터링: like, comment'
      }
    },
    'userId': {
      optional: { options: { nullable: true, checkFalsy: true } },
      customSanitizer: {
        options: (id) => id && ObjectId.isValid(id) ? ObjectId(id) : null
      }
    },
    'skip': {
      toInt: true,
      isInt: {
        options: [{ min: 0 }],
        errorMessage: 'Skip 값은 0보다 큰 정수가 필요합니다.'
      }
    },
    'limit': {
      toInt: true,
      isInt: {
        options: [{ min: 1 }],
        errorMessage: 'Limit 값은 1보다 큰 정수가 필요합니다.'
      }
    },
    'searchText': {
      optional: { options: { nullable: true } },
      trim: true,
      isString: {
        options: [{ min: 2, max: 255 }],
        errorMessage: '검색어는 최소 2글자 이상, 최대 255글자 이내로 작성해 주세요.'
      },
      customSanitizer: {
        options: (text) => !!text ? decodeURI(text) : null
      }
    }
  };
};

export default {
  POST_VALIDATION_SCHEMA,
  POSTS_PAGINATION_SCHEMA
};
