import { MenuModel } from '../../../model/menu.js';
import { UserModel } from '../../../model/user.js';
import { CommentModel } from '../../../model/comment.js';

const POST_VALIDATION_SCHEMA = () => {
  return {
    'main': {
      toString: true
    },
    'sub': {
      custom: {
        options: async (sub, { req }) => {
          try {
            const menu = await MenuModel.findOne({ main: req.body.main, sub: sub }, { _id: 1 }, { lean: true }).exec();
            req.body.menu = menu._id;
            return true
          } catch (error) {
            return Promise.reject('게시물 메뉴가 올바르지 않습니다.');
          }
        }
      }
    },
    'category': {
      toString: true,
      customSanitizer: {
        options: category => category ? category.trim() : '기타'
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
      optional: { options: { nullable: true, checkFalsy: true } },
      isString: true
    }
  };
};

const POSTS_PAGINATION_SCHEMA = () => {
  return {
    'skip': {
      toInt: true,
      isInt: {
        options: [{ min: 0, max: 255 }],
        errorMessage: 'Skip 값은 0보다 큰 정수가 필요합니다.'
      }
    },
    'limit': {
      toInt: true,
      isInt: {
        options: [{ min: 1, max: 255 }],
        errorMessage: 'Limit 값은 1보다 큰 정수가 필요합니다.'
      }
    },
    'menus': {
      toArray: true,
      isArray: {
        options: [{ max: 10 }],
        errorMessage: '메뉴는 최대 10개까지 선택 가능합니다.'
      }
    },
    'menus.*': {
      isMongoId: {
        bail: true,
        errorMessage: '메뉴 ID가 올바르지 않습니다.',
      },
      customSanitizer: {
        options: (menu) => new ObjectId(menu)
      }
    },
    'category': {
      customSanitizer: {
        options: (category) => category ? decodeURI(category).trim() : '전체'
      },
      isLength: {
        options: [{ min: 1, max: 20 }],
        errorMessage: '카테고리는 0 ~ 20글자 이내로 적어주세요(비어있다면 전체로 간주합니다).'
      }
    },
    'hasThumbnail': {
      optional: { options: { nullable: true, checkFalsy: true } },
      toLowerCase: true,
      isIn: {
        options: [['true', 'false']],
        errorMessage: '썸네일 여부는 비어있거나 true 또는 false 이어야 합니다(비어있다면 false로 간주합니다).'
      },
      customSanitizer: {
        options: (str) => str === 'true'
      }
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
        options: (id) => id && ObjectId.isValid(id) ? new ObjectId(id) : null
      }
    },
    'liker': {
      optional: { options: { nullable: true } },
      custom: {
        options: async (nickname, { req }) => {
          try {
            const user = await UserModel.findOne({ nickname: decodeURI(nickname) }, { _id: 1 }, { lean: true }).exec();
            req.query.likes = user._id;
            return true;
          } catch (error) {
            return Promise.reject(error);
          }
        }
      }
    },
    'commenter': {
      optional: { options: { nullable: true } },
      custom: {
        options: async (nickname, { req }) => {
          try {
            const user = await UserModel.findOne({ nickname: decodeURI(nickname) }, { _id: 1 }, { lean: true }).exec();
            req.query.comments = await CommentModel.distinct('post', { commenter: user._id }).exec();
            return true;
          } catch (error) {
            return Promise.reject(error);
          }
        }
      }
    },
    'sort': {
      optional: { options: { nullable: true } }
    },
    'searchText': {
      optional: { options: { nullable: true } },
      isString: {
        options: [{ min: 2, max: 255 }],
        errorMessage: '검색어는 최소 2글자 이상, 최대 255글자 이내로 작성해 주세요.'
      },
      customSanitizer: {
        options: (text) => !!text ? decodeURI(text).trim() : null
      }
    }
  };
};

export default {
  POST_VALIDATION_SCHEMA,
  POSTS_PAGINATION_SCHEMA
};
