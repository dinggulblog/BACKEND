import sanitizeHtml from 'sanitize-html';

const MAIL_VALIDATION_SCHEMA = () => {
  return {
    'email': {
      trim: true,
      isEmail: true,
      normalizeEmail: { options: { gmail_remove_dots: false } },
      errorMessage: '이메일 형식이 올바르지 않습니다.'
    },
    'subject': {
      trim: true,
      isLength: {
        options: [{ min: 1, max: 150 }],
        errorMessage: '메일 제목은 최소 1자 이상, 최대 150자 이내로 적어주세요.'
      }
    },
    'content': {
      isLength: {
        options: [{ min: 10, max: 10000 }],
        errorMessage: '건의 사항은 최소 10자 이상, 최대 10000자까지 가능합니다.'
      },
      customSanitizer: {
        options: value => sanitizeHtml(value, { exclusiveFilter: (frame) => frame.tag === 'script' })
      }
    }
  };
};

export default { MAIL_VALIDATION_SCHEMA };
