const POST_VALIDATION_SCHEMA = () => {
  return {
    'menu': {
      isMongoId: {
        bail: true,
        errorMessage: '게시물의 메뉴 ID가 올바르지 않습니다.'
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
      toArray: true,
      customSanitizer: {
        options: (menus) => menus.map(menuId => ObjectId.isValid(menuId) ? ObjectId(menuId) : null).filter(Boolean)
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
        errorMessage: 'Available filtering words: like, comment'
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
        errorMessage: 'Skip must be an integer greater than 0'
      }
    },
    'limit': {
      toInt: true,
      isInt: {
        options: [{ min: 1 }],
        errorMessage: 'Limit must be an integer greater than 1'
      }
    },
    'searchText': {
      optional: { options: { nullable: true } },
      trim: true,
      isString: {
        options: [{ min: 2, max: 30 }],
        errorMessage: 'Search text must be between 2 and 30 chars long'
      }
    }
  };
};

export default {
  POST_VALIDATION_SCHEMA,
  POSTS_PAGINATION_SCHEMA
};
