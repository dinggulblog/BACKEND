import sanitizeHtml from 'sanitize-html';
import { UserModel } from '../../../model/user.js';
import { RoleModel } from '../../../model/role.js';

const EMAIL_EXIST_VALIDATION_SCHEMA = () => {
  return {
    'email': {
      trim: true,
      custom: {
        options: async (email) => {
          const user = await UserModel.findOne({ email: email }, { email: 1, isActive: 1 }, { lean: true }).exec();
          return !user ? Promise.reject('해당 이메일을 찾을 수 없습니다.') : true;
        }
      }
    }
  };
};

const EMAIL_VALIDATION_SCHEMA = () => {
  return {
    'email': {
      trim: true,
      isEmail: true,
      normalizeEmail: { options: { gmail_remove_dots: false } },
      errorMessage: '이메일 형식이 올바르지 않습니다.'
    }
  };
};

const PASSWORD_VALIDATION_SCHEMA = (isNew = true) => {
  return {
    [isNew ? 'password' : 'newPassword']: {
      trim: true,
      isLength: {
        options: [{ min: 4, max: 30 }],
        errorMessage: '패스워드는 4자 이상, 30자 이하만 가능합니다.'
      }
    },
    'passwordConfirmation': {
      trim: true,
      custom: {
        options: (value, { req }) => value !== req.body.password ? Promise.reject('패스워드가 일치하지 않습니다.') : true
      }
    },
    'currentPassword': {
      optional: { options: { nullable: true, checkFalsy: true } },
      trim: true
    }
  };
};

const NICKNAME_VALIDATION_SCHEMA = () => {
  return {
    'nickname': {
      matches: {
        options: [/^[ㄱ-ㅎ가-힣a-zA-Z0-9]{2,15}$/],
        errorMessage: '닉네임은 2글자 이상, 15자 이하 영문, 한글 및 숫자 조합만 가능합니다.'
      }
    }
  };
};

const PROFILE_VALIDATION_SCHEMA = () => {
  return {
    'greetings': {
      optional: { options: { nullable: true } },
      isLength: {
        options: [{ max: 300 }],
        errorMessage: '인사말은 300자 이하만 가능합니다.'
      }
    },
    'introduce': {
      isLength: {
        options: [{ max: 10000 }],
        errorMessage: '소개글은 최대 10000자까지 가능합니다.'
      },
      customSanitizer: {
        options: value => value !== undefined
          ? sanitizeHtml(value, {
            exclusiveFilter: (frame) => frame.tag === 'script',
            allowedAttributes: {
              'p': ['style'],
              'span': ['style'],
              'strong': ['style'],
              'pre': ['class', 'spellcheck']
            },
            allowedStyles: {
              '*': {
                'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
                'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
                'text-align': [/^left$/, /^right$/, /^center$/],
                'font-size': [/^\d+(?:px|em|%)$/]
              }
            }
          })
          : undefined
      }
    }
  };
};

const ACCOUNTS_VALIDATION_SCHEMA = () => {
  return {
    'users': {
      isArray: {
        bail: true,
        options: [{ min: 0 }],
        errorMessage: '수정하려는 유저 목록을 배열로 전달해 주세요.'
      }
    },
    'users.*._id': {
      isMongoId: {
        bail: true,
        errorMessage: '유저 ID가 올바르지 않습니다.'
      }
    },
    'users.*.nickname': {
      optional: {
        options: { nullable: true, checkFalsy: true }
      },
      matches: {
        options: [/^[ㄱ-ㅎ가-힣a-zA-Z0-9]{2,15}$/],
        errorMessage: '닉네임은 2글자 이상, 15자 이하 영문, 한글 및 숫자 조합만 가능합니다.'
      }
    },
    'users.*.roles': {
      optional: {
        options: { nullable: true, checkFalsy: true }
      },
      isArray: {
        bail: true,
        options: [{ min: 1 }],
        errorMessage: '최소 1개 이상의 권한이 필요합니다.'
      }
    },
    'users.*.roles.*': {
      toString: true,
      toUpperCase: true,
      matches: {
        options: [/\b(?:USER|ADMIN)\b/],
        errorMessage: '사용 가능한 권한: "USER", "ADMIN"'
      },
      customSanitizer: {
        options: async role => {
          const newRole = await RoleModel.findOne({ name: role }, { _id: 1 }, { lean: true }).exec();
          return newRole._id;
        }
      }
    },
    'users.*.isActive': {
      optional: { options: { nullable: true } },
      toBoolean: true
    }
  };
};

export default {
  EMAIL_EXIST_VALIDATION_SCHEMA,
  EMAIL_VALIDATION_SCHEMA,
  PASSWORD_VALIDATION_SCHEMA,
  NICKNAME_VALIDATION_SCHEMA,
  PROFILE_VALIDATION_SCHEMA,
  ACCOUNTS_VALIDATION_SCHEMA
};
