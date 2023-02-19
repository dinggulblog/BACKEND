import sanitizeHtml from 'sanitize-html';
import { UserModel } from '../../../model/user.js';

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
        errorMessage: '닉네임은 2자 이상, 15자 이하만 가능합니다.'
      }
    }
  };
};

const PROFILE_VALIDATION_SCHEMA = () => {
  return {
    'greetings': {
      isLength: {
        options: [{ max: 300 }],
        errorMessage: '인사말은 300자 이하만 가능합니다.'
      },
      optional: { options: { nullable: true } }
    },
    'introduce': {
      isLength: {
        options: [{ max: 10000 }],
        errorMessage: '소개글은 최대 10000자까지 가능합니다.'
      },
      customSanitizer: {
        options: value => value !== undefined
          ? sanitizeHtml(value, { exclusiveFilter: (frame) => frame.tag === 'script' })
          : undefined
      }
    }
  };
};

export default {
  EMAIL_EXIST_VALIDATION_SCHEMA,
  EMAIL_VALIDATION_SCHEMA,
  PASSWORD_VALIDATION_SCHEMA,
  NICKNAME_VALIDATION_SCHEMA,
  PROFILE_VALIDATION_SCHEMA
};
